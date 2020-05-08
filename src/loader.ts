/**
 * @Author: huangw1
 * @Date: 2020-05-08 15:42
 */

import * as fs from 'fs'
import * as path from 'path'
import * as Router from 'koa-router'
import { BaseContext } from 'koa'
import * as Koa from 'koa'

const cache = Symbol.for('cache');

export class Loader {
  app: Koa;
  route: Router = new Router();
  controller: any = {};

  constructor(app: Koa) {
    this.app = app;
  }

  loadController() {
    const dirs = fs.readdirSync(path.join(__dirname, 'controller'));

    dirs.forEach(filename => {
      const property = path.parse(filename).name;
      const mod = require(path.join(__dirname, 'controller', filename)).default;

      if (mod) {
        const methods = Object.getOwnPropertyNames(mod.prototype).filter(method => method !== 'constructor');
        Object.defineProperty(this.controller, property, {
          get(): any {
            const proxy: { [key: string]: any } = {};
            methods.forEach(method => {
              proxy[method] = {
                type: mod,
                method
              }
            });

            return proxy
          }
        })
      }
    });

    return this.controller
  }

  loadService() {
    const dirs = fs.readdirSync(path.join(__dirname, 'service'));

    Object.defineProperty(this.app.context, 'service', {
      get(): any {
        if (!this[cache]) {
          this[cache] = {}
        }
        if (!this[cache].service) {
          this[cache].service = {};

          dirs.forEach(filename => {
            const property = path.parse(filename).name;
            const mod = require(path.join(__dirname, 'service', filename)).default;
            if (mod) {
              this[cache].service[property] = new mod(this, this.app);
            }
          })
        }

        return this[cache].service
      }
    })
  }

  loadConfig() {
    const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    const envConfig = path.join(__dirname, 'config', `config.${env}.js`);
    const defaultConfig = path.join(__dirname, 'config', 'config.default.js');
    const proxy = Object.assign({}, require(defaultConfig).default, require(envConfig).default);

    Object.defineProperty(this.app, 'config', {
      get(): any {
        return proxy
      }
    })
  }

  loadRouter() {
    this.loadConfig();
    this.loadService();
    this.loadController();

    const mod = require(path.join(__dirname, 'router.js')).default;
    const routers = mod(this.controller);

    Object.entries(routers).forEach(([key, handler]) => {
      const [method, path] = key.split(' ');
      (<any>this.route)[method](path, async (ctx: BaseContext) => {
        const { type, method } = <any>handler;
        /**
         * 独立的请求，需要新的ctx，不能复用
         */
        const instance = new type(ctx);
        instance[method]()
      })
    });

    return this.route.routes()
  }
}

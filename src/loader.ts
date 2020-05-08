/**
 * @Author: huangw1
 * @Date: 2020-05-08 15:42
 */

import * as fs from 'fs'
import * as path from 'path'
import * as Router from 'koa-router'
import * as Koa from 'koa'
import { BaseContext } from 'koa';
import { bp } from './blueprint'

const cache = Symbol.for('cache');

export class Loader {
  app: Koa;
  router: Router = new Router();
  controller: any = {};

  constructor(app: Koa) {
    this.app = app;
  }

  loadController() {
    const dirs = fs.readdirSync(path.join(__dirname, 'controller'));

    dirs.forEach(filename => {
      require(path.join(__dirname, 'controller', filename)).default
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

    Object.entries(bp.getRoutes()).forEach(([url, r]) => {
      r.forEach(route => {
        const { httpMethod, constructor, handler } = <any>route;
        (<any>this.router)[httpMethod](url, async (ctx: BaseContext) => {
          /**
           * 独立的请求，需要新的ctx，不能复用
           */
          const instance = new constructor(ctx, this.app);
          instance[handler]()
        })
      });
    });

    return this.router.routes()
  }
}

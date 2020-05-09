/**
 * @Author: huangw1
 * @Date: 2020-05-08 15:42
 */

import * as fs from 'fs'
import * as path from 'path'
import * as Router from 'koa-router'
import { BaseContext } from 'koa';
import { bp } from './blueprint'
import { EggOmed } from './core';

const cache = Symbol.for('cache');

interface FileModule {
  module: any,
  filename: string
}

export class Loader {
  app: EggOmed;
  router: Router = new Router();
  controller: any = {};

  constructor(app: EggOmed) {
    this.app = app;
  }

  static get appDir() {
    return path.join(__dirname, 'app')
  }

  fileLoader(url: string): Array<FileModule> {
    if (fs.existsSync(path.join(Loader.appDir, url))) {
      const dirs = fs.readdirSync(path.join(Loader.appDir, url));
      return dirs.map(filename => {
        return {
          module: require(path.join(__dirname, url, filename)).default,
          filename
        }
      })
    } else {
      return []
    }
  }

  loadController() {
    this.fileLoader('controller');
  }

  loadService() {
    const services = this.fileLoader('service');
    this.loadToContext(services, 'service');
  }

  loadToContext(fileModules: Array<FileModule>, property: string) {
    Object.defineProperty(this.app.context, property, {
      get(): any {
        if (!this[cache]) {
          this[cache] = {}
        }
        if (!this[cache][property]) {
          this[cache][property] = {};

          fileModules.forEach(fileModule => {
            const key = path.parse(fileModule.filename).name;
            if (fileModule.module) {
              this[cache][property][key] = new fileModule.module(this, this.app);
            }
          })
        }

        return this[cache][property]
      }
    })
  }

  loadPlugin() {
    const mod = require(path.join(Loader.appDir, 'config', 'plugin.js'));

    Object.entries(mod).forEach(([_, p]) => {
      if ((<any>p).enabled) {
        const plugin = require((<any>p).packagePath).default;
        plugin(this.app)
      }
    })
  }

  loadMiddleware() {
    const middleware = this.fileLoader('middleware');
    const registerMiddleware = (<any>this.app).config.middleware as Array<string>;
    if (registerMiddleware) {
      registerMiddleware.forEach(name => {
        middleware.forEach(mid => {
          if (name === mid.filename) {
            const key = path.parse(mid.filename).name;
            this.app.use(mid.module((<any>this.app).config[key], this.app));
          }
        })
      })
    }
  }

  loadConfig() {
    const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    const envConfig = path.join(Loader.appDir, 'config', `config.${env}.js`);
    const defaultConfig = path.join(Loader.appDir, 'config', 'config.default.js');
    const proxy = Object.assign({}, require(defaultConfig).default, require(envConfig).default);

    Object.defineProperty(this.app, 'config', {
      get(): any {
        return proxy
      }
    })
  }

  loadRouter() {
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

    this.app.use(this.router.routes())
  }

  load() {
    this.loadConfig();
    this.loadPlugin();
    this.loadController();
    this.loadService();
    this.loadMiddleware();
    this.loadRouter();
  }
}

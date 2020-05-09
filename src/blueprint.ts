/**
 * @Author: huangw1
 * @Date: 2020-05-08 19:47
 */

interface Bp {
  httpMethod: string;
  constructor: any;
  handler: string
}

interface Bps {
  [key: string]: Array<Bp>
}

const methods = ['get', 'post', 'put', 'del'];

interface Decorate {
  (target: any, key: string): void
}

export interface BluePrint extends Blueprint {
  get(url: string): Decorate;
  post(url: string): Decorate;
  put(url: string): Decorate;
  del(url: string): Decorate
}

class Blueprint {
  routes: Bps = {};

  addRoute(url: string, route: Bp) {
    const existRoutes = this.routes[url];
    if (existRoutes) {
      for (const existRoute of existRoutes) {
        if (existRoute.httpMethod === existRoute.httpMethod) {
          console.warn(`exist route ${route.httpMethod} ${url}`);
          return
        }
      }
      this.routes[url].push(route);
    } else {
      this.routes[url] = [route];
    }
  }

  get(url: string) {
    return (target: any, key: string) => {
      this.addRoute(url, {
        httpMethod: 'get',
        constructor: target.constructor,
        handler: key
      })
    }
  }

  getRoutes() {
    return this.routes;
  }
}

methods.forEach(httpMethod => {
  Object.defineProperty(Blueprint.prototype, httpMethod, {
    get(): any {
      return (url: string) => {
        return (target: any, key: string) => {
          this.addRoute(url, {
            httpMethod,
            constructor: target.constructor,
            handler: key
          })
        }
      }
    }
  })
});

export const bp = new Blueprint();

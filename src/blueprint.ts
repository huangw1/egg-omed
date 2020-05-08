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

export const bp = new Blueprint();

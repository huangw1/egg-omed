/**
 * @Author: huangw1
 * @Date: 2020-05-09 09:39
 */

import * as Koa from 'koa'
import { Loader } from './loader';

export class EggOmed extends Koa {
  private ip: string = '127.0.0.1';
  private port: number = 3000;
  private loader: Loader;

  constructor() {
    super();

    this.loader = new Loader(this);
  }

  loadDefaultMiddleware() {

  }

  /**
   * 开发环境处理异常
   */
  run(callback: (port: number, ip: string) => void, port?: number, ip?: string) {
    this.loadDefaultMiddleware();
    this.loader.load();

    return this.listen(port || this.port, ip || this.ip, () => {
      callback(port || this.port, ip || this.ip);
    })
  }
}

/**
 * @Author: huangw1
 * @Date: 2020-05-08 16:06
 */

import { BaseContext } from 'koa'
import * as Koa from 'koa';

export class Controller {
  ctx: BaseContext;
  app: Koa;

  constructor(ctx: BaseContext, app: Koa) {
    this.ctx = ctx;
    this.app = app;
  }
}

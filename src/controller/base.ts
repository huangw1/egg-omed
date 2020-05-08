/**
 * @Author: huangw1
 * @Date: 2020-05-08 16:06
 */

import { BaseContext } from 'koa'

export class Controller {
  ctx: BaseContext;

  constructor(ctx: BaseContext) {
    this.ctx = ctx;
  }
}

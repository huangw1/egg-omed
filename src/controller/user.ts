/**
 * @Author: huangw1
 * @Date: 2020-05-08 16:08
 */
import { Controller } from './base';

export default class User extends Controller {
  async user() {
    this.ctx.body = `hello ${(<any>this.ctx).service.user.sayHi()}`
  }

  async userInfo() {
    this.ctx.body = 'hello user info'
  }
}

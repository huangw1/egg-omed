/**
 * @Author: huangw1
 * @Date: 2020-05-08 16:08
 */
import { Controller } from './base';
import {bp} from '../blueprint';

export default class User extends Controller {
  @bp.get('/')
  async user() {
    this.ctx.body = `hello ${(<any>this.ctx).service.user.sayHi()}`
  }

  async userInfo() {
    this.ctx.body = 'hello user info'
  }
}

/**
 * @Author: huangw1
 * @Date: 2020-05-08 16:08
 */

import { bp } from '../../blueprint';
import { Controller } from '../../base/controller';

export default class User extends Controller {
  @bp.get('/')
  async user() {
    this.ctx.body = (<any>this.ctx).service.user.sayHi()
  }
}

/**
 * @Author: huangw1
 * @Date: 2020-05-08 17:34
 */

import { Service } from '../../base/service';

export default class User extends Service {
  sayHi() {
    return `hello, ${(<any>this.app).config.appName}!`
  }
}

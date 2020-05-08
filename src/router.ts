/**
 * @Author: huangw1
 * @Date: 2020-05-08 15:39
 */

export default (controller: any) => {
  return {
    'get /': controller.user.user,
    'get /user-info': controller.user.userInfo
  }
};

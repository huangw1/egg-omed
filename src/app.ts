/**
 * @Author: huangw1
 * @Date: 2020-05-08 15:21
 */

import * as Koa from 'koa'
import { Loader } from './loader';

const app = new Koa();

const loader = new Loader(app);

app.use(loader.loadRouter());

app.listen(3000, '127.0.0.1', () => {
  console.log('koa listener at 3000')
});

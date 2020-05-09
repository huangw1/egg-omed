/**
 * @Author: huangw1
 * @Date: 2020-05-09 12:14
 */

import * as os from 'os';
import { EventEmitter } from 'events'

export class EggOmedCluster extends EventEmitter {
  workersCount: number = 0;
  numCPUs: number = os.cpus().length;
}

import {bindMethods} from './bindMethods.js';


export default class Point {
  constructor(x, y) {
    bindMethods(this);

    this.x = x || 0;
    this.y = y || 0;
  }
}

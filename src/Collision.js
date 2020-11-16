import {bindMethods} from './bindMethods.js';

import Vector from './Vector.js';


export default class Collision {
  constructor({a, b, overlap, normal} = {}) {
    bindMethods(this);

    this.a = a;
    this.b = b;
    this.overlap = overlap || new Vector();
    this.normal = normal || new Vector();
  }
}

import {bindMethods} from './bindMethods.js';

import Vector from './Vector.js';


export default class Collision {
  constructor({a, b, penetration, normal} = {}) {
    bindMethods(this);

    this.a = a;
    this.b = b;
    this.penetration = penetration;
    this.normal = normal;
  }
}

import {bindMethods} from './bindMethods.js';

import Vector from './Vector.js';


export default class Collision {
  constructor({
    a,
    b,
    overlap,
    normal,
    rv,
    velocityNormal,
    materialA,
    materialB,
    e,
    j
  } = {}) {
    bindMethods(this);

    this.a = a;
    this.b = b;
    this.overlap = overlap || new Vector();
    this.normal = normal || new Vector();

    this.rv = rv;
    this.velocityNormal = velocityNormal;
    this.materialA = materialA;
    this.materialB = materialB;
    this.e = e;
    this.j = j;
  }
}

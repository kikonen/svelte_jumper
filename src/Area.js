import {bindMethods} from './bindMethods.js';

import Vector from './Vector.js';

export default class Area {
  constructor({min, max}) {
    bindMethods(this);
    this.min = min || new Vector();
    this.max = max || new Vector();
  }

  toString() {
    return `[${this.min}-${this.max}]`;
  }
}

import {bindMethods} from './bindMethods.js';

import Vector from './Vector.js';


export default class BoxShape {
  constructor({min, max, layer = 1} = {}) {
    bindMethods(this);
    this.set(min, max);
    this.layer = layer;
  }

  set(min, max) {
    this.min = min || new Vector();
    this.max = max || new Vector();

    this.dim = this.max.minus(this.min);
    this.volume = this.dim.x * this.dim.y;
  }

  intersect(b) {
    if (this === b) {
      return false;
    }
    if (!(this.layer & b.layer)) {
      return false;
    }

    if (this.max.x < b.min.x || this.min.x > b.max.x) {
      return false;
    }
    if (this.max.y < b.min.y || this.min.y > b.max.y) {
      return false;
    }

    return true;
  }

  move(movement, area) {
    let newMin = this.min.plus(movement);
    let newMax = this.max.plus(movement);

    let x0 = newMin.x;
    let y0 = newMin.y;

    let x1 = newMax.x;
    let y1 = newMax.y;

    if (x0 < area.min.x) {
      let diffX = x0 - area.min.x;
      x0 -= diffX;
      x1 -= diffX;
    } else if (x1 > area.max.x) {
      let diffX = x1 - area.max.x;
      x0 -= diffX;
      x1 -= diffX;
    }

    if (y0 < area.min.y) {
      let diffY = y0 - area.min.y;
      y0 -= diffY;
      y1 -= diffY;
    } else if (y1 > area.max.y) {
      let diffY = y1 - area.max.y;
      y0 -= diffY;
      y1 -= diffY;
    }

    this.min = new Vector(x0, y0);
    this.max = new Vector(x1, y1);
  }
}

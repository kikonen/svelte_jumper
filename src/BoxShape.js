import {bindMethods} from './bindMethods.js';

import Vector from './Vector.js';


export default class BoxShape {
  constructor({min, max, fill, material, surfaces, layer = 1} = {}) {
    bindMethods(this);
    this.layer = layer;

    this.fill = fill;
    this.surfaces = surfaces;

    if (this.fill == null) {
      this.fill = material;
    }

    if (this.surfaces == null) {
      this.surfaces = {
        north: material,
        south: material,
        west: material,
        east: material,
      };
    }

    this.surfaceX = new Map();
    this.surfaceX.set(1, this.surfaces.east);
    this.surfaceX.set(-1, this.surfaces.west);

    this.surfaceY = new Map();
    this.surfaceY.set(-1, this.surfaces.north);
    this.surfaceY.set(1, this.surfaces.south);

    this.set(min, max);
  }

  toString() {
    return `pos=${this.pos},mass=${this.mass},a=${this.min}-${this.max},fill=${this.fill}`;
  }

  set(min, max) {
    min = min || new Vector();
    max = max || new Vector();

    this.min = min;
    this.max = max;

    this.dim = max.minus(min);
    this.volume = this.dim.x * this.dim.y;

    this.mass = this.fill.density * this.volume;

    let middleX = (max.x + min.x) / 2;
    let middleY = (max.y + min.y) / 2;

    this.pos = new Vector(middleX, middleY);
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

  getMaterial(normal) {
    return this.surfaceX.get(normal.x) || this.surfaceY.get(normal.y);
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

    this.set(new Vector(x0, y0), new Vector(x1, y1));
  }
}

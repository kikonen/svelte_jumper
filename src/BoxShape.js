import {bindMethods} from './bindMethods.js';

import Area from './Area.js';
import Vector from './Vector.js';


export default class BoxShape {
  constructor({min, max, limits, fill, material, surfaces, layer = 1} = {}) {
    bindMethods(this);
    this.layer = layer;

    this.fill = fill;
    this.surfaces = surfaces;

    this.limits = limits || new Area({min: new Vector(null, null), max: new Vector(null, null)});

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
    this.massI = 1 / this.mass;

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

    let minX = this.limits.min.x || area.min.x;
    let maxX = this.limits.max.x || area.max.x;
    let minY = this.limits.min.y || area.min.y;
    let maxY = this.limits.max.y || area.max.y;

    if (x0 < minX) {
      let diffX = x0 - minX;
      x0 -= diffX;
      x1 -= diffX;
    } else if (x1 > maxX) {
      let diffX = x1 - maxX;
      x0 -= diffX;
      x1 -= diffX;
    }

    if (y0 < minY) {
      let diffY = y0 - minY;
      y0 -= diffY;
      y1 -= diffY;
    } else if (y1 > maxY) {
      let diffY = y1 - maxY;
      y0 -= diffY;
      y1 -= diffY;
    }

    this.min = new Vector(x0, y0);
    this.max = new Vector(x1, y1);
    let middleX = (x0 + x1) / 2;
    let middleY = (y0 + y1) / 2;

    this.pos = new Vector(middleX, middleY);
  }
}

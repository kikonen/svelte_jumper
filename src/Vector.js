import {bindMethods} from './bindMethods.js';


export default class Vector {
  constructor(x, y) {
    bindMethods(this);

    this.x = x || 0;
    this.y = y || 0;
  }

  isEmpty() {
    return this.x == 0 && this.y == 0;
  }

  magnitude() {
    if (this.x == 0 && this.y == 0) {
      return 0;
    }
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    let magnitude = this.magnitude();
    this.x /= magnitude;
    this.y /= magnitude;
  }

  reverse() {
    return new Vector(-this.x, -this.y);
  }

  plus(b) {
    return new Vector(this.x + b.x, this.y + b.y);
  }

  minus(b) {
    return new Vector(this.x - b.x, this.y - b.y);
  }

  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  multiplyX(scalar) {
    return new Vector(this.x * scalar, this.y);
  }

  multiplyY(scalar) {
    return new Vector(this.x, this.y * scalar);
  }

  changeX(x) {
    return new Vector(x, this.y);
  }

  changeY(y) {
    return new Vector(this.x, y);
  }

  divide(scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
  }

  clamp(area) {
    let x = this.x;
    let y = this.y;

    if (x < area.min.x) {
      x = area.min.x;
    } else if (x < area.max.x) {
      x = area.max.x;
    }

    if (y < area.min.y) {
      y = area.min.y;
    } else if (y < area.max.y) {
      y = area.max.y;
    }

    return new Vector(x, y);
  }
}

import {bindMethods} from './bindMethods.js';


export default class Vector {
  constructor(x, y) {
    bindMethods(this);

    this.x = x || 0;
    this.y = y || 0;
  }

  toString() {
    return `[${this.x}, ${this.y}]`;
  }

  isEmpty() {
    return this.x === 0 && this.y === 0;
  }

  isPresent() {
    return this.x !== 0 || this.y !== 0;
  }

  isInfinity() {
    return this.magnitude() == Infinity;
  }

  magnitude() {
    // NOTE KI null => 0 magnitude
    if (this.x == 0 && this.y == 0) {
      return 0;
    }
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    let magnitude = this.magnitude();
    return new Vector(this.x /= magnitude, this.y /= magnitude);
  }

  signX() {
    if (this.x === 0) {
      return 0;
    }
    return this.x < 0 ? -1 : 1;
  }

  signY() {
    if (this.y === 0) {
      return 0;
    }
    return this.y < 0 ? -1 : 1;
  }

  reverse() {
    return new Vector(-this.x, -this.y);
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  resetX(x) {
    this.x = x;
    return this;
  }

  resetY(y) {
    this.y = y;
    return this;
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

  dot(b) {
    return this.x * b.x + this.y * b.y;
  }

  zeroIfBelow(min) {
    if (this.magnitude() < min) {
      return new Vector();
    }
    return this;
  }

  clamp(min, max) {
    let m = this.magnitude();

    if (m <= min) {
      let ratio = Math.max(min, m) / m;
      return new Vector(this.x / ratio, this.y / ratio);
    } else if (m >= max) {
      let ratio = Math.min(max, m) / m;
      return new Vector(this.x * ratio, this.y * ratio);
    }

    return this;
  }


/*
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
*/
}

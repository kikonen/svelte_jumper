import {bindMethods} from './bindMethods.js';
import Vector from './Vector.js';

const DEFAULT_GRAVITY = 0.9;
const DEFAULT_FRICTION = 0.9;


let idBase = 0;

export function nextId() {
  return ++idBase;
}


export default class Item {
  constructor(data) {
    bindMethods(this);

    this.id = nextId();
    this.data = data;

    Object.assign(this, data);

    if (this.gravity ==  null) {
      this.gravity = DEFAULT_GRAVITY;
    }

    if (this.friction ==  null) {
      this.friction = DEFAULT_FRICTION;
    }

    this.velocity = this.velocity || new Vector();
    this.mass = this.material.density * this.shape.volume;
    this.isPlayer = this.type == 'player';
  }

  start() {
  }

  stop() {
    this.velocity = new Vector();
  }

  intersect(b) {
    this.shape.intersect(b.shape);
  }

  adjustLocation(movement) {
    this.shape.move(movement, this.engine.area);
  }
}

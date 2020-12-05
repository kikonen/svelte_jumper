import {bindMethods} from './bindMethods.js';
import Vector from './Vector.js';
import {GRAVITY} from './PhysicsEngine.js';

//const FRICTION = 0.9;
//const GRAVITY = 6.674e-11;


let idBase = 0;

export function nextId() {
  return ++idBase;
}


export default class Item {
  constructor({type, label, shape, acceleration, gravity, gravityModifier = 1, velocity, force} = {}) {
    bindMethods(this);

    this.id = nextId();

    this.type = type;
    this.label = label;

    this.shape = shape;
    this.gravityModifier = gravityModifier;
    this.acceleration = acceleration || new Vector();
    this.velocity = velocity || new Vector();
    this.force = force || new Vector();
    this.movement = new Vector();

    this.gravity = gravity == null ? GRAVITY : gravity;

    this.collisions = new Set();

    this.player = this.type == 'player';
    this.platform = this.type == 'platform';
    this.world = this.type == 'world';
  }

  toString() {
    return `${this.type}.${this.label}: shape: ${this.shape}, force: ${this.force}`;
  }

  setShape(shape) {
    this.shape = shape;
  }

  start() {
  }

  stop() {
    this.velocity = new Vector();
  }

  intersect(b, tolerance) {
    return this.shape.intersect(b.shape, tolerance);
  }

  isCollision(b) {
    return this.collisions.has(b.id);
  }

  addCollision(b) {
    this.collisions.add(b.id);
  }

  clearCollision(b) {
    this.collisions.delete(b.id);
  }

  move(movement) {
    if (this.world) {
      this.velocity = new Vector();
      this.acceleration = new Vector();
      this.force = new Vector();
      return;
    }

    let hit = this.shape.move(movement, this.engine.area);

    if (this.acceleration.signX() == hit.x) {
      this.acceleration.resetX(0);
    }

    if (this.velocity.signX() == hit.x) {
      this.velocity.resetX(0);
    }

    if (this.acceleration.signY() == hit.y) {
      this.acceleration.resetY(0);
    }

    if (this.velocity.signY() == hit.y) {
      this.velocity.resetY(0);
    }
  }
}

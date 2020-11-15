import {bindMethods} from './bindMethods.js';
import Vector from './Vector.js';
import {GRAVITY} from './PhysicsEngine.js';

const FRICTION = 0.9;
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

    this.gravity = gravity == null ? GRAVITY : gravity;

    this.collisions = new Set();

    this.player = this.type == 'player';
    this.world = this.type == 'world';
  }

  setShape(shape) {
    this.shape = shape;
  }

  start() {
  }

  stop() {
    this.velocity = new Vector();
  }

  clearTick() {
    this.force.reset(0, 0);
  }

  intersect(b) {
    return this.shape.intersect(b.shape);
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
    if (this.type =='world') {
      return;
    }

    this.shape.move(movement, this.engine.area);
  }
}

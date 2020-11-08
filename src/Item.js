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
  constructor({type, label, shape, material, acceleration, gravity, gravityModifier = 1, velocity, force} = {}) {
    bindMethods(this);

    this.id = nextId();

    this.type = type;
    this.label = label;
    this.shape = shape;
    this.material = material;
    this.gravityModifier = gravityModifier;
    this.acceleration = acceleration || new Vector();
    this.velocity = velocity || new Vector();
    this.force = force || new Vector();

    this.gravity = gravity == null ? GRAVITY : gravity;

    this.mass = this.material.density * this.shape.volume;

    this.collisions = new Set();

    this.player = this.type == 'player';
    this.world = this.type == 'world';

    this.calculatePosition();
  }

  setShape(shape) {
    this.shape = shape;
    this.mass = this.material.density * this.shape.volume;
    this.calculatePosition();
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

    let box = this.shape;
    box.move(movement, this.engine.area);
    this.calculatePosition();
  }

  calculatePosition() {
    let box = this.shape;

    let middleX = (box.max.x + box.min.x) / 2;
    let middleY = (box.max.y + box.min.y) / 2;

    this.pos = new Vector(middleX, middleY);
  }
}

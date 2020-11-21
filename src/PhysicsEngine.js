import {bindMethods} from './bindMethods.js';

import Area from './Area.js';
import Vector from './Vector.js';
import Material from './Material.js';
import BoxShape from './BoxShape.js';
import Collision from './Collision.js';
import Item from './Item.js';

const TICK_SPEED = 20;
const WORLD_SPEED = 50;

export const GRAVITY = 6.674e-11;
//export const GRAVITY = 39.5;

const WALL_THICKNESS = 10000;

const LEFT_FORCE = new Vector(-2000, 0);
const LEFT_FLY_FORCE = new Vector(-500, 0);

const RIGHT_FORCE = new Vector(2000, 0);
const RIGHT_FLY_FORCE = new Vector(500, 0);

const MIN_VELOCITY = 0.001;
const MAX_VELOCITY = 25;

const MIN_ACCELERATION = 0.001;
const MAX_ACCELERATION = 10;

const JUMP_FORCE = new Vector(0, -5000);
const JUMP_FLY_FORCE = new Vector(0, -100);

const START_FALL_VELOCITY = new Vector(0, 2);

export const MATERIALS = {
  tar: new Material({
    label: 'tar',
    density: 5,
    restitution: 0,
    staticFriction: 4,
    dynamicFriction: 4,
  }),
  brick: new Material({
    label: 'brick',
    density: 5,
    restitution: 0.4,
    staticFriction: 0.02,
    dynamicFriction: 0.02,
  }),
  steel: new Material({
    label: 'steel',
    density: 5,
    restitution: 0.4,
    staticFriction: 0.02,
    dynamicFriction: 0.02,
  }),
  copper: new Material({
    label: 'copper',
    density: 5,
    restitution: 0.4,
    staticFriction: 0.02,
    dynamicFriction: 0.02,
  }),
  spring: new Material({
    label: 'spring',
    density: 5,
    restitution: 0.7,
    staticFriction: 0.02,
    dynamicFriction: 0.01,
  }),
  human: new Material({
    label: 'human',
    density: 1,
    restitution: 0.1,
    staticFriction: 0.5,
    dynamicFriction: 0.5,
  }),
  sky: new Material({
    label: 'sky',
    density: 1,
    restitution: 1,
    staticFriction: 0.01,
    dynamicFriction: 0.01,
  }),
  wall: new Material({
    label: 'wall',
    density: 1,
    restitution: 1,
    staticFriction: 0.01,
    dynamicFriction: 0.01,
  }),
  ground: new Material({
    label: 'ground',
    density: 8,
    restitution: 0.1,
    staticFriction: 0.4,
    dynamicFriction: 0.4,
  }),
  void: new Material({
    label: 'void',
    density: 0,
    restitution: 0,
    staticFriction: 0,
    dynamicFriction: 0,
  }),

};

const NOP = function() {};


export default class PhysicsEngine {
  constructor(dispatch) {
    bindMethods(this);

    this.ticks = 0;
    this.dispatch = dispatch;

    this.items = [];

    this.byId = new Map();

    this.setupBoundaries();

    this.controls = {
      nop: NOP,
      ArrowLeft: this.onLeft,
      ArrowRight: this.onRight,
      ArrowUp: this.onUp,
      ArrowDown: this.onDown,
    };
  }

  onLeft(ev) {
    this.moveLeft(this.player);
  }
  onRight(ev) {
    this.moveRight(this.player);
  }
  onUp(ev) {
    this.jump(this.player);
  }
  onDown(ev) {
    this.fall(this.player);
  }

  setupBoundaries() {
    this.wallW = new Item({
      type: 'world',
      label: 'west',
      shape: new BoxShape({ material: MATERIALS.wall }),
      gravity: 0,
      gravityModifier: 0,
    });

    this.wallE = new Item({
      type: 'world',
      label: 'east',
      shape: new BoxShape({ material: MATERIALS.wall }),
      gravity: 0,
      gravityModifier: 0,
    });

    this.wallN = new Item({
      type: 'world',
      label: 'north',
      shape: new BoxShape({ material: MATERIALS.sky }),
      gravity: 0,
      gravityModifier: 0,
    });

    this.wallS = new Item({
      type: 'world',
      label: 'south',
      shape: new BoxShape({ material: MATERIALS.ground }),
      gravity: GRAVITY,
    });

    this.register(this.wallW);
    this.register(this.wallE);
    this.register(this.wallN);
    this.register(this.wallS);

    this.updateBoundaries();
  }

  updateBoundaries() {
    let w = this.getWidth();
    let h = this.getHeight();

    if (this.oldW === w && this.oldH === h) {
      return;
    }

    this.oldW = w;
    this.oldH = h;

    this.area = new Area({ max: new Vector(w, h) });

    const T = WALL_THICKNESS;

    this.wallW.shape.set(new Vector(-T, -T), new Vector(0, T));
    this.wallE.shape.set(new Vector(w, -T), new Vector(T, T));

    this.wallN.shape.set(new Vector(-T, -T), new Vector(T, 0));
    this.wallS.shape.set(new Vector(-T, h), new Vector(T, T));
  }

  register(item) {
    item.engine = this;

    this.items.push(item);
    this.byId.set(item.id, item);

    if (item.player) {
      this.player = item;
    }
  }

  subscribe(id, itemChanged) {
    let item = this.byId.get(id);
    if (item) {
      item.itemChanged = itemChanged;
    }
  }

  getItem(id) {
    return this.byId.get(id);
  }

  registerContainer(container) {
    this.container = container;
  }

  getWidth() {
    return this.container ? this.container.clientWidth : 600;
  }

  getHeight() {
    return this.container ? this.container.clientHeight : 600;
  }

  handleKeydown(event) {
    if (!this.player) {
      return;
    }
    (this.controls[event.key] || this.controls[event.code] || this.controls.nop)(event);
  }

  start() {
    if (this.started) {
      return;
    }
    this.started = true;
    this.items.forEach(this.startItem);

    if (this.player) {
//      this.fall(this.player);
    }

    this.currentTime = Date.now();
//    this.timerId = setInterva(this.tick, TICK_SPEED);
    setTimeout(this.tick, TICK_SPEED);
    this.render();
  }

  stop() {
    this.stopped = true;
//    this.timerId = clearInterval(this.timerId);
    this.items.forEach(this.stopItem);
  }

  startItem(item) {
    item.start();
  }

  stopItem(item) {
    item.stop();
  }

  findSurface(a) {
    let surface = null;
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let b = items[i];
      if (a === b || !a.intersect(b)) {
        continue;
      }
      let col = this.calculateCollision(a, b);
      if (col.normal && col.normal.y > 0) {
        surface = b;
        break;
      }
    }

    return surface;
  }

  jump(a) {
    let surface = this.findSurface(a);
    if (surface) {
      a.movement = a.movement.plus(JUMP_FORCE);
    } else {
      a.movement = a.movement.plus(JUMP_FLY_FORCE);
    }
  }

  fall(a) {
//    a.velocity = a.velocity.plus(START_FALL_VELOCITY);
  }

  moveLeft(a) {
    let surface = this.findSurface(a);
    if (surface) {
      a.movement = a.movement.plus(LEFT_FORCE);
    } else {
      a.movement = a.movement.plus(LEFT_FLY_FORCE);
    }
  }

  moveRight(a) {
    let surface = this.findSurface(a);
    if (surface) {
      a.movement = a.movement.plus(RIGHT_FORCE);
    } else {
      a.movement = a.movement.plus(RIGHT_FLY_FORCE);
    }
  }

  render() {
    if (this.stopped) {
      return;
    }

    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];
      if (a.itemChanged) {
        a.itemChanged(a);
      }
    }
    requestAnimationFrame(this.render);
  }

  tick() {
    if (this.stopped) {
      return;
    }

    this.ticks += 1;

    let now = Date.now();
    let elapsed = now - this.currentTime;
    let timeScale = elapsed / WORLD_SPEED;

//    console.log(timeScale, elapsed);

    this.updateBoundaries();

    this.clearItems();
    this.applyForces();
    this.tickItems(timeScale);

    this.currentTime = now;
    setTimeout(this.tick, TICK_SPEED);
  }

  clearItems() {
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];

      a.force.reset(0, 0);
      a.acceleration = a.acceleration.zeroIfBelow(MIN_ACCELERATION);
      a.velocity = a.velocity.zeroIfBelow(MIN_VELOCITY);
    }
  }

  tickItems(timeScale) {
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];
      if (a.force.isPresent() || a.velocity.isPresent() || a.acceleration.isPresent()) {
        this.updatePosition(a, timeScale);
      }

      for (let j = i + 1; j < size; j++) {
        let b = items[j];
        if (a.world && b.world) {
          continue;
        }

        if (a.intersect(b)) {
          this.resolveCollision(a, b);
        }
      }
      if (false && a.player) {
        console.log(`vy=${a.velocity.y},  ay=${a.acceleration.y}`);
      }
    }
  }

  applyForces() {
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];

      for (let j = i + 1 ; j < size; j++) {
        let b = items[j];
        if (a.world && b.world) {
          continue;
        }

        this.applyFrictionForce(a, b);
        this.applyGravityForce(a, b);
      }
    }
  }

  applyFrictionForce(a, b) {
    if (!a.intersect(b)) {
      return;
    }
    let col = this.calculateCollision(a, b);
    if (!col.normal) {
      return;
    }

    let boxA = a.shape;
    let boxB = b.shape;

    let t = col.rv.minus(col.normal.multiply(col.rv.dot(col.normal)));
    t = t.normalize();

    if (t.isEmpty() || t.isInfinity()) {
      return;
    }

    let ma = col.materialA;
    let mb = col.materialB;

    let mus = Math.sqrt(ma.staticFriction * ma.staticFriction + mb.staticFriction * mb.staticFriction);

    let jt = -col.rv.dot(t);
    jt = jt / (boxA.massI + boxB.massI);

    let impulse;
    if (Math.abs(jt) < col.j * mus) {
      impulse = t.multiply(jt);
    } else {
      let mud = Math.sqrt(ma.dynamicFriction * ma.dynamicFriction + mb.dynamicFriction * mb.dynamicFriction);
      impulse = t.multiply(-col.j * mud);
    }

    a.velocity = a.velocity.minus(impulse.multiply(boxA.massI));
    b.velocity = b.velocity.plus(impulse.multiply(boxB.massI));

    console.log(impulse.multiply(boxB.massI).x);

//    console.log(`a.friction = ${ma.friction}, b.friction = ${mb.friction} => ${f}`);
  }

  applyGravityForce(a, b) {
    if (!a.gravity || !b.gravity) {
      return;
    }

    let boxA = a.shape;
    let boxB = b.shape;

    // distance between centers of objects
    let n = this.distanceNormal(a, b);
    let dx = n.x;
    let dy = n.y;

    let r2 = dx * dx + dy * dy;
    let r = Math.sqrt(r2);

    if (r < 0.1) {
      return;
    }

    // Compute force for this pair; k = 1000
    const K = Math.min(a.gravity, b.gravity);
    let f = (K * boxA.mass * boxB.mass) / r * r;

    // Break it down into components
    let fx = f * dx / r;
    let fy = f * dy / r;

    // Accumulate for first object
    let df = new Vector(fx, fy);

    // NOTE KI only a can be world
    if (!a.world) {
      a.force = a.force.plus(df.multiply(a.gravityModifier));
    }
    b.force = b.force.minus(df.multiply(b.gravityModifier));
  }

  resolveCollision(a, b) {
    let col = this.calculateCollision(a, b);
    let boxA = a.shape;
    let boxB = b.shape;

    if (!col.normal) {
      return;
    }

    // Do not resolve if velocities are separating
    if (col.velocityAlongNormal > 0) {
      return;
    }

    // Apply impulse
    let impulse = col.normal.multiply(col.j);

    // NOTE KI only a can be world
    if (!a.world) {
      a.velocity = a.velocity.minus(impulse.multiply(boxA.massI));
    }
    b.velocity = b.velocity.plus(impulse.multiply(boxB.massI));

    if (a.world) {
      let reflect = new Vector(col.overlap.x * col.normal.x, col.overlap.y * col.normal.y);
      b.move(reflect);
    } else {
      let reflect = new Vector(col.overlap.x * col.normal.x * -1, col.overlap.y * col.normal.y * -1);
      a.move(reflect);
    }

    // NOTE KI collision kills acceleration
    a.acceleration.reset(0, 0);
    b.acceleration.reset(0, 0);
  }

  calculateCollision(a, b) {
    // Vector from A to B
    let n = this.distanceNormal(a, b);
    let normal = null;
    let overlap = new Vector();

    let boxA = a.shape;
    let boxB = b.shape;

    let overlapX = n.x > 0 ? boxA.max.x - boxB.min.x : boxB.max.x - boxA.min.x;
    let overlapY = n.y > 0 ? boxA.max.y - boxB.min.y : boxB.max.y - boxA.min.y;

    if (overlapX < 0 || overlapY < 0) {
      return new Collision({a, b, overlap, normal});
    }

    overlap.reset(overlapX, overlapY);

    // Find out which axis is axis of least penetration
    if (overlapX < overlapY) {
      // Point towards B knowing that n points from A to B
      if (n.x < 0) {
        normal = new Vector(-1, 0);
      } else {
        normal = new Vector(1, 0);
      }
    } else {
      // Point toward B knowing that n points from A to B
      if (n.y < 0) {
        normal = new Vector(0, -1);
      } else {
        normal = new Vector(0, 1);
      }
    }

    // relative velocity
    let rv = b.velocity.minus(a.velocity);

    // Calculate relative velocity in terms of the normal direction
    let velocityAlongNormal = rv.dot(normal);

    // Calculate restitution
    let materialA = boxA.getMaterial(normal);
    let materialB = boxB.getMaterial(normal.multiply(-1));

//    let e = (materialA.restitution * boxA.mass + materialB.restitution * boxB.mass) / (boxA.mass + boxB.mass);
    let e = Math.min(materialA.restitution, materialB.restitution);

    // Calculate impulse scalar
    let j = -(1 + e) * velocityAlongNormal;
    j /= boxA.massI + boxB.massI;

    return new Collision({a, b, overlap, normal, rv, velocityAlongNormal, materialA, materialB, e, j});
  }

  distanceNormal(a, b) {
    if (a.world === b.world) {
      return b.shape.pos.minus(a.shape.pos);
    }

    let sign = 1;
    if (a.world) {
      let t = a;
      a = b;
      b = t;
      sign = -1;
    }

    let boxA = a.shape;
    let boxB = b.shape;

    let xa = boxA.pos.x;
    let ya = boxA.pos.y;

    let xb = boxB.pos.x;
    let yb = boxB.pos.y;

    let dx = 0;
    let dy = 0;

    switch (b.label) {
    case 'north':
      dy = boxB.max.y - ya;
      break;
    case 'south':
      dy = boxB.min.y - ya;
      break;
    case 'west':
      dx = boxB.max.x - xa;
      break;
    case 'east':
      dx = boxB.min.x - xa;
      break;
    }

    return new Vector(dx * sign, dy * sign);
  }

  updatePosition(a, dt) {
    let dbg = true;
    let boxA = a.shape;

    if (dbg && a.player) {
      console.log(`=========`);
      console.log(`f=${a.force}`);
      console.log(`m=${a.movement}`);
      console.log(`v=${a.velocity}`);
      console.log(`a=${a.acceleration}`);
    }

    let acceleration;
    {
      let ax = a.acceleration.x;
      let ay = a.acceleration.y;

      let fx = a.force.x + a.movement.x;
      let fy = a.force.y + a.movement.y;

      // ...acceleration
      ax += fx / boxA.mass;
      ay += fy / boxA.mass;

      acceleration = new Vector(ax, ay);
      acceleration = acceleration.clamp(MIN_ACCELERATION, MAX_ACCELERATION);
    }

    let velocity;
    {
      let vx = a.velocity.x;
      let vy = a.velocity.y;

      vx += acceleration.x * dt;
      vy += acceleration.y * dt;

      velocity = new Vector(vx, vy);
      velocity = velocity.clamp(MIN_VELOCITY, MAX_VELOCITY);
    }

    a.acceleration = acceleration;
    a.velocity = velocity;

    let movement = new Vector(velocity.x * dt, velocity.y * dt);
    a.move(movement);

    if (dbg && a.player) {
      console.log(`------------`);
      console.log(`f=${a.force}`);
      console.log(`m=${a.movement}`);
      console.log(`v=${a.velocity}`);
      console.log(`a=${a.acceleration}`);
    }

    a.movement.reset(0, 0);
  }
}

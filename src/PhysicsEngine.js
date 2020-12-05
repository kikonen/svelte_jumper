import {bindMethods} from './bindMethods.js';

import Area from './Area.js';
import Vector from './Vector.js';
import Material from './Material.js';
import BoxShape from './BoxShape.js';
import Collision from './Collision.js';
import Item from './Item.js';

const TICK_SPEED = 10;
const WORLD_SPEED = 80;

export const WORLD_SCALE = 20.0;

export const GRAVITY = 6.674e-11;

const WALL_THICKNESS = 10000;

const LEFT_FORCE = new Vector(-100, 0);
const LEFT_FLY_FORCE = new Vector(-50, 0);

const RIGHT_FORCE = new Vector(100, 0);
const RIGHT_FLY_FORCE = new Vector(50, 0);

const MIN_VELOCITY = 0.001;
const MAX_VELOCITY = 25;

const MIN_ACCELERATION = 0.001;
const MAX_ACCELERATION = 10;

const JUMP_FORCE = new Vector(0, -3000);
const JUMP_FLY_FORCE = new Vector(0, -10);

const START_FALL_VELOCITY = new Vector(0, 2);

const FRICTION_TOLERANCE = 0.1;
const COLLISION_TOLERANCE = 0;

const FRICTION_STATIC_VELOCITY = 0.01;


export const MATERIALS = {
  tar: new Material({
    label: 'tar',
    density: 60,
    restitution: 0,
    staticFriction: 1,
    dynamicFriction: 1,
  }),
  brick: new Material({
    label: 'brick',
    density: 80,
    restitution: 0.4,
    staticFriction: 0.02,
    dynamicFriction: 0.02,
  }),
  steel: new Material({
    label: 'steel',
    density: 100,
    restitution: 0.8,
    staticFriction: 0.02,
    dynamicFriction: 0.02,
  }),
  copper: new Material({
    label: 'copper',
    density: 120,
    restitution: 0.8,
    staticFriction: 0.02,
    dynamicFriction: 0.02,
  }),
  spring: new Material({
    label: 'spring',
    density: 40,
    restitution: 0.7,
    staticFriction: 0.02,
    dynamicFriction: 0.01,
  }),
  human: new Material({
    label: 'human',
    density: 60,
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
    density: 80,
    restitution: 1,
    staticFriction: 0.01,
    dynamicFriction: 0.01,
  }),
  ground: new Material({
    label: 'ground',
    density: 80,
    restitution: 0.1,
    staticFriction: 0.5,
    dynamicFriction: 0.05,
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
  constructor({ dispatch, input }) {
    bindMethods(this);

    this.debug = false;

    this.ticks = 0;
    this.dispatch = dispatch;
    this.input = input;

    this.items = [];

    this.byId = new Map();

    this.setupBoundaries();
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
    return (this.container ? this.container.clientWidth : 600) / WORLD_SCALE;
  }

  getHeight() {
    return (this.container ? this.container.clientHeight : 600) / WORLD_SCALE;
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
      if (a === b || !a.intersect(b, COLLISION_TOLERANCE)) {
        continue;
      }
      let col = this.calculateCollision(a, b, COLLISION_TOLERANCE);
      if (col.normal && col.normal.y > 0) {
        surface = b;
        break;
      }
    }

    return surface;
  }

  handleInput(dt) {
    if (!this.player) {
      return;
    }

    let surface = this.findSurface(this.player);

    if (this.input.keys.left) {
      this.moveLeft(this.player, dt, surface);
    }
    if (this.input.keys.right) {
      this.moveRight(this.player, dt, surface);
    }
    if (this.input.keys.up) {
      this.jump(this.player, dt, surface);
    }
  }

  jump(a, dt, surface) {
//    console.log("UP");
    if (surface) {
      a.movement = a.movement.plus(JUMP_FORCE);//.divide(dt);
    } else {
      a.movement = a.movement.plus(JUMP_FLY_FORCE);//.divide(dt);
    }
  }

  fall(a, dt, surface) {
//    a.velocity = a.velocity.plus(START_FALL_VELOCITY);
  }

  moveLeft(a, dt, surface) {
//    console.log("LEFT");
    if (surface) {
      a.movement = a.movement.plus(LEFT_FORCE);//.divide(dt);
    } else {
      a.movement = a.movement.plus(LEFT_FLY_FORCE);//.divide(dt);
    }
  }

  moveRight(a, dt, surface) {
//    console.log("RIGHT");
    if (surface) {
      a.movement = a.movement.plus(RIGHT_FORCE);//.divide(dt);
    } else {
      a.movement = a.movement.plus(RIGHT_FLY_FORCE);//.divide(dt);
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

    timeScale = 0.2;
//    console.log(timeScale, elapsed);

    this.updateBoundaries();

    this.handleInput(timeScale);
    this.clearItems(timeScale);
    this.applyForces(timeScale);
    this.tickItems(timeScale);

    this.currentTime = now;
    setTimeout(this.tick, TICK_SPEED);
  }

  clearItems(dt) {
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];

      a.force.reset(0, 0);
      a.acceleration = a.acceleration.zeroIfBelow(MIN_ACCELERATION);
      a.velocity = a.velocity.zeroIfBelow(MIN_VELOCITY);

      this.debugItem(a, dt, "CLEAR");
    }
  }

  tickItems(dt) {
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];
      if (a.force.isPresent() || a.velocity.isPresent() || a.acceleration.isPresent()) {
        this.updatePosition(a, dt);
      }

      for (let j = i + 1; j < size; j++) {
        let b = items[j];
        if (a.world && b.world) {
          continue;
        }

        if (a.intersect(b, COLLISION_TOLERANCE)) {
          this.resolveCollision(a, b, COLLISION_TOLERANCE, dt);
        }
      }

      this.debugItem(a, dt, "TICK-A");
    }
  }

  applyForces(dt) {
    this.applyGravityForces(dt);
    this.applyFrictionForces(dt);
  }

  applyGravityForces(dt) {
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];

      for (let j = i + 1 ; j < size; j++) {
        let b = items[j];
        if (a.world && b.world) {
          continue;
        }

        this.applyGravityForce(a, b, dt);
      }
    }
  }

  applyFrictionForces(dt) {
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];

      for (let j = i + 1 ; j < size; j++) {
        let b = items[j];
        if (a.world && b.world) {
          continue;
        }

        this.applyFrictionForce(a, b, dt);
      }
    }
  }

  /**
   * https://en.wikipedia.org/wiki/Friction
   *
   * - The friction force between two surfaces after sliding begins is the product of the coefficient of kinetic friction and the normal force: Ff = u * Fn
   *
   * https://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-friction-scene-and-jump-table--gamedev-7765
   * https://gamedev.stackexchange.com/questions/37889/friction-in-2d-game
   */
  applyFrictionForce(a, b, dt) {
    if (!a.intersect(b, FRICTION_TOLERANCE)) {
      return;
    }
    let col = this.calculateCollision(a, b, FRICTION_TOLERANCE);
    if (!col.normal) {
      return;
    }

    this.debugItem(a, dt, "FRICTION-START-A");
    this.debugItem(b, dt, "FRICTION-START-B");

    let boxA = a.shape;
    let boxB = b.shape;

    let fa = a.force;
    let fb = b.force;

    let ma = col.materialA;
    let mb = col.materialB;

    let frictionA = ma.dynamicFriction;
    let frictionB = mb.dynamicFriction;

    let t = col.rv.minus(col.normal.multiply(col.rv.dot(col.normal)));
    t = t.normalize();

    if (t.isEmpty() || t.isInfinity()) {
      return;
    }

    if (col.rv < FRICTION_STATIC_VELOCITY) {
      frictionA = ma.staticFriction;
      frictionB = mb.staticFriction;
    }

    let fn = fa.plus(fb);

    let ffa = new Vector(frictionB * fa.y * t.x, frictionB * fa.x * t.y);
    let ffb = new Vector(frictionA * fb.y * t.x, frictionA * fb.x * t.y);

    a.force = a.force.plus(ffa);
    b.force = b.force.plus(ffb);

    this.debugItem(a, dt, "FRICTION-END-A");
    this.debugItem(b, dt, "FRICTION-END-B");
  }

  applyFrictionForceOLD(a, b, dt) {
    if (!a.intersect(b, FRICTION_TOLERANCE)) {
      return;
    }
    let col = this.calculateCollision(a, b, FRICTION_TOLERANCE);
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

    this.debugItem(a, dt, "FRICTION-START-A");
    this.debugItem(b, dt, "FRICTION-START-B");

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

    let velA = a.velocity.minus(impulse.multiply(boxA.massI));
    let velB = b.velocity.plus(impulse.multiply(boxB.massI));
    a.velocity = velA;
    b.velocity = velB;

    this.debugItem(a, dt, "FRICTION-END-A");
    this.debugItem(b, dt, "FRICTION-END-B");
  }

  applyGravityForce(a, b, dt) {
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

    this.debugItem(a, dt, "GRAVITY-A");
    this.debugItem(b, dt, "GRAVITY-B");
  }

  resolveCollision(a, b, tolerance, dt) {
    let col = this.calculateCollision(a, b, tolerance);
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
    if (col.normal.x === 0) {
      a.acceleration.reset(0, a.acceleration.y);
      b.acceleration.reset(0, b.acceleration.y);
    } else {
      a.acceleration.reset(a.acceleration.x, 0);
      b.acceleration.reset(b.acceleration.x, 0);
    }
    a.acceleration.reset(0, 0);
    b.acceleration.reset(0, 0);

    this.debugItem(a, dt, "COLL-A");
    this.debugItem(b, dt, "COLL-B");
  }

  calculateCollision(a, b, tolerance) {
    // Vector from A to B
    let n = this.distanceNormal(a, b);
    let normal = null;
    let overlap = new Vector();

    let boxA = a.shape;
    let boxB = b.shape;

    let overlapX = n.x > 0 ? boxA.max.x + tolerance - boxB.min.x : boxB.max.x + tolerance - boxA.min.x;
    let overlapY = n.y > 0 ? boxA.max.y + tolerance - boxB.min.y : boxB.max.y + tolerance - boxA.min.y;

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

    let dx = xb - xa;
    let dy = yb - ya;

    switch (b.label) {
    case 'north':
      dx = 0;
      break;
    case 'south':
      dx = 0;
      break;
    case 'west':
      dy = 0;
      break;
    case 'east':
      dy = 0;
      break;
    }

    return new Vector(dx * sign, dy * sign);
  }

  updatePosition(a, dt) {
    let boxA = a.shape;

    this.debugItem(a, dt, "UPDATE-START");

    let acceleration;
    {
      // m/s^2
      let ax = a.acceleration.x * dt;
      let ay = a.acceleration.y * dt;

      let fx = (a.force.x + a.movement.x) * dt;
      let fy = (a.force.y + a.movement.y) * dt;

      // ...acceleration
      // F = m/s^2 * kg = m*kg/s^2
      // a = F / m
      // m/s^2 += (kg/s^2) / kg
      ax += fx / boxA.mass;
      ay += fy / boxA.mass;

      acceleration = new Vector(ax, ay);
      acceleration = acceleration.zeroIfBelow(MIN_ACCELERATION);
      acceleration = acceleration.clamp(0, MAX_ACCELERATION);
    }

    let velocity;
    {
      // ms/s
      let vx = a.velocity.x;
      let vy = a.velocity.y;

      // m/s += m/s^2 * s
      vx += acceleration.x * dt;
      vy += acceleration.y * dt;

      velocity = new Vector(vx, vy);
      velocity = velocity.zeroIfBelow(MIN_VELOCITY);
      velocity = velocity.clamp(0, MAX_VELOCITY);
    }

    a.acceleration = acceleration;
    a.velocity = velocity;

    let movement = new Vector(velocity.x * dt, velocity.y * dt);
    a.move(movement);

    this.debugItem(a, dt, "UPDATE-END");

    a.movement.reset(0, 0);
  }

  debugItem(a, dt, label) {
    if (!this.debug) {
      return;
    }

    let mark = `${label}-${a.label}`;
    if (false) {
      console.log(`${mark} ${this.ticks} - ${dt} -----`);
      console.log(`${mark} f=${a.force}`);
      console.log(`${mark} m=${a.movement}`);
      console.log(`${mark} v=${a.velocity}`);
      console.log(`${mark} a=${a.acceleration}`);
    }

    if (true) {
      console.log(`${mark} ${this.ticks} - ${dt}\nv=${a.velocity} - a=${a.acceleration}\nf=${a.force} - m=${a.movement}`);
    }

    if (false) {
      console.table({ e: { x: mark, y: this.ticks }, v: a.velocity, a: a.acceleration, f: a.force, m: a.movement }, ['x', 'y']);
    }
  }
}

import {bindMethods} from './bindMethods.js';

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

const START_LEFT_VELOCITY = new Vector(-3, 0);
const START_RIGHT_VELOCITY = new Vector(3, 0);

const MIN_X_VELOCITY = 0.01;
const MIN_Y_VELOCITY = 0.01;

const MAX_X_VELOCITY = 50;
const MAX_Y_VELOCITY = 50;

const MIN_X_ACCELERATION = 0.01;
const MIN_Y_ACCELERATION = 0.01;

const MAX_X_ACCELERATION = 10;
const MAX_Y_ACCELERATION = 10;

const START_JUMP_VELOCITY = new Vector(0, -20);
const START_JUMP_ACCELERATION = new Vector(0, -3);

const START_FALL_VELOCITY = new Vector(0, 2);

export const MATERIALS = {
  brick: new Material({density: 5, restitution: 0.4}),
  human: new Material({density: 2, restitution: 0.5}),
  sky: new Material({density: 1, restitution: 1, friction: 0}),
  wall: new Material({density: 1, restitution: 1, friction: 0}),
  ground: new Material({density: 8, restitution: 0.1, friction: 0.5}),
  void: new Material({density: 0, restitution: 0, friction: 0}),
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

    this.area = new BoxShape({ min: null, max: new Vector(w, h), material: MATERIALS.void });

    const T = WALL_THICKNESS;

    this.wallW.shape.set(new Vector(-T, -T), new Vector(1, h + T));
    this.wallE.shape.set(new Vector(w - 1, -T), new Vector(w + T, h + T));

    this.wallN.shape.set(new Vector(-T, -T), new Vector(w + T, 1));
    this.wallS.shape.set(new Vector(-T, h - 1), new Vector(w + T, h + T));
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
    this.timerId = setInterval(this.tick, TICK_SPEED);
//    requestAnimationFrame(this.tick);
  }

  stop() {
    this.stopped = true;
    this.timerId = clearInterval(this.timerId);
    this.items.forEach(this.stopItem);
  }

  startItem(item) {
    item.start();
    if (item.itemChanged) {
      item.itemChanged(item);
    }
  }

  stopItem(item) {
    item.stop();
  }

  jump(a) {
    if (a.velocity.y < 0 || a.acceleration.y < 0) {
      return;
    }

    a.velocity = a.velocity.plus(START_JUMP_VELOCITY);
    a.acceleration = a.acceleration.plus(START_JUMP_ACCELERATION);

    if (a.player) {
//      console.log({JUMP: 1, f: a.force.y, a: a.acceleration.y, v: a.velocity.y});
    }
  }

  fall(a) {
    a.velocity = a.velocity.plus(START_FALL_VELOCITY);
  }

  moveLeft(a) {
    if (a.velocity.y > 0) {
//      return;
    }

    a.velocity = a.velocity.plus(START_LEFT_VELOCITY);
  }

  moveRight(a) {
    if (a.velocity.y > 0) {
//      return;
    }

    a.velocity = a.velocity.plus(START_RIGHT_VELOCITY);
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

    // if (this.player.acceleration.y < 0 || this.player.velocity.y < 0) {
    //   debugger
    // }

    this.items.forEach((item) => { item.clearTick(); });

    this.applyForces();
    this.collisionDetection();

    this.items.forEach((item) => { this.tickItem(item, timeScale); });

    // if (this.player.acceleration.y < 0 || this.player.velocity.y < 0) {
    //   debugger
    // }

    this.currentTime = now;
//    requestAnimationFrame(this.tick);
  }

  tickItem(item, timeScale) {
    item.acceleration = item.acceleration.zeroIfBelow(MIN_X_ACCELERATION, MIN_Y_ACCELERATION);
    item.velocity = item.velocity.zeroIfBelow(MIN_X_VELOCITY, MIN_Y_VELOCITY);
    if (item.force.isPresent() || item.velocity.isPresent() || item.acceleration.isPresent()) {
      this.handleMove(item, timeScale);
    }
  }

  applyForces() {
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];

      for (let j = i + 1 ; j < size; j++) {
        let b = items[j];
        if (!a.gravity || !b.gravity) {
          continue;
        }

        this.applyGravityForce(a, b);
      }
    }
  }

  applyGravityForce(a, b) {
    if (a === b) {
      return;
    }

    let boxA = a.shape;
    let boxB = b.shape;

/*
    let col = this.calculateCollision(a, b);
    if (col.penetration != null) {
      return;
    }
*/

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
    a.force = a.force.minus(df.multiply(a.gravityModifier));
    b.force = b.force.plus(df.multiply(b.gravityModifier));

    if (a.player) {
      //        console.log({t: this.ticks, FORCEa: 1, f: a.force.y, a: a.acceleration.y, v: a.velocity.y, from: b.label});
    }
    if (b.player) {
      //        console.log({t: this.ticks, FORCEb: 1, f: b.force.y, a: b.acceleration.y, v: b.velocity.y, from: a.label});
    }
  }

  collisionDetection() {
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];

      for (let j = i + 1; j < size; j++) {
        let b = items[j];
        if (a.world && b.world) {
          continue;
        }

        if (a.intersect(b)) {
          this.resolveCollision(a, b, this.handled);
        } else {
          a.clearCollision(b);
          b.clearCollision(a);
        }
      }
    }
  }

  resolveCollision(a, b) {
    let col = this.calculateCollision(a, b);
    let boxA = a.shape;
    let boxB = b.shape;

    if (!col.normal) {
      a.clearCollision(b);
      b.clearCollision(a);
      return;
    }

    if (a.isCollision(b)) {
      // NOTE KI try to avoid "stuck bouncing" collision
//      console.log("COLL_SKIP");
      return;
    }

    a.addCollision(b);
    b.addCollision(a);

    // relative velocity
    let rv = b.velocity.minus(a.velocity);

    // Calculate relative velocity in terms of the normal direction
    let velAlongNormal = rv.dot(col.normal);

    // Do not resolve if velocities are separating
    if (velAlongNormal > 0) {
//      return;
    }

    // Calculate restitution
    let materialA = boxA.getMaterial(col.normal);
    let materialB = boxB.getMaterial(col.normal);
    let e = (materialA.restitution + materialB.restitution) / 2;

    // Calculate impulse scalar
    let j = -(1 + e) * velAlongNormal;
    j /= 1 / boxA.mass + 1 / boxB.mass;

    // Apply impulse
    let impulseA = col.normal.multiply(j);
    let impulseB = col.normal.multiply(j);

    a.velocity = a.velocity.minus(impulseA.multiply(1 / boxA.mass));
    b.velocity = b.velocity.plus(impulseB.multiply(1 / boxB.mass));

    // NOTE KI collision kills acceleration
    if (b.player && Math.sign(b.acceleration.y) !== Math.sign(b.velocity.y)) {
//      debugger
    }

    a.acceleration.reset(0, 0);
    b.acceleration.reset(0, 0);

    if (a.player) {
//      console.log({t: this.ticks, COLLa: 1, f: a.force.y, a: a.acceleration.y, v: a.velocity.y, from: b.label});
    }
    if (b.player) {
//      console.log({t: this.ticks, COLLb: 1, f: b.force.y, a: b.acceleration.y, v: b.velocity.y, from: a.label});
    }
  }

  calculateCollision(a, b) {
    // Vector from A to B
    let n = this.distanceNormal(a, b);
    let normal = null;
    let penetration = null;

    let boxA = a.shape;
    let boxB = b.shape;

    let overlapX = n.x > 0 ? boxB.max.x - boxA.min.x : boxA.max.x - boxB.min.x;
    let overlapY = n.y > 0 ? boxB.max.y - boxA.min.y : boxA.max.y - boxB.min.y;

    if (overlapX < 0 || overlapY < 0) {
      return new Collision({a, b, penetration, normal});
    }

    // Find out which axis is axis of least penetration
    if (overlapX < overlapY) {
      // Point towards B knowing that n points from A to B
      if (n.x < 0) {
        normal = new Vector(-1, 0);
      } else {
        normal = new Vector(1, 0);
      }
      penetration = overlapX;
    } else {
      // Point toward B knowing that n points from A to B
      if (n.y < 0) {
        normal = new Vector(0, -1);
      } else {
        normal = new Vector(0, 1);
      }
      penetration = overlapY;
    }

    return new Collision({a, b, penetration, normal});
  }

  distanceNormal(a, b) {
    let boxA = a.shape;
    let boxB = b.shape;

    if (a.world === b.world) {
      return boxA.pos.minus(boxB.pos);
    }

    let sign = 1;
    if (a.world) {
      let t = a;
      a = b;
      b = t;
      sign = -1;
    }

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

  handleMove(a, dt) {
    if (a.player) {
//      console.log({t: this.ticks, MOVE1: 1, f: a.force.y, a: a.acceleration.y, v: a.velocity.y});
    }

    let boxA = a.shape;

    let ax = a.acceleration.x;
    let ay = a.acceleration.y;

    // ...acceleration
    ax += a.force.x / boxA.mass;
    ay += a.force.y / boxA.mass;

    if (Math.abs(ax) > MAX_X_ACCELERATION) {
      ax = MAX_X_ACCELERATION * Math.sign(ax);
    }

    if (Math.abs(ay) > MAX_Y_ACCELERATION) {
      ay = MAX_Y_ACCELERATION * Math.sign(ay);
    }

    let vx = a.velocity.x;
    let vy = a.velocity.y;

    if (a.player) {
//      console.log({t: this.ticks, MOVE2: 1, f: a.force.y, a: ay, v: vy});
    }

    vx += ax * dt;
    vy += ay * dt;

    if (Math.abs(vx) > MAX_X_VELOCITY) {
      vx = MAX_X_VELOCITY * Math.sign(vx);
    }

    if (Math.abs(vy) > MAX_Y_VELOCITY) {
      vy = MAX_Y_VELOCITY * Math.sign(vy);
    }

    a.acceleration = new Vector(ax, ay);
    a.velocity = new Vector(vx, vy);

    let movement = new Vector(vx * dt, vy * dt);

    let px = boxA.pos.x;
    let py = boxA.pos.y;

    a.move(movement);

    if (false) {
      let nx = boxA.pos.x;
      let ny = boxA.pos.y;

      if (px === nx) {
        ax = 0;
        vx = 0;
      }
      if (py === ny) {
        ay = 0;
        vy = 0;
      }
      a.acceleration.reset(ax, ay);
      a.velocity.reset(vx, vy);
    }

    if (a.player) {
//      console.log({t: this.ticks, MOVED: 1, f: a.force.y, a: a.acceleration.y, v: a.velocity.y});
    }

    if (a.itemChanged) {
      a.itemChanged(a);
    }
  }
}

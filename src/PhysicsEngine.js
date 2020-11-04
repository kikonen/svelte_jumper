import {bindMethods} from './bindMethods.js';

import Vector from './Vector.js';
import Material from './Material.js';
import BoxShape from './BoxShape.js';
import Collision from './Collision.js';
import Item from './Item.js';

const TICK_SPEED = 20;
const WORLD_SPEED = 50;

const GRAVITY = 6.674e-11;

const WALL_THICKNESS = 10000;

const START_LEFT_VELOCITY = new Vector(-3, 0);
const START_RIGHT_VELOCITY = new Vector(3, 0);

const MIN_X_VELOCITY = 0.01;
const MIN_Y_VELOCITY = 0.01;

const MAX_X_VELOCITY = 20;
const MAX_Y_VELOCITY = 20;

const MIN_X_ACCELERATION = 0.01;
const MIN_Y_ACCELERATION = 0.01;

const MAX_X_ACCELERATION = 10;
const MAX_Y_ACCELERATION = 10;

const START_JUMP_VELOCITY = new Vector(0, -20);

const START_FALL_VELOCITY = new Vector(0, 2);

const NOP = function() {};


export default class PhysicsEngine {
  constructor(dispatch) {
    bindMethods(this);

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
    let wallMaterial = new Material({density: 1000, restitution: 1.5});
    let skyMaterial = new Material({density: 1000, restitution: 1.5});
    let groundMaterial = new Material({density: 1000, restitution: 1.5});

    this.wallW = new Item({
      type: 'world',
      label: 'wallW',
      shape: new BoxShape(),
      material: wallMaterial,
      gravity: 0,
      friction: 1,
    });

    this.wallE = new Item({
      type: 'world',
      label: 'wallE',
      shape: new BoxShape(),
      material: wallMaterial,
      gravity: 0,
      friction: 1,
    });

    this.wallN = new Item({
      type: 'world',
      label: 'wallN',
      shape: new BoxShape(),
      material: skyMaterial,
      gravity: 0,
      friction: 1,
    });

    this.wallS = new Item({
      type: 'world',
      label: 'wallS',
      shape: new BoxShape(),
      material: groundMaterial,
      gravity: GRAVITY,
      friction: 1,
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

    this.area = new BoxShape({ min: null, max: new Vector(w, h)});

    const T = WALL_THICKNESS;

    this.wallW.setShape(new BoxShape({min: new Vector(-T, -T), max: new Vector(1, h + T)}));
    this.wallE.setShape(new BoxShape({min: new Vector(w - 1, -T), max: new Vector(w + T, h + T)}));

    this.wallN.setShape(new BoxShape({min: new Vector(-T, -T), max: new Vector(w + T, 1)}));
    this.wallS.setShape(new BoxShape({min: new Vector(-T, h - 1), max: new Vector(w + T, h + T)}));

  }

  register(item) {
    item.engine = this;

    this.items.push(item);
    this.byId.set(item.id, item);

    if (item.isPlayer) {
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
      this.fall(this.player);
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

  tick() {
    if (this.stopped) {
      return;
    }

    let now = Date.now();
    let elapsed = now - this.currentTime;
    let timeScale = elapsed / WORLD_SPEED;

//    console.log(timeScale, elapsed);

    this.updateBoundaries();

    this.items.forEach((item) => { item.clearTick() });

//    this.applyForces();
    this.collisionDetection();

    this.items.forEach((item) => { this.tickItem(item, timeScale); });

    this.currentTime = now;
//    requestAnimationFrame(this.tick);
  }

  applyForces() {
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];

      if (!a.gravity) {
        continue;
      }

      for (let j = i + 1; i < size; i++) {
        let b = items[j];
        this.applyGravityForce(a, b);
      }
    }
  }

  applyGravityForce(a, b) {
    if (a === b) {
      return;
    }

    let col = this.calculateCollision(a, b);
    if (col.penetration != null) {
      return;
    }

    // distance between centers of objects
    let dx = a.pos.x - b.pos.x;
    let dy = a.pos.y - b.pos.y;
    let r = Math.sqrt(dx * dx + dy * dy);

    // avoid division by 0
    if (r < 1) {
      r = 1;
    }

    // Compute force for this pair; k = 1000
    const K = Math.abs(a.gravity - b.gravity);
    let f = (K * a.mass * b.mass) / r * r;

    // Break it down into components
    let fx = f * dx / r;
    let fy = f * dy / r;

    // Accumulate for first object
    let df = new Vector(fx, fy);
    a.force = a.force.minus(df);
    b.force = b.force.plus(df);
  }

  collisionDetection() {
    let items = this.items;
    let size = items.length;

    for (let i = 0; i < size; i++) {
      let a = items[i];

      for (let j = i + 1; j < size; j++) {
        let b = items[j];
        if (a.type === 'world' && b.type === 'world') {
          continue;
        }

        if (a.intersect(b)) {
          this.resolveCollision(a, b, this.handled);
        }
      }
    }
  }

  resolveCollision(a, b) {
    let col = this.calculateCollision(a, b);
    if (!col.normal) {
      return;
    }

    // relative velocity
    let rv = b.velocity.minus(a.velocity);

    // Calculate relative velocity in terms of the normal direction
    let velAlongNormal = rv.dot(col.normal);

    // Do not resolve if velocities are separating
    if (velAlongNormal > 0) {
//      return;
    }

    // Calculate restitution
    let e = Math.min(a.material.restitution, b.material.restitution);

    // Calculate impulse scalar
    let j = -(1 + e) * velAlongNormal;
    j /= 1 / a.mass + 1 / b.mass;

    // Apply impulse
    let impulse = col.normal.multiply(j);
    a.velocity = a.velocity.minus(impulse.multiply(1 / a.mass));
    b.velocity = b.velocity.plus(impulse.multiply(1 / b.mass));
  }

  calculateCollision(a, b) {
    // Vector from A to B
    let n = a.pos.minus(b.pos);
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

  tickItem(item, timeScale) {
    item.accleration = item.velocity.zeroIfBelow(MIN_X_ACCELERATION, MIN_Y_ACCELERATION);
    item.velocity = item.velocity.zeroIfBelow(MIN_X_VELOCITY, MIN_Y_VELOCITY);
    if (!item.velocity.isEmpty()) {
      this.handleMove(item, timeScale);
    }
  }

  jump(item) {
/*
    if (item.velocity.y !== 0) {
      return;
    }
*/
    item.velocity = item.velocity.plus(START_JUMP_VELOCITY);
  }

  fall(item) {
    item.velocity = item.velocity.plus(START_FALL_VELOCITY);
  }

  moveLeft(item) {
    if (item.velocity.y > 0) {
//      return;
    }

    item.velocity = item.velocity.plus(START_LEFT_VELOCITY);
  }

  moveRight(item) {
    if (item.velocity.y > 0) {
//      return;
    }

    item.velocity = item.velocity.plus(START_RIGHT_VELOCITY);
  }

  handleMove(a, dt) {
    let ax = a.acceleration.x;
    let ay = a.acceleration.y;

    // ...acceleration
    ax += a.force.x / a.mass;
    ay += a.force.y / a.mass;

    if (Math.abs(ax) > MAX_X_ACCELERATION) {
      ax = MAX_X_ACCELERATION * Math.sign(ax);
    }

    if (Math.abs(ay) > MAX_Y_ACCELERATION) {
      ay = MAX_Y_ACCELERATION * Math.sign(ay);
    }

    let vx = a.velocity.x;
    let vy = a.velocity.y;

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

    a.move(movement);

    if (a.itemChanged) {
      a.itemChanged(a);
    }
  }
}

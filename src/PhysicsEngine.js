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
  tar: new Material({label: 'tar', density: 5, restitution: 0, friction: 1}),
  brick: new Material({label: 'brick', density: 5, restitution: 0.4}),
  steel: new Material({label: 'steel', density: 5, restitution: 0.4}),
  copper: new Material({label: 'copper', density: 5, restitution: 0.4}),
  spring: new Material({label: 'spring', density: 5, restitution: 0.7}),
  human: new Material({label: 'human', density: 1, restitution: 0.2}),
  sky: new Material({label: 'sky', density: 1, restitution: 1, friction: 0}),
  wall: new Material({label: 'wall', density: 1, restitution: 1, friction: 0}),
  ground: new Material({label: 'ground', density: 8, restitution: 0.1, friction: 0.5}),
  void: new Material({label: 'void', density: 0, restitution: 0, friction: 0}),
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

    let overlap = 0;

    this.wallW.shape.set(new Vector(-T, -T), new Vector(overlap, h + T));
    this.wallE.shape.set(new Vector(w - overlap, -T), new Vector(w + T, h + T));

    this.wallN.shape.set(new Vector(-T, -T), new Vector(w + T, overlap));
    this.wallS.shape.set(new Vector(-T, h - overlap), new Vector(w + T, h + T));
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

  jump(a) {
    if (a.velocity.y < 0 || a.acceleration.y < 0) {
      return;
    }

    a.velocity = a.velocity.plus(START_JUMP_VELOCITY);
    a.acceleration = a.acceleration.plus(START_JUMP_ACCELERATION);
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
      a.acceleration = a.acceleration.zeroIfBelow(MIN_X_ACCELERATION, MIN_Y_ACCELERATION);
      a.velocity = a.velocity.zeroIfBelow(MIN_X_VELOCITY, MIN_Y_VELOCITY);
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
        } else {
          a.clearCollision(b);
          b.clearCollision(a);
        }
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

        if (!a.gravity || !b.gravity) {
          continue;
        }

        this.applyGravityForce(a, b);
      }
    }
  }

  applyGravityForce(a, b) {
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
      a.clearCollision(b);
      b.clearCollision(a);
      return;
    }

    if (a.isCollision(b)) {
      // NOTE KI try to avoid "stuck bouncing" collision
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
    let materialB = boxB.getMaterial(col.normal.multiply(-1));

    let e = (materialA.restitution + materialB.restitution) / 2;

    // Calculate impulse scalar
    let j = -(1 + e) * velAlongNormal;
    j /= boxA.massI + boxB.massI;

    // Apply impulse
    let impulse = col.normal.multiply(j);

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

    a.clearCollision(b);
    b.clearCollision(a);

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

    return new Collision({a, b, overlap, normal});
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
  }
}

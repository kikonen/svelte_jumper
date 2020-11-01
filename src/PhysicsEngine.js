import {bindMethods} from './bindMethods.js';

import Vector from './Vector.js';
import Material from './Material.js';
import BoxShape from './BoxShape.js';
import Collision from './Collision.js';
import Item from './Item.js';

const WORLD_SPEED = 40;

const WALL_THICKNESS = 10000;

const START_LEFT_VELOCITY = new Vector(-3, 0);
const START_RIGHT_VELOCITY = new Vector(3, 0);

const MIN_X_VELOCITY = 0.01;
const MIN_Y_VELOCITY = 0.01;

const ADD_MOVE_VELOCITY = 1.4;
const MIN_MOVE_VELOCITY = 0.1;
const MAX_MOVE_VELOCITY = 20;

const START_JUMP_VELOCITY = new Vector(0, -20);
const MIN_JUMP_VELOCITY = -0.5;

const START_FALL_VELOCITY = new Vector(0, 2);
const MIN_FALL_VELOCITY = 0.01;
const MAX_FALL_VELOCITY = 100;

const NOP = function() {};


export default class PhysicsEngine {
  constructor(dispatch) {
    bindMethods(this);

    this.dispatch = dispatch;

    this.items = new Map();

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
    let wallMaterial = new Material({density: 10000, restitution: 1.5});
    let skyMaterial = new Material({density: 10000, restitution: 1.5});
    let groundMaterial = new Material({density: 10000, restitution: 1.5});

    this.wallW = new Item({
      type: 'world',
      label: 'wallW',
      shape: new BoxShape(),
      material: wallMaterial,
      gravity: 1,
      friction: 1,
    });

    this.wallE = new Item({
      type: 'world',
      label: 'wallE',
      shape: new BoxShape(),
      material: wallMaterial,
      gravity: 1,
      friction: 1,
    });

    this.wallN = new Item({
      type: 'world',
      label: 'wallN',
      shape: new BoxShape(),
      material: skyMaterial,
      gravity: 1,
      friction: 1,
    });

    this.wallS = new Item({
      type: 'world',
      label: 'wallS',
      shape: new BoxShape(),
      material: groundMaterial,
      gravity: 1,
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
    this.items.set(item.id, item);
    if (item.isPlayer) {
      this.player = item;
    }
  }

  subscribe(id, itemChanged) {
    let item = this.items.get(id);
    if (item) {
      item.itemChanged = itemChanged;
    }
  }

  getItem(id) {
    return this.items.get(id);
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
    this.timerId = setInterval(this.tick, WORLD_SPEED);
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
    this.collisionDetection();

    this.items.forEach((item) => { this.tickItem(item, timeScale); });

    this.currentTime = now;
//    requestAnimationFrame(this.tick);
  }

  collisionDetection() {
    this.items.forEach((item) => {
      if (item.type !== 'world') {
        this.itemCollisionDetection(item);
      }
    });
  }

  itemCollisionDetection(a) {
    this.items.forEach((b) => {
      if (a.intersect(b)) {
        this.resolveCollision(a, b);
      }
    });
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

    let overlapX = n.x < 0 ? boxB.max.x - boxA.min.x : boxA.max.x - boxB.min.x;
    let overlapY = n.y < 0 ? boxB.max.y - boxA.min.y : boxA.max.y - boxB.min.y;

    // SAT test on x axis
    if (overlapX > 0) {
      // SAT test on y axis
      if (overlapY > 0) {
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
          penetration = overlapX;
        }
      }
    }

    return new Collision({a, b, penetration, normal});
  }

  tickItem(item, timeScale) {
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
      return;
    }

    item.velocity = item.velocity.plus(START_LEFT_VELOCITY);
  }

  moveRight(item) {
    if (item.velocity.y > 0) {
      return;
    }

    item.velocity = item.velocity.plus(START_RIGHT_VELOCITY);
  }

  handleMove(item, timeScale) {
    let x = item.velocity.x;
    let y = item.velocity.y;

    if (x !== 0) {
      x = x * item.friction;

      if (Math.abs(x) > MAX_MOVE_VELOCITY) {
        x = MAX_MOVE_VELOCITY * Math.sign(x);
      }
    }

    if (y > 0) {
      y = y / item.gravity;
    } else if (y < 0) {
      y = y * item.gravity;
      if (y > MIN_JUMP_VELOCITY) {
        y = START_FALL_VELOCITY.y;
      }
    }

    if (y > MAX_FALL_VELOCITY) {
      y = MAX_FALL_VELOCITY;
    }

    item.velocity = new Vector(x, y);

    let movement = new Vector(x * timeScale, y * timeScale);

    item.adjustLocation(movement);

    if (item.itemChanged) {
      item.itemChanged(item);
    }
  }

}

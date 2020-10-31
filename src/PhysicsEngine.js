import {bindMethods} from './bindMethods.js';

import Vector from './Vector.js';
import BoxShape from './BoxShape.js';
import Item from './Item.js';

const WORLD_SPEED = 40;

const START_LEFT_VELOCITY = new Vector(-3, 0);
const START_RIGHT_VELOCITY = new Vector(3, 0);

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

    this.area = new BoxShape();

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

  register(item) {
    item.engine = this;
    this.items.set(item.id, item);
    if (item.isPlayer) {
      this.player = item;
    }
  }

  subscribe(id, itemChanged) {
    let item = this.items.get(id);
    item.itemChanged = itemChanged;
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
    (this.controls[event.key] || this.controls[event.code] || this.controls.nop)(event);
  }

  start() {
    if (this.started) {
      return;
    }
    this.started = true;
    this.items.forEach(this.startItem);

    this.fall(this.player);

    this.timerId = setInterval(this.tick, WORLD_SPEED);
  }

  stop() {
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
    this.area = new BoxShape(null, new Vector(this.getWidth(), this.getHeight()));

    this.hitDetection();

    this.items.forEach(function(item) { this.tickItem(item); }.bind(this));
  }

  hitDetection() {
    this.items.forEach(function(item) {
      this.itemHitDetection(item);
    }.bind(this));
  }

  itemHitDetection(item) {
    let hits = [];
    this.items.forEach(function(b) {
      if (item.intersect(b)) {
        hits.push(b);
      }
    }.bind(this));

    if (hits.length) {
    }
  }

  tickItem(item) {
    if (!item.velocity.isEmpty()) {
      this.handleMove(item);
    }
  }

  jump(item) {
    if (item.velocity.y !== 0) {
      return;
    }

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

  handleMove(item) {
    let x = item.velocity.x;
    let y = item.velocity.y;

    if (x !== 0) {
      x = x * item.friction;

      if (Math.abs(x) < MIN_MOVE_VELOCITY) {
        x = 0;
      }
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

    item.adjustLocation(item.velocity);

    if (x !== 0) {
      if (item.shape.min.x == this.area.min.x || item.shape.max.x == this.area.max.x) {
        item.velocity = item.velocity.multiplyX(-1);
      }
    }

    if (item.shape.min.y == this.area.min.y) {
      item.velocity = item.velocity.changeY(START_FALL_VELOCITY.y);
    }
    if (item.shape.max.y == this.area.max.y) {
      item.velocity = item.velocity.multiplyY(0);
    }

    item.itemChanged(item);
  }

}

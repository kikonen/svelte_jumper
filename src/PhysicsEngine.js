const WORLD_SPEED = 40;

const DEFAULT_GRAVITY = 0.9;
const DEFAULT_FRICTION = 0.9;

const START_MOVE_VELOCITY = 3;
const ADD_MOVE_VELOCITY = 1.4;
const MIN_MOVE_VELOCITY = 0.1;
const MAX_MOVE_VELOCITY = 20;

const START_JUMP_VELOCITY = 20;
const MIN_JUMP_VELOCITY = 0.5;

const START_FALL_VELOCITY = 2;
const MIN_FALL_VELOCITY = 0.01;
const MAX_FALL_VELOCITY = 100;

const NOP = function() {};


export default class PhysicsEngine {
  constructor(dispatch) {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    methods
      .filter(method => (method !== 'constructor'))
      .forEach((method) => { this[method] = this[method].bind(this); });

    this.dispatch = dispatch;

    this.idBase = 0;
    this.items = new Map();

    this.area = {
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0,
    };

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

  nextId() {
    return ++this.idBase;
  }

  register(item, isPlayer) {
    item.id = this.nextId();

    let halfW = item.width / 2;
    let halfH = item.height / 2;

    item.box = {
      halfW: halfW,
      halfH: halfH,
      x0: item.x - halfW,
      y0: item.y - halfH,
      x1: item.x + halfW,
      y1: item.y + halfH,
    };

    this.items.set(item.id, item);
    if (isPlayer) {
      this.setPlayer(item.id);
    }
  }

  setPlayer(id) {
    let item = this.items.get(id);

    item.isPlayer = true;
    this.playerId = item.id;
    this.player = item;
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

    this.timerId = setInterval(this.tick, WORLD_SPEED);
  }

  stop() {
    this.timerId = clearInterval(this.timerId);
    this.items.forEach(this.stopItem);
  }

  stopItem(item) {
    item.velocityX = 0;
    item.velocityY = 0;
  }

  startItem(item) {
    if (item.itemChanged) {
      item.itemChanged(item);
    }

    this.testFall(item);
  }

  tick() {
    this.area.x1 = this.getWidth();
    this.area.y1 = this.getHeight();

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
      if (this.isHit(item, b)) {
        hits.push(b);
      }
    }.bind(this));

    if (hits.length) {
    }
  }

  tickItem(item) {
    if (item.velocityX && item.velocityX > 0) {
      this.handleMove(item);
    }

    if (item.velocityY && item.velocityY > 0) {
      if (item.dirY > 0) {
        this.handleFall(item);
      } else {
        this.handleJump(item);
      }
    }
  }

  testFall(item) {
    this.fall(item);
    this.items.forEach(function(b) {
    });
  }

  jump(item) {
    if (item.velocityY > 0) {
      return;
    }

    item.gravity = item.gravity != null ? item.gravity : DEFAULT_GRAVITY;
    item.velocityY = START_JUMP_VELOCITY;
    item.dirY = -1;
  }

  fall(item) {
    item.gravity = item.gravity != null ? item.gravity : DEFAULT_GRAVITY;
    item.velocityY = START_FALL_VELOCITY;
    item.dirY = 1;
  }

  moveLeft(item) {
    if (item.dirX !== -1) {
      item.velocityX = 0;
    }
    item.dirX = -1;
    this.startMove(item);
  }

  moveRight(item) {
    if (item.dirX !== 1) {
      item.velocityX = 0;
    }
    item.dirX = 1;
    this.startMove(item);
  }

  startMove(item) {
    if (item.velocityX && item.velocityX > 0) {
      item.velocityX *= ADD_MOVE_VELOCITY;
    } else {
      item.velocityX = item.velocityX || START_MOVE_VELOCITY;
      item.friction = item.friction != null ? item.friction : DEFAULT_FRICTION;
    }
    if (item.velocityX > MAX_MOVE_VELOCITY) {
      item.velocityX = MAX_MOVE_VELOCITY;
    }
  }

  handleJump(item) {
    if (item.velocityY === 0) {
      return;
    }

    item.velocityY = item.velocityY * item.gravity;

    let movement = item.velocityY * 1;
    let diffY = movement * item.dirY;

    this.adjustLocation(item, 0, diffY);

    if (item.box.y1 <= this.area.y0 || item.velocityY < MIN_JUMP_VELOCITY) {
      this.fall(item);
    }

    item.itemChanged(item);
  }

  handleFall(item) {
    if (item.velocityY === 0) {
      return;
    }

    item.velocityY = item.velocityY / item.gravity;

    if (item.velocityY > MAX_FALL_VELOCITY) {
      item.velocityY = MAX_FALL_VELOCITY;
    }

    let movement = item.velocityY * 1;
    let diffY = movement * item.dirY;

    this.adjustLocation(item, 0, diffY);

    if (item.box.y1 >= this.area.y1 || item.velocityY < MIN_FALL_VELOCITY) {
      item.velocityY = 0;
    }

    item.itemChanged(item);
  }

  handleMove(item) {
    item.velocityX = item.velocityX * item.friction;

    let movement = item.velocityX * 1;
    let newX = item.x + movement * item.dirX;

    this.adjustLocation(item, movement * item.dirX, 0);

    if (item.velocityX < MIN_MOVE_VELOCITY) {
      item.velocityX = 0;
    } else if (item.box.x0 <= this.area.x0 || item.box.x1 >= this.area.x1) {
      item.dirX = item.dirX * -1;
      newX += item.dirX;
    }

    item.itemChanged(item);
  }

  adjustLocation(item, diffX, diffY) {
    let changed = false;

    let area = this.area;
    let box = item.box;
    let halfW = box.halfW;
    let halfH = box.halfH;

    if (diffX !== 0) {
      let newX = item.x + diffX;

      if (newX - halfW < area.x0) {
        newX = area.x0 + halfW;
      } else if (newX + halfW > area.x1) {
        newX = area.x1 - halfW;
      }

      changed = item.x !== newX;
      item.x = newX;
    }

    if (diffY !== 0) {
      let newY = item.y + diffY;

      if (newY - halfH < area.y0) {
        newY = area.y0 + halfH;
      } else if (newY + halfH > area.y1) {
        newY = area.y1 - halfH;
      }

      changed = changed || item.y !== newY;
      item.y = newY;
    }

    if (changed) {
      box.x0 = item.x - halfW;
      box.y0 = item.y - halfH;
      box.x1 = item.x + halfW;
      box.y1 = item.y + halfH;
    };

    return changed;
  }

  isHit(a, b) {
    if (a === b) {
      return false;
    }

    let boxA = a.box;
    let boxB = b.box;

    if (boxA.x1 < boxB.x0 || boxA.x0 > boxB.x1) {
      return false;
    }
    if (boxA.y1 < boxB.y0 || boxA.y0 > boxB.y1) {
      return false;
    }

    return true;
  }
}

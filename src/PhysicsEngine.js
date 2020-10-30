const WORLD_SPEED = 20;

const DEFAULT_GRAVITY = 0.9;
const DEFAULT_FRICTION = 0.9;

const START_MOVE_VELOCITY = 3;
const ADD_MOVE_VELOCITY = 1.4;
const MIN_MOVE_VELOCITY = 0.1;
const MAX_MOVE_VELOCITY = 20;

const START_JUMP_VELOCITY = 20;
const MIN_JUMP_VELOCITY = 0.5;

const START_FALL_VELOCITY = 2;
const MAX_FALL_VELOCITY = 100;


export default class PhysicsEngine {
  constructor(dispatch) {
    this.dispatch = dispatch;

    this.idBase = 0;
    this.items = new Map();

    let self = this;
    this.controls = {
      nop: function() {},

      ArrowLeft: function(ev) {
        self.moveLeft(self.player);
      },
      ArrowRight: function(ev) {
        self.moveRight(self.player);
      },
      ArrowUp: function(ev) {
        self.jump(self.player);
      },
    };

    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    methods
      .filter(method => (method !== 'constructor'))
      .forEach((method) => { this[method] = this[method].bind(this); });
  }

  nextId() {
    return ++this.idBase;
  }

  register(item, isPlayer) {
    item.id = this.nextId();
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
    this.stopFall(item);
    this.stopJump(item);
    this.stopMove(item);
  }

  startItem(item) {
    if (item.itemChanged) {
      item.itemChanged(item);
    }

    if (item.isPlayer) {
      this.fall(item);
    }
  }

  tick() {
    const areaW = this.getWidth();
    const areaH = this.getHeight();

    this.items.forEach(function(item) { this.tickItem(item, areaW, areaH); }.bind(this));
  }

  tickItem(item, areaW, areaH) {
    if (item.velocityX && item.velocityX > 0) {
      const minX =  item.width / 2;
      const maxX = areaW - item.width / 2;

      this.handleMove(item, minX, maxX);
    }

    if (item.velocityY && item.velocityY > 0) {
      const minY = item.height / 2;
      const maxY = areaH - item.height / 2;

      if (item.dirY > 0) {
        this.handleFall(item, minY, maxY);
      } else {
        this.handleJump(item, minY, maxY);
      }
    }
  }

  getMinX(item) {
    return item.width / 2;
  }

  getMaxX(item) {
    return this.getWidth() - item.width / 2;
  }

  getMinY(item) {
    return item.height / 2;
  }

  getMaxY(item) {
    return this.getHeight() - item.height / 2;
  }

  stopJump(item) {
    item.velocityY = 0;
  }

  stopFall(item) {
    item.velocityY = 0;
  }

  stopMove(item) {
    item.velocityX = 0;
  }

  jump(item) {
    if (item.velocityY && item.velocityY > 0) {
      return;
    }

    this.stopFall(item);

    item.gravity = item.gravity || DEFAULT_GRAVITY;
    item.velocityY = START_JUMP_VELOCITY;
    item.dirY = -1;
  }

  fall(item) {
    this.stopJump(item);
    this.stopFall(item);

    item.gravity = item.gravity || DEFAULT_GRAVITY;
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
      item.friction = item.friction || DEFAULT_FRICTION;
    }
    if (item.velocityX > MAX_MOVE_VELOCITY) {
      item.velocityX = MAX_MOVE_VELOCITY;
    }
  }

  handleJump(item, minY, maxY) {
    item.velocityY = item.velocityY * item.gravity;

    let movement = item.velocityY * 1;
    let newY = item.y + movement * item.dirY;

    if (newY <= minY) {
      newY = minY;
    } else if (newY > maxY) {
      newY = maxY;
    }

    if (newY <= minY || item.velocityY < MIN_JUMP_VELOCITY) {
      this.fall(item);
    }

    item.y = newY;

    item.itemChanged(item);
  }

  handleFall(item, minY, maxY) {
    item.velocityY = item.velocityY / item.gravity;
    if (item.velocityY > MAX_FALL_VELOCITY) {
      item.velocityY = MAX_FALL_VELOCITY;
    }

    let movement = item.velocityY * 1;
    let newY = item.y + movement * item.dirY;

    if (newY <= minY) {
      newY = minY;
    } else if (newY > maxY) {
      newY = maxY;
    }

    if (newY >= maxY) {
      this.stopFall(item);
    }

    item.y = newY;

    item.itemChanged(item);
  }

  handleMove(item, minX, maxX) {
    item.velocityX = item.velocityX * item.friction;

    let movement = item.velocityX * 1;
    let newX = item.x + movement * item.dirX;

    if (newX <= minX) {
      newX = minX;
    } else if (newX > maxX) {
      newX = maxX;
    }

    if (item.velocityX < MIN_MOVE_VELOCITY) {
      this.stopMove(item);
    } else if (newX <= minX || newX >= maxX) {
      item.dirX = item.dirX * -1;
      newX += item.dirX;
    }

    item.x = newX;

    item.itemChanged(item);
  }
}

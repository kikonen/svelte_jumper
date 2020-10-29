const DEFAULT_GRAVITY = 0.9;
const DEFAULT_FRICTION = 0.9;

const START_VELOCITY_X = 3;
const ADD_VELOCITY_X = 1.4;
const MIN_VELOCITY_X = 0.1;
const MAX_VELOCITY_X = 20;

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
  }

  stop() {
    this.stopItem(this.player);
  }

  stopItem(item) {
    this.stopFall(item);
    this.stopJump(item);
    this.stopMove(item);
  }

  tick() {
    this.items.forEach(this.tickItem);
  }

  startItem(item) {
    if (item.itemChanged) {
      item.itemChanged(item);
    }

    if (item.isPlayer) {
      this.fall(item);
    }
  }

  tickItem(item) {
    if (item.velocityX <= 0)  {
      item.velocityX = 0;
      return;
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
    item.jumpTimerId = clearInterval(item.jumpTimerId);
  }

  stopFall(item) {
    item.fallTimerId = clearInterval(item.fallTimerId);
  }

  stopMove(item) {
    item.moveTimerId = clearInterval(item.moveTimerId);
  }

  jump(item) {
    if (item.jumpTimerId || item.fallTimerId) {
      return;
    }

    this.stopFall(item);

    item.gravity = item.gravity || DEFAULT_GRAVITY;
    item.velocityY = START_JUMP_VELOCITY;
    item.dirY = -1;

    item.jumpTimerId = setInterval(function() { this.handleJump(item); }.bind(this), 50);
  }

  fall(item) {
    this.stopJump(item);
    this.stopFall(item);

    item.gravity = item.gravity || DEFAULT_GRAVITY;
    item.velocityY = START_FALL_VELOCITY;
    item.dirY = 1;

    item.fallTimerId = setInterval(function() { this.handleFall(item); }.bind(this), 50);
  }

  moveLeft(item) {
    if (item.dirX !== -1) {
      item.velocityX = START_VELOCITY_X;
    }
    item.dirX = -1;
    this.startMove(item);
  }

  moveRight(item) {
    if (item.dirX !== 1) {
      item.velocityX = START_VELOCITY_X;
    }
    item.dirX = 1;
    this.startMove(item);
  }

  startMove(item) {
    if (item.moveTimerId) {
      item.velocityX *= ADD_VELOCITY_X;
    } else {
      item.velocityX = item.velocityX || START_VELOCITY_X;
      item.friction = item.friction || DEFAULT_FRICTION;
    }
    if (item.velocity > MAX_VELOCITY_X) {
      item.velocity = MAX_VELOCITY_X;
    }

    if (!item.moveTimerId) {
      item.moveTimerId = setInterval(function() { this.handleMove(item); }.bind(this), 20);
    }
  }

  handleJump(item) {
    const minY = this.getMinY(item);
    const maxY = this.getMaxY(item);

    item.velocityY = item.velocityY * item.gravity;

    let movement = item.velocityY * 1;
    let newY = item.y + movement * item.dirY;

    if (newY <= minY || newY > maxY || item.velocityY < MIN_JUMP_VELOCITY) {
      this.fall(item);
    }
    if (newY <= minY) {
      newY = minY;
    } else if (newY > maxY) {
      newY = maxY;
    }

    item.y = newY;

    item.itemChanged(item);
  }

  handleFall(item) {
    const minY = this.getMinY(item);
    const maxY = this.getMaxY(item);

    item.velocityY = item.velocityY / item.gravity;
    if (item.velocityY > MAX_FALL_VELOCITY) {
      item.velocityY = MAX_FALL_VELOCITY;
    }

    let movement = item.velocityY * 1;
    let newY = item.y + movement * item.dirY;

    if (newY <= minY || newY > maxY) {
      this.stopFall(item);
    }
    if (newY <= minY) {
      newY = minY;
    } else if (newY > maxY) {
      newY = maxY;
    }

    item.y = newY;

    item.itemChanged(item);
  }

  handleMove(item) {
    const minX = this.getMinX(item);
    const maxX = this.getMaxX(item);

    item.velocityX = item.velocityX * item.friction;

    let movement = item.velocityX * 1;
    let newX = item.x + movement * item.dirX;

    if (newX <= minX || newX > maxX || item.velocityX < MIN_VELOCITY_X) {
      this.stopMove(item);
    }
    if (newX <= minX) {
      newX = minX;
    } else if (newX > maxX) {
      newX = maxX;
    }

    item.x = newX;

    item.itemChanged(item);
  }
}

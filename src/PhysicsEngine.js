const GRAVITY = 0.9;
const FRICTION = 0.8;

const MAX_JUMP = 200;
const MAX_MOVE = 50;


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
    this.stopFall(this.player);
    this.stopJump(this.player);
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
    if (item.velocity <= 0)  {
      item.velocity = 0;
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

    item.gravity = GRAVITY;
    item.jumpHeight = 0;
    item.jumpStart = item.y;

    item.jumpTimerId = setInterval(function() { this.handleJump(item); }.bind(this), 50);
  }

  handleJump(item) {
    item.jumpHeight += 10 * item.gravity;
    item.y = item.jumpStart - item.jumpHeight;

    if (item.jumpHeight >= MAX_JUMP) {
      this.fall(item);
    }
    item.itemChanged(item);
  }

  fall(item) {
    this.stopJump(item);
    this.stopFall(item);

    item.gravity = GRAVITY;
    item.jumpHeight = 0;
    item.jumpStart = item.y;

    item.fallTimerId = setInterval(function() { this.handleFall(item); }.bind(this), 50);
  }

  handleFall(item) {
    let minY = this.getMinY(item);
    let maxY = this.getMaxY(item);

    item.jumpHeight -= 10 / item.gravity;
    item.y = item.jumpStart - item.jumpHeight;

    if (item.y >= maxY) {
      item.y = maxY;
      this.stopFall(item);
    }

    item.itemChanged(item);
  }

  moveLeft(item) {
    item.dir = -1;
    this.startMove(item);
  }

  moveRight(item) {
    item.dir = 1;
    this.startMove(item);
  }

  startMove(item) {
    if (item.moveTimerId) {
      return;
    }

    item.velocity = 5;
    item.moveStart = item.x;
    item.movement = 0;
    item.friction = FRICTION;

    item.moveTimerId = setInterval(function() { this.handleMove(item); }.bind(this), 20);
  }

  handleMove(item) {
    const minX = this.getMinX(item);
    const maxX = this.getMaxX(item);

    item.movement += item.velocity * item.friction;

    let newX = item.moveStart + item.movement * item.dir;

    if (newX <= minX || newX > maxX || item.movement > MAX_MOVE) {
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

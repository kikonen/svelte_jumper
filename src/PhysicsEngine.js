const GRAVITY = 0.9;
const FRICTION = 0.8;

const MAX_JUMP = 200;
const MAX_MOVE = 50;

export default class PhysicsEngine {
  constructor() {
    this.idBase = 0;
    this.items = [];
  }

  nextId() {
    return ++this.idBase;
  }

  register(item) {
    item.id = this.nextId();
    this.items.push(item);
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

  tick() {
    this.items.forEach(this.moveItem);
  }

  moveItem(item) {
    if (item.velocity <= 0)  {
      item.velocity = 0;
      return;
    }


  }
}

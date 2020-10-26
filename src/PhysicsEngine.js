export default class PhysicsEngine {
  constructor() {
    this.idBase = 0;
    this.elements = [];
  }

  nextId() {
    return ++this.idBase;
  }

  register(element) {
    element.id = this.nextId();
    this.elements.push(element);
  }

  registerContainer(container) {
    this.container = container;
  }

  getWidth() {
    return this.container ? this.container.clientWidth : 600;
  }

  getHeight() {
    return this.container.clientHeight;
  }

}

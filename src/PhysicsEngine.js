export default class PhysicsEngine {
  constructor() {
    this.nodes = [];
  }

  register(node) {
    this.nodes.push(node);
  }
}

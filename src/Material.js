import {bindMethods} from './bindMethods.js';


export default class Material {
  constructor({label = '', density = 10, restitution = 0.1, friction = 1} = {}) {
    bindMethods(this);

    this.label = label;
    this.density = density;
    this.restitution  = restitution;
    this.friction = friction;
  }

  toString() {
    return `{l: ${this.label}, d: ${this.density}, r: ${this.restitution}, f: ${this.friciton}]`;
  }
}

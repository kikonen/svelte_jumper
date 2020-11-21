import {bindMethods} from './bindMethods.js';


export default class Material {
  constructor({
    label = '',
    density = 10,
    restitution = 0.1,
    staticFriction = 0.5,
    dynamicFriction = 0.5} = {}) {
    bindMethods(this);

    this.label = label;
    this.density = density;
    this.restitution  = restitution;
    this.staticFriction = staticFriction;
    this.dynamicFriction = dynamicFriction;
  }

  toString() {
    return `{l: ${this.label}, d: ${this.density}, r: ${this.restitution}, f: ${this.friciton}]`;
  }
}

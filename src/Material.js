import {bindMethods} from './bindMethods.js';


export default class Material {
  constructor({density = 10, restitution = 0.3} = {}) {
    bindMethods(this);

    this.density = density;
    this.restitution  = restitution;
  }
}

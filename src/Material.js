import {bindMethods} from './bindMethods.js';


export default class Material {
  constructor(density, surfaceFriction) {
    bindMethods(this);

    this.density = density;
    this.surfaceFriction = surfaceFriction;
  }
}

export default class Player {
  constructor(opt) {
    this.name = opt.name;
    this.bottom = opt.bottom;
    this.left = opt.left;
  }

  start() {
  }

  jump() {
    this.bottom += 30;
  }

  moveLeft() {
    this.left -= 5;
  }

  moveRight() {
    this.left += 5;
  }
}

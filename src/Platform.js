export default class Platform {
  constructor(opt) {
    this.bottom = opt.bottom;
    this.left = opt.left;

    this.direction = 1;
  }

  start() {
    let self = this;
    this.stop();
    this.timerId = setInterval(function() {
      self.tick();
    }, 50);
  };

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  tick() {
    let newLeft = this.left + 5 * this.direction;
    if (newLeft <= 0 || newLeft > 700) {
      this.direction = this.direction * -1;
    }
    this.left = newLeft;
  };

  moveLeft() {
  }

  moveRight() {
    this.left += 5;
  }
}

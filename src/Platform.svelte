<script>
  import { onDestroy } from 'svelte';

  export let platform;

  function start() {
    let self = this;
    this.stop();
    this.timerId = setInterval(function() {
      self.tick();
    }, 50);
  };

  function stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  function tick() {
    let newLeft = this.left + 5 * this.direction;
    if (newLeft <= 0 || newLeft > 700) {
      this.direction = this.direction * -1;
    }
    this.left = newLeft;
  };

  function moveLeft() {
  }

  function moveRight() {
    this.left += 5;
  }

  onDestroy(function() {
    stop();
  });
</script>

<platform style="left: {platform.left}px; bottom: {platform.bottom}px;">
</platform>

<style>
  platform {
    background-color: gray;
    width: 100px;
    height: 20px;
    position: absolute;
  }
</style>

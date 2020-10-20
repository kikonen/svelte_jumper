<script>
  import { onDestroy } from 'svelte';

  export let platform;
  export let started;

  let timerId;
  let direction = 1;

  $: {
    if (started) {
      start();
    } else {
      stop();
    }
  }

  function start() {
    console.log("start");
    stop();
    timerId = setInterval(function() {
      tick();
    }, 50);
  };

  function stop() {
    console.log("stop/");
    timerId = clearInterval(timerId);
  }

  function tick() {
    let newLeft = platform.left + 5 * direction;
    if (newLeft <= 0 || newLeft > 700) {
      direction = direction * -1;
    }
    platform.left = newLeft;
  };

  function moveLeft() {
  }

  function moveRight() {
    platform.left += 5;
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

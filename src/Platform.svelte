<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';

  export let engine;
  export let data;
  export let index;
  export let playfield;

  let el;

  let left = 0;
  let bottom = 0;
  let width = 100;
  let height = 20;

  let timerId;
  let direction = 1;
  let speed = 0;

  function getMaxLeft() {
    return engine.getWidth() - data.width;
  }

  function start() {
    console.log(`start: ${data.id}`);
    stop();
    timerId = setInterval(function() {
      tick();
    }, speed);
  };

  function stop() {
    console.log(`stop: ${data.id}`);
    timerId = clearInterval(timerId);
  }

  function tick() {
    let newLeft = left + 5 * direction;
    let maxLeft = getMaxLeft();
    if (newLeft <= 0 || newLeft > maxLeft) {
      newLeft = newLeft <= 0 ? 0 : maxLeft;
      direction = direction * -1;
    }
    left = newLeft;
  };

  function moveLeft() {
  }

  function moveRight() {
    left += 5;
  }

  onMount(function() {
    width = data.width;
    height = data.height;
    left = data.left;
    bottom = data.bottom;
    speed = data.speed;
    start();
  });

  onDestroy(function() {
    console.log(`destroy data: ${data.id}`);
    stop();
  });
</script>

<platform bind:this={el} style="left: {left}px; bottom: {bottom}px; height: {height}px; width: {width}px;">
</platform>

<style>
  platform {
    background-color: gray;
    position: absolute;
  }
</style>

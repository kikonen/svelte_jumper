<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';

  export let engine;
  export let data;
  export let index;
  export let playfield;

  let el;

  let x = 0;
  let y = 0;
  let width = 100;
  let height = 20;

  let timerId;
  let direction = 1;

  function getMinX() {
    return width / 2;
  }

  function getMaxX() {
    return engine.getWidth() - width / 2;
  }

  function getMinY() {
    return height / 2;
  }

  function getMaxY() {
    return engine.getHeight() - height / 2;
  }

  function start() {
    console.log(`start: ${data.id}`);
    stop();
    timerId = setInterval(function() {
      tick();
    }, data.velocity);
  };

  function stop() {
    console.log(`stop: ${data.id}`);
    timerId = clearInterval(timerId);
  }

  function tick() {
    let newX = x + 5 * direction;
    let minX = getMinX();
    let maxX = getMaxX();

    if (newX <= minX || newX > maxX) {
      newX = newX <= minX ? minX : maxX;
      direction = direction * -1;
    }
    x = newX;
  };

  onMount(function() {
    x = data.x;
    y = data.y;
    width = data.width;
    height = data.height;
    start();
  });

  onDestroy(function() {
    console.log(`destroy data: ${data.id}`);
    stop();
  });
</script>

<platform bind:this={el} style="left: {x - width/2}px; top: {y - height/2}px; height: {height}px; width: {width}px;">
</platform>

<style>
  platform {
    background-color: gray;
    position: absolute;
  }
</style>

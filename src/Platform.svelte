<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';
  import { beforeUpdate } from 'svelte';

  export let id;
  export let engine;
  export let index;

  let el;

  let started = false;

  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;
  let velocity = 0;

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
    console.log(`start: ${id}`);
    stop();
    timerId = setInterval(function() {
      tick();
    }, velocity);
  };

  function stop() {
    console.log(`stop: ${id}`);
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

  function itemChanged(item) {
    x = item.x;
    y = item.y;
    width = item.width;
    height = item.height;
    velocity = item.velocity;

    if (!started) {
      started = true;
      start();
    }
  }

  onMount(function() {
    engine.subscribe(id, itemChanged);
  });

  onDestroy(function() {
    console.log(`destroy data: ${id}`);
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

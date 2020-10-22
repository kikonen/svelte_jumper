<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';

  export let id;
  export let index;
  export let playfield;

  let el;

  let left = 0;
  let bottom = 0;

  let timerId;
  let direction = 1;
  let speed = 0;


  function getMaxLeft() {
    return el.parentNode.clientWidth - el.clientWidth;
  }

  function start() {
    console.log(`start: ${id}`);
    stop();
    timerId = setInterval(function() {
      tick();
    }, speed);
  };

  function stop() {
    console.log(`stop: ${id}`);
    timerId = clearInterval(timerId);
  }

  function tick() {
    let newLeft = left + 5 * direction;
    let maxLeft = getMaxLeft();
    if (newLeft <= 0 || newLeft > maxLeft) {
      newLeft = newLeft < 0 ? 0 : maxLeft;
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
    left = getMaxLeft() * Math.random();
    bottom = index * 80;
    speed = 40 + 10 * Math.random();
    start();
  });

  onDestroy(function() {
    console.log(`destroy platform: ${id}`);
    stop();
  });
</script>

<platform bind:this={el} style="left: {left}px; bottom: {bottom}px;">
</platform>

<style>
  platform {
    background-color: gray;
    width: 100px;
    height: 20px;
    position: absolute;
  }
</style>

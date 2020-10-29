<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';
  import { beforeUpdate } from 'svelte';

  export let id;
  export let engine;

  let el;

  let x = 0;
  let y = 0;
  let height = 0;
  let width = 0;

  function start() {
    console.log(`start player: ${id}`);
  };

  function stop() {
    console.log(`stop player: ${id}`);
  }

  function itemChanged(item) {
    x = item.x;
    y = item.y;
    width = item.width;
    height = item.height;
  }

  onMount(function() {
    engine.subscribe(id, itemChanged);
  });

  onDestroy(function() {
    console.log(`destroy player: ${id}`);
    stop();
  });
</script>

<player bind:this={el} style="left: {x - width/2}px; top: {y - height/2}px; height: {height}px; width: {width}px;">
</player>

<style>
  player {
    background-color: red;
    position: absolute;
    z-index: 1;
  }
</style>

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
  let velocity = 0;

  function itemChanged(item) {
    x = item.x;
    y = item.y;
    width = item.width;
    height = item.height;
    velocity = item.velocity;
  }

  onMount(function() {
    engine.subscribe(id, itemChanged);
  });

  onDestroy(function() {
    console.log("destroy player");
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

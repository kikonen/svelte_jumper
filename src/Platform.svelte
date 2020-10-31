<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';
  import { beforeUpdate } from 'svelte';

  import Item from './Item.js';

  export let id;
  export let engine;

  let el;

  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;


  function start() {
//    console.log(`start platform: ${id}`);
  };

  function stop() {
//    console.log(`stop platform: ${id}`);
  }

  function itemChanged(item) {
    let shape = item.shape;
    x = shape.min.x;
    y = shape.min.y;
    width = shape.dim.x;
    height = shape.dim.y;
  }

  onMount(function() {
    engine.subscribe(id, itemChanged);
  });

  onDestroy(function() {
//    console.log(`destroy platform: ${id}`);
    stop();
  });
</script>

<platform bind:this={el} style="left: {x}px; top: {y}px; height: {height}px; width: {width}px;">
</platform>

<style>
  platform {
    background-color: gray;
    position: absolute;
  }
</style>

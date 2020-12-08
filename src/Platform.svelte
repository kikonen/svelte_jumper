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
    let d = item.shape.display;
    x = d.min.x;
    y = d.min.y;
    width = d.max.x - d.min.x;
    height = d.max.y - d.min.y;
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
    background-color: lightgray;
    background-image: url('../svelte_jumper/platform.jpg');
    background-repeat: repeat;
    background-size: 100px;
    background-position: left top;

    position: absolute;
  }
</style>

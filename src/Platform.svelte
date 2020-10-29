<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';
  import { beforeUpdate } from 'svelte';

  export let id;
  export let engine;

  let el;

  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;


  function start() {
    console.log(`start platform: ${id}`);
  };

  function stop() {
    console.log(`stop platform: ${id}`);
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
    console.log(`destroy platform: ${id}`);
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

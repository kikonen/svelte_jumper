<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';
  import { beforeUpdate } from 'svelte';

  export let engine;

  let el;

  onMount(function() {
//    console.log("playfield");
  });

  onDestroy(function() {
  });
</script>

<playfield bind:this={el}>
  <slot></slot>
</playfield>

<style>
  playfield {
    background-color: lightgray;
    background-image: url('../game/wall.jpg');
    background-repeat: repeat;
    background-size: 800px;
    background-position: left top;

    width: 100%;
    height: 100%;
    position: absolute;

    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
</style>

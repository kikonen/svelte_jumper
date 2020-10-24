<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';

  export let physics;

  let el;

  onMount(function() {
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

    width: 100%;
    height: 100%;
    position: absolute;

    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
</style>

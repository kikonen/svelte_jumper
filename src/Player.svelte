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

  let movementY = 0;
  let movementX = 0;

  let dirUp = false;
  let dirDown = false;
  let dirLeft = false;
  let dirRight = false;

  function start() {
//    console.log(`start player: ${id}`);
  };

  function stop() {
//    console.log(`stop player: ${id}`);
  }

  function itemChanged(item) {
    let d = item.shape.display;
    x = d.min.x;
    y = d.min.y;
    width = d.max.x - d.min.x;
    height = d.max.y - d.min.y;

    movementX = item.movement.x;
    movementY = item.movement.y;

    if (movementX > 0) {
      dirLeft = false;
      dirRight = true;
      dirUp = false;
    } else if (movementX < 0) {
      dirLeft = true;
      dirRight = false;
      dirUp = false;
    }
  }

  onMount(function() {
    engine.subscribe(id, itemChanged);
  });

  onDestroy(function() {
//    console.log(`destroy player: ${id}`);
    stop();
  });
</script>

<player bind:this={el} style="left: {x}px; top: {y}px; height: {height}px; width: {width}px;">
  <img
    class="image"
    class:left={dirLeft}
    class:right={dirRight}
    class:up={dirUp}
    class:down={dirDown}
    src="../game/stick_run.png" />
</player>

<style>
  player {
/*//    background-color: red;*/

    position: absolute;
    z-index: 1;
  }
  .image {
    width: 100%;
    height: 100%;
  }
  .left {
    transform: scaleX(-1);
  }

  .right {
    transform: scaleX(1);
  }

  .up {
  }

  .down {
  }

</style>

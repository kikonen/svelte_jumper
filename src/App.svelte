<script>
  import {onMount} from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import PhysicsEngine from './PhysicsEngine.js';

  import Playfield from './Playfield.svelte';
  import Player from './Player.svelte';
  import Platform from './Platform.svelte';

  export let name;

  const MAX_PLATFORMS = 8;
  const dispatch = createEventDispatcher();

  const controls = {
    nop: function() {},

    ArrowLeft: function(ev) {
      player.moveLeft();
    },
    ArrowRight: function(ev) {
      player.moveRight();
    },
    ArrowUp: function(ev) {
      player.jump();
    },
  };


  let idBase = 0;

  let physics;

  let player = {}
  let platforms = [];

  let started = false;

  function nextId() {
    return ++idBase;
  }

  function createPlatforms() {
    platforms = [];
    for (let i = 0; i < MAX_PLATFORMS; i++) {
      platforms.push({ id: nextId() });
    }
  }

  function start() {
    physics = new PhysicsEngine();
    createPlatforms();
    started = true;
  }

  function stop() {
    platforms = [];
    started = false;
  }

  function toggleGame() {
    if (started) {
      stop();
    } else {
      start();
    }
  }

  onMount(function () {
  });

  function handleKeydown(ev) {
    (controls[event.key] || controls[event.code] || controls.nop)(event);
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<main>
  <button on:click={toggleGame}>{started ? 'Stop' : 'Start'}</button>
  <div class="game">
    {#if started}
      <Playfield physics={physics} >
        <Player physics={physics}/>

        {#each platforms as p, index}
          <Platform platform={p} index={index} physics={physics} />
        {/each}
      </Playfield>
     {/if}
  </div>
</main>

<style>
  main {
    box-sizing: border-box;

    text-align: center;
    padding: 0.5rem;
    width: 100%;
    height: 100%;
    margin: 0;
  }

  .game {
    box-sizing: border-box;
    overflow: hidden;

    text-align: center;
    width: 100%;
    height: 600px;
    margin: 0;
    position: relative;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 1em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<script>
  import {onMount} from 'svelte';
  import {afterUpdate} from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import PhysicsEngine from './PhysicsEngine.js';

  import Playfield from './Playfield.svelte';
  import Player from './Player.svelte';
  import Platform from './Platform.svelte';

  export let name;

  const MAX_PLATFORMS = 8;
  const dispatch = createEventDispatcher();

  let engine;

  let container;

  let playerId;
  let platformIds = [];

  let started = false;

  function createPlayer() {
    let areaW = engine.getWidth();

    let item = {
      x: areaW/2 - 50/2,
      y: 80,
      width: 50,
      height: 80,
      mass: 30,
    };
    engine.register(item, true);
    playerId = item.id;
  }

  function createPlatforms() {
    platformIds = [];
    let areaW = engine.getWidth();
    for (let i = 0; i < MAX_PLATFORMS; i++) {
      let item = {
        x: (areaW - 50) * Math.random(),
        y: i * 80 + 10,
        width: 100,
        height: 20,
        mass: 100,
        friction: 1,
        velocityX: 40 + 10 * Math.random(),
      };
      engine.register(item);
      platformIds.push(item.id);
    }
  }

  function start() {
    engine = new PhysicsEngine(dispatch);
    engine.registerContainer(container);
    createPlayer();
    createPlatforms();
    started = true;
  }

  function stop() {
    started = false;
  }

  function toggleGame() {
    if (started) {
      stop();
    } else {
      start();
    }
    setTimeout(function() {
      engine.start();
    }, 0);
  }

  afterUpdate(function () {
  });

  onMount(function () {
  });

  function handleKeydown(ev) {
    if (engine) {
      engine.handleKeydown(ev);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<main>
  <button on:click={toggleGame}>{started ? 'Stop' : 'Start'}</button>
  <div class="game">
    <div class="container" bind:this={container}>
      {#if started}
        <Playfield engine={engine} >
          <Player id={playerId} engine={engine} />

          {#each platformIds as id, index}
            <Platform id={id} index={index} engine={engine} />
          {/each}
        </Playfield>
      {/if}
    </div>
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

  .container {
    width: 100%;
    height: 100%;
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

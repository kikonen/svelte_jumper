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

  let engine;

  let player;
  let playfield;

  let playerData = {}
  let platforms = [];

  let started = false;

  function createPlayer() {
    let areaW = engine.getWidth();

    playerData = {
      bottom: 80,
      left: areaW/2 - 50/2,
      width: 50,
      height: 80,
      speed: 0,
    };
    engine.register(playerData);
  }

  function createPlatforms() {
    platforms = [];
    let areaW = engine.getWidth();
    for (let i = 0; i < MAX_PLATFORMS; i++) {
      let platform = {
        bottom: i * 80,
        left: (areaW - 100) * Math.random(),
        width: 100,
        height: 20,
        speed: 40 + 10 * Math.random(),
      };
      engine.register(platform);
      platforms.push(platform);
    }
  }

  function start() {
    engine = new PhysicsEngine();
    engine.registerContainer(playfield);
    createPlayer();
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
      <Playfield bind:this={playfield} engine={engine} >
        <Player bind:this={player} data={playerData} platforms={platforms} engine={engine} />

        {#each platforms as p, index}
          <Platform data={p} index={index} engine={engine} />
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

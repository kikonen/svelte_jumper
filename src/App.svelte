<script>
  import {onMount} from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import Playfield from './Playfield.svelte';
  import Player from './Player.svelte';
  import Platform from './Platform.svelte';

  export let name;

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

  let playerData = {
    left: 20,
    bottom: 20,
  };

  let player;

  let platforms = [];

  let started = false;

  function createPlayer() {
    playerData = {
      name: name,
      left: 20,
      bottom: 20,
    };
  }

  function createPlatforms() {
    let newPlatforms = [];
    for (let i = 0; i < 10; i++) {
      let platform = { left: 600 * Math.random(), bottom: i * 80 };
      newPlatforms.push(platform);
    }
    platforms = newPlatforms;
  }

  function start() {
    createPlatforms();
    createPlayer();
    player.start();
    dispatch("start");
    started = true;
  }

  function stop() {
    platforms = [];
    createPlayer();
    dispatch("stop");
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
//    start();
  });

  function handleKeydown(ev) {
    (controls[event.key] || controls[event.code] || controls.nop)(event);
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<main>
  <button on:click={toggleGame}>{started ? 'Stop' : 'Start'}</button>
  <div class="game">
    <Playfield>
      <Player bind:this={player} player={playerData} />

      {#each platforms as p}
        <Platform platform={p} bind:started={started} />
      {/each}
    </Playfield>
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

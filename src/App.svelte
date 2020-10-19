<script>
  import {onMount} from 'svelte';

  import Playfield from './Playfield.svelte';
  import Player from './Player.svelte';
  import Platform from './Platform.svelte';

  export let name;

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
    name: name,
    left: 20,
    bottom: 20,
  };

  let player;

  let platforms = [];
  let platformTimerId;

  function startPlatforms() {
    platforms = [];
    for (let i = 0; i < 10; i++) {
      let platform = { left: 600 * Math.random(), bottom: i * 80 };
      platforms.push(platform);
    }
  }

  function start() {
    startPlatforms();
    player.start();
  }

  onMount(function () {
    start();
  });

  function handleKeydown(ev) {
    (controls[event.key] || controls[event.code] || controls.nop)(event);
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<main>
  <Playfield>
    <Player bind:this={player} player={playerData} />

    {#each platforms as p}
      <Platform platform={p} />
    {/each}
  </Playfield>
</main>

<style>
  main {
    box-sizing: border-box;

    text-align: center;
    padding: 1rem;
    max-width: 240px;
    margin: 0 auto;
    height: 100%;
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

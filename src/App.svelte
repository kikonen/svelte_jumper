<script>
  import {onMount} from 'svelte';

  import Player from './Player.js';
  import Platform from './Platform.js';

  import Playfield from './Playfield.svelte';
  import PlayerSprite from './PlayerSprite.svelte';
  import PlatformSprite from './PlatformSprite.svelte';

  export let name;

  const controls = {
    nop: function() {},

    ArrowLeft: function(ev) {
      player.moveLeft();
      player = player;
    },
    ArrowRight: function(ev) {
      player.moveRight();
      player = player;
    },
    ArrowUp: function(ev) {
      player.jump();
      player = player;
    },
  };

  let player = new Player({name: name, left: 20, bottom: 20});
  let playerTimerId;

  let platforms = [];
  let platformTimerId;

  function startPlatforms() {
    for (let i = 0; i < 10; i++) {
      let platform = new Platform({left: 600 * Math.random(), bottom: i * 80});
      platforms.push(platform);
    }

    platforms.forEach(function(p) {
      p.start();
    });

    platformTimerId = setInterval(function() {
      platforms = platforms;
    }, 100);
  }

  function startPlayer() {
    player = new Player({name: name, left: 20, bottom: 20});
    player.start();

    playerTimerId = setInterval(function() {
      player = player;
    }, 100);
  }

  function start() {
    startPlatforms();
    startPlayer();
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
    <PlayerSprite {player} />

    {#each platforms as p}
      <PlatformSprite platform={p} />
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

<script>
  import {onMount} from 'svelte';
  import {afterUpdate} from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import Area from './Area.js';
  import Vector from './Vector.js';
  import BoxShape from './BoxShape.js';
  import Material from './Material.js';

  import Item from './Item.js';

  import Input from './Input.js';
  import PhysicsEngine from './PhysicsEngine.js';
  import {MATERIALS} from './PhysicsEngine.js';

  import Playfield from './Playfield.svelte';
  import Player from './Player.svelte';
  import Platform from './Platform.svelte';

  export let name;

  const MIN_PLATFORM = 0;
  const MAX_PLATFORM = 7;
  const dispatch = createEventDispatcher();

  let input;
  let engine;

  let container;

  let playerId;
  let platformIds = [];

  let started = false;
  let debug = false;

  function createPlayer() {
    let areaW = engine.getWidth();
    let areaH = engine.getHeight();

    let w = 0.8;
    let h = 1.8;
    let middleX = (areaW / 2 - w/2);
    let middleY = areaH / 2 + h / 2;

    let min = new Vector(middleX - w/2, middleY - h/2);
    let max = new Vector(middleX + w/2, middleY + h/2);
    let material = MATERIALS.human;
    let shape = new BoxShape({min, max, material});

    let item = new Item({
      type: 'player',
      label: 'player',
      shape: shape,
    });
    engine.register(item);

    return item.id;
  }

  function createPlatforms() {
    let platformIds = [];
    let areaW = engine.getWidth();
    for (let i = MIN_PLATFORM; i <= MAX_PLATFORM; i++) {
      let w = 8;
      let h = 0.7;
      let middleX = w/2 + (areaW - w) * Math.random();
      let middleY = h/2 + i * 4 + h/2;

      let min = new Vector(middleX - w/2, middleY - h/2)
      let max = new Vector(middleX + w/2, middleY + h/2)

      let limits = new Area({min: new Vector(null, min.y), max: new Vector(null, max.y + h * 4)});

      let fill = MATERIALS.brick;
      let surfaces = {
        north: MATERIALS.tar,
        south: MATERIALS.brick,
        west: MATERIALS.steel,
        east: MATERIALS.copper,
      };
      let shape = new BoxShape({min, max, limits, fill, surfaces});

      let velocity = new Vector(0.5 + 2 * Math.random(), 0);
      if (Math.random() > 0.5) {
        velocity = velocity.reverse();
      }
//      velocity = new Vector();

      let item = new Item({
        type: 'platform',
        label: `platform-${i}`,
        shape: shape,
        gravityModifier: -0.3,
        velocity: velocity
      });
      engine.register(item);
      platformIds.push(item.id);
    }
    return platformIds;
  }

  function start() {
    input = new Input();
    engine = new PhysicsEngine({ dispatch, input });
    engine.registerContainer(container);

    engine.debug = debug;

    playerId = createPlayer();
    platformIds = createPlatforms();

    started = true;
  }

  function stop() {
    engine.stop();
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

  function toggleDebug() {
    debug = !debug;
    if (engine) {
      engine.debug = debug;
    }
    if (debug) {
      console.clear();
    }
  }

  afterUpdate(function () {
  });

  onMount(function () {
  });

  function handleKeydown(ev) {
    if (input) {
      input.handleKeydown(ev);
    }
  }

  function handleKeyup(ev) {
    if (input) {
      input.handleKeyup(ev);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}
               on:keyup={handleKeyup}
/>

<main>
  <button on:click={toggleGame}>{started ? 'Stop' : 'Start'}</button>
  <button on:click={toggleDebug}>{debug ? 'Debug off' : 'Debug on'}</button>

  <div class="game">
    <div class="container" bind:this={container}>
      {#if started}
        <Playfield engine={engine} >
          <Player id={playerId} engine={engine} />

          {#each platformIds as id (id)}
            <Platform id={id} engine={engine} />
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

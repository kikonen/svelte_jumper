<script>
  import {onMount} from 'svelte';
  import {afterUpdate} from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import Area from './Area.js';
  import Vector from './Vector.js';
  import BoxShape from './BoxShape.js';
  import Material from './Material.js';

  import Item from './Item.js';
  import PhysicsEngine from './PhysicsEngine.js';
  import {MATERIALS} from './PhysicsEngine.js';

  import Playfield from './Playfield.svelte';
  import Player from './Player.svelte';
  import Platform from './Platform.svelte';

  export let name;

  const MIN_PLATFORM = 0;
  const MAX_PLATFORM = 7;
  const dispatch = createEventDispatcher();

  let engine;

  let container;

  let playerId;
  let platformIds = [];

  let started = false;

  function createPlayer() {
    let areaW = engine.getWidth();
    let areaH = engine.getHeight();

    let w = 40;
    let h = 60;
    let middleX = (areaW / 2 - w/2);
    let middleY = areaH / 2 + h / 2;

    let min = new Vector(middleX - w/2, middleY - h/2);
    let max = new Vector(middleX + w/2, middleY + h/2);
    let material = MATERIALS.human;
    let shape = new BoxShape({min, max, material});

    let item = new Item({
      type: 'player',
      shape: shape,
    });
    engine.register(item);

    return item.id;
  }

  function createPlatforms() {
    let platformIds = [];
    let areaW = engine.getWidth();
    for (let i = MIN_PLATFORM; i <= MAX_PLATFORM; i++) {
      let w = 100;
      let h = 20;
      let middleX = w/2 + (areaW - w) * Math.random();
      let middleY = h/2 + i * 80 + h/2;

      let min = new Vector(middleX - w/2, middleY - h/2)
      let max = new Vector(middleX + w/2, middleY + h/2)

      let limits = new Area({min: new Vector(null, min.y), max: new Vector(null, null)});

      let fill = MATERIALS.brick;
      let surfaces = {
        north: MATERIALS.tar,
        south: MATERIALS.spring,
        west: MATERIALS.steel,
        east: MATERIALS.copper,
      };
      let shape = new BoxShape({min, max, limits, fill, surfaces});

      let velocity = new Vector(5 + 5 * Math.random(), 0);
      if (Math.random() > 0.5) {
        velocity = velocity.reverse();
      }
//      velocity = new Vector();

      let item = new Item({
        type: 'platform',
        shape: shape,
        gravityModifier: -0.01,
        velocity: velocity
      });
      engine.register(item);
      platformIds.push(item.id);
    }
    return platformIds;
  }

  function start() {
    engine = new PhysicsEngine(dispatch);
    engine.registerContainer(container);

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

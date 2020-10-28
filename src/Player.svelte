<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';

  export let engine;
  export let data;

  const GRAVITY = 0.9;
  const FRICTION = 0.8;

  const MAX_JUMP = 200;
  const MAX_MOVE = 50;

  let el;

  let x = 0;
  let y = 0;
  let height = 0;
  let width = 0;

  let jumpHeight;
  let jumpStart;

  let jumpTimerId;
  let fallTimerId;
  let gravity;

  let moveTimerId;
  let moveStart = 0;
  let movement;
  let dir = 0;
  let friction;

  export function start() {
  }

  export function stop() {
  }

  function getMinX() {
    return width / 2;
  }

  function getMaxX() {
    return engine.getWidth() - width / 2;
  }

  function getMinY() {
    return height / 2;
  }

  function getMaxY() {
    return engine.getHeight() - height / 2;
  }

  function stopJump() {
    jumpTimerId = clearInterval(jumpTimerId);
  }

  function stopFall() {
    fallTimerId = clearInterval(fallTimerId);
  }

  function stopMove() {
    moveTimerId = clearInterval(moveTimerId);
  }

  export function jump() {
    if (jumpTimerId || fallTimerId) {
      return;
    }

    stopFall();

    gravity = GRAVITY;
    jumpHeight = 0;
    jumpStart = y;

    jumpTimerId = setInterval(function() {
      jumpHeight += 10 * gravity;
      y = jumpStart - jumpHeight;

      if (jumpHeight >= MAX_JUMP) {
        fall();
      }
    }, 50);
  }

  function fall() {
    stopJump();
    stopFall();

    let minY = getMinY();
    let maxY = getMaxY();

    gravity = GRAVITY;
    jumpHeight = 0;
    jumpStart = y;

    fallTimerId = setInterval(function() {
      jumpHeight -= 10 / gravity;

      y = jumpStart - jumpHeight;

      if (y >= maxY) {
        y = maxY;
        stopFall();
      }
    }, 50);
  }

  export function moveLeft() {
    dir = -1;
    startMove();
  }

  export function moveRight() {
    dir = 1;
    startMove();
  }

  export function startMove() {
    if (moveTimerId) {
      return;
    }

    data.velocity = 5;
    moveStart = x;
    movement = 0;
    friction = FRICTION;

    const minX = getMinX();
    const maxX = getMaxX();

    moveTimerId = setInterval(function() {
      movement += data.velocity * friction;

      let newX = moveStart + movement * dir;

      if (newX <= minX || newX > maxX || movement > MAX_MOVE) {
        stopMove();
      }
      if (newX <= minX) {
        newX = minX;
      } else if (newX > maxX) {
        newX = maxX;
      }

      x = newX;
    }, 20);
  }

  onMount(function() {
    x = data.x;
    y = data.y;
    width = data.width;
    height = data.height;

    fall();
  });

  onDestroy(function() {
    console.log("destroy player");
    stop();
  });
</script>

<player bind:this={el} style="left: {x - width/2}px; top: {y - height/2}px; height: {height}px; width: {width}px;">
</player>

<style>
  player {
    background-color: red;
    position: absolute;
    z-index: 1;
  }
</style>

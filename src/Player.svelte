<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';

  export let physics;
  export let playfield;
  export let platforms;

  const GRAVITY = 0.9;
  const FRICTION = 0.8;

  const MAX_JUMP = 200;
  const MAX_MOVE = 50;

  let el;

  let left = 0;
  let bottom = 0;

  let jumpHeight;
  let jumpStart;

  let jumpTimerId;
  let fallTimerId;
  let gravity;

  let moveTimerId;
  let moveStart = 0;
  let movement;
  let dir = 0;
  let speed = 5;
  let friction;

  export function start() {
  }

  export function stop() {
  }

  function getMaxLeft() {
    return el.parentNode.clientWidth - el.clientWidth;
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
    jumpStart = bottom;

    jumpTimerId = setInterval(function() {
      jumpHeight += 10 * gravity;
      bottom = jumpStart + jumpHeight;

      if (jumpHeight >= MAX_JUMP) {
        fall();
      }
    }, 50);
  }

  function fall() {
    stopJump();
    stopFall();

    gravity = GRAVITY;
    jumpHeight = 0;
    jumpStart = bottom;

    fallTimerId = setInterval(function() {
      jumpHeight -= 10 / gravity;

      bottom = jumpStart + jumpHeight;

      if (bottom <= 0) {
        bottom = 0;
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

    moveStart = left;
    movement = 0;
    friction = FRICTION;

    let maxLeft = getMaxLeft();
    console.log(platforms[1]);

    moveTimerId = setInterval(function() {
      movement += speed * friction;

      let l = moveStart + movement * dir;

      if (l <= 0 || l > maxLeft || movement > MAX_MOVE) {
        stopMove();
      }
      if (l <= 0) {
        l = 0;
      } else if (l > maxLeft) {
        l = maxLeft;
      }

      left = l;
    }, 20);
  }

  onMount(function() {
    left = 20;
    bottom = 20;
    fall();
  });

  onDestroy(function() {
    console.log("destroy player");
    stop();
  });
</script>

<player bind:this={el} style="left: {left}px; bottom: {bottom}px;">
</player>

<style>
  player {
    background-color: red;
    width: 50px;
    height: 80px;
    position: absolute;
    z-index: 1;
  }
</style>

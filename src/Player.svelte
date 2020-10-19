<script>
  export let player;

  const GRAVITY = 0.9;
  const FRICTION = 0.8;

  const MAX_JUMP = 200;
  const MAX_MOVE = 50;

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
    jumpStart = player.bottom;

    jumpTimerId = setInterval(function() {
      jumpHeight += 10 * gravity;
      player.bottom = jumpStart + jumpHeight;

      if (jumpHeight >= MAX_JUMP) {
        fall();
      }
    }, 50);
  }

  function fall() {
    stopJump();
    stopFall();

    jumpHeight = 0;
    jumpStart = player.bottom;

    fallTimerId = setInterval(function() {
      jumpHeight -= 10 / gravity;

      player.bottom = jumpStart + jumpHeight;

      if (player.bottom <= 0) {
        player.bottom = 0;
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

    moveStart = player.left;
    movement = 0;
    friction = FRICTION;

    moveTimerId = setInterval(function() {
      movement += speed * friction;

      let left = moveStart + movement * dir;

      if (left <= 0 || left > 600 || movement > MAX_MOVE) {
        stopMove();
      }
      if (left <= 0) {
          left = 0;
      } else if (left > 600) {
          left = 600;
      }

      player.left = left;
    }, 20);
  }
</script>

<player style="left: {player.left}px; bottom: {player.bottom}px;">
  {name}
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

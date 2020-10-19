<script>
  export let player;
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
  }
</style>

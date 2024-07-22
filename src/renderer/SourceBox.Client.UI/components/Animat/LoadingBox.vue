<template>
  <div class="loader">
    <div class="element-animation">
      <img :src="src" />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  src: string
}>()
</script>

<style lang="scss" scoped>
.loader {
  --t-size: 90px;
  --t-length: calc(var(--t-size) * 3);

  display: block;
  width: var(--t-size);
  height: var(--t-size);
  margin: 0 auto;
  background-color: #ffffff;
  overflow: hidden;
  border-radius: 100%;
  border: #111 solid 3px;

  .element-animation {
    width: 100%;
    height: 100%;
    animation: animationFrames linear 3s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;

    & > img {
      height: 100%;
      width: 100%;
    }

    @keyframes animationFrames {
      0% {
        transform: translateX(calc(0px - var(--t-length)));
      }
      100% {
        transform: translateX(var(--t-size));
      }
    }
  }
}
</style>

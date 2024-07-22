<template>
  <div class="loader" :style="{ '--t-size': `${size}px` }">
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ size: number }>()
</script>

<style lang="scss" scoped>
.loader {
  --t-size: 0px;
  width: var(--t-size);
  height: var(--t-size);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .circle {
    position: absolute;
    --t-offset: calc(var(--t-size) / 4);
    width: calc(var(--t-size) - var(--t-offset));
    height: calc(var(--t-size) - var(--t-offset));
    opacity: 0;
    transform: rotate(225deg);
    animation-iteration-count: infinite;
    animation-name: orbit;
    animation-duration: 5.5s;

    &:after {
      content: '';
      position: absolute;
      inset: 0;
      --t-csize: calc(var(--t-size) / 10);
      width: var(--t-csize);
      height: var(--t-csize);
      border-radius: var(--t-csize);
      background: #fff;
    }

    &:nth-child(2) {
      animation-delay: 240ms;
    }
    &:nth-child(3) {
      animation-delay: 480ms;
    }
    &:nth-child(4) {
      animation-delay: 720ms;
    }
    &:nth-child(5) {
      animation-delay: 960ms;
    }
  }
}

@keyframes orbit {
  0% {
    transform: rotate(225deg);
    opacity: 1;
    animation-timing-function: ease-out;
  }

  7% {
    transform: rotate(345deg);
    animation-timing-function: linear;
  }

  30% {
    transform: rotate(455deg);
    animation-timing-function: ease-in-out;
  }

  39% {
    transform: rotate(690deg);
    animation-timing-function: linear;
  }

  70% {
    transform: rotate(815deg);
    opacity: 1;
    animation-timing-function: ease-out;
  }

  75% {
    transform: rotate(945deg);
    animation-timing-function: ease-out;
  }

  76% {
    transform: rotate(945deg);
    opacity: 0;
  }
  100% {
    transform: rotate(945deg);
    opacity: 0;
  }
}
</style>

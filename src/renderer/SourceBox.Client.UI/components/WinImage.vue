<template>
  <div class="w-image" :style="{ '--bg': `url(${url})` }">
    <div class="w-image-mask" />
    <div class="w-image-info">
      <div class="name"><slot name="name" /></div>
      <div class="content"><slot name="content" /></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ url: string }>()
</script>

<style lang="scss" scoped>
.w-image {
  --bg: '';
  height: 100%;
  width: 100%;
  background-image: var(--bg);
  background-size: cover;
  border-radius: 10px;

  & > .w-image-mask {
    position: fixed;
    inset: 0;
    height: 100%;
    width: 100%;
    -webkit-mask: linear-gradient(transparent 50%, black 75%, black);
    mask: linear-gradient(transparent 50%, black 75%, black);
    background-image: var(--bg);
    background-size: cover;
    border-radius: 0 0 10px 10px;

    &::after {
      content: '';
      position: fixed;
      inset: 0;
      height: 100%;
      width: 100%;
      backdrop-filter: blur(10px);
    }
  }

  .w-image-info {
    position: fixed;
    display: inline-table;
    inset: auto 0 0 0;
    padding: 0 1vw 0.8vw;

    & > .name {
      font-size: 1.6vw;
      padding-left: 0.5vw;
      margin-bottom: 0.25vw;
    }

    & > .content {
      font-size: 1.3vw;
      box-sizing: border-box;
      padding: 0.2vw 0.4vw;
      border-radius: 5px;
      background-color: rgba(0, 0, 0, 0.25);
    }
  }
}
</style>

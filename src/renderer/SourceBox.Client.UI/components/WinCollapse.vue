<template>
  <transition name="w-collapse" @enter="onEnter" @leave="onLeave">
    <div v-show="show" class="w-collapse"><slot /></div>
  </transition>
</template>

<script lang="ts" setup>
defineProps<{
  show: boolean
}>()

const onEnter = (el: any) => {
  const height = `${el.scrollHeight || 0}px`
  el.style.minHeight = height
  el.style.maxHeight = height
}

const onLeave = (el: any) => {
  el.style.minHeight = '0'
  el.style.maxHeight = '0'
}
</script>

<style lang="scss" scoped>
.w-collapse {
  will-change: height;
  overflow: hidden;

  & > :deep(div) {
    display: flex;
    box-sizing: border-box;
  }

  &.w-collapse-enter-active,
  &.w-collapse-leave-active {
    transition:
      300ms min-height ease-in-out,
      300ms max-height ease-in-out;
  }

  &.w-collapse-enter-from,
  &.w-collapse-leave-to {
    min-height: 0;
    max-height: 0;
  }
}
</style>

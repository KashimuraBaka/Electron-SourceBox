<template>
  <div ref="container" @mouseenter="onFishPoolMouseEnter" @mousemove="onFishPoolMouseMove">
    <canvas ref="canvas" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FishPool from '@renderer/utils/animation/fishpool'

let fishpool: FishPool | undefined

const container = ref()
const canvas = ref()

const onFishPoolMouseEnter = (event: MouseEvent) => {
  fishpool?.startEpicenter(event)
}

const onFishPoolMouseMove = (event: MouseEvent) => {
  fishpool?.moveEpicenter(event)
}

onMounted(() => {
  fishpool = new FishPool(container.value, canvas.value)
})

onUnmounted(() => {
  fishpool?.destory()
})
</script>

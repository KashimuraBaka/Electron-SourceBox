<template>
  <el-card shadow="never">
    <slot />
  </el-card>
</template>

<style lang="scss" scoped>
.el-card {
  border: 0;
  background: rgba(104, 114, 124, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: var(--theme-card-shadow);
}
</style>

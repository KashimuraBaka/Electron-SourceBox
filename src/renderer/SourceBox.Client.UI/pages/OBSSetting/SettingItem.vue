<template>
  <div class="obs-setting-item">
    <div class="obs-setting-item__header">
      <slot name="header" />
    </div>
    <div class="obs-setting-item__inner">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.obs-setting-item {
  flex: 1;
  display: flex;
  flex-direction: column;

  .obs-setting-item__header {
    height: 1rem;
    display: flex;
    font-size: 14px;
    margin-bottom: 10px;
    align-items: center;
  }

  .obs-setting-item__inner {
    flex: 1;
    display: flex;

    & > :deep(*) {
      flex: 1;
    }
  }
}
</style>

<template>
  <div class="w-option">
    <el-icon><slot name="icon" /></el-icon>
    <div class="w-option-content">
      <div class="w-option-content-title"><slot name="title" /></div>
      <div class="w-option-content-message"><slot name="message" /></div>
    </div>
    <div class="w-option-extend">
      <slot name="content" />
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.w-option {
  display: flex;
  flex-direction: row;
  border-radius: 5px;
  border: var(--theme-card-border-color) solid 1px;
  background-color: var(--theme-card-bg-color);
  backdrop-filter: blur(10px);
  padding: 20px 18px;
  align-items: center;

  .el-icon {
    margin-right: 20px;
    font-size: 20px;
  }

  .w-option-content {
    flex: 1;
    .w-option-content-title {
      font-size: 13px;
    }
    .w-option-content-message {
      font-size: 12px;
    }
  }

  .w-option-extend {
    display: flex;
    align-items: center;
    font-size: 14px;

    .el-switch {
      margin-left: 1vw;
    }
  }
}
</style>

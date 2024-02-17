<template>
  <div class="w-option">
    <div :class="{ 'w-option-main': true, pointer: hasContent }" @click="showExtendContent">
      <div class="w-option-custom-icon">
        <el-icon v-if="!!useSlots()['icon']"><slot name="icon" /></el-icon>
        <slot v-else name="custom-icon" />
      </div>
      <div class="w-option-content">
        <div class="w-option-content-title"><slot name="title" /></div>
        <div class="w-option-content-message"><slot name="message" /></div>
      </div>
      <div class="w-option-extend">
        <slot />
        <div v-if="hasContent" class="w-option-extend__btn">
          <el-icon :class="{ 'is-action': !isHidden }">
            <i-material-symbols:arrow-forward-ios />
          </el-icon>
        </div>
      </div>
    </div>
    <WinCollapse v-if="hasContent" :show="!isHidden">
      <div class="w-option-extend-content">
        <slot name="extend-content" />
      </div>
    </WinCollapse>
  </div>
</template>

<script lang="ts" setup>
import { useSlots, ref } from 'vue'

import WinCollapse from './WinCollapse.vue'

const props = defineProps<{
  defaultOpen?: boolean
}>()

const hasContent = !!useSlots()['extend-content']

const isHidden = ref(props.defaultOpen)

const showExtendContent = () => {
  if (!hasContent) return
  isHidden.value = !isHidden.value
}
</script>

<style lang="scss" scoped>
.w-option {
  color: var(--el-text-color-primary);
  border: var(--theme-card-border-color) solid 1px;
  border-radius: 5px;
  background-color: var(--theme-card-bg-color);
  backdrop-filter: blur(10px);

  .w-option-main {
    flex: 1;
    display: flex;
    flex-direction: row;
    padding: 20px 18px;
    align-items: center;

    &.pointer {
      cursor: pointer;
    }

    &:hover > .w-option-extend > .w-option-extend__btn {
      background-color: var(--theme-btn-bg-color);
    }

    .w-option-custom-icon {
      font-size: 20px;
      margin-right: 20px;

      :deep(img) {
        height: 20px;
        width: 20px;
      }
    }

    .w-option-content {
      flex: 1;
      text-align: left;

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

      .w-option-extend__btn {
        display: flex;
        width: 32px;
        height: 32px;
        padding: 10px;
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
        border-radius: 5px;

        .el-icon {
          font-size: 10px;
          transition: transform 0.3s ease-in-out;
          transform: rotate(90deg);

          &.is-action {
            transform: rotate(-90deg);
          }
        }
      }
    }
  }

  .w-option-extend-content {
    font-size: 14px;
    align-items: center;
    border-top: var(--theme-card-border-color) solid 1px;
    padding: 20px 10px 20px 58px;
  }
}
</style>

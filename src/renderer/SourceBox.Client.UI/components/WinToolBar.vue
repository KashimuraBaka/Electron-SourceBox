<template>
  <div :class="{ taskbar: true, disabled: isMaximize }">
    <div class="title" @dblclick="windowMax">
      <img :src="ICON" />
      <span>SourceBox</span>
    </div>
    <div class="tools-btns">
      <el-tag :type="store.CSteamID.init ? 'success' : 'danger'" disable-transitions>
        {{ store.CSteamID.init ? 'Steam服务已启用' : 'Steam服务已禁用' }}
      </el-tag>
    </div>
    <div class="main-btns">
      <div class="btn" @click="windowMin">
        <el-icon><i-material-symbols:chrome-minimize /></el-icon>
      </div>
      <div class="btn" @click="windowMax">
        <el-icon>
          <i-material-symbols:stack-outline v-if="isMaximize" />
          <i-material-symbols:chrome-maximize-outline-sharp v-else />
        </el-icon>
      </div>
      <div class="btn close" @click="windowClose">
        <el-icon><i-material-symbols:close-rounded /></el-icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import useCounterStore from '@desktop/services/store'

import ICON from '../../../../resources/icon.png?asset'

const isMaximize = ref(false)

const windowMin = () => window.api.windowMinimize()
const windowMax = async () => {
  isMaximize.value = await window.api.windowMaximize()
}
const windowClose = () => window.api.windowClose()

const store = useCounterStore()
</script>

<style lang="scss" scoped>
.taskbar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: right;
  -webkit-app-region: drag; // 可拖拽窗口

  &.disabled {
    -webkit-app-region: no-drag;
  }

  .title {
    flex: 1;
    display: flex;
    padding-left: 10px;
    align-items: center;

    img {
      height: 24px;
      width: 24px;
    }

    span {
      margin-left: 10px;
      font-weight: bold;
    }
  }

  .tools-btns {
    width: 120px;
    -webkit-app-region: no-drag;
  }

  .main-btns {
    height: 100%;
    display: flex;
    align-items: flex-start;
    -webkit-app-region: no-drag;

    .btn {
      display: flex;
      width: 46px;
      height: 32px;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: var(--theme-btn-bg-color);
        cursor: pointer;
      }

      &.close {
        --theme-btn-bg-color: #f44336;
      }
    }
  }
}
</style>

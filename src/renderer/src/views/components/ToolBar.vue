<template>
  <div class="taskbar">
    <div class="title" @dblclick="windowMax"></div>
    <div class="tools-btns">
      <el-switch v-model="isDark" :inactive-action-icon="Sunny" :active-action-icon="Moon" />
    </div>
    <el-button-group class="main-btns">
      <el-button :icon="SemiSelect" @click="windowMin" />
      <el-button :icon="FullScreen" @click="windowMax" />
      <el-button :icon="CloseBold" class="close" @click="windowClose" />
    </el-button-group>
  </div>
</template>

<script lang="ts" setup>
import { useDark } from '@vueuse/core'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { SemiSelect, FullScreen, CloseBold } from '@element-plus/icons-vue'

const windowMin = () => window.electron.ipcRenderer.send('window-min')
const windowMax = () => window.electron.ipcRenderer.send('window-max')
const windowClose = () => window.electron.ipcRenderer.send('window-close')

const isDark = useDark()
// /* const toggleDark = useToggle(isDark); */
</script>

<style lang="scss" scoped>
.taskbar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: right;
  -webkit-app-region: drag; // 可拖拽窗口

  .title {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .tools-btns {
    width: 50px;
    -webkit-app-region: no-drag;
  }

  .main-btns {
    height: 100%;
    display: flex;
    align-items: flex-start;
    -webkit-app-region: no-drag;

    .el-button {
      border: 0;
      border-radius: inherit;

      &:hover {
        --el-button-bg-color: #343434;
      }
    }
  }
}
</style>

<template>
  <el-container id="setting" class="w-container">
    <SettingDialogs ref="dialog" @appid-change="confirmChangeAppid" />
    <el-header>
      <h1>设置</h1>
    </el-header>
    <el-main>
      <WinOption>
        <template #icon><i-material-symbols-videogame-asset /></template>
        <template #title>当前应用 AppID: {{ store.steamApp.id }} ({{ store.steamApp.name }})</template>
        <template #message>修改后可支持当前创意工坊物品查询 (注意: 错误ID或未购买游戏会导致服务启动失败)</template>
        <el-button @click="dialog.openWithAppID(store.steamApp)">修改</el-button>
      </WinOption>
      <WinOption>
        <template #icon><MoonNight /></template>
        <template #title>暗黑模式</template>
        <template #message>当前主题切换成暗黑模式</template>
        <div class="swtich-box">
          <span>{{ store.themeDark ? '打开' : '关闭' }}</span>
          <el-switch v-model="store.themeDark" />
        </div>
      </WinOption>
      <WinOption>
        <template #icon><i-ic:round-live-tv /></template>
        <template #title>OBS插件 - 进入服务器显示</template>
        <template #message>显示当前进入服务器信息</template>
        <div class="swtich-box">
          <span>{{ store.web.enable ? '打开' : '关闭' }}</span>
          <el-switch v-model="store.web.enable" @change="obsOptionsChange" />
        </div>
      </WinOption>
      <el-container class="about-box">
        <el-header>关于</el-header>
        <el-main>
          <WinOption default-open>
            <template #custom-icon><img :src="ICON" /></template>
            <template #title>SourceBox</template>
            <template #message>Build Date: {{ pack_time }}</template>
            <template #extend-content>
              作者:
              <el-link target="_blank" href="https://steamcommunity.com/id/Kashimura" style="margin-left: 5px"> Kashimura </el-link>
            </template>
            <div style="font-size: 12px; margin-right: 14px">版本 {{ soft_version }}</div>
          </WinOption>
        </el-main>
      </el-container>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import useCounterStore from '@desktop/services/store'
import { ref } from 'vue'
import { FormatTime } from '@renderer/utils/time'

import { MoonNight } from '@element-plus/icons-vue'
import WinOption from '@desktop/components/WinOption.vue'
import SettingDialogs from './SettingDialogs.vue'

import ICON from '../../../../../resources/icon.png?asset'

const pack_time = FormatTime(define.packtime)
const soft_version = define.version

const store = useCounterStore()
const dialog = ref()

const obsOptionsChange = (val: string | number | boolean) => {
  if (val) {
    window.config.createWebServer(store.web.port)
  } else {
    window.config.destoryWebServer()
  }
}

const confirmChangeAppid = ({ appid, name }: { appid: number; name: string }) => {
  store.steamApp.id = appid
  store.steamApp.name = name
  window.config.set('settings', 'appid', appid)
}
</script>

<style lang="scss" scoped>
.w-option + .w-option {
  margin-top: 10px;
}

.el-container.about-box {
  .el-header {
    height: unset;
    padding: 7px 0;
    font-size: 15px;
  }

  .el-main {
    padding: 0;
  }
}

.swtich-box {
  display: flex;
  align-items: center;
  font-size: 14px;

  .el-switch {
    margin-left: 1vw;
  }
}
</style>

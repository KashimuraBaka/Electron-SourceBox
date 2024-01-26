<template>
  <el-container id="setting" class="w-container">
    <SettingDialogs ref="dialog" @appid-change="confirmChangeAppid" />
    <el-header>设置</el-header>
    <el-main>
      <SettingContent>
        <template #icon><i-material-symbols-videogame-asset /></template>
        <template #title>
          当前应用 AppID: {{ store.steamApp.id }} ({{ store.steamApp.name }})
        </template>
        <template #message>
          修改后可支持当前创意工坊物品查询 (注意: 错误ID或未购买游戏会导致服务启动失败)
        </template>
        <template #content>
          <el-button class="win" @click="dialog.openWithAppID(store.steamApp)">修改</el-button>
        </template>
      </SettingContent>
      <SettingOption v-model="store.themeDark">
        <template #icon><MoonNight /></template>
        <template #title>暗黑模式</template>
        <template #message>当前主题切换成暗黑模式</template>
      </SettingOption>
      <SettingOption v-model="store.obsOptions.enable" @change="obsOptionsChange">
        <template #icon><i-ic:round-live-tv /></template>
        <template #title>OBS插件 - 进入服务器显示</template>
        <template #message>显示当前进入服务器信息</template>
      </SettingOption>
      <SettingAbout />
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import useCounterStore from '@renderer/services/store'
import { ref } from 'vue'

import { MoonNight } from '@element-plus/icons-vue'
import SettingAbout from './SettingAbout.vue'
import SettingContent from './SettingContent.vue'
import SettingOption from './SettingOption.vue'
import SettingDialogs from './SettingDialogs.vue'

const store = useCounterStore()
const dialog = ref()

const obsOptionsChange = (val: boolean) => {
  if (val) {
    window.config.openOBSLiveServer(store.obsOptions.port)
  } else {
    window.config.closeOBSLiveServer()
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
</style>

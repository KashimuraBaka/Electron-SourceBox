<template>
  <div class="container">
    <FishPool class="fishpool" />
    <div class="loading-box" @click="percent = 10">
      <LoadingBox class="header" :src="Hajimi" />
      <div class="context">
        <WinLoading :size="16" class="loading" />
        <div>{{ message }}</div>
      </div>
      <div class="progress" :style="{ opacity: percent != 0 ? 1 : 0 }">
        <el-progress :text-inside="true" :stroke-width="16" :percentage="percent" striped striped-flow />
        <div class="progress__speed">{{ percentSpeed }}/s</div>
      </div>
    </div>
  </div>
</template>

<script lang="tsx" setup>
import { ref, onMounted } from 'vue'
import useCounterStore from '@desktop/services/store'
import router from '@desktop/services/router'
import { Files } from '@renderer/utils'
import Hajimi from '@renderer/assets/images/hajimi.png'
import { ConfirmAsync } from '@renderer/utils/element-plus/message-box'
import SteamAPI from '@renderer/utils/steam-api'

import FishPool from '@desktop/components/Animat/FishPool.vue'
import WinLoading from '@desktop/components/Animat/WinLoading.vue'
import LoadingBox from '@desktop/components/Animat/LoadingBox.vue'

import type { IpcRendererEvent } from 'electron'
import type { ProgressInfo } from 'electron-updater'

// 获取基础设置
const store = useCounterStore()

const message = ref<string>('')
const percent = ref(0)
const percentSpeed = ref('')

const printMessage = (msg: string) => {
  message.value = msg
}

const asyncCheckVersion = (): Promise<boolean> => {
  return new Promise((resolve, rejects) => {
    printMessage('正在检查更新...')
    window.api
      .checkVersion()
      .then((res) => {
        // 如果返回 null 则是目前处于开发者模式无需更新
        if (res == null) {
          resolve(false)
        }
      })
      .catch(() => undefined)
    window.electron.ipcRenderer.on('app-updater-error', (_: IpcRendererEvent, err: Error) => {
      printMessage('更新出现异常...')
      rejects(err)
    })
    window.electron.ipcRenderer.on('app-updater-update', () => {
      printMessage('正在请求更新...')
    })
    window.electron.ipcRenderer.on('app-updater-available', () => {
      printMessage('获取到更新...')
      window.api.downloadUpdater()
    })
    window.electron.ipcRenderer.on('app-updater-notavailable', () => {
      printMessage('检测到目前为最新版本')
      resolve(false)
    })
    window.electron.ipcRenderer.on('app-updater-progress', (_: IpcRendererEvent, progress: ProgressInfo) => {
      printMessage('正在下载...')
      percent.value = Math.round(progress.percent)
      percentSpeed.value = Files.sizeof(progress.bytesPerSecond)
    })
    window.electron.ipcRenderer.on('app-updater-downloaded', async () => {
      printMessage('正在安装...')
      if (
        await ConfirmAsync(
          <p>
            <span>安装包已经下载完毕, 是否立即更新?</span>
          </p>,
          '软件更新',
          {
            confirmButtonText: '更新',
            cancelButtonText: '不更新',
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'info'
          }
        )
      ) {
        window.api.quitToUpdater()
      } else {
        window.api.windowClose()
      }
    })
  })
}

const checkVersion = async () => {
  let res = false
  try {
    res = await asyncCheckVersion()
  } catch (e) {
    if (
      await ConfirmAsync(
        <p>
          <span>更新出现异常 (有可能网络问题)</span>
          <p style="color: teal">{(e as Error).message.slice(0, 45)}...</p>
        </p>,
        '错误',
        {
          confirmButtonText: '重试',
          cancelButtonText: '关闭',
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          type: 'error'
        }
      )
    ) {
      res = await checkVersion()
    } else {
      res = true
      window.api.windowClose()
    }
  }
  return res
}

const initSteamworks = async () => {
  const err = await window.steamworks.run('initialized')
  if (err) {
    if (
      await ConfirmAsync(
        <p>
          <span>Steam服务启用失败(请检查Steam是否启用)</span>
          <p style="color: teal">{err.slice(0, 45)}...</p>
        </p>,
        '错误',
        {
          confirmButtonText: '重试',
          cancelButtonText: '关闭',
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          type: 'error'
        }
      )
    ) {
      await initSteamworks()
    } else {
      window.api.windowClose()
    }
  }
}

const handleServices = async () => {
  // 获取绑定IP
  printMessage('正在读取配置...')
  const appid = await window.config.get('settings', 'appid')
  store.web.enable = await window.config.get('settings', 'web.enable')
  store.web.port = await window.config.get('settings', 'web.port')
  if (store.web.enable && !store.web.channel) {
    window.config.createWebServer(store.web.port)
  }
  // 检查更新
  if (!(await checkVersion())) {
    printMessage('当前版本无需更新')
  }
  // 获取Steam设置
  printMessage('正在启用Steam服务...')
  await initSteamworks()
  const { steamId32, steamId64 } = await window.steamworks.run('steamuser.getSteamId')
  // 获取当前App配置
  const details = await SteamAPI.GetGameDetails(appid)
  store.steamApp = { id: appid, name: details ? details.name : 'Unknown App' }
  store.CSteamID = {
    init: true,
    name: await window.steamworks.run('steamfriends.getPersonaName'),
    level: await window.steamworks.run('steamuser.getPlayerSteamLevel'),
    steamId32,
    steamId64
  }
  router.push('/main')
}

onMounted(handleServices)
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
  background: linear-gradient(to bottom, var(--theme-content-bg) 50%, #212121 100%);
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    z-index: 0;
    position: absolute;
    border-radius: 5px;
    inset: 0;
    mask: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.15) 50%, rgba(0, 0, 0, 0.35) 100%);
    background-image: url(@renderer/assets/images/background.webp);
    background-size: cover;
    background-repeat: no-repeat;
  }

  .fishpool {
    position: absolute;
    inset: auto 0 0 0;
    height: 25%;
  }

  .loading-box {
    width: 20vw;

    .header {
      margin-bottom: 10px;
    }

    .context {
      display: flex;
      align-items: center;
      justify-content: center;

      .loading {
        margin-right: 8px;
      }
    }

    .progress {
      display: flex;
      margin-top: 10px;
      height: 16px;
      align-items: center;

      .el-progress {
        flex: 1;
      }

      .progress__speed {
        margin-left: 5px;
        font-size: 12px;
      }
    }
  }
}
</style>

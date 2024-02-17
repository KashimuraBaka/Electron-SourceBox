<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="showBox" :style="setPreviewStyle" v-html="showHTML" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { CssStyle } from '@renderer/utils'

import type { CSSProperties } from 'vue'

const url = new URLSearchParams(window.location.search)
const wsPort = url.get('port') || '7000'

const defaultText = () => '当前服务器：{server}\n当前地图：{map} [{mapname}]\n服务器IP地址：{ip}\n服务器当前人数：{player}'

const defaultTextStyle = (): Config.ObsPluginsTextStyle => ({
  size: '1.3rem',
  align: 'left',
  color: '#000',
  shadowType: 'mbzc',
  shadowColor: '#fff'
})

const emptyServerInfo = () => ({
  IP: '',
  Delay: 0,
  Protocol: 0,
  Name: '',
  Map: '',
  Folder: '',
  Game: '',
  AppID: 0,
  Player: 0,
  PlayerMax: 0,
  Robot: 0,
  ServerType: '',
  Envirnoment: '',
  Visibility: false,
  Vac: false,
  Version: '',
  Port: 0,
  SteamID: 0n,
  TVPort: 0,
  TVName: '',
  Tags: '',
  GameID: 0n
})

const formdata = ref<Config.ObsPlugins>({
  customText: defaultText(),
  textStyle: defaultTextStyle()
})

const serverInfo = ref<A2S.SourceServerInfoFormIP>(emptyServerInfo())

class WebSokcet_Client {
  private address: string
  private ws: WebSocket

  constructor(address: string) {
    this.address = address
    this.ws = this.CreateSocket()
  }

  private CreateSocket(): WebSocket {
    const ws = new WebSocket(this.address)
    ws.onopen = this.onOpen.bind(this)
    ws.onerror = this.onError.bind(this)
    ws.onmessage = this.onMessage.bind(this)
    ws.onclose = this.onClose.bind(this)
    return ws
  }

  // 连接成功
  private async onOpen() {
    console.info('[WS] 已连接到服务器...')
  }

  // 消息处理
  private async onMessage({ data: jsonData }: MessageEvent<string>) {
    const { action, data }: ObsResponseData = JSON.parse(jsonData)
    console.log(action, data)
    switch (action) {
      default:
        console.warn('[Unknown Data]', action, data)
        return
      case 'setting': {
        const { customText: customTextConfig, textStyle: textStyleConfig } = data
        formdata.value.customText = customTextConfig || defaultText()
        formdata.value.textStyle = textStyleConfig || defaultTextStyle()
        break
      }
      case 'server': {
        if (data.Delay != -1) {
          serverInfo.value = data
        }
        break
      }
    }
  }

  private async onError(e: Event) {
    console.error('[WS] 因为错误已断开服务器！', e)
  }

  private async onClose() {
    console.info('[WS] 自动断开服务器！')
    let downCount = 10
    const timer = setInterval(() => {
      if (downCount <= 0) {
        formdata.value.customText = '🌈(・ω< )★ 罢工了~\n正在重连中...'
        this.ws.close()
        this.ws = this.CreateSocket()
        clearInterval(timer)
      } else {
        formdata.value.customText = `Σ( ￣□￣💧)< 罢工了~\n正在尝试进行重连(${downCount}s)...`
        downCount -= 1
      }
    }, 1000)
  }
}

const setPreviewStyle = computed(() => {
  const style: CSSProperties = {}
  const { shadowType, shadowColor, size, color, align } = formdata.value.textStyle
  switch (shadowType) {
    case 'tyrh': {
      style.textShadow = `0.0625rem 0.0625rem 0.125rem ${shadowColor}`
      break
    }
    case 'tyzc': {
      style.textShadow = `0.0625rem 0.0625rem 0 #7a7a7a, 0.125rem 0.125rem 0 ${shadowColor}`
      break
    }
    case 'mbrh': {
      style.textShadow = `0 0 0.25rem #000, 0 0 0.0625rem ${shadowColor}`
      break
    }
    case 'mbzc': {
      style.textShadow = CssStyle.textStorke(16, 0.15, 'rem', shadowColor)
      break
    }
  }
  return {
    fontSize: size,
    color,
    textAlign: align,
    ...style
  }
})

// 渲染HTML代码
const showHTML = computed(() => {
  const dict: Json<string> = {
    server: serverInfo.value.Name || '未进入服务器',
    map: serverInfo.value.Map || '--',
    ip: serverInfo.value.IP || '--',
    player: `[${serverInfo.value.Player || 0}/${serverInfo.value.PlayerMax || 0}]`
  }
  return (
    formdata.value.customText
      // 删除自定字符串
      .replace(/\{(.*?)\}/g, (_, r: string) => {
        const [deleteStr, objectKey] = r.match(/:del\((.*?)\)/) || []
        // 是否存在规则
        if (deleteStr) {
          r = r.replace(deleteStr, '')
          if (objectKey) {
            try {
              return (dict[r] || '').replace(new RegExp(objectKey), '')
            } catch (e) {
              return dict[r] || ''
            }
          }
        }
        return dict[r] || ''
      })
      // 给每个换行套个div元素
      .replace(/(.*?)(\n|$)/g, (m, r) => {
        return m ? `<div>${r}</div>` : ''
      })
  )
})

onMounted(() => {
  new WebSokcet_Client(`ws://127.0.0.1:${wsPort}`)
})
</script>

<style lang="scss">
@charset "utf-8";
@use '@renderer/assets/css/font.scss';

html,
body {
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  font-family: 'HarmonyOS_Regular';
}
</style>

<style lang="scss" scoped>
.showBox {
  position: absolute;
  inset: 50% auto auto 0;
  transform: translate(0, -50%);
  padding: 4px 10px;

  :deep(div) {
    line-height: normal;
  }
}
</style>

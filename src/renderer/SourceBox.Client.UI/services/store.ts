import { defineStore } from 'pinia'
import { useDark } from '@vueuse/core'
import { API } from '@renderer/utils'

export type TWebServerPort = WebServerPort

/** 封装 WebServer Port 方法, 方便线程之间交互 */
class WebServerPort {
  private port: MessagePort

  constructor(port: MessagePort) {
    this.port = port
    this.port.start()
  }

  /** 向所有客户端发送数据 */
  public sendAll(action: string, data: any) {
    // 因为 WebSocket 服务端是无法通过对象属性发送给客户端的, 需要通过JSON转换为字符串
    this.port.postMessage([
      'sendAll',
      JSON.stringify({ action, data }, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    ])
  }

  /** 关闭当前通信桥 */
  public close() {
    this.port.close()
  }
}

const useCounterStore = defineStore<'counter', TCounterStore, TCounterGetter, TCounterAction>(
  'counter',
  {
    state: () => ({
      themeDark: useDark(),
      web: {
        enable: false,
        port: 7500,
        obsOptions: {}
      },
      steamApp: {
        id: 480,
        name: ''
      },
      CSteamID: {
        init: false,
        name: '',
        level: 0,
        steamId32: '',
        steamId64: 0n
      }
    }),
    actions: {
      createSourceServerMessage(ip: string) {
        this.web.obsOptions.ip = ip
        clearInterval(this.web.obsOptions.timer)
        const handler = () => {
          if (this.web.enable) {
            window.steamworks.run('simpleQueryServer', ip).then((res) => {
              this.web.channel?.sendAll('server', { IP: ip, ...res })
            })
          } else {
            clearInterval(this.web.obsOptions.timer)
          }
        }
        handler()
        this.web.obsOptions.timer = setInterval(handler, 3000)
      }
    }
  }
)

window.onmessage = async ({ source, data, ports: [port] }: MessageEvent) => {
  // event.source === window 意味着消息来自预加载脚本, 而不是来自iframe或其他来源
  if (source === window && data === 'setWebPort') {
    const store = useCounterStore()
    switch (data) {
      case 'setWebPort': {
        store.web.channel?.close()
        store.web.channel = new WebServerPort(port)
        break
      }
    }
  }
}

export const InitConterStore = async () => {
  // 获取基础设置
  const store = useCounterStore()
  const appid = await window.config.get('settings', 'appid')
  store.web.enable = await window.config.get('settings', 'web.enable')
  store.web.port = await window.config.get('settings', 'web.port')
  if (store.web.enable && !store.web.channel) {
    window.config.createWebServer(store.web.port)
  }
  // 获取Steam设置
  const err = await window.steamworks.run('initialized')
  if (err) {
    throw err
  }
  const { steamId32, steamId64 } = await window.steamworks.run('steamuser.getSteamId')
  const details = await API.Steam.GetGameDetails(appid)
  store.steamApp = { id: appid, name: details ? details.name : 'Unknown App' }
  store.CSteamID = {
    init: true,
    name: await window.steamworks.run('steamfriends.getPersonaName'),
    level: await window.steamworks.run('steamuser.getPlayerSteamLevel'),
    steamId32,
    steamId64
  }
}

export default useCounterStore

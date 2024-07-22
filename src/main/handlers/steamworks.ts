import LocalStore from '../stores/localstore'
import { SourceSocket } from '../utils/steam/source'
import Steamworks from '../utils/steamworks'

import type { IpcMainInvokeEvent } from 'electron'

async function runFunction(func: (...args: any[]) => any, args: any[]) {
  let result: any
  try {
    result = await func(...args)
  } catch (e) {
    result = undefined
  }
  return result
}

export default {
  steamworks: async (_event: IpcMainInvokeEvent, [funcsStr, args]: [string, any[]]) => {
    // 查找函数
    const funcs = funcsStr.split('.')
    // 是否为预定义
    switch (funcsStr) {
      case 'initialized': {
        // Steamworks 初始化
        try {
          LocalStore.steamworks = Steamworks.init(480)
          // Steamworks.electronEnableSteamOverlay()
          LocalStore.steamworks_error = ''
        } catch (e) {
          console.log('[Steamworks] 服务异常:', (<Error>e).message)
          LocalStore.steamworks_error = (<Error>e).message
        }
        return LocalStore.steamworks_error
      }
      case 'setAppid':
        return (LocalStore.steamworks = Steamworks.init(args[0])) != undefined
      case 'simpleQueryServer':
        return await new SourceSocket(args[0]).QueryServerInfo()
      case 'queryServerPlayers':
        return await new SourceSocket(args[0]).QueryServerPlayers()
      case 'queryServerRules':
        return await new SourceSocket(args[0]).QueryServerRules()
      case 'restartAppIfNecessary':
        return LocalStore.steamworks?.restartAppIfNecessary(args[0])
    }
    // 如果Steamworks服务未启动则返回undefined
    if (!LocalStore.steamworks) return undefined
    let func: any = LocalStore.steamworks
    // 遍历数组中的每个键
    for (const key of funcs) {
      // 如果当前的属性值是一个对象，且有该键对应的属性，更新属性值
      const type = typeof func[key]
      if (type === 'function' || type === 'object') {
        func = func[key]
      } else {
        func = undefined
        break
      }
    }
    if (func) {
      return await runFunction(func, args)
    } else {
      console.warn('[Steamworks] unknown function', funcsStr)
      return undefined
    }
  }
}

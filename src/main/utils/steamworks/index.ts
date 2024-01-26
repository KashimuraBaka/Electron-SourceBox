import Electron from 'electron'
import { Client } from './types'
import { SteamApiCallback } from './client'
import SteamworksNode from '../../../../resources/win64/steamworks.win32-x64-msvc.node'

/// 目前只考虑Windows x64使用 steamworks 跳过该步骤
/* 
  const { platform, arch } = process
  const nativeBinding = (() => {
  if (platform === 'win32' && arch === 'x64') {
    return require('../../resources/win64/steamworks.win32-x64-msvc.node')
  } else if (platform === 'linux' && arch === 'x64') {
    return require('../../resources/linux64/steamworks.linux-x64-gnu.node')
  } else if (platform === 'darwin') {
    if (arch === 'x64') {
      return require('../../resources/osx/steamworks.darwin-x64.node')
    } else if (arch === 'arm64') {
      return require('../../resources/osx/steamworks.darwin-arm64.node')
    }
  } else {
    throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`)
  }
})() */

let runCallbacksInterval: NodeJS.Timeout

/**
 * Initialize the steam client or throw an error if it fails
 * @param {number} [appId] - App ID of the game to load, if undefined, will search for a steam_appid.txt file
 * @returns {Omit<Client, 'init' | 'runCallbacks'>}
 */
const init = (appId: number): Omit<Client, 'init' | 'runCallbacks'> => {
  const { init: internalInit, runCallbacks, ...api } = SteamworksNode

  internalInit(appId)

  clearInterval(runCallbacksInterval)
  runCallbacksInterval = setInterval(runCallbacks, 1000 / 30)

  return api
}

const shutdown = () => {
  const { shutdown } = SteamworksNode

  clearInterval(runCallbacksInterval)
  shutdown()
}

/**
 * @param {number} appId - App ID of the game to load
 * {@link https://partner.steamgames.com/doc/api/steam_api#SteamAPI_RestartAppIfNecessary}
 * @returns {boolean}
 */
const restartAppIfNecessary = (appId: number): boolean => {
  return SteamworksNode.restartAppIfNecessary(appId)
}

/**
 * Enable the steam overlay on electron
 * @param {boolean} [disableEachFrameInvalidation] - Should attach a single pixel to be rendered each frame
 */
const electronEnableSteamOverlay = (disableEachFrameInvalidation?: boolean) => {
  Electron.app.commandLine.appendSwitch('in-process-gpu')
  Electron.app.commandLine.appendSwitch('disable-direct-composition')

  if (!disableEachFrameInvalidation) {
    /** @param {electron.BrowserWindow} browserWindow */
    const attachFrameInvalidator = (browserWindow: any) => {
      browserWindow.steamworksRepaintInterval = setInterval(() => {
        if (browserWindow.isDestroyed()) {
          clearInterval(browserWindow.steamworksRepaintInterval)
        } else if (!browserWindow.webContents.isPainting()) {
          browserWindow.webContents.invalidate()
        }
      }, 1000 / 60)
    }

    Electron.BrowserWindow.getAllWindows().forEach(attachFrameInvalidator)
    Electron.app.on('browser-window-created', (_, bw) => attachFrameInvalidator(bw))
  }
}

export default {
  init,
  shutdown,
  restartAppIfNecessary,
  electronEnableSteamOverlay,
  SteamCallback: SteamworksNode.callback.SteamCallback as SteamApiCallback
}

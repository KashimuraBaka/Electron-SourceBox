import { ipcMain } from 'electron'
import ConfigHandlers, { createWebServer } from './config'
import ProcessHandlers from './console'
import SteamworksHandlers from './steamworks'
import Stores from '../stores'

export const registerIpcHandler = async () => {
  const handlers = {
    ...ConfigHandlers,
    ...ProcessHandlers,
    ...SteamworksHandlers
  }

  Object.entries(handlers).forEach(([eventName, handler]) => {
    ipcMain.handle(eventName, handler)
  })
}

export const registerServiceHandler = async () => {
  if (Stores.Settings.store.web.enable) {
    createWebServer(Stores.Settings.store.web.port)
  }
}

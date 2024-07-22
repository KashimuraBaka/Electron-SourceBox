import type { Main } from '..'
import type AppUpdater from '../updater'
import type { Client } from '../utils/steamworks/types'
import type { MessagePortMain } from 'electron'

export default class LocalStore {
  public static main: Main
  public static steamworks: Omit<Client, 'init' | 'runCallbacks'>
  public static steamworks_error: string
  public static web?: Electron.UtilityProcess
  public static webMainPort?: MessagePortMain
  public static webClientPort?: MessagePortMain
  public static updater?: AppUpdater
}

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import writeBuffer from './writer'
import ShortcutReader from './reader'
import { GenerateRandomArray } from '../..'

class ShortcutEditor {
  private _filePath: string
  private _shortcuts: TShortcuts

  constructor(filePath: string, obj?: TShortcuts) {
    this._filePath = filePath
    this._shortcuts = obj || { shortcuts: [] }
  }

  private findgame(gamename: string) {
    return this._shortcuts.shortcuts.findIndex(
      (val) => val.AppName.toLowerCase() == gamename.toLowerCase()
    )
  }

  public IsGameExist(gamename: string) {
    return this.findgame(gamename) != -1
  }

  public GetGameID(gamename: string) {
    const index = this.findgame(gamename)
    if (index != -1) {
      const AppID = this._shortcuts.shortcuts[index].appid
      return ((BigInt(AppID) & 0xffffffffn) << 32n) | 0x02000000n
    } else {
      return 0n
    }
  }

  public AddCustomGame(gamename: string, options: TShortcutOptions) {
    const gameids = this._shortcuts.shortcuts.map((val) => val.appid)
    if (existsSync(options.Exe)) {
      const StartDir = dirname(options.Exe).slice(0, -1).replaceAll('//', '\\')
      options.Exe = `"${options.Exe}"`.replaceAll('//', '\\')
      this._shortcuts.shortcuts.push({
        ...{
          appid: GenerateRandomArray(gameids, 2000000000, 3000000000),
          AppName: gamename,
          Exe: '',
          StartDir,
          icon: '',
          ShortcutPath: '',
          LaunchOptions: '',
          IsHidden: false,
          AllowDesktopConfig: true,
          AllowOverlay: true,
          OpenVR: false,
          Devkit: false,
          DevkitGameID: '',
          DevkitOverrideAppID: false,
          LastPlayTime: new Date(),
          FlatpakAppID: '',
          tags: []
        },
        ...options
      })
      return true
    }
    return false
  }

  public WriteToFile() {
    try {
      const data = new writeBuffer(this._shortcuts).read()
      writeFileSync(this._filePath, data)
      return true
    } catch (e) {
      return false
    }
  }
}

function ReadShortcutFile(filePath: string, options?: ParseObjectOptions) {
  const folderPath = dirname(filePath)
  if (!statSync(folderPath).isDirectory()) {
    mkdirSync(folderPath, { recursive: true })
  }
  if (!existsSync(filePath)) {
    writeFileSync(filePath, '')
  }
  const fileStream = readFileSync(filePath)
  const reader = new ShortcutReader(fileStream, options).Parse()
  return new ShortcutEditor(filePath, reader)
}

export { ReadShortcutFile }

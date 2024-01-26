import { ReadShortcutFile } from './shortcut-editor'
import Steam from './index'
import { app } from 'electron'

export default async function (id: number) {
  const SteamPath = await Steam.getPath()
  if (SteamPath) {
    const editor = ReadShortcutFile(`${SteamPath}/userdata/${id}/config/shortcuts.vdf`)
    if (!editor.IsGameExist('SourceBox-Run(730)')) {
      editor.AddCustomGame('SourceBox-Run(730)', { Exe: 'D://Tools//精易编程助手3.98//Edbug.exe' })
      editor.WriteToFile()
    }
    console.log(editor.GetGameID('SourceBox-Run(730)'))
  }

  app.exit()
}

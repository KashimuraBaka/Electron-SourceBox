import Regedit from '../regedit'

const getPath = async () => {
  return await Regedit.readValue(
    Regedit.HKEY.LOCAL_MACHINE,
    'SOFTWARE/Wow6432Node/Valve/Steam',
    'InstallPath'
  )
}

export default {
  getPath
}

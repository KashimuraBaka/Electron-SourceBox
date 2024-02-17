import ElectronStore from 'electron-store'
import { DEFAULT_STORES_PATH } from '../config'
import { CompressJson, UnCompressJson } from './storehandler'

export default new ElectronStore<TElectronStore>({
  cwd: DEFAULT_STORES_PATH,
  fileExtension: 'dat',
  encryptionKey: 'Kashimura',
  name: 'settings',
  // 写入压缩算法
  serialize: CompressJson,
  // 读取解压算法
  deserialize: UnCompressJson,
  defaults: {
    appid: 480,
    mainWindow: {
      x: 0,
      y: 0,
      width: 900,
      height: 670,
      isMaximized: false
    },
    web: {
      enable: false,
      port: 7500
    },
    obsOptions: {
      customText: '当前服务器：{server}\n当前地图：{map} [{mapname}]\n服务器IP地址：{ip}\n服务器当前人数：{player}',
      textStyle: {
        size: '1.3rem',
        align: 'left',
        color: '#fff',
        shadowType: 'tyrh',
        shadowColor: '#7a7a7a'
      }
    }
  }
})

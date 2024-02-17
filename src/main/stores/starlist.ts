import ElectronStore from 'electron-store'
import { DEFAULT_STORES_PATH } from '../config'
import { CompressJson, UnCompressJson } from './storehandler'

export default new ElectronStore<TServersStore>({
  cwd: DEFAULT_STORES_PATH,
  fileExtension: 'dat',
  encryptionKey: 'Kashimura',
  name: 'starlist',
  // 写入压缩算法
  serialize: CompressJson,
  // 读取解压算法
  deserialize: UnCompressJson,
  defaults: {
    servers: [],
    collections: {}
  }
})

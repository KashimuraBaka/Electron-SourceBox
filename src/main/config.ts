import path from 'path'

const ROOT_PATH = process.cwd()

/** Electron Store 存放路径 */
export const DEFAULT_STORES_PATH = path.normalize(path.join(ROOT_PATH, 'Saves'))

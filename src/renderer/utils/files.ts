/** 文件大小单位转换 */
const sizeof = (byte: number | bigint) => {
  if (typeof byte == 'bigint') {
    byte = Number(byte)
  }
  if (byte <= 0) return '0 Bytes'
  const unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const index = Math.floor(Math.log(byte) / Math.log(1024))
  return (byte / Math.pow(1024, index)).toFixed(2) + unitArr[index]
}

const start = (path: string) => {
  return window.api.exec(`start "" "${path}"`)
}

const isFile = (path: string) => {
  return new RegExp(/^[A-z]:\\(.+?\\)*\w*\.\w*$/).test(path)
}

export default {
  sizeof,
  start,
  isFile
}

import { exec } from 'child_process'

type REG_VALUE = string | number | bigint | Buffer

enum HKEY {
  CLASSES_ROOT = 'HKEY_CLASSES_ROOT',
  CURRENT_CONFIG = 'HKEY_CURRENT_CONFIG',
  DYN_DATA = 'HKEY_DYN_DATA',
  CURRENT_USER_LOCAL_SETTINGS = 'HKEY_CURRENT_USER_LOCAL_SETTINGS',
  CURRENT_USER = 'HKEY_CURRENT_USER',
  LOCAL_MACHINE = 'HKEY_LOCAL_MACHINE',
  PERFORMANCE_DATA = 'HKEY_PERFORMANCE_DATA',
  PERFORMANCE_TEXT = 'HKEY_PERFORMANCE_TEXT',
  PERFORMANCE_NLSTEXT = 'HKEY_PERFORMANCE_NLSTEXT',
  USERS = 'HKEY_USERS'
}

export enum REG_TYPE {
  BINARY = 'REG_BINARY',
  DWORD = 'REG_DWORD',
  DWORD_LITTLE_ENDIAN = 'REG_DWORD_LITTLE_ENDIAN',
  DWORD_BIG_ENDIAN = 'REG_DWORD_BIG_ENDIAN',
  EXPAND_SZ = 'REG_EXPAND_SZ',
  LINK = 'REG_LINK',
  MULTI_SZ = 'REG_MULTI_SZ',
  NONE = 'REG_NONE',
  QWORD = 'REG_QWORD',
  QWORD_LITTLE_ENDIAN = 'REG_QWORD_LITTLE_ENDIAN',
  SZ = 'REG_SZ'
}

const parseType = (type: string, value: string): REG_VALUE => {
  switch (type) {
    case REG_TYPE.SZ:
      return value
    case REG_TYPE.DWORD:
      return parseInt(value, 16)
    case REG_TYPE.BINARY:
      return Buffer.from(value, 'hex')
    case REG_TYPE.QWORD:
      return BigInt(value)
    default:
      return value
  }
}

const readValue = (key: HKEY, path: string, value: string): Promise<null | REG_VALUE> => {
  const regPath = `${key}\\${path.replaceAll('/', '\\')}`
  return new Promise((resolve) => {
    exec(
      `cmd /c chcp 65001>nul && REG QUERY ${regPath} /v ${value}`,
      { encoding: 'buffer' },
      (error, stdout, stderr) => {
        if (error != null) {
          console.log('[regedit] Error:', error)
          resolve(null)
        } else if (stderr.length) {
          console.log('[regedit] Command: Error', stderr.toString('utf-8'))
          resolve(null)
        } else {
          const res = stdout.toString().match(/(REG_\w+)\s+(.*)\S*/)
          if (!res || res.length != 3) {
            console.log('[regedit] regex value error')
            resolve(null)
            return
          }
          const [, type, value] = res
          resolve(parseType(type, value))
        }
      }
    )
  })
}

export default { HKEY, readValue }

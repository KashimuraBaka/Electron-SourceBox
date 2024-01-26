import { SPECIAL, TYPES } from './constants'

function every<T = any>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean) {
  let index = -1
  const length = array == null ? 0 : array.length

  while (++index < length) {
    if (!predicate(array[index], index, array)) {
      return false
    }
  }
  return true
}

export default class ShortcutReader {
  private stream: Buffer
  private offset: number
  private options: ParseObjectOptions

  constructor(buf: Buffer, options?: ParseObjectOptions) {
    this.stream = buf
    this.offset = 0
    this.options = {
      autoConvertArrays: true,
      autoConvertBooleans: true,
      dateProperties: ['LastPlayTime'],
      ...options
    }
  }

  public Parse(): TShortcuts {
    if (this.stream.length) {
      return this.Object() as TShortcuts
    } else {
      return { shortcuts: [] }
    }
  }

  private readType(type: TYPES, propName: string) {
    switch (type) {
      case TYPES.OBJECT:
        return this.Object()
      case TYPES.STRING:
        return this.String()
      case TYPES.INTEGER: {
        const val = this.Integer()
        if (this.options.dateProperties.includes(propName)) {
          return new Date(val * 1000)
        } else if (this.options.autoConvertBooleans && (val === 1 || val === 0)) {
          return !!val
        }
        return val
      }
      default:
        return null
    }
  }

  private Object() {
    const obj: TObject = {}
    // 应该有属性，有类型和值
    do {
      const type = this.stream.readUInt8(this.offset)
      this.offset++

      // 处理空数组/对象
      if (type === SPECIAL.OBJECT_END) {
        break
      }

      const propName = this.String()
      try {
        obj[propName] = this.readType(type, propName)
      } catch (err) {
        throw new Error(`encountered error while handling property: ${propName} ${err}`)
      }
    } while (this.offset < this.stream.length)

    if (this.options.autoConvertArrays) {
      // check if we should convert to an array instead
      const keys = Object.keys(obj)
      if (every(keys, (val) => (val.match(/\d+/) || '').length > 0)) {
        const arr = new Array(keys.length)
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          arr[key] = obj[key]
        }
        return arr
      }
    }

    return obj
  }

  private String() {
    const start = this.offset
    while (this.stream.readUInt8(this.offset) !== SPECIAL.STRING_END) {
      this.offset++
    }
    return this.stream.toString('utf8', start, this.offset++)
  }

  private Integer() {
    const value = this.stream.readUInt32LE(this.offset)
    this.offset += 4
    return value
  }
}

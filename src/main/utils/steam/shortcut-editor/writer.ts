import { TYPES, SPECIAL, ECMA_SIZES } from './constants'

class ObjecSizeof {
  private static isNodePlatform = typeof process === 'object' && typeof require === 'function'

  private static allProperties(obj: any[]) {
    const stringProperties: any[] = []
    for (const prop in obj) {
      stringProperties.push(prop)
    }
    if (Object.getOwnPropertySymbols) {
      const symbolProperties = Object.getOwnPropertySymbols(obj)
      Array.prototype.push.apply(stringProperties, symbolProperties)
    }
    return stringProperties
  }

  private static sizeOfObject(seen: WeakSet<WeakKey>, object: any) {
    if (object == null) {
      return 0
    }

    let bytes = 0
    const properties = ObjecSizeof.allProperties(object)
    for (let i = 0; i < properties.length; i++) {
      const key = properties[i]
      // Do not recalculate circular references
      if (typeof object[key] === 'object' && object[key] !== null) {
        if (seen.has(object[key])) {
          continue
        }
        seen.add(object[key])
      }

      bytes += ObjecSizeof.getCalculator(seen)(key)
      try {
        bytes += ObjecSizeof.getCalculator(seen)(object[key])
      } catch (ex) {
        if (ex instanceof RangeError) {
          // circular reference detected, final result might be incorrect
          // let's be nice and not throw an exception
          bytes = 0
        }
      }
    }

    return bytes
  }

  private static getCalculator(seen: WeakSet<WeakKey>) {
    return function calculator(object: ObjectAny) {
      if (Buffer.isBuffer(object)) {
        return object.length
      }

      switch (typeof object) {
        case 'string':
          // https://stackoverflow.com/questions/68789144/how-much-memory-do-v8-take-to-store-a-string/68791382#68791382
          return ObjecSizeof.isNodePlatform
            ? 12 + 4 * Math.ceil(object.length / 4)
            : object.length * ECMA_SIZES.STRING
        case 'boolean':
          return ECMA_SIZES.BOOLEAN
        case 'number':
          return ECMA_SIZES.NUMBER
        case 'symbol': {
          if (Symbol.keyFor) {
            const symbol = Symbol.keyFor(object)
            if (symbol) {
              return symbol.length * ECMA_SIZES.STRING
            }
          }
          return (object.toString().length - 8) * ECMA_SIZES.STRING
        }
        case 'object':
          if (Array.isArray(object)) {
            return object.map(ObjecSizeof.getCalculator(seen)).reduce((acc, curr) => {
              return acc + curr
            }, 0)
          } else {
            return ObjecSizeof.sizeOfObject(seen, object)
          }
        default:
          return 0
      }
    }
  }

  /**
   * Main module's entry point
   * Calculates Bytes for the provided parameter
   * @param object - handles object/string/boolean/buffer
   * @returns {*}
   */
  static Calc(object: ObjectAny): number {
    return ObjecSizeof.getCalculator(new WeakSet())(object)
  }
}

export default class ShortcutWritter {
  private stream: Buffer
  private offset: number
  private allocSize: number

  public totalLength = 0

  constructor(obj: TShortcuts) {
    this.offset = 0
    this.allocSize = 256
    this.stream = Buffer.alloc(
      this.multiplesOf(ObjecSizeof.Calc(obj), this.allocSize) * this.allocSize
    )
    this.appendValue(obj)
    return
  }

  private appendValue(val: ObjectAny) {
    // pre process values to align with writable values
    if (val === null || val === undefined) {
      // treat as empty strings
      val = ''
    } else if (val instanceof Date) {
      // treat dates as numbers
      val = val.valueOf() / 1000
    } else if (val === true) {
      // treat booleans as numbers
      val = 1
    } else if (val === false) {
      // treat booleans as numbers
      val = 0
    }

    // write values
    if (typeof val === 'string') {
      const lengthInBytes = Buffer.byteLength(val)
      this.extendBufferIfNeeded(lengthInBytes + 1)
      this.stream.write(val, this.offset, lengthInBytes)
      this.offset += lengthInBytes
      this.stream.writeUInt8(SPECIAL.STRING_END, this.offset)
      this.offset += 1
    } else if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      // four bytes, LE
      this.extendBufferIfNeeded(4)
      this.stream.writeUInt32LE(val, this.offset)
      this.offset += 4
    } else if (typeof val === 'object') {
      let keys

      if (val instanceof Array) {
        keys = new Array(val.length)
        for (let i = 0; i < keys.length; i++) {
          keys[i] = i.toString()
        }
      } else {
        keys = Object.keys(val)
      }

      for (let i = 0; i < keys.length; i++) {
        let constant
        const key = keys[i]
        const propValue = val[key]

        if (propValue === null || propValue === undefined || typeof propValue === 'string') {
          constant = TYPES.STRING
        } else if (
          propValue === true ||
          propValue === false ||
          (typeof propValue === 'number' && !isNaN(propValue) && isFinite(propValue)) ||
          propValue instanceof Date
        ) {
          constant = TYPES.INTEGER
        } else if (typeof val === 'object') {
          constant = TYPES.OBJECT
        } else {
          throw new Error(`Writer encountered unhandled value: ${val}`)
        }

        const lengthInBytes = Buffer.byteLength(key)
        this.extendBufferIfNeeded(lengthInBytes + 2)

        this.stream.writeUInt8(constant, this.offset)
        this.offset += 1
        this.stream.write(key, this.offset, lengthInBytes)
        this.offset += lengthInBytes
        this.stream.writeUInt8(SPECIAL.PROPERTY_NAME_END, this.offset)
        this.offset += 1

        this.appendValue(propValue)
      }

      this.extendBufferIfNeeded(1)
      this.stream.writeUInt8(SPECIAL.OBJECT_END, this.offset)
      this.offset += 1
    } else {
      throw new Error(`Writer encountered unhandled value: ${String(val)}`)
    }
  }

  private multiplesOf(number, constant) {
    return Math.max(1, Math.floor(number / constant) + (number % constant === 0 ? 0 : 1))
  }

  public extendBufferIfNeeded(object: number) {
    const newAmountOfBytes = ObjecSizeof.Calc(object)
    if (this.stream.length < this.offset + newAmountOfBytes) {
      const remainingSize = newAmountOfBytes - (this.stream.length - this.offset)
      const multiplesOfAlloc = this.multiplesOf(remainingSize, this.allocSize)
      this.stream = Buffer.concat(
        [this.stream],
        this.stream.length + multiplesOfAlloc * this.allocSize
      )
    }
  }

  public read(): Buffer {
    return this.stream.subarray(0, this.offset)
  }
}

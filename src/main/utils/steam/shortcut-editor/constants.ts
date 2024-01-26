enum TYPES {
  /** 对象类型 */
  OBJECT = 0x00,
  /** 字符串类型 */
  STRING = 0x01,
  /** 整数类型 */
  INTEGER = 0x02
}

enum SPECIAL {
  OBJECT_END = 0x08,
  STRING_END = 0x00,
  PROPERTY_NAME_END = 0x00
}

enum ECMA_SIZES {
  STRING = 2,
  BOOLEAN = 4,
  BYTES = 4,
  NUMBER = 8,
  Uint8Array = 1,
  Uint8ClampedArray = 1,
  Uint16Array = 2,
  Uint32Array = 4,
  Int8Array = 1,
  Int16Array = 2,
  Int32Array = 4,
  Float32Array = 4,
  Float64Array = 8
}

export { TYPES, SPECIAL, ECMA_SIZES }

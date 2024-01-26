export class Coding {
  private stream: Buffer
  private index: number

  constructor(buf: Buffer) {
    this.stream = buf
    this.index = 0
  }

  public Length(): number {
    return this.stream.length - this.index
  }

  public reset(buf: Buffer): void {
    this.stream = buf
    this.index = 0
  }

  public readBytes(length: number): Buffer {
    const startIndex = this.index
    let endIndex = this.index + length
    if (endIndex > this.stream.length) {
      endIndex = this.stream.length
    }
    this.index = endIndex
    return this.stream.subarray(startIndex, endIndex)
  }

  public Header(): string {
    // Skip FFFFFFFF
    this.readBytes(4)
    // Read Header
    return this.readBytes(1).toString()
  }

  public Byte(): number {
    return this.stream.readUint8(this.index++)
  }

  public Bool(): boolean {
    return this.Byte() > 0
  }

  public Short(): number {
    const index = this.index
    this.index += 2 // Short Type 2 Bytes
    return this.stream.readUint16LE(index)
  }

  public Int(): number {
    const index = this.index
    this.index += 4 // Int Type 4 Bytes
    return this.stream.readUint32LE(index)
  }

  public Long(): bigint {
    const index = this.index
    this.index += 8 // Long Type 8 Bytes
    return this.stream.readBigUInt64LE(index)
  }

  public Float(): number {
    const index = this.index
    this.index += 4 // Float Type 4 Bytes
    return this.stream.readFloatLE(index)
  }

  public String(len?: number): string {
    if (len) {
      return this.readBytes(len).toString()
    } else {
      const index = this.stream.indexOf(0, this.index)
      let data: Buffer
      if (index == -1) {
        data = this.readBytes(this.stream.length - this.index)
      } else {
        data = this.readBytes(index - this.index)
        // 跳过空数据
        this.index++
      }
      return data.toString()
    }
  }

  public Bytes(): Buffer {
    const needReadLength = this.stream.length - this.index
    return this.readBytes(needReadLength)
  }
}

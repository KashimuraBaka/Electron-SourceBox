import Dgram from 'dgram'

type SocketStore = {
  success: boolean
  data?: Buffer
  error?: Error
}

export class SyncSocket {
  private socketType: Dgram.SocketType
  private timeout: number

  constructor(type: Dgram.SocketType, timeout = 3) {
    this.socketType = type
    this.timeout = timeout
  }

  public Send(ip: string, port: number, msg: Buffer) {
    return new Promise<SocketStore>((resolve) => {
      const socket = Dgram.createSocket(this.socketType)
      // 设置 Socket 请求超时
      const timer = setTimeout(() => {
        socket.unref()
        resolve({ success: false, error: new Error('timeout') })
      }, this.timeout * 1000)
      socket.on('close', () => clearTimeout(timer))
      socket.on('message', (data) => {
        socket.close()
        clearTimeout(timer)
        resolve({ success: true, data })
      })
      socket.on('error', (err) => {
        socket.close()
        clearTimeout(timer)
        resolve({ success: false, data: Buffer.from(''), error: err })
      })
      socket.send(msg, port, ip, (err) => {
        if (err) {
          resolve({ success: false, data: Buffer.from(''), error: err })
        }
      })
    })
  }
}

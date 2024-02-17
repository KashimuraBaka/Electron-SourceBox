import WebSocket from 'ws'
import Settings from '../stores/settings'

interface TAddressInfo {
  port: number
  family: number
  address: string
}

interface TWebSocket extends WebSocket {
  _socket: {
    address(): TAddressInfo
    readonly remoteAddress: string
    readonly remotePort: number
  }
}

export default class HTTP_WebSocket {
  private ws: WebSocket.Server
  private onlineMap = new Map<number, WebSocket>()

  constructor(port: number) {
    this.ws = new WebSocket.Server({ port })
    this.ws.on('connection', this.onConnected.bind(this))
  }

  /**
   * 客户端成功连接时
   * @param client 客户端句柄
   * @noreturn
   */
  private onConnected(client: TWebSocket) {
    const { remotePort: port } = client._socket
    this.onlineMap.set(port, client)
    client.send(JSON.stringify({ action: 'setting', data: Settings.store.obsOptions }))
    // 客户端收到消息
    client.on('message', this.onClientMessage.bind(this))
    // 客户端关闭连接
    client.on('close', () => this.onClientClosed(port))
  }

  /**
   * 当客户端发送数据时
   * @param data 发送字节集数据
   * @param isBinary 是否为字节集数据
   * @noreturn
   */
  private async onClientMessage(data: WebSocket.RawData) {
    console.log('WebClient', data.toString())
  }

  private async onClientClosed(port: number) {
    this.onlineMap.delete(port)
  }

  /**
   * 向所有 Webscoket client 发送是数据
   * @param data 要发送的字节数据
   * @noreturn
   */
  public SendAllMessage(data: BufferLike) {
    this.onlineMap.forEach((client) => {
      client.send(data)
    })
  }
}

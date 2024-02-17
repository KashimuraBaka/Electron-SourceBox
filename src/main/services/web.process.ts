import WEB_SERVER from './web_http'
import WEB_SOCKET from './web_socket'

const {
  argv: [, , portStr],
  parentPort
} = process

const servicePort = Number(portStr)

// 开启服务
new WEB_SERVER(servicePort)
const ws = new WEB_SOCKET(servicePort + 1)

// 获取管道通信
parentPort.on('message', ({ ports: [port] }: Electron.MessageEvent) => {
  port.start()
  port.on('message', ({ data: [func, data] }: Electron.MessageEvent) => {
    switch (func) {
      case 'sendAll': {
        ws.SendAllMessage(data)
      }
    }
  })
})

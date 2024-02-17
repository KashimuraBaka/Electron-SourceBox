import { parentPort, workerData } from 'worker_threads'
import WEB_SERVER from './web_http'
import WEB_SOCKET from './web_socket'

const { port } = workerData

new WEB_SERVER(port)
new WEB_SOCKET(port + 1)

// 获取管道通信
parentPort?.on('message', () => {})

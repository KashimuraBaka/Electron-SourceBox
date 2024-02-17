export default async (event: MessageEvent) => {
  // event.source === window 意味着消息来自预加载脚本
  // 而不是来自iframe或其他来源
  if (event.source === window && event.data === 'setWebPort') {
    const [port] = event.ports
    console.log(port)
    // 一旦我们有了这个端口，我们就可以直接与主进程通信
    /* port.onmessage = (event) => {
        console.log('from main process:', event.data)
        port.postMessage(event.data.test * 2)
      } */
  }
}

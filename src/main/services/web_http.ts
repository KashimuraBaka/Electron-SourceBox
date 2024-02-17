import path from 'path'

import express from 'express'

import type { Express } from 'express-serve-static-core'

export default class HTTP_Server {
  private port: number
  private app: Express

  constructor(port: number) {
    this.port = port
    this.app = express()
    this.app.listen(port, this.onOpen.bind(this))
    // 自动重定向, 防止访问ElectronApp
    this.app.get(/^\/index(\.html)?$/, (_, res) => {
      res.redirect('/')
    })
    // 加载静态资源
    this.app.use(
      express.static(path.join(__dirname, '../renderer'), {
        index: 'index-web.html'
      })
    )
  }

  private onOpen() {
    console.log('[Web Procss] Server listening on port', this.port)
  }
}

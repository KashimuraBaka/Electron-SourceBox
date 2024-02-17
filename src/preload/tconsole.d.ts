/// <reference types="electron-vite/node" />

type TGetStore<T> = (...args: any[]) => Promise<T>

declare interface TConsole {
  windowMinimize: TGetStore<void>
  windowMaximize: TGetStore<boolean>
  windowClose: TGetStore<void>
  openFile: TGetStore<void>
  exec: TGetStore<boolean>
}

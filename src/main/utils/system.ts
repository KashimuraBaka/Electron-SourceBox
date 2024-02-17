import { utilityProcess } from 'electron'
import { join } from 'path'

export const createProcess = (serviceName: string, ...args: string[]) => {
  return utilityProcess.fork(join(__dirname, `${serviceName}.js`), args, { serviceName })
}

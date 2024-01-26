export const MatchAddress = (Addr: string) => {
  const host = { ServerIp: '127.0.0.1', ServerPort: 0 }
  const reg = /^(\d{1,3}\.\d{1,3}\.\d{1,3}.\d{1,3}|(\w*\.|)\w*\.\w*)((:|：|)(\d{1,5})|)/
  const subMatch = Addr.match(reg)
  if (subMatch && subMatch.length == 6) {
    host.ServerIp = subMatch[1]
    host.ServerPort = parseInt(subMatch[5])
  }
  return host
}

/**
 * 获取随机数值
 * @param min 最小值
 * @param max 最大值
 * @returns {number} 返回随机数
 */
export const GetRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const SecondToTime = (time: number): string => {
  const total_s = Number(time) // 浮点数转整数
  const h = Math.floor(total_s / 3600)
  const m = Math.floor((total_s % 3600) / 60)
  const s = Math.floor((total_s % 3600) % 60)
  const hDisplay = h > 0 ? (h < 10 ? '0' + h : h) : '00'
  const mDisplay = m > 0 ? (m < 10 ? '0' + m : m) : '00'
  const sDisplay = s > 0 ? (s < 10 ? '0' + s : s) : '00'
  return `${hDisplay}:${mDisplay}:${sDisplay}`
}

/**
 * 通过数组排除获取指定随机值
 * @param arr 要排除整数数组
 * @param min 随机最小值
 * @param max 随机最大值
 * @returns {number} 返回随机数
 */
export const GenerateRandomArray = (arr: number[], min: number, max: number) => {
  let rand = 0
  while (arr.indexOf((rand = GetRandomInt(min, max))) == -1) {
    break
  }
  return rand
}

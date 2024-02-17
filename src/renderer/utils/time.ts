/**
 * 时间戳转字符串时间，默认返回当前字符串时间
 * @param timestamp 时间戳，不填默认当前时间
 * @returns {string} 字符串时间，格式YYYY-MM-DD hh:mm:ss
 */
export const FormatTime = (timestamp = 0): string => {
  // GetTime
  const date = new Date()
  switch (timestamp.toString().length) {
    default:
      return 'N/A'
    case 1:
      break
    case 10:
      date.setTime(timestamp * 1000)
      break
    case 13:
      date.setTime(timestamp)
      break
    case 18:
      date.setTime(Math.floor((timestamp - 116444736000000000) / 10000))
      break
  }
  // Time format
  const fixZero = (val: number) => (val < 10 ? `0${val}` : val)
  const YY = date.getFullYear()
  const MM = fixZero(date.getMonth() + 1)
  const DD = fixZero(date.getDate())
  const hh = fixZero(date.getHours())
  const mm = fixZero(date.getMinutes())
  const ss = fixZero(date.getSeconds())
  return `${YY}-${MM}-${DD} ${hh}:${mm}:${ss}`
}

/**
 * 秒单位到总天数
 * @param second 时间/秒
 * @returns 返回字符串当前天
 */
export const SecondToDate = (second: number): string => {
  const day = Math.floor(second / 86400)
  if (day > 365) {
    return `${Math.floor(day / 365)}年前`
  } else if (day > 0 && day < 365) {
    return `${day}天前`
  } else {
    return `${Math.floor(second / 3600)}小时前`
  }
}

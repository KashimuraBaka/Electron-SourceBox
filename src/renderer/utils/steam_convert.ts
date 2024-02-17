/**
 * 格式是否为 STEAMID_3
 * @param steamid 字符串 STEAMID
 * @returns 返回是否符合格式
 */
const isID3 = (steamid: string) => {
  return /^\[U:\d:\d{9,9}\]$/.test(steamid)
}

/**
 * 格式是否为 STEAMID_32
 * @param steamid 字符串 STEAMID
 * @returns 返回是否符合格式
 */
const isID32 = (steamid: string) => {
  return /^STEAM_\d:\d:\d*$/.test(steamid)
}

/**
 * 格式是否为 STEAMID_64
 * @param steamid 字符串 STEAMID
 * @returns 返回是否符合格式
 */
const isID64 = (steamid: string) => {
  return /7656119\d{10,10}/.test(steamid)
}

/**
 * 格式是否为 STEAM自定义URL
 * @param url URL连接
 * @returns 返回是否符合格式
 */
const isCustomUrl = (url: string) => {
  return /id\/[\w-]*[/$]*/.test(url)
}

/**
 * 获取URL上的 64位 STEAMID
 * @param url URL连接
 * @returns 64位 STEAMID
 */
const GetProfilesSteamID64 = (url: string) => {
  const re = url.match(/(7656119\d{10,10})/) as RegExpMatchArray
  return re[1] || ''
}

/**
 * 获取 STEAMID 格式类型
 * @param steamid STEAMID
 * @returns 返回类型
 */
const getType = (steamid: string) => {
  if (isID3(steamid)) {
    return 'steamid3'
  } else if (isID32(steamid)) {
    return 'steamid32'
  } else if (isID64(steamid)) {
    return 'steamid64'
  } else {
    return 'customurl'
  }
}

/**
 * STEAMID3 转换成 STEAMID32
 * @param steamid3 STEAMID3
 * @returns STEAMID32
 */
const ID3To32 = (steamid3: string) => {
  if (!steamid3 || !isID3(steamid3)) return 'N/A'
  const re = steamid3.match(/\[U:(\d):(\d*)\]/) as RegExpMatchArray
  const Y = parseInt(re[2])
  const account_type = Y % 2 ? 1 : 0
  // STEAM_X X:0=金源引擎 X:1=起源引擎
  return `STEAM_1:${account_type}:${Math.floor((Y - account_type) / 2)}`
}

/**
 * STEAMID3 转换成 STEAMID64
 * @param steamid3 STEAMID3
 * @returns STEAMID64
 */
const ID3To64 = (steamid3: string) => {
  if (!steamid3 || !isID3(steamid3)) return 'N/A'
  const re = steamid3.match(/\[U:(\d):(\d*)\]/) as RegExpMatchArray
  const Accountid = parseInt(re[2])
  const Y = Accountid % 2 ? 0 : 1
  const Z = Accountid % 2 ? Accountid / 2 : (Accountid - 1) / 2
  return `7656119${Z * 2 + 7960265728 + Y}`
}

/**
 * STEAMID32 转换成 STEAMID3
 * @param steamid32 STEAMID32
 * @returns STEAMID3
 */
const ID32To3 = (steamid32: string) => {
  if (!steamid32 || !isID32(steamid32)) return 'N/A'
  const re = steamid32.match(/^STEAM_(\d):(\d):(\d*)$/) as RegExpMatchArray
  const Y = parseInt(re[2])
  const Z = parseInt(re[3])
  return `[U:1:${(Z + Y) * 2 - Y}]`
}

/**
 * STEAMID32 转换成 STEAMID64
 * @param steamid32 STEAMID32
 * @returns STEAMID64
 */
const ID32To64 = (steamid32: string) => {
  if (!steamid32 || !isID32(steamid32)) return 'N/A'
  const re = steamid32.match(/^STEAM_(\d):(\d):(\d*)$/) as RegExpMatchArray
  const Y = parseInt(re[2])
  const Z = parseInt(re[3]) * 2
  return `7656119${7960265728 + Y + Z}`
}

/**
 * STEAMID64 转换成 STEAMID3
 * @param steamid64 STEAMID64
 * @returns STEAMID3
 */
const ID64To3 = (steamid64: string) => {
  if (!steamid64 || !isID64(steamid64)) return 'N/A'
  return `[U:1:${BigInt(steamid64) - 76561197960265728n}]`
}

const ID64To3Number = (steamid64: string) => {
  if (!steamid64 || !isID64(steamid64)) return -1
  return Number(BigInt(steamid64) - 76561197960265728n)
}

/**
 * STEAMID64 转换成 STEAMID32
 * @param steamid64 STEAMID64
 * @returns STEAMID32
 */
const ID64To32 = (steamid64: string) => {
  if (!steamid64 || !isID64(steamid64)) return 'N/A'
  const offset_id = BigInt(steamid64) - 76561197960265728n
  const X = offset_id % 2n ? 1n : 0n
  const Y = (offset_id - X) / 2n
  return `STEAM_1:${X}:${Y}`
}

export default {
  isCustomUrl,
  GetProfilesSteamID64,
  getType,
  ID3To32,
  ID3To64,
  ID32To3,
  ID32To64,
  ID64To3,
  ID64To3Number,
  ID64To32
}

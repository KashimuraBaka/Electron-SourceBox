import { MatchAddress, SecondToTime } from '..'
import { Coding } from './coding'
import { SyncSocket } from '../socket'

const AS2_INFO = 'FFFFFFFF54536F7572636520456E67696E6520517565727900'
const A2S_PLAYER = 'FFFFFFFF55'
const A2S_RULES = 'FFFFFFFF56'

export class SourceSocket extends SyncSocket {
  private ip: string
  private port: number

  constructor(address: string, timeout?: number) {
    super('udp4', timeout)
    const { ServerIp, ServerPort } = MatchAddress(address)
    this.ip = ServerIp
    this.port = ServerPort
  }

  /**
   * A2S查询服务器信息
   * @returns 返回服务器信息
   */
  public async QueryServerInfo(): Promise<A2S.SourceServerInfo> {
    const startTime = new Date().getTime()
    const { success, data } = await this.a2s_info()

    const info: A2S.SourceServerInfo = {
      Delay: -1,
      Protocol: 0,
      Name: 'N/A',
      Map: 'N/A',
      Folder: '',
      Game: '',
      AppID: 0,
      Player: 0,
      PlayerMax: 0,
      Robot: 0,
      ServerType: '',
      Envirnoment: '',
      Visibility: false,
      Vac: false,
      Version: '',
      Port: 0,
      SteamID: 0n,
      TVPort: 0,
      TVName: '',
      Tags: '',
      GameID: 0n
    }

    if (!success || !data) {
      return info
    }

    info.Delay = new Date().getTime() - startTime
    info.Protocol = data.Byte()
    info.Name = data.String()
    info.Map = data.String()
    info.Folder = data.String()
    info.Game = data.String()
    info.AppID = data.Short()
    info.Player = data.Byte()
    info.PlayerMax = data.Byte()
    info.Robot = data.Byte()
    info.ServerType = ((val: string) => {
      switch (val) {
        case 'd':
          return '专用服务器'
        case 'l':
          return '非专用服务器'
        case 'p':
          return 'SourceTV relay'
        default:
          return 'Unknown'
      }
    })(data.String(1))
    info.Envirnoment = ((val: string) => {
      switch (val) {
        case 'l':
          return 'Linux'
        case 'w':
          return 'Windows'
        case 'o':
          return 'Mac'
        default:
          return 'Unknown'
      }
    })(data.String(1))
    info.Visibility = data.Bool()
    info.Vac = data.Bool()
    info.Version = data.String()

    const flags = data.Byte()
    if ((flags & 0x80) > 0) {
      info.Port = data.Short()
    }
    if ((flags & 0x10) > 0) {
      info.SteamID = data.Long()
    }
    if ((flags & 0x40) > 0) {
      info.TVPort = data.Short()
      info.TVName = data.String()
    }
    if ((flags & 0x20) > 0) {
      info.Tags = data.String()
    }
    if ((flags & 0x01) > 0) {
      info.GameID = data.Long()
    }

    return info
  }

  /**
   * A2S查询服务器玩家信息
   * @returns 返回玩家信息
   */
  public async QueryServerPlayers(): Promise<A2S.SourceServerPlayers> {
    const { success, data } = await this.a2s_player()

    const players: A2S.SourceServerPlayers = {
      Total: 0,
      Players: []
    }

    if (!success || !data) {
      return players
    }

    players.Total = data.Byte()
    while (data.Length() != 0) {
      players.Players.push({
        Index: data.Byte(),
        Name: data.String(),
        Score: data.Int(),
        Time: SecondToTime(data.Float())
      })
    }

    return players
  }

  /**
   * A2S查询服务器规则
   * @returns 服务器规则
   */
  public async QueryServerRules(): Promise<A2S.SourceServerRules> {
    const { success, data } = await this.a2s_rules()

    const rules: A2S.SourceServerRules = {
      Total: 0,
      Rules: []
    }

    if (!success || !data) {
      return rules
    }

    rules.Total = data.Short()
    while (data.Length() != 0) {
      rules.Rules.push({
        Convar: data.String(),
        Value: data.String()
      })
    }

    return rules
  }

  /**
   * A2S查询服务器信息
   * @returns 返回服务器信息
   */
  private async a2s_info(): Promise<A2S.SourceStore> {
    let res = await this.Send(this.ip, this.port, Buffer.from(AS2_INFO, 'hex'))

    if (!res.success || !res.data) {
      return { success: false, error: '请求数据失败!' }
    }

    const code = new Coding(res.data)
    if (code.Header() == 'A') {
      const challenge = code.Bytes()
      res = await this.Send(
        this.ip,
        this.port,
        Buffer.concat([Buffer.from(AS2_INFO, 'hex'), challenge])
      )
      if (!res.success || !res.data) {
        return { success: false, error: '二次请求数据失败!' }
      }
      code.reset(res.data)
      if (code.Header() != 'I') {
        return { success: false, error: '无效数据!' }
      }
    }

    return { success: true, data: code }
  }

  /**
   * A2S 查询玩家数据
   * @returns 返回玩家请求书护具
   */
  private async a2s_player(): Promise<A2S.SourceStore> {
    let res = await this.Send(this.ip, this.port, Buffer.from(A2S_PLAYER + 'FFFFFFFF', 'hex'))
    if (!res.success || !res.data) {
      return { success: false, error: '请求数据失败!' }
    }

    const code = new Coding(res.data)
    // 标志不为 A(玩家返回数据), 则返回非有效信息
    if (code.Header() != 'A') {
      return { success: false, error: '无效数据!' }
    }

    const challenge = code.Bytes()
    res = await this.Send(
      this.ip,
      this.port,
      Buffer.concat([Buffer.from(A2S_PLAYER, 'hex'), challenge])
    )
    if (!res.success || !res.data) {
      return { success: false, error: '二次请求数据失败!' }
    }

    code.reset(res.data)
    if (code.Header() != 'D') {
      return { success: false, error: '无效数据!' }
    }

    return { success: true, data: code }
  }

  /**
   * A2S查询服务器规则
   * @returns 返回服务器规则信息
   */
  private async a2s_rules(): Promise<A2S.SourceStore> {
    let res = await this.Send(this.ip, this.port, Buffer.from(A2S_RULES + 'FFFFFFFF', 'hex'))
    if (!res.success || !res.data) {
      return { success: false, error: '请求数据失败!' }
    }

    const code = new Coding(res.data)
    // 标志不为 A(玩家返回数据), 则返回非有效信息
    if (code.Header() != 'A') {
      return { success: false, error: '无效数据!' }
    }

    const challenge = code.Bytes()
    res = await this.Send(
      this.ip,
      this.port,
      Buffer.concat([Buffer.from(A2S_RULES, 'hex'), challenge])
    )
    if (!res.success || !res.data) {
      return { success: false, error: '二次请求数据失败!' }
    }

    code.reset(res.data)
    if (code.Header() != 'E') {
      return { success: false, error: '无效数据!' }
    }

    return { success: true, data: code }
  }
}

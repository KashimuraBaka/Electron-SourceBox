declare namespace A2S {
  /** 服务器信息 */
  interface SourceServerInfo {
    /** 延迟 */
    Delay: number
    /** 协议号 */
    Protocol: number
    /** 服务器名称 */
    Name: string
    /** 服务器地图 */
    Map: string
    /** 服务器游戏文件夹名称 */
    Folder: string
    /** 服务器游戏名 */
    Game: string
    /** 服务器游戏APPID */
    AppID: number
    /** 游戏玩家数 */
    Player: number
    /** 游戏最大玩家数 */
    PlayerMax: number
    /** 游戏机器人数量 */
    Robot: number
    /** 服务器类型 */
    ServerType: string
    /** 服务器系统环境 */
    Envirnoment: string
    /** 服务器可见性 */
    Visibility: boolean
    /** 服务器反作弊状态 */
    Vac: boolean
    /** 服务器游戏版本 */
    Version: string
    /** 服务器端口 */
    Port: number
    /** 服务器SteamID */
    SteamID: bigint
    /** 服务器 TV 端口 */
    TVPort: number
    /** 服务器 TV 名称 */
    TVName: string
    /** 服务器标签 */
    Tags: string
    /** 服务器游戏ID */
    GameID: bigint
  }

  /** 起源服务器玩家信息 */
  interface SourceServerPlayer {
    /** 玩家索引ID */
    Index: number
    /** 玩家名称 */
    Name: string
    /** 玩家分数 */
    Score: number
    /** 玩家游玩时间 */
    Time: string
  }

  interface SourceServerPlayers {
    Total: number
    Players: SourceServerPlayer[]
  }

  /** 起源服务器规则信息 */
  interface SourceServerRule {
    /** 参数名 */
    Convar: string
    /** 参数值 */
    Value: string
  }

  interface SourceServerRules {
    /** 规则数量 */
    Total: number
    /** 规则列表 */
    Rules: SourceServerRule[]
  }

  /** 服务器带IP数据 */
  interface SourceServerInfoFormIP extends SourceServerInfo {
    IP: string
  }
}

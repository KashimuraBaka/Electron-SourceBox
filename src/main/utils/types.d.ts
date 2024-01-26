interface Coding {
  Length(): number

  /**
   * 重置字节流
   * @param buf 要重置覆盖的数组
   */
  reset(buf: Buffer): void

  /**
   * 读取指定长度字节
   * @param length 读取指定长度
   * @return {Buffer} 字节流
   */
  readBytes(length: number): Buffer

  /** 获取文件头 */
  Header(): string

  /** 读取字节 (1bit) */
  Byte(): number

  /** 读取布尔 (1bit) */
  Bool(): boolean

  /** 读取短整数 (2bit) */
  Short(): number

  /** 读取整数 (4bit) */
  Int(): number

  /** 读取长整数 (8bit) */
  Long(): bigint

  /** 读取浮点数 (8bit) */
  Float(): number

  /** 读取字符串 */
  String(len?: number): string

  /** 返回剩余字节流 */
  Bytes(): Buffer
}

declare namespace A2S {
  type SourceStore = {
    success: boolean
    data?: Coding
    error?: string
  }

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
}

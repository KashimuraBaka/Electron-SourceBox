import client = require('./client')

export const enum ChatMemberStateChange {
  /** This user has joined or is joining the lobby. */
  Entered,
  /** This user has left or is leaving the lobby. */
  Left,
  /** User disconnected without leaving the lobby first. */
  Disconnected,
  /** The user has been kicked. */
  Kicked,
  /** The user has been kicked and banned. */
  Banned
}

export interface CallbackReturns {
  [client.SteamApiCallback.PersonaStateChange]: {
    steam_id: bigint
    flags: { bits: number }
  }
  [client.SteamApiCallback.SteamServersConnected]: object
  [client.SteamApiCallback.SteamServersDisconnected]: {
    reason: number
  }
  [client.SteamApiCallback.SteamServerConnectFailure]: {
    reason: number
    still_retrying: boolean
  }
  [client.SteamApiCallback.LobbyDataUpdate]: {
    lobby: bigint
    member: bigint
    success: boolean
  }
  [client.SteamApiCallback.LobbyChatUpdate]: {
    lobby: bigint
    user_changed: bigint
    making_change: bigint
    member_state_change: ChatMemberStateChange
  }
  [client.SteamApiCallback.P2PSessionRequest]: {
    remote: bigint
  }
  [client.SteamApiCallback.P2PSessionConnectFail]: {
    remote: bigint
    error: number
  }
  [client.SteamApiCallback.GameLobbyJoinRequested]: {
    lobby_steam_id: bigint
    friend_steam_id: bigint
  }
  [client.SteamApiCallback.MicroTxnAuthorizationResponse]: {
    app_id: number
    order_id: number | bigint
    authorized: boolean
  }
}

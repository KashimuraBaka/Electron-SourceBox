use super::consts::CSteamID;
use napi_derive::napi;

#[napi]
pub mod steamuser {
    use super::CSteamID;
    use napi::bindgen_prelude::{BigInt, Buffer, Error};
    use std::net::SocketAddr;
    use steamworks::networking_types::NetworkingIdentity;
    use steamworks::{AuthSessionTicketResponse, AuthTicket, SteamId, TicketForWebApiResponse};
    use tokio::sync::oneshot;

    #[napi]
    /// Steam 票证信息
    pub struct Ticket {
        /// 票证数据
        pub(crate) data: Vec<u8>,
        /// 票证句柄
        pub(crate) handle: AuthTicket,
    }

    #[napi]
    impl Ticket {
        #[napi]
        pub fn cancel(&mut self) {
            let client = crate::client::get_client();
            client.user().cancel_authentication_ticket(self.handle);
        }

        #[napi]
        pub fn get_bytes(&self) -> Buffer {
            self.data.clone().into()
        }
    }

    #[napi]
    /// 获取当前登录至 Steam 客户端帐户的 Steam ID。 通常被称为“当前用户”，或“本地用户”。
    /// Steam ID 是 Steam 帐户、Steam 组、大厅和聊天室的唯一标识符，用于在 Steamworks API 各部分中区分用户。
    ///
    /// @returns CSteamID
    pub fn get_steam_id() -> CSteamID {
        let client = crate::client::get_client();
        CSteamID::from_steamid(client.user().steam_id())
    }

    #[napi]
    /// 获得用户的 Steam 社区个人资料中显示的 Steam 等级
    ///
    /// @returns 当前用户的等级
    pub fn get_player_steam_level() -> u32 {
        let client = crate::client::get_client();
        client.user().level()
    }

    /// 获取身份验证票证，以便发送给希望对您进行身份验证的实体。
    /// 调用此函数之后，您可以发送票证至实体，该实体然后可以调用 BeginAuthSession/ISteamGameServer::BeginAuthSession，验证此实体的完整性。
    ///
    /// @param networkIdentity - 将验证票证的远程系统的身份, 必须是该服务的字符串标识符（如果有的话）
    /// @param timeoutSeconds - 等待票证验证的秒数。 默认值为 10 秒。
    /// @returns 返回验证票证
    async fn get_auth_session_ticket(
        network_identity: NetworkingIdentity,
        timeout_seconds: Option<u32>,
    ) -> Result<Ticket, Error> {
        let client = crate::client::get_client();
        let (tx, rx) = oneshot::channel();
        let mut tx = Some(tx);

        let (ticket_handle, ticket) = client
            .user()
            .authentication_session_ticket(network_identity);

        let callback =
            client.register_callback(move |session_ticket_response: AuthSessionTicketResponse| {
                if session_ticket_response.ticket == ticket_handle {
                    if let Some(tx) = tx.take() {
                        tx.send(match session_ticket_response.result {
                            Ok(()) => Ok(()),
                            Err(e) => Err(Error::from_reason(e.to_string())),
                        })
                        .unwrap();
                    }
                }
            });

        let mut ticket = Ticket {
            data: ticket,
            handle: ticket_handle,
        };

        let timeout_seconds = u64::from(timeout_seconds.unwrap_or(10));
        let result =
            tokio::time::timeout(std::time::Duration::from_secs(timeout_seconds), rx).await;

        drop(callback);

        match result {
            Ok(result) => match result {
                Ok(Ok(())) => Ok(ticket),
                Ok(Err(e)) => {
                    ticket.cancel();
                    Err(e)
                }
                Err(e) => {
                    ticket.cancel();
                    Err(Error::from_reason(e.to_string()))
                }
            },
            Err(_) => {
                ticket.cancel();
                Err(Error::from_reason(
                    "Steam didn't validated the ticket in time.",
                ))
            }
        }
    }

    #[napi]
    /// 通过SteamID获取身份验证票证，以便发送给希望对您进行身份验证的实体。
    /// 调用此函数之后，您可以发送票证至实体，该实体然后可以调用 BeginAuthSession/ISteamGameServer::BeginAuthSession，验证此实体的完整性。
    ///
    /// @param networkIdentity - 将验证票证的远程系统的身份
    /// - 如果是 P2P，则为用户 Steam ID。
    /// - 如果是游戏服务器，且是从可信的第三方获得的，则可以使用游戏服务器的 steam ID
    /// @param timeoutSeconds - 等待票证验证的秒数。 默认值为 10 秒。 如果是游戏服务器，且是从可信的第三方获得的，则可以使用游戏服务器的 steam ID
    /// @returns 返回验证票证
    pub async fn get_session_ticket_with_steam_id(
        steam_id64: BigInt,
        timeout_seconds: Option<u32>,
    ) -> Result<Ticket, Error> {
        get_auth_session_ticket(
            NetworkingIdentity::new_steam_id(SteamId::from_raw(steam_id64.get_u64().1)),
            timeout_seconds,
        )
        .await
    }

    /// 通过SteamID获取身份验证票证，以便发送给希望对您进行身份验证的实体。
    /// 调用此函数之后，您可以发送票证至实体，该实体然后可以调用 BeginAuthSession/ISteamGameServer::BeginAuthSession，验证此实体的完整性。
    ///
    /// @param ip - 将验证票证的远程系统的身份, 必须是服务器IP地址
    /// @param timeoutSeconds - 等待票证验证的秒数。 默认值为 10 秒。 如果是游戏服务器，且是从可信的第三方获得的，则可以使用游戏服务器的 steam ID
    /// @returns 返回验证票证
    #[napi]
    pub async fn get_session_ticket_with_ip(
        ip: String,
        timeout_seconds: Option<u32>,
    ) -> Result<Ticket, Error> {
        match ip.parse::<SocketAddr>() {
            Ok(addr) => {
                get_auth_session_ticket(NetworkingIdentity::new_ip(addr), timeout_seconds).await
            }
            Err(e) => Err(Error::from_reason(e.to_string())),
        }
    }

    #[napi]
    /// 使用 ISteamUserAuth/AuthenticateUserTicket Web API 获取要发送给欲对您进行身份验证的实体的验证票证。
    /// - 调用应用程序必须等待 API 调用生成的 GetTicketForWebApiResponse_t 回调才能访问票证。
    /// 最佳做法是为每个将使用票证的服务使用标识字符串。
    /// - 注意：此 API 不能用于创建供 BeginAuthSession/ISteamGameServer::BeginAuthSession 使用的票证。 请改用 GetAuthSessionTicket API。
    ///
    /// @param identity 将验证票证的远程服务的身份。 该服务应提供一个字符串标识符。 如果未提供，则传入 null。
    /// @returns 验证票证
    pub async fn get_auth_ticket_for_web_api(
        identity: String,
        timeout_seconds: Option<u32>,
    ) -> Result<Ticket, Error> {
        let client = crate::client::get_client();
        let (tx, rx) = oneshot::channel();
        let mut tx = Some(tx);

        let ticket_handle = client
            .user()
            .authentication_session_ticket_for_webapi(&identity);

        let callback =
            client.register_callback(move |ticket_for_webapi_response: TicketForWebApiResponse| {
                if ticket_for_webapi_response.ticket_handle == ticket_handle {
                    let mut ticket = ticket_for_webapi_response.ticket;
                    ticket.truncate(ticket_for_webapi_response.ticket_len as usize);

                    if let Some(tx) = tx.take() {
                        tx.send(match ticket_for_webapi_response.result {
                            Ok(()) => Ok(ticket),
                            Err(e) => Err(Error::from_reason(e.to_string())),
                        })
                        .unwrap();
                    }
                }
            });

        let timeout_seconds = u64::from(timeout_seconds.unwrap_or(10));
        let result =
            tokio::time::timeout(std::time::Duration::from_secs(timeout_seconds), rx).await;

        drop(callback);

        match result {
            Ok(result) => match result {
                Ok(Ok(data)) => Ok(Ticket {
                    handle: ticket_handle,
                    data,
                }),
                Ok(Err(e)) => {
                    client.user().cancel_authentication_ticket(ticket_handle);
                    Err(e)
                }
                Err(e) => {
                    client.user().cancel_authentication_ticket(ticket_handle);
                    Err(Error::from_reason(e.to_string()))
                }
            },
            Err(_) => {
                client.user().cancel_authentication_ticket(ticket_handle);
                Err(Error::from_reason(
                    "Steam didn't validated the ticket in time.",
                ))
            }
        }
    }
}

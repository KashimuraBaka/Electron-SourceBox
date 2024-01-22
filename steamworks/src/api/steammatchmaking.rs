use super::consts::{CSteamID, ELobbyType};
use napi_derive::napi;

#[napi]
/// 为客户端提供匹配服务、访问收藏夹以及在游戏大厅中进行操作的函数。
/// https://partner.steamgames.com/doc/api/ISteamMatchmaking
pub mod steammatchmaking {
    use super::{CSteamID, ELobbyType};
    use napi::bindgen_prelude::{BigInt, Error};
    use std::collections::HashMap;
    use steamworks::{LobbyId, LobbyType};
    use tokio::sync::oneshot;

    #[napi]
    pub struct Lobby {
        pub id: BigInt,
        lobby_id: LobbyId,
    }

    #[napi]
    impl Lobby {
        #[napi]
        /// 加入一个现有大厅。
        /// 可以用 RequestLobbyList 搜索并加入好友从而获取大厅的 Steam ID，也可以从邀请中获取。
        ///
        /// @returns SteamAPICall_t，与LobbyEnter_t 调用结果一起使用。
        /// 触发一个 LobbyDataUpdate_t 回调。
        pub async fn join(&self) -> Result<Lobby, Error> {
            join_lobby(self.id.clone()).await
        }

        #[napi]
        /// 离开用户当前所在的大厅，这将立即在客户端生效，大厅的其他用户将得到 LobbyChatUpdate_t 回调的通知。
        ///
        /// @noreturns
        pub fn leave(&self) {
            let client = crate::client::get_client();
            client.matchmaking().leave_lobby(self.lobby_id);
        }

        #[napi]
        /// 激活 Steam 界面，打开邀请对话框。 进入该大厅的邀请将从此窗口发出。
        pub fn open_invite_dialog(&self) {
            let client = crate::client::get_client();
            client.friends().activate_invite_dialog(self.lobby_id);
        }

        #[napi]
        /// 获得一个大厅中的用户数。
        /// 注意： 当前用户必须在大厅中才能获取该大厅中其他用户的 Steam ID。
        /// 用于循环访问，调用此函数后，可使用 GetLobbyMemberByIndex 来获得大厅中每个成员的 Steam ID。
        /// 通过 ISteamFriends 接口可自动收到大厅其他成员的个人信息（姓名、头像等）。
        ///
        /// @returns 大厅中成员的数量，如果当前用户没有来自大厅的数据，则为 0。
        pub fn get_member_count(&self) -> usize {
            let client = crate::client::get_client();
            client.matchmaking().lobby_member_count(self.lobby_id)
        }

        #[napi]
        /// 当前对于可以加入的玩家数量的限制。
        /// 如果没有定义限制，返回 0。
        ///
        /// @returns 如果指定大厅没有可用元数据，则返回 0。
        pub fn get_member_limit(&self) -> Option<usize> {
            let client = crate::client::get_client();
            client.matchmaking().lobby_member_limit(self.lobby_id)
        }

        #[napi]
        /// 获取当前大厅所有盛有
        ///
        /// @returns 当前大厅所有成员
        pub fn get_members(&self) -> Vec<CSteamID> {
            let client = crate::client::get_client();
            client
                .matchmaking()
                .lobby_members(self.lobby_id)
                .into_iter()
                .map(CSteamID::from_steamid)
                .collect()
        }

        #[napi]
        /// 返回当前大厅所有者。
        /// 注意： 您必须是大厅成员才能访问
        /// 始终只有一位大厅所有者，如果当前所有者离开，该大厅中的另一名玩家将自动成为所有者。
        /// 在一个大厅的所有者刚离开时，其他玩家便有机会（但较少见）加入该大厅，进入大厅后，其自身便成为该大厅的所有者。
        ///
        /// @returns 如果您不在大厅中，则返回 k_steamIDNil。
        pub fn get_owner(&self) -> CSteamID {
            let client = crate::client::get_client();
            CSteamID::from_steamid(client.matchmaking().lobby_owner(self.lobby_id))
        }

        #[napi]
        /// 设置一个大厅是否对其他玩家开放。 始终默认为启用新的大厅。
        /// 如果禁止加入，那么没有玩家可以加入，即便他们是好友或已受邀请。
        /// 禁止加入的大厅将不会从大厅搜索中返回。
        ///
        /// @returns true， 表示成功；否则，如果您不是大厅所有者，则返回 false。
        pub fn set_joinable(&self, joinable: bool) -> bool {
            let client = crate::client::get_client();
            client
                .matchmaking()
                .set_lobby_joinable(self.lobby_id, joinable)
        }

        #[napi]
        /// 获取与指定大厅中的指定键相关的元数据。
        /// 注意： 仅能从客户端知晓的大厅获取元数据，客户端或是从 LobbyMatchList_t 收到一个大厅列表并使用
        /// RequestLobbyData 获取数据，或是在加入一个大厅后而知晓大厅的。
        /// 
        /// @params key 要获取值的键
        /// @returns 如果没有为此键设置值，或 steamIDLobby 无效，则返回一个空白字符串（""）。
        pub fn get_data(&self, key: String) -> Option<String> {
            let client = crate::client::get_client();
            client
                .matchmaking()
                .lobby_data(self.lobby_id, &key)
                .map(|s| s.to_string())
        }

        #[napi]
        /// 在大厅元数据中设置键/值对。 此函数可用于设置大厅名称、当前地图、游戏模式等。
        /// 这只能由大厅所有者设置。 大厅成员则应使用 SetLobbyMemberData。
        /// 通过 LobbyDataUpdate_t 回调，大厅中的每位用户都将能收到大厅数据变更的通知，并且任何加入的新用户都将收到所有现有数据。
        /// 将只发送已变更的数据。 在发送数据之前会稍有延迟，因此您可以重复调用来设置您需要的所有数据，并在最后一次顺序调用之后，数据将被自动批处理和发送。
        /// 
        /// @param key 要设置数据的键。 不得长于 k_nMaxLobbyKeyLength。
        /// @param value 要设置的值。 不得长于 k_cubChatMetadataMax。
        /// @return true， 表示数据设置成功。 如果 steamIDLobby 为无效索引或键/值太长，则为 false。
        pub fn set_data(&self, key: String, value: String) -> bool {
            let client = crate::client::get_client();
            client
                .matchmaking()
                .set_lobby_data(self.lobby_id, &key, &value)
        }

        #[napi]
        /// 从大厅移除元数据键。
        /// 此操作只能由大厅所有者完成。
        /// 只有当键存在时，才会发送数据。 在发送数据之前会稍有延迟，因此您可以重复调用来设置您需要的所有数据，并在最后一次顺序调用之后，数据将被自动批处理和发送。
        /// 
        /// @returns true， 表示成功删除了键/值；否则，如果 steamIDLobby 或 pchKey 无效，则为 false。
        pub fn delete_data(&self, key: String) -> bool {
            let client = crate::client::get_client();
            client.matchmaking().delete_lobby_data(self.lobby_id, &key)
        }

        #[napi]
        /// 获取当前大厅所有数据键
        /// 
        /// @returns 返回当前大厅数据键
        pub fn get_full_data(&self) -> HashMap<String, String> {
            let client = crate::client::get_client();

            let mut data = HashMap::new();

            let count = client.matchmaking().lobby_data_count(self.lobby_id);
            for i in 0..count {
                let maybe_lobby_data = client.matchmaking().lobby_data_by_index(self.lobby_id, i);

                if let Some((key, value)) = maybe_lobby_data {
                    data.insert(key, value);
                }
            }

            data
        }

        #[napi]
        /// 合并完整数据键数据
        /// 
        /// @params data 大厅所有数据键
        /// @returns 是否合并成功
        pub fn merge_full_data(&self, data: HashMap<String, String>) -> bool {
            let matchmaking = crate::client::get_client().matchmaking();
            data.iter()
                .map(|(key, value)| matchmaking.set_lobby_data(self.lobby_id, key, value))
                .all(|x| x)
        }
    }

    #[napi]
    /// 创建一个新的匹配大厅。
    ///
    /// @param lobby_type 此大厅的类型与可见性，之后可通过 SetLobbyType 更改。
    /// @param max_members 可加入此大厅的玩家最大数量。 不能超过 250 人。
    /// @returns SteamAPICall_t，与 LobbyCreated_t 调用结果一起使用。
    /// - 触发 LobbyEnter_t 回调。
    /// - 触发 LobbyDataUpdate_t 回调。
    /// - 如果通过 LobbyCreated_t 调用结果返回的结果表明是成功的，那么大厅此时已有人加入，可随时使用。
    /// - 本地用户已加入他们自己的大厅，因此也收到了 LobbyEnter_t 回调。
    pub async fn create_lobby(lobby_type: ELobbyType, max_members: u32) -> Result<Lobby, Error> {
        let client = crate::client::get_client();

        let (tx, rx) = oneshot::channel();

        client
            .matchmaking()
            .create_lobby(LobbyType::from(lobby_type), max_members, |result| {
                tx.send(result).unwrap();
            });

        rx.await
            .unwrap()
            .map(|lobby_id| Lobby {
                id: BigInt::from(lobby_id.raw()),
                lobby_id,
            })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi]
    /// 加入一个现有大厅。
    /// 可以用 RequestLobbyList 搜索并加入好友从而获取大厅的 Steam ID，也可以从邀请中获取。
    ///
    /// @param lobby_id 要加入的大厅的 Steam ID
    /// @returns SteamAPICall_t，与LobbyEnter_t 调用结果一起使用。
    /// - 触发一个 LobbyDataUpdate_t 回调。
    pub async fn join_lobby(lobby_id: BigInt) -> Result<Lobby, Error> {
        let client = crate::client::get_client();

        let (tx, rx) = oneshot::channel();

        client.matchmaking().join_lobby(
            steamworks::LobbyId::from_raw(lobby_id.get_u64().1),
            |result| {
                tx.send(result).unwrap();
            },
        );

        rx.await
            .unwrap()
            .map(|lobby_id| Lobby {
                id: BigInt::from(lobby_id.raw()),
                lobby_id,
            })
            .map_err(|_| Error::from_reason("Failed to join lobby".to_string()))
    }

    #[napi]
    /// 获得经筛选的相关大厅列表。
    /// 每次只能有一个活跃的大厅搜索。 如果新请求被启动，旧请求将被取消。 视用户与 Steam 后端的连接状况而定，此调用可能需要 300 毫秒至 5 秒完成，20 秒则超时。
    /// 注意：要筛选结果，您必须在调用此函数前先调用 AddRequestLobbyList* 函数。 每次调用该函数时筛选器都被清空。
    /// 注意：如果未调用 AddRequestLobbyListDistanceFilter，将会使用 k_ELobbyDistanceFilterDefault，该函数只有在相同或邻近区域才能找到匹配结果。
    /// 注意：仅返回未满的大厅，和那些调用了 k_ELobbyTypePublic 或 k_ELobbyTypeInvisible 的大厅，以及使用 SetLobbyJoinable 设置为可加入的大厅。
    ///
    /// @returns 返回大厅ID列表
    /// - SteamAPICall_t，与 LobbyMatchList_t 调用结果一起使用。
    /// 注意：这也会出于对旧应用程序的兼容而作为回调返回，但如果可能，您应使用调用结果。
    pub async fn get_lobbies() -> Result<Vec<Lobby>, Error> {
        let client = crate::client::get_client();

        let (tx, rx) = oneshot::channel();

        client.matchmaking().request_lobby_list(|lobbies| {
            tx.send(lobbies).unwrap();
        });

        rx.await
            .unwrap()
            .map(|lobbies| {
                lobbies
                    .iter()
                    .map(|lobby_id| Lobby {
                        id: BigInt::from(lobby_id.raw()),
                        lobby_id: *lobby_id,
                    })
                    .collect()
            })
            .map_err(|e| Error::from_reason(e.to_string()))
    }
}

use super::consts::{CSteamID, EP2PSend};
use napi_derive::napi;

#[napi]
pub mod steamnetworking {
    use super::{CSteamID, EP2PSend};
    use napi::{
        bindgen_prelude::{BigInt, Buffer},
        Error,
    };
    use steamworks::{SendType, SteamId};

    #[napi(object)]
    /// P2P数据包信息
    pub struct P2PPacket {
        /// 数据包原始数据
        pub data: Buffer,
        /// 数据包大小
        pub size: i32,
        /// SteamID
        pub steam_id: CSteamID,
    }

    #[napi]
    /// 给指定用户发送 P2P 数据包。
    /// 此 API 不产生会话，而是自动遍历 NAT 或建立 Steam 中继服务器连接。
    /// 注意： 在运行 NAT 遍历代码时，第一个数据包发送可能会延迟。
    /// 参见 EP2PSend ，了解发送数据包的不同方法。
    /// 您所发送的数据为任意类型，您可使用现成可用的系统，如 Protocol Buffers 或 Cap'n Proto，对数据包进行高效编码，或者您也可以创建自己的消息传送系统。
    ///
    /// @param stema_id64 要向其发送数据包的目标用户
    /// @param send_type 指定您希望数据传输的方式，如可靠、不可靠、缓冲，等等。
    pub fn send_p2p_packet(
        steam_id64: BigInt,
        send_type: EP2PSend,
        data: Buffer,
    ) -> Result<bool, Error> {
        let client = crate::client::get_client();
        let result = client.networking().send_p2p_packet(
            SteamId::from_raw(steam_id64.get_u64().1),
            SendType::from(send_type),
            &data,
        );
        Ok(result)
    }

    #[napi]
    /// 检查是否有 P2P 数据包可读，如有，获取消息大小。
    /// 应在您使用的每个通道中循环调用。 如有数据包可用，您应调用 ReadP2PPacket 获取数据包数据。
    ///
    /// @returns 返回数据包的大小
    pub fn is_p2p_packet_available() -> i32 {
        let client = crate::client::get_client();
        client
            .networking()
            .is_p2p_packet_available()
            .unwrap_or_default() as i32
    }

    #[napi]
    /// 在另一位用户通过 SendP2PPacket 发送的数据包中读取。
    /// 如果 cubDest 缓冲区过小，无法容纳该数据包，则消息会截断。
    /// 调用不阻止，如无数据可用，会返回 false。
    /// 在调用此函数前，您应调用 IsP2PPacketAvailable。
    /// 
    /// @param size 分配给 pubDest 的大小。应与 IsP2PPacketAvailable 返回的大小或您最大数据包的大小相同。
    /// @returns true， 表示成功读取数据包；如无数据包可用，则返回 false。
    pub fn read_p2p_packet(size: i32) -> Result<P2PPacket, Error> {
        let client = crate::client::get_client();
        let mut buffer = vec![0; size as usize];

        client
            .networking()
            .read_p2p_packet(&mut buffer)
            .map(|(steam_id, read_size)| P2PPacket {
                data: buffer.into(),
                size: read_size as i32,
                steam_id: CSteamID::from_steamid(steam_id),
            })
            .ok_or_else(|| {
                Error::new(
                    napi::Status::GenericFailure,
                    "No packet available".to_string(),
                )
            })
    }

    #[napi]
    /// 这允许游戏指定是否接受传入的数据包。 需要在与远程主机建立真正的连接之前调用，让游戏有机会决定是否允许远程用户访问。
    /// 如果一个您最近并未向其发送数据包的远程用户尝试先向您发送一个数据包，您的游戏会收到 P2PSessionRequest_t 回调。 
    /// 该回调包含希望向您发送数据包的用户的 Steam ID。 
    /// 响应回调时，您应该查看是否想与此用户通话（如用户是否与您在同一大厅内），如果您愿意，接受连接；
    /// 否则，如您不想与此用户通话，只需忽略请求即可。 如该用户继续向您发送数据包，另一个 P2PSessionRequest_t 将定期发布。 
    /// 如您已对该用户调用了 SendP2PPacket，这会隐式接受会话请求。
    /// 注意，此函数只应在响应 P2PSessionRequest_t 回调时才能调用！
    /// 
    /// @param steam_id64 向我们发送了初始数据包的用户的 Steam ID
    /// @returns true， 表示成功；只有在 steamIDRemote 无效时为 false。
    pub fn accept_p2_psession_with_user(steam_id64: BigInt) {
        let client = crate::client::get_client();
        client
            .networking()
            .accept_p2p_session(SteamId::from_raw(steam_id64.get_u64().1));
    }
}

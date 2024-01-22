use napi_derive::napi;

#[napi]
pub mod steaminput {
    use napi::bindgen_prelude::BigInt;

    #[napi]
    pub struct Controller {
        /// 您要为其激活一个操作集的控制器句柄
        pub(crate) handle: BigInt,
    }

    #[napi]
    impl Controller {
        #[napi]
        /// 重新配置控制器以使用指定的操作集（如：“菜单”、“行走”或“驾驶”）。
        /// 此函数消耗低，并能多次安全调用。 通常在您的状态循环中反复调用较为容易，无需试图将其放入您的所有状态转换中。
        /// 
        /// @param action_set_handle 您要激活的操作集的句柄
        /// @noreturns
        pub fn activate_action_set(&self, action_set_handle: BigInt) {
            let client = crate::client::get_client();
            client
                .input()
                .activate_action_set_handle(self.handle.get_u64().1, action_set_handle.get_u64().1)
        }

        #[napi]
        /// 返回所提供的数字游戏操作是否当前被按下
        /// 
        /// @returns 此操作的当前状态；若此操作当前被按下，为 true，反之则为 false。
        pub fn get_digital_action_data(&self, action_handle: BigInt) -> bool {
            let client = crate::client::get_client();
            client
                .input()
                .get_digital_action_data(self.handle.get_u64().1, action_handle.get_u64().1)
                .bState
        }

        #[napi]
        /// 返回所提供的模拟游戏操作的当前状态
        ///
        /// @param action_handle
        /// @return 返回当前模拟游戏所在坐标
        pub fn get_analog_action_vector(&self, action_handle: BigInt) -> AnalogActionVector {
            let client = crate::client::get_client();
            let data = client
                .input()
                .get_analog_action_data(self.handle.get_u64().1, action_handle.get_u64().1);
            AnalogActionVector {
                x: data.x as f64,
                y: data.y as f64,
            }
        }
    }

    #[napi(object)]
    /// 此操作当前轴上的状态
    pub struct AnalogActionVector {
        /// 此操作当前在水平轴上的状态
        pub x: f64,
        /// 此操作当前在垂直轴上的状态
        pub y: f64,
    }

    #[napi]
    /// 在开始使用 ISteamInput 接口时必须调用。
    /// 
    /// @noreturns
    pub fn init() {
        let client = crate::client::get_client();
        client.input().init(false)
    }

    #[napi]
    /// 返回所有模拟游戏手柄的相关控制器句柄，来判定使用 Steam 输入手柄模拟的控制器的类型
    /// 
    /// @returns 所有 InputHandle_t
    pub fn get_controllers() -> Vec<Controller> {
        let client = crate::client::get_client();
        client
            .input()
            .get_connected_controllers()
            .into_iter()
            .map(|identity| Controller {
                handle: BigInt::from(identity),
            })
            .collect()
    }

    #[napi]
    /// 查找操作集句柄。 最好在启动时调用一次，并存储句柄供所有未来 API 调用使用。
    /// 
    /// @returns 指定操作集的句柄
    pub fn get_action_set_handle(action_set_name: String) -> BigInt {
        let client = crate::client::get_client();
        BigInt::from(client.input().get_action_set_handle(&action_set_name))
    }

    #[napi]
    /// 获取指定的数字操作的句柄。
    /// 注意： 此函数不接受操作集句柄参数。 这意味着 VDF 文件中的每个操作都必须有唯一的字符串标识符。 
    /// 换言之，如果您在两个不同的操作集中使用了一个名为“向上”的操作，此函数将只返回其中一个，而忽略另一个。
    /// 
    /// @returns 指定数字操作的句柄。
    pub fn get_digital_action(action_name: String) -> BigInt {
        let client = crate::client::get_client();
        BigInt::from(client.input().get_digital_action_handle(&action_name))
    }

    #[napi]
    /// 获得指定的模拟操作的句柄。
    /// 注意： 此函数不接受操作集句柄参数。 这意味着 VDF 文件中的每个操作都必须有唯一的字符串标识符。 
    /// 换言之，如果您在两个不同的操作集中使用了一个名为“向上”的操作，此函数将只返回其中一个，而忽略另一个。
    /// 
    /// @returns 指定模拟操作的句柄。
    pub fn get_analog_action(action_name: String) -> BigInt {
        let client = crate::client::get_client();
        BigInt::from(client.input().get_analog_action_handle(&action_name))
    }

    #[napi]
    /// 在结束使用 ISteamInput 接口时必须调用。
    /// 
    /// @noreturns
    pub fn shutdown() {
        let client = crate::client::get_client();
        client.input().shutdown()
    }
}

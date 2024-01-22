use napi_derive::napi;

#[napi]
pub mod steamremotestorage {
    use napi::bindgen_prelude::Error;
    use std::io::Read;
    use std::io::Write;

    #[napi]
    /// 检查是否此用户帐户中的所有 Steam 云设置都已启用，或者是否用户在“设置”->“云”对话框禁用了 Steam 云。
    /// 确定您也检查了 IsCloudEnabledForApp。这两个选项互相排斥。
    /// 
    /// @returns true， 表示此帐户启用了 Steam 云；否则，返回 false。
    pub fn is_cloud_enabled_for_account() -> bool {
        let client = crate::client::get_client();
        client.remote_storage().is_cloud_enabled_for_account()
    }

    #[napi]
    /// 查看是否此用户启用了按游戏设置的 Steam 云，或在“游戏属性”->“更新”对话框中禁用了 Steam 云。
    /// 确定您也检查了 IsCloudEnabledForAccount。这两个选项互相排斥。
    /// 我们一般建议您允许用户使用游戏内选项切换此设置。您可以使用 SetCloudEnabledForApp 进行切换。
    /// 
    /// @returns true， 表示 Steam 云为此应用启用；否则，返回 false。
    pub fn is_cloud_enabled_for_app() -> bool {
        let client = crate::client::get_client();
        client.remote_storage().is_cloud_enabled_for_app()
    }

    #[napi]
    /// 打开一个二进制文件，将文件内容读取至一个字节数组，然后关闭文件。
    /// 注意： 这是一个同步调用，因此将阻止您调用磁盘 IO 的线程，也将阻止 SteamAPI，这可能导致您应用程序中的其他线程受阻。 
    /// 要避免客户端电脑由于磁盘繁忙出现“卡顿”，我们建议使用此API 的异步版本，即 FileReadAsync。
    /// 
    /// @returns 返回读取文件信息
    pub fn file_read(name: String) -> Result<String, Error> {
        let client = crate::client::get_client();
        let mut buf: String = String::new();
        let size = client
            .remote_storage()
            .file(&name)
            .read()
            .read_to_string(&mut buf);

        match size {
            Ok(_) => Ok(buf),
            Err(e) => Err(Error::from_reason(format!("Failed to read file: {}", e))),
        }
    }

    #[napi]
    /// 创建一个新文件，将字节写入文件，再关闭文件。 目标文件若已存在，将被覆盖。
    /// 注意： 这是一个同步调用，因此将阻止您调用磁盘 IO 的线程，也将阻止 SteamAPI，这可能导致您应用程序中的其他线程受阻。 
    /// 要避免客户端电脑由于磁盘繁忙出现“卡顿”，我们建议使用此API 的异步版本，即 FileWriteAsync。
    /// 
    /// @returns true， 表示写入成功。
    /// 否则，在下列情况时，返回 false：
    /// - 您尝试写入的文件大于 k_unMaxCloudFileChunkSize 所规定的 100MiB。
    /// - cubData 小于 0。
    /// - pvData 为 NULL。
    /// - 您尝试从无效路径或文件名读取。 由于 Steam 云是跨平台的，文件需要在支持的所有操作系统与文件系统中均有有效名称。 参见微软命名文件、路径与命名空间文档。
    /// - 超过了当前用户的 Steam 云存储配额。 云存储或者缺乏空间，或者有过多文件。
    /// - Steam 无法写入磁盘，该位置可能为只读。
    pub fn file_write(name: String, content: String) -> bool {
        let client = crate::client::get_client();
        let file = client.remote_storage().file(&name);

        let buf = content.as_bytes();
        file.write().write_all(buf).is_ok()
    }

    #[napi]
    /// 从本地磁盘中删除一个文件，并将该删除传播到云端。
    /// 此函数应该只在用户主动删除文件时使用。 如果您希望将一个文件从 Steam 云中移除，但将其保留在用户的本地磁盘，则需使用 FileForget。
    /// 您删除文件后，可以使用 FileWrite 重新写入该文件，以将其重新上传至 Steam 云。
    /// 
    /// @returns true， 表示文件存在且已成功删除；否则，如果文件不存在，返回 false。
    pub fn file_delete(name: String) -> bool {
        let client = crate::client::get_client();
        let file = client.remote_storage().file(&name);

        file.delete()
    }

    #[napi]
    /// 检查指定文件是否存在。
    /// 
    /// @returns true， 表示文件存在；否则，返回 false。
    pub fn file_exists(name: String) -> bool {
        let client = crate::client::get_client();
        let file = client.remote_storage().file(&name);

        file.exists()
    }
}

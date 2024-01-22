use super::consts::{
    CSteamID, EItemUpdateStatus, ERemoteStoragePublishedFileVisibility,
};
use napi_derive::napi;

#[napi]
pub mod steamugc {
    use super::{CSteamID, EItemUpdateStatus, ERemoteStoragePublishedFileVisibility};
    use napi::bindgen_prelude::{BigInt, Error};
    use napi::threadsafe_function::ErrorStrategy;
    use napi::threadsafe_function::ThreadsafeFunction;
    use napi::threadsafe_function::ThreadsafeFunctionCallMode;
    use std::path::Path;
    use steamworks::{ClientManager, FileType, PublishedFileId, UpdateHandle};
    use tokio::sync::oneshot;

    #[napi(object)]
    /// 创建创意工坊物品信息
    pub struct UgcResult {
        /// 物品ID
        pub item_id: BigInt,
        /// 用户需要接受《Steam 创意工坊法律协议》
        pub needs_to_accept_agreement: bool,
    }

    #[napi(object)]
    /// 创意工坊信息
    pub struct UgcUpdate {
        /// 创意工坊标题
        pub title: Option<String>,
        /// 创意工坊描述
        pub description: Option<String>,
        /// 创意工坊更新信息
        pub change_note: Option<String>,
        /// 创意工坊预览路径
        pub preview_path: Option<String>,
        /// 创意工坊文件路径
        pub content_path: Option<String>,
        /// 创意工坊分类标签
        pub tags: Option<Vec<String>>,
        /// 创意工坊可见性
        pub visibility: Option<ERemoteStoragePublishedFileVisibility>,
    }

    impl UgcUpdate {
        pub fn submit(
            self,
            mut update: UpdateHandle<ClientManager>,
            callback: impl FnOnce(Result<(PublishedFileId, bool), steamworks::SteamError>)
                + Send
                + 'static,
        ) -> steamworks::UpdateWatchHandle<ClientManager> {
            if let Some(title) = self.title {
                update = update.title(title.as_str());
            }

            if let Some(description) = self.description {
                update = update.description(description.as_str());
            }

            if let Some(preview_path) = self.preview_path {
                update = update.preview_path(Path::new(&preview_path));
            }

            if let Some(tags) = self.tags {
                update = update.tags(tags);
            }

            if let Some(content_path) = self.content_path {
                update = update.content_path(Path::new(&content_path));
            }

            if let Some(visibility) = self.visibility {
                update = update.visibility(visibility.into());
            }

            let change_note = self.change_note.as_deref();
            update.submit(change_note, callback)
        }
    }

    #[napi(object)]
    /// 创意工坊物品安装信息
    pub struct InstallInfo {
        /// 内容的文件夹的绝对路径
        pub folder: String,
        /// 创意工坊物品的字节大小
        pub size_on_disk: BigInt,
        /// 创意工坊物品上次更新的时间
        pub timestamp: u32,
    }

    #[napi(object)]
    /// 创意工坊更新进度
    pub struct UpdateProgress {
        pub status: EItemUpdateStatus,
        pub progress: BigInt,
        pub total: BigInt,
    }

    #[napi(object)]
    /// 创意工坊下载信息
    pub struct DownloadInfo {
        /// 返回当前已下载的字节
        pub current: BigInt,
        /// 返回总字节数。 仅在下载开始后有效
        pub total: BigInt,
    }

    #[napi(object)]
    /// 创意工坊查询
    pub struct WorkshopItemQueryOptions {
        /// 设置待处理的 UGC 查询是否从特定时间段的缓存中返回查询结果
        pub cached_response_max_age: Option<u32>,
        /// 设置待处理的 UGC 查询是否需要返回开发者指定的物品元数据
        pub include_metadata: Option<bool>,
        /// 设置待处理的 UGC 查询是否需要返回物品的完整描述。如果您未设置此项，那么您只会收到概要，也即被截断为 255 个字节的描述。
        pub include_long_description: Option<bool>,
        /// 设置待处理的 UGC 查询返回的物品标题和描述所使用的语言
        pub language: Option<String>,
    }

    #[derive(Debug)]
    #[napi(object)]
    /// 创意工坊信息
    pub struct WorkshopItem {
        /// 此 UGC 的全局唯一物品句柄
        pub published_file_id: BigInt,
        /// 创建此物品的应用的 App Id
        pub creator_app_id: Option<u32>,
        /// 将消耗此物品的应用的 App Id
        pub consumer_app_id: Option<u32>,
        /// 此物品的标题
        pub title: String,
        /// 此物品的说明
        pub description: String,
        /// 创建此内容的用户的 Steam ID
        pub owner: CSteamID,
        /// 所发布物品的创建时间，以 Unix 时间戳格式提供（自 1970 年 1 月 1 日起的秒数）
        pub time_created: u32,
        /// 所发布物品的最后更新时间，以 Unix 时间戳格式提供（自 1970 年 1 月 1 日起的秒数）
        pub time_updated: u32,
        /// 此物品是否被封禁
        pub banned: bool,
        /// 此应用的开发者是否已经将此物品特别标记为被创意工坊所接受。
        pub accepted_for_use: bool,
        /// 与此物品关联的所有标签
        pub tags: Vec<String>,
        /// 标签列表是否因过长而不能返回到提供的缓冲区并因此而截断
        pub tags_truncated: bool,
        /// 与此物品关联的 URL
        pub url: String,
        /// 此物品赞的数量
        pub num_upvotes: u32,
        /// 此物品踩的数量
        pub num_downvotes: u32,
        /// 如果 m_eFileType 为 k_EWorkshopFileTypeCollection，则代表合集中的物品数; 也可能是此特定物品所依赖的物品数
        pub num_children: u32,
        /// 预览文件图片链接
        pub preview_url: Option<String>,
    }

    impl WorkshopItem {
        fn from_query(result: steamworks::QueryResult, preview_url: Option<String>) -> Self {
            Self {
                published_file_id: BigInt::from(result.published_file_id.0),
                creator_app_id: result.creator_app_id.map(|id| id.0),
                consumer_app_id: result.consumer_app_id.map(|id| id.0),
                title: result.title,
                description: result.description,
                owner: CSteamID::from_steamid(result.owner),
                time_created: result.time_created,
                time_updated: result.time_updated,
                banned: result.banned,
                accepted_for_use: result.accepted_for_use,
                tags: result.tags,
                tags_truncated: result.tags_truncated,
                url: result.url,
                num_upvotes: result.num_upvotes,
                num_downvotes: result.num_downvotes,
                num_children: result.num_children,
                preview_url,
            }
        }
    }

    /// 获取此客户端上创意工坊物品的当前状态
    ///
    /// @returns 返回此物品状态。 应与 EItemState 标记一起使用，以确定创意工坊物品的状态。
    #[napi]
    pub fn get_item_state(item_id: BigInt) -> u32 {
        let client = crate::client::get_client();
        let result = client
            .ugc()
            .item_state(PublishedFileId(item_id.get_u64().1));
        result.bits()
    }

    #[napi]
    /// 创建一个尚无附加内容的新创意工坊物品
    ///
    /// @return 创意工坊信息
    pub async fn create_item(app_id: Option<u32>) -> Result<UgcResult, Error> {
        let client = crate::client::get_client();
        let app_id = app_id
            .map(steamworks::AppId)
            .unwrap_or_else(|| client.utils().app_id());

        let (tx, rx) = oneshot::channel();

        client
            .ugc()
            .create_item(app_id, FileType::Community, |result| {
                tx.send(result).unwrap();
            });

        let result = rx.await.unwrap();
        match result {
            Ok((item_id, needs_to_accept_agreement)) => Ok(UgcResult {
                item_id: BigInt::from(item_id.0),
                needs_to_accept_agreement,
            }),
            Err(e) => Err(Error::from_reason(e.to_string())),
        }
    }

    #[napi]
    /// 将对物品所做的更改上传到 Steam 创意工坊。
    /// 您可以使用 GetItemUpdateProgress 追踪物品更新的进度。
    ///
    /// @param item_id 创意工坊ID
    /// @param update_details 创意工坊更新信息
    /// @param app_id 创意工坊所属应用ID
    /// @returns 返回更新结果及错误信息
    pub async fn update_item(
        item_id: BigInt,
        update_details: UgcUpdate,
        app_id: Option<u32>,
    ) -> Result<UgcResult, Error> {
        let client = crate::client::get_client();

        let app_id = app_id
            .map(steamworks::AppId)
            .unwrap_or_else(|| client.utils().app_id());

        let (tx, rx) = oneshot::channel();

        {
            let update_handle = client
                .ugc()
                .start_item_update(app_id, PublishedFileId(item_id.get_u64().1));

            update_details.submit(update_handle, |result| {
                tx.send(result).unwrap();
            });
        };

        let result = rx.await.unwrap();
        match result {
            Ok((item_id, needs_to_accept_agreement)) => Ok(UgcResult {
                item_id: BigInt::from(item_id.0),
                needs_to_accept_agreement,
            }),
            Err(e) => Err(Error::from_reason(e.to_string())),
        }
    }

    #[napi]
    /// 订阅创意工坊物品。 会尽快下载并安装该物品。
    ///
    /// @param item_id 要订阅的创意工坊物品
    /// @returns 返回订阅结果
    pub async fn subscribe_item(item_id: BigInt) -> Result<(), Error> {
        let client = crate::client::get_client();
        let (tx, rx) = oneshot::channel();

        client
            .ugc()
            .subscribe_item(PublishedFileId(item_id.get_u64().1), |result| {
                tx.send(result).unwrap();
            });

        let result = rx.await.unwrap();
        match result {
            Ok(()) => Ok(()),
            Err(e) => Err(Error::from_reason(e.to_string())),
        }
    }

    /// 取消来自创意工坊物品的订阅。 退出游戏后会移除该物品。
    ///
    /// @param item_id 要取消订阅的创意工坊物品项目
    /// @returns 返回订阅结果
    #[napi]
    pub async fn unsubscribe_item(item_id: BigInt) -> Result<(), Error> {
        let client = crate::client::get_client();
        let (tx, rx) = oneshot::channel();

        client
            .ugc()
            .unsubscribe_item(PublishedFileId(item_id.get_u64().1), |result| {
                tx.send(result).unwrap();
            });

        let result = rx.await.unwrap();
        match result {
            Ok(()) => Ok(()),
            Err(e) => Err(Error::from_reason(e.to_string())),
        }
    }

    /// 下载或更新创意工坊物品。
    /// 如果返回值为 true，在调用 GetItemInstallInfo 或访问磁盘上创意工坊物品前，注册并等待 DownloadItemResult_t 回调。
    /// 如果用户并未订阅该物品（例如匿名登录的游戏服务器），创意工坊物品会下载并临时存放于缓存中。
    /// 如果创意工坊物品有一个状态为 k_EItemStateNeedsUpdate 的物品，则可调用此函数来开始更新。
    /// 在调用 DownloadItemResult_t 前切勿访问磁盘上的创意工坊物品。
    /// DownloadItemResult_t 回调中包含与创意工坊物品关联的应用 ID。
    /// 无论正在运行什么应用程序，均会为所有物品下载调用处理程序，因此请检查该应用 ID 与运行中的应用的 ID 是否一致。
    ///
    /// @param item_id 要下载的创意工坊物品
    /// @param high_priority 以高优先级模式开始下载，暂停所有其他正在进行的 Steam 下载并立即开始下载此创意工坊物品
    /// @returns true 表明下载成功开始；否则，如果 nPublishedFileID 无效或用户尚未登录，返回 false。
    #[napi]
    pub fn download_item(item_id: BigInt, high_priority: bool) -> bool {
        let client = crate::client::get_client();
        client
            .ugc()
            .download_item(PublishedFileId(item_id.get_u64().1), high_priority)
    }

    /// 获得当前游戏中，当前用户所订阅的所有物品的清单。
    ///
    /// @returns 已订阅的创意工坊物品ID
    #[napi]
    pub fn get_subscribed_items() -> Vec<BigInt> {
        let client = crate::client::get_client();
        let result = client.ugc().subscribed_items();

        result
            .iter()
            .map(|item| BigInt::from(item.0))
            .collect::<Vec<_>>()
    }

    #[napi]
    /// 查询特定 UGC 物品的详细信息。 目前您可以请求的项目数量限制为 1,000，但将来此限制可能会取消。
    ///
    /// @param item 要获取详细信息的创意工坊物品列表
    /// @param query 要查询创意工坊指定选项
    /// @returns 返回创意工坊查询结果
    pub async fn get_item(
        item: BigInt,
        query: Option<WorkshopItemQueryOptions>,
    ) -> Result<Option<WorkshopItem>, Error> {
        let client = crate::client::get_client();
        let (tx, rx) = oneshot::channel();

        {
            let mut item_query = client
                .ugc()
                .query_item(PublishedFileId(item.get_u64().1))
                .map_err(|e| Error::from_reason(e.to_string()))?;

            if let Some(query) = query {
                if let Some(cached_response_max_age) = query.cached_response_max_age {
                    item_query = item_query.allow_cached_response(cached_response_max_age);
                }

                if let Some(include_metadata) = query.include_metadata {
                    item_query = item_query.include_metadata(include_metadata);
                }

                if let Some(include_long_description) = query.include_long_description {
                    item_query = item_query.include_long_desc(include_long_description);
                }

                if let Some(language) = query.language {
                    item_query = item_query.language(&language);
                }
            }

            item_query.fetch(|result| {
                tx.send(result.map(|result| {
                    result
                        .get(0)
                        .map(|item| WorkshopItem::from_query(item, result.preview_url(0)))
                }))
                .unwrap();
            });
        }

        rx.await
            .unwrap()
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi]
    /// 查询特定 UGC 物品的详细信息。 目前您可以请求的项目数量限制为 1,000，但将来此限制可能会取消。
    ///
    /// @param items 要获取详细信息的创意工坊物品列表
    /// @param query 要查询创意工坊指定选项
    /// @returns 返回创意工坊查询结果
    pub async fn get_items(
        items: Vec<BigInt>,
        query: Option<WorkshopItemQueryOptions>,
    ) -> Result<Vec<Option<WorkshopItem>>, Error> {
        let client = crate::client::get_client();
        let (tx, rx) = oneshot::channel();
        {
            let mut item_query = client
                .ugc()
                .query_items(
                    items
                        .iter()
                        .map(|id| PublishedFileId(id.get_u64().1))
                        .collect(),
                )
                .map_err(|e| Error::from_reason(e.to_string()))?;

            if let Some(query) = query {
                if let Some(cached_response_max_age) = query.cached_response_max_age {
                    item_query = item_query.allow_cached_response(cached_response_max_age);
                }

                if let Some(include_metadata) = query.include_metadata {
                    item_query = item_query.include_metadata(include_metadata);
                }

                if let Some(include_long_description) = query.include_long_description {
                    item_query = item_query.include_long_desc(include_long_description);
                }

                if let Some(language) = query.language {
                    item_query = item_query.language(&language);
                }
            }

            item_query.fetch(|result| {
                tx.send(result.map(|result| {
                    result
                        .iter()
                        .enumerate()
                        .map(|(i, item)| {
                            item.map(|item| {
                                WorkshopItem::from_query(item, result.preview_url(i as u32))
                            })
                        })
                        .collect()
                }))
                .unwrap();
            });
        }

        rx.await
            .unwrap()
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    /// 获取当前已安装在光盘上的创意工坊物品相关信息。
    ///
    /// @param item_id 	要获取安装信息的创意工坊物品
    /// @returns 返回创意工坊安装信息
    #[napi]
    pub fn get_item_install_info(item_id: BigInt) -> Option<InstallInfo> {
        let client = crate::client::get_client();
        let result = client
            .ugc()
            .item_install_info(PublishedFileId(item_id.get_u64().1));

        match result {
            Some(install_info) => Some(InstallInfo {
                folder: install_info.folder,
                size_on_disk: BigInt::from(install_info.size_on_disk),
                timestamp: install_info.timestamp,
            }),
            None => None,
        }
    }

    /// 获取设置了 k_EItemStateNeedsUpdate 的创意工坊物品的待下载状态信息
    ///
    /// @param item_id 要获取下载信息的创意工坊物品
    #[napi]
    pub fn get_item_download_info(item_id: BigInt) -> Option<DownloadInfo> {
        let client = crate::client::get_client();
        let result = client
            .ugc()
            .item_download_info(PublishedFileId(item_id.get_u64().1));

        result.map(|download_info| DownloadInfo {
            current: BigInt::from(download_info.0),
            total: BigInt::from(download_info.1),
        })
    }

    #[napi]
    /// 获取创意工坊物品更新的进度
    ///
    /// @param item_id 创意工坊物品ID
    /// @param update_details 创意工坊信息
    /// @param app_id 创意工坊对应app_id
    /// @param success_callback 创意工坊上传成功时回调
    /// @param error_callback 创意工坊上传失败时回调
    /// @param progress_callback 创意工坊上传失败时回调
    /// @param progress_callback_interval_ms 创意工坊回调时间
    pub fn update_item_with_callback(
        item_id: BigInt,
        update_details: UgcUpdate,
        app_id: Option<u32>,
        #[napi(ts_arg_type = "(data: UgcResult) => void")] success_callback: napi::JsFunction,
        #[napi(ts_arg_type = "(err: any) => void")] error_callback: napi::JsFunction,
        #[napi(ts_arg_type = "(data: UpdateProgress) => void")] progress_callback: Option<
            napi::JsFunction,
        >,
        progress_callback_interval_ms: Option<u32>,
    ) {
        let success_callback: ThreadsafeFunction<UgcResult, ErrorStrategy::Fatal> =
            success_callback
                .create_threadsafe_function(0, |ctx| Ok(vec![ctx.value]))
                .unwrap();
        let error_callback: ThreadsafeFunction<Error, ErrorStrategy::Fatal> = error_callback
            .create_threadsafe_function(0, |ctx| Ok(vec![ctx.value]))
            .unwrap();

        let client = crate::client::get_client();

        let app_id = app_id
            .map(steamworks::AppId)
            .unwrap_or_else(|| client.utils().app_id());

        {
            let update_handle = client
                .ugc()
                .start_item_update(app_id, PublishedFileId(item_id.get_u64().1));

            let update_watch_handle = update_details.submit(update_handle, move |result| {
                match result {
                    Ok((item_id, needs_to_accept_agreement)) => success_callback.call(
                        UgcResult {
                            item_id: BigInt::from(item_id.0),
                            needs_to_accept_agreement,
                        },
                        ThreadsafeFunctionCallMode::Blocking,
                    ),
                    Err(e) => error_callback.call(
                        Error::from_reason(e.to_string()),
                        ThreadsafeFunctionCallMode::Blocking,
                    ),
                };
            });

            if let Some(progress_callback) = progress_callback {
                let progress_callback: ThreadsafeFunction<UpdateProgress, ErrorStrategy::Fatal> =
                    progress_callback
                        .create_threadsafe_function(0, |ctx| Ok(vec![ctx.value]))
                        .unwrap();

                std::thread::spawn(move || loop {
                    let (status, progress, total) = update_watch_handle.progress();
                    let value = UpdateProgress {
                        status: status.into(),
                        progress: BigInt::from(progress),
                        total: BigInt::from(total),
                    };
                    progress_callback.call(value, ThreadsafeFunctionCallMode::Blocking);
                    match status {
                        steamworks::UpdateStatus::Invalid => break,
                        steamworks::UpdateStatus::CommittingChanges => break,
                        _ => (),
                    }
                    std::thread::sleep(std::time::Duration::from_millis(
                        progress_callback_interval_ms.unwrap_or(1000) as u64,
                    ));
                });
            }
        };
    }
}

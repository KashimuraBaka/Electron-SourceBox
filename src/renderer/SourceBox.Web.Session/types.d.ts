declare type ObsResponseData =
  | { action: 'setting'; data: Config.ObsPlugins }
  | { action: 'server'; data: A2S.SourceServerInfoFormIP }

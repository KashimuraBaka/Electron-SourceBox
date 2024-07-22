<!--
 * @Author: Kashimura
 * @Date: 2024-04-03 19:43:34
 * @LastEditors: Kashimura
 * @LastEditTime: 2024-07-22 16:35:30
 * @FilePath: \SourceBox\README.md
 * @Description: 
 * 
 * Copyright (c) 2024 by Kashimura, All Rights Reserved. 
-->
# sourcebox

An Electron application with Vue and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# 使用项目时需要编译模块(旧)
cd node_modules\ref-napi\
node-gyp configure
node-gyp build

# 使用 Greenworks 前注意(由于不再维护,改用Steamworks.js)
$ npm install --save --ignore-scripts git+https://github.com/greenheartgames/greenworks.git
# https://partner.steamgames.com 下载 Steamworks SDK 覆盖安装至
copy Project\node_modules\greenworks\deps\steamworks_sdk
$ npm install
$ npm install --save-dev electron-rebuild
.\node_modules\.bin\electron-rebuild.cmd
# electron-builder.yml
extraFiles:
  - 'steam_appid.txt'

# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

# 镜像源问题
npm config edit
registry=https://registry.npmmirror.com
electron_mirror=https://cdn.npmmirror.com/binaries/electron/
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
npm cache clean --force
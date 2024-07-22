import { join, resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Icons from 'unplugin-icons/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import PACKAGE_JSON from './package.json'

const ROOT_PATH = process.cwd()

export default defineConfig(({ command }) => ({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()],
    build: {
      rollupOptions: {
        input: {
          index: join(ROOT_PATH, 'src/main/index.ts'),
          webserver: join(ROOT_PATH, 'src/main/services/web.process.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer'),
        '@desktop': resolve('src/renderer/SourceBox.Client.UI')
      }
    },
    plugins: [
      vue(),
      vueJsx(),
      AutoImport({ resolvers: [ElementPlusResolver(), IconsResolver({ prefix: 'Icon' })] }),
      Components({ resolvers: [ElementPlusResolver(), IconsResolver()] }),
      Icons({ autoInstall: true, compiler: 'vue3' })
    ],
    define: {
      'define.version': `"${PACKAGE_JSON.version}"`,
      'define.packtime': new Date().getTime()
    },
    build: {
      // 指定静态资源存放目录
      assetsDir: 'assets',
      // 是否空目录
      emptyOutDir: true,
      // 启用、禁用css代码拆分
      cssCodeSplit: true,
      // 构建是否生成source map文件
      sourcemap: 'inline',
      // 代码混淆选项
      minify: command == 'build' ? 'esbuild' : false,
      // rollup 配置打包项
      rollupOptions: {
        input: {
          desktop: join(ROOT_PATH, 'src/renderer/index.html'),
          web: join(ROOT_PATH, 'src/renderer/index-web.html')
        },
        output: {
          entryFileNames: 'js/[name].[hash].js',
          chunkFileNames: 'js/lib.[hash].js',
          assetFileNames: ({ name: filename }) => {
            if (filename) {
              switch (filename.substring(filename.lastIndexOf('.') + 1)) {
                // 样式资源
                case 'css':
                  return 'css/style.[hash].[ext]'
                // 字体资源
                case 'woff2':
                  return 'font/[hash].[ext]'
                // 图片资源
                case 'png':
                case 'jpg':
                case 'webp':
                  return 'images/[name].[hash].[ext]'
              }
            }
            return 'assets/[name].[hash].[ext]'
          }
        }
      }
    }
  }
}))

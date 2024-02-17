<!-- eslint-disable vue/no-v-html -->
<template>
  <el-container id="setting" class="w-container">
    <el-header>OBS直播显示设置</el-header>
    <el-main>
      <div class="obs-setting-items">
        <SettingItem>
          <template #header>浏览器显示地址</template>
          <el-input v-model="url" readonly>
            <template #append>
              <el-button class="win" @click="event_Copy(url)">点击复制</el-button>
            </template>
          </el-input>
        </SettingItem>
      </div>
      <div class="obs-setting-items">
        <SettingItem>
          <template #header>文字样式</template>
          <el-select v-model="formdata.textStyle.shadowType" class="no-input">
            <el-option
              v-for="item in StyleOptions.textShadow"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </SettingItem>
        <SettingItem>
          <template #header>文字大小</template>
          <el-select v-model="formdata.textStyle.size" class="no-input">
            <el-option
              v-for="item in StyleOptions.fontSize"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </SettingItem>
        <SettingItem>
          <template #header>文字样式</template>
          <el-select v-model="formdata.textStyle.align" class="no-input">
            <el-option
              v-for="item in StyleOptions.fontAlign"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </SettingItem>
      </div>
      <div class="obs-setting-items">
        <SettingItem>
          <template #header>文本颜色</template>
          <el-input v-model="formdata.textStyle.color">
            <template #prepend>
              <el-color-picker
                v-model="formdata.textStyle.color"
                :predefine="StyleOptions.predefineColors"
              />
            </template>
          </el-input>
        </SettingItem>
        <SettingItem class="color-contrast">
          <el-tooltip placement="top" effect="light" content="对比度是否通过(仅供参考)">
            <div
              class="color-box"
              :style="{ backgroundColor: colorContranst >= 4.5 ? 'darkgreen' : 'darkred' }"
            >
              <div>{{ colorContranst >= 4.5 ? '通过' : '未通过' }}</div>
              <div>{{ colorContranst.toFixed(2) }}</div>
            </div>
          </el-tooltip>
        </SettingItem>
        <SettingItem>
          <template #header>文本轮廓颜色</template>
          <el-input v-model="formdata.textStyle.shadowColor">
            <template #prepend>
              <el-color-picker
                v-model="formdata.textStyle.shadowColor"
                :predefine="StyleOptions.predefineColors"
              />
            </template>
          </el-input>
        </SettingItem>
      </div>
      <div class="obs-setting-items full">
        <SettingItem>
          <template #header>
            自定义文本
            <el-tooltip placement="bottom" effect="light" trigger="click">
              <el-icon style="margin-left: 5px"><i-material-symbols:help /></el-icon>
              <template #content>
                <h3 style="margin: 0">关键字</h3>
                <div>服务器名: {server}</div>
                <div>地图: {map}</div>
                <div>服务器IP: {ip}</div>
                <div>人数: {player}</div>
                <div>删除内容: {关键字:del(屏蔽字)}</div>
              </template>
            </el-tooltip>
          </template>
          <el-input
            v-model="formdata.customText"
            type="textarea"
            resize="none"
            spellcheck="false"
          />
        </SettingItem>
        <SettingItem>
          <template #header>预览</template>
          <div class="preview">
            <div :style="setPreviewStyle" v-html="showHTML" />
          </div>
        </SettingItem>
      </div>
      <div class="obs-setting-items btns">
        <el-button class="win" :loading="saveLoading" @click="saveStyleOptions">保存</el-button>
        <el-button class="win" @click="resetStyleOptions">重置</el-button>
      </div>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import useCounterStore from '@desktop/services/store'
import { useClipboard } from '@vueuse/core'
import { Color, CssStyle, deepCopy } from '@renderer/utils'

import SettingItem from './SettingItem.vue'

import type { CSSProperties } from 'vue'
import { onMounted } from 'vue'

const store = useCounterStore()

const StyleOptions = {
  // 文字样式
  textShadow: [
    { label: '无', value: '' },
    { label: '投影（柔和）', value: 'tyrh' },
    { label: '投影（正常）', value: 'tyzc' },
    { label: '描边（柔和）', value: 'mbrh' },
    { label: '描边（正常）', value: 'mbzc' }
  ],
  // 文字大小
  fontSize: [
    { label: '超小', value: '0.875rem' },
    { label: '小', value: '1.125rem' },
    { label: '普通', value: '1.3rem' },
    { label: '大', value: '1.5rem' },
    { label: '超大', value: '2.25rem' }
  ],
  // 文字对齐
  fontAlign: [
    { label: '左对齐', value: 'left' },
    { label: '居中', value: 'center' },
    { label: '右对齐', value: 'right' }
  ],
  // 预制颜色
  predefineColors: ['#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff', '#c71585']
}

const url = ref(`http://localhost:${store.web.port}?port=${store.web.port + 1}`)
const formdata = ref<Config.ObsPlugins>(defaultStyleOptions())
const serverInfo = ref<A2S.SourceServerInfoFormIP | undefined>()
const saveLoading = ref(false)

const setPreviewStyle = computed(() => {
  const style: CSSProperties = {}
  const { shadowType, shadowColor, size, color, align } = formdata.value.textStyle
  switch (shadowType) {
    case 'tyrh': {
      style.textShadow = `0.0625rem 0.0625rem 0.125rem ${shadowColor}`
      break
    }
    case 'tyzc': {
      style.textShadow = `0.0625rem 0.0625rem 0 #7a7a7a, 0.125rem 0.125rem 0 ${shadowColor}`
      break
    }
    case 'mbrh': {
      style.textShadow = `0 0 0.25rem #000, 0 0 0.0625rem ${shadowColor}`
      break
    }
    case 'mbzc': {
      style.textShadow = CssStyle.textStorke(16, 0.15, 'rem', shadowColor)
      break
    }
  }
  return {
    fontSize: size,
    color,
    textAlign: align,
    ...style
  }
})

// 获取颜色对比度
const colorContranst = computed(() => {
  const { color, shadowColor } = formdata.value.textStyle
  const color1 = color || '#ffffff'
  const color2 = shadowColor || '#ffffff'
  const radio = Color.getContrastRatio(color1, color2)
  return isNaN(radio) ? 0 : radio
})

// 渲染HTML代码
const showHTML = computed(() => {
  const obj: Json<string> = {
    server: serverInfo.value?.Name || '未进入服务器',
    map: serverInfo.value?.Map || '--',
    ip: serverInfo.value?.IP || '--',
    player: `[${serverInfo.value?.Player || 0}/${serverInfo.value?.PlayerMax || 0}]`
  }
  return (
    formdata.value.customText
      // 删除自定字符串
      .replace(/\{(.*?)\}/g, (_, r: string) => {
        const [deleteStr, objectKey] = r.match(/:del\((.*?)\)/) || []
        // 是否存在规则
        if (deleteStr) {
          r = r.replace(deleteStr, '')
          if (objectKey) {
            try {
              return (obj[r] || '').replace(new RegExp(objectKey), '')
            } catch (e) {
              return obj[r] || ''
            }
          }
        }
        return obj[r] || ''
      })
      // 给每个换行套个div元素
      .replace(/(.*?)(\n|$)/g, (m, r) => {
        return m ? `<div>${r}</div>` : ''
      })
  )
})

/**
 * 复制OBS接口至剪贴板
 * @param string 要复制的文本
 */
const event_Copy = (string: string) => {
  useClipboard()
    .copy(string)
    .then(() => {
      ElMessage.success({ message: '复制成功！', appendTo: '#setting', offset: 8 })
    })
  return string
}

function defaultStyleOptions(): Config.ObsPlugins {
  return {
    customText:
      '当前服务器：{server}\n当前地图：{map}\n服务器IP地址：{ip}\n服务器当前人数：{player}',
    textStyle: {
      size: '1.3rem',
      align: 'left',
      color: '#000',
      shadowType: 'mbzc',
      shadowColor: '#fff'
    }
  }
}

async function saveStyleOptions() {
  saveLoading.value = true
  const rawData = deepCopy(formdata.value)
  await window.config.set('settings', 'obsOptions', rawData)
  store.web.channel?.sendAll('setting', rawData)
  ElMessage.success({ message: '保存成功', appendTo: '#setting' })
  saveLoading.value = false
}

function resetStyleOptions() {
  formdata.value = defaultStyleOptions()
}

onMounted(async () => {
  // 获取配置信息
  formdata.value = {
    ...formdata.value,
    ...(await window.config.get('settings', 'obsOptions'))
  }
  // 查询目标服务器当模板
  if (store.web.obsOptions.ip) {
    const res = await window.steamworks.run('simpleQueryServer', store.web.obsOptions.ip)
    serverInfo.value = { IP: store.web.obsOptions.ip, ...res }
  }
})
</script>

<style lang="scss" scoped>
.el-container {
  height: 100%;

  .el-main {
    overflow: hidden;

    .obs-setting-items {
      display: flex;
      flex-direction: row;
      margin-bottom: 15px;
      box-sizing: border-box;

      .obs-setting-item {
        margin-right: 10px;

        // 颜色对比度显示样式
        &.color-contrast {
          flex: 0;

          .color-box {
            width: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            border-radius: 5px;
            border: var(--theme-input-border-color) solid 1px;
            background-color: var(--theme-input-bg-color);

            div:first-child {
              font-size: 12px;
            }

            div:last-child {
              font-size: 10px;
            }
          }
        }

        &:last-child {
          margin-right: 0;
        }
      }

      &.full {
        flex: 1;

        :deep(.obs-setting-item) > .obs-setting-item__inner {
          flex: 1 0px; // flex布局触发子元素overflow
          overflow: auto;

          .preview {
            --alpha: 0.3;
            overflow: auto;
            padding: 4px 10px;
            border: var(--theme-input-border-color) solid 1px;
            border-radius: 4px;
            box-sizing: border-box;
            // 透明方格背景
            background-color: #fff;
            background-image: linear-gradient(
                45deg,
                rgba(0, 0, 0, var(--alpha)) 25%,
                transparent 25%,
                transparent 75%,
                rgba(0, 0, 0, var(--alpha)) 75%,
                rgba(0, 0, 0, var(--alpha)) 100%
              ),
              linear-gradient(
                45deg,
                rgba(0, 0, 0, var(--alpha)) 25%,
                transparent 25%,
                transparent 75%,
                rgba(0, 0, 0, var(--alpha)) 75%,
                rgba(0, 0, 0, var(--alpha)) 100%
              );
            background-size: 16px 16px;
            background-position:
              0 0,
              8px 8px;

            & > div {
              min-width: 100%;
            }
          }
        }
      }

      &.btns {
        justify-content: flex-end;
      }
    }

    .el-textarea {
      --t-height: 100%;
    }
  }
}
</style>

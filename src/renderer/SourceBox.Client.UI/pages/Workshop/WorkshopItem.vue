<template>
  <section :class="{ workshop: true, hover }" @mouseover="hover = true" @mouseleave="hover = false">
    <div class="workshop-preview">
      <img :src="item.previewUrl" />
    </div>
    <div class="workshop-inner">
      <div class="workshop-content">
        <div class="title">
          <el-tag disable-transitions>{{ item.tags.join(',') }}</el-tag>
          <el-link :underline="false" @click="SteamConsole.workshop(Number(item.publishedFileId))">
            {{ item.title }}
          </el-link>
          <a class="install"> ({{ item.install_info ? Files.sizeof(item.install_info.sizeOnDisk) : '未安装' }}) </a>
        </div>
        <div class="author">
          作者:
          <el-link
            target="_blank"
            :underline="false"
            :href="`https://steamcommunity.com/profiles/${item.owner.steamId64}/myworkshopfiles?appid=${item.creatorAppId}`"
          >
            {{ item.author }}
          </el-link>
        </div>
        <div class="time">
          创建时间: {{ FormatTime(item.timeCreated) }} 上次更新:
          {{ SecondToDate(item.timeDistance) }}
        </div>
        <div class="description">{{ item.description }}</div>
      </div>
      <div class="workshop-extend">
        <el-button v-if="item.install_info" text @click="openFile">
          <template #icon>
            <i-mdi:folder-download />
          </template>
          下载文件夹
        </el-button>
        <el-button v-else text @click="downloadItem">
          <template #icon>
            <i-material-symbols:download />
          </template>
          强制下载
        </el-button>
        <el-button text @click="unsubscribe">
          <template #icon>
            <i-material-symbols:do-not-disturb-on-outline v-if="isSubscribe" />
            <i-material-symbols:add v-else />
          </template>
          {{ isSubscribe ? '取消订阅' : '订阅' }}
        </el-button>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { SteamConsole, Files } from '@renderer/utils'
import { SecondToDate, FormatTime } from '@renderer/utils/time'

const props = defineProps<{
  item: WorkshopItemDetail
}>()

const hover = ref(false)
const isSubscribe = ref(true)

const openFile = async () => {
  if (props.item.install_info) {
    if (Files.isFile(props.item.install_info.folder)) {
      const [folder] = props.item.install_info.folder.match(/^[A-z]:\\(.+?\\)*/) || []
      Files.start(folder || '')
    } else {
      Files.start(props.item.install_info.folder)
    }
  }
}

const downloadItem = async () => {
  if (!props.item.install_info) {
    await window.steamworks.run('steamugc.downloadItem', props.item.publishedFileId, true)
  }
}

const unsubscribe = async () => {
  if (isSubscribe.value) {
    await window.steamworks.run('steamugc.unsubscribeItem', props.item.publishedFileId)
    ElMessage.success({
      message: `取消订阅 ${props.item.title} 成功!`,
      appendTo: '#workshop'
    })
    isSubscribe.value = false
  } else {
    await window.steamworks.run('steamugc.subscribeItem', props.item.publishedFileId)
    ElMessage.success({
      message: `订阅 ${props.item.title} 成功!`,
      appendTo: '#workshop'
    })
    isSubscribe.value = true
  }
}
</script>

<style lang="scss" scoped>
.workshop {
  --workshop-item-height: 104px;

  display: flex;
  flex-direction: row;
  flex-basis: auto;
  box-sizing: border-box;
  border-radius: 5px;
  border: var(--theme-card-border-color) solid 1px;
  background-color: var(--theme-card-bg-color);
  margin-bottom: 10px;
  overflow: hidden;
  transition: all 150ms ease-in-out;

  &.hover {
    transform: translateY(-1px);
    background-color: rgba(255, 255, 255, 0.06);
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.15);

    .workshop-inner > .workshop-extend {
      opacity: 1;
      height: 34px;
    }
  }

  .workshop-preview {
    flex-shrink: 0;
    width: 178px;
    height: var(--workshop-item-height);
    box-sizing: border-box;

    img {
      height: 100%;
      width: 100%;
      object-fit: cover;
    }
  }

  .workshop-inner {
    position: relative;
    display: flex;
    flex-direction: row;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    padding: 5px 5px 5px 10px;
    color: #969696;
    font-size: 14px;
    height: var(--workshop-item-height);
    overflow: hidden;

    .workshop-content {
      flex: 1;
      flex-direction: column;
      overflow: hidden;
      font-size: 13px;

      .title {
        display: flex;
        align-items: center;
        color: var(--theme-menu-font-color);
        overflow: hidden;

        .el-tag {
          max-width: 16vw;
          :deep(.el-tag__content) {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .el-link {
          padding: 0 5px;
          min-width: 0;

          :deep(.el-link__inner) {
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .install {
          white-space: nowrap;
        }
      }

      .author {
        display: flex;
        align-items: center;

        .el-link {
          margin-left: 5px;
        }
      }

      .description {
        font-size: 12px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-all;
      }
    }

    .workshop-extend {
      position: absolute;
      inset: auto 0 0 0;
      display: flex;
      flex-shrink: 0;
      width: 100%;
      height: 0;
      opacity: 0;
      align-items: center;
      justify-content: flex-end;
      background-color: rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(2px);
      box-sizing: border-box;
      padding: 10px 5px;
      text-align: center;
      transition: all 150ms ease-in-out;

      .el-button {
        padding: 8px;

        &:hover,
        &:focus {
          color: white;
          background-color: transparent;
        }
      }

      .el-button + .el-button {
        margin-left: 4px;
      }
    }
  }
}
</style>

<template>
  <section class="workshop" @dblclick="openFile">
    <img class="workshop-preview" :src="item.previewUrl" />
    <div class="workshop-inner">
      <div class="workshop-content">
        <div class="title">
          <el-tag disable-transitions>{{ item.tags.join(',') }}</el-tag>
          <el-link
            class="name"
            :underline="false"
            @click="Steam.workshop(Number(item.publishedFileId))"
          >
            {{ item.title }}
          </el-link>
          <a class="install">
            ({{ installInfo ? files.sizeof(Number(installInfo.sizeOnDisk)) : '未安装' }})
          </a>
        </div>
        <div class="author">
          作者:
          <el-link
            target="_blank"
            :underline="false"
            :href="`https://steamcommunity.com/profiles/${item.owner.steamId64}/myworkshopfiles?appid=${item.creatorAppId}`"
          >
            {{ authorname }}
          </el-link>
        </div>
        <div class="time">创建时间: {{ FormatTime(item.timeCreated) }}</div>
        <div class="description">{{ item.description }}</div>
      </div>
      <div class="workshop-extend">
        <el-button class="win" @click="unsubscribe">
          {{ isSubscribe ? '取消订阅' : '订阅' }}
        </el-button>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { FormatTime, files } from '@renderer/utils'
import Steam from '@renderer/utils/steam_console'

const props = defineProps<{
  item: WorkshopItem
  authorname: string
}>()
const isSubscribe = ref(true)
const installInfo = ref<null | InstallInfo>()

const openFile = async () => {
  if (installInfo.value) {
    files.start(installInfo.value.folder)
  }
}

const unsubscribe = async () => {
  if (isSubscribe.value) {
    await window.steamworks.run('steamugc.unsubscribeItem', props.item.publishedFileId)
    ElMessage.success(`取消订阅 ${props.item.title} 成功!`)
    isSubscribe.value = false
  } else {
    await window.steamworks.run('steamugc.subscribeItem', props.item.publishedFileId)
    ElMessage.success(`订阅 ${props.item.title} 成功!`)
    isSubscribe.value = true
  }
}

onMounted(async () => {
  // installInfo.value = await window.steamworks.workshop.installInfo(props.item.publishedFileId)
})
</script>

<style lang="scss" scoped>
.workshop {
  --workshop-item-height: 104px;

  display: flex;
  flex-direction: row;
  flex-basis: auto;
  box-sizing: border-box;
  min-width: 0;
  border-radius: 5px;
  border: var(--theme-card-border-color) solid 1px;
  background-color: var(--theme-card-bg-color);
  margin-bottom: 10px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }

  .workshop-preview {
    display: flex;
    flex-shrink: 0;
    width: 178px;
    height: var(--workshop-item-height);
    object-fit: cover;
  }

  .workshop-inner {
    flex: 1;
    flex-basis: auto;
    display: flex;
    flex-direction: row;
    flex-basis: auto;
    box-sizing: border-box;
    padding: 5px 5px 5px 10px;
    color: #969696;
    font-size: 14px;
    height: var(--workshop-item-height);
    overflow: hidden;

    .workshop-content {
      flex: 1;
      flex-basis: auto;
      display: flex;
      flex-direction: column;
      font-size: 13px;

      .title {
        display: flex;
        align-items: center;
        color: var(--theme-menu-font-color);

        .el-tag {
          max-width: 16vw;
          :deep(.el-tag__content) {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .el-link {
          max-width: 30vw;
          padding: 0 5px;
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
      display: flex;
      flex-shrink: 0;
      padding: 10px 5px;
      text-align: center;
    }
  }
}
</style>

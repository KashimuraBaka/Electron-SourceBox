<template>
  <el-drawer
    v-model="dialogVisible"
    size="100%"
    modal-class="win-page"
    :with-header="false"
    :close-on-press-escape="false"
    destroy-on-close
    @closed="drawerOnClose"
  >
    <el-container class="w-container show">
      <el-header>
        <el-button text @click="dialogVisible = false">
          <template #icon>
            <i-material-symbols:arrow-back-ios-new />
          </template>
        </el-button>
        <h1>
          合集:
          <el-link target="_blank" :underline="false" :href="`https://steamcommunity.com/sharedfiles/filedetails/?id=${collection.id}`">
            {{ collection.title }}
          </el-link>
        </h1>
      </el-header>
      <el-main>
        <!--
          操作区域, 按钮全选 订阅 及 取消订阅
        -->
        <div class="btns">
          <div class="actions-start">
            <el-button size="small" @click="selectAllWorkshopItem">
              {{ checkBoxSelectCount == collection.items.length ? '取消全选' : `全选(${checkBoxSelectCount})` }}
            </el-button>
            <el-button :class="{ star: isStar }" size="small" @click="onStarClick">
              <template #icon>
                <i-material-symbols:kid-star v-if="isStar" />
                <i-material-symbols:kid-star-outline v-else />
              </template>
              {{ isStar ? '取消收藏' : '收藏合集' }}
            </el-button>
          </div>
          <div v-if="checkBoxSelectCount" class="actions-end">
            <el-button size="small" :loading="subscriptionLoading" @click="onSubClick">
              <template #icon>
                <i-material-symbols:add />
              </template>
              订阅所选
            </el-button>
            <el-button size="small" :loading="unSubscriptionLoading" @click="onUnSubClick">
              <template #icon>
                <i-material-symbols:check-indeterminate-small />
              </template>
              取消订阅
            </el-button>
          </div>
        </div>
        <!--
          创意工坊列表
        -->
        <div class="workshop-list">
          <el-auto-resizer>
            <template #default="{ height, width }">
              <div class="workshop-collection-list" :style="{ height: `${height}px`, width: `${width}px` }">
                <!-- 遍历物品列表 -->
                <div
                  v-for="({ item }, index) in collection.items"
                  :key="item.publishedFileId.toString()"
                  class="workshop-collection-item"
                  :style="{ '--t-bg-image': `url(${item.previewUrl || ''})` }"
                  @click="collection.items[index].checked = !collection.items[index].checked"
                >
                  <div
                    :class="{
                      'workshop-collection-main': true,
                      'is-active': item.publishedFileId == selectId
                    }"
                  >
                    <div class="icon" @click.stop="onItemClick(item)">
                      <el-icon><i-material-symbols:arrow-forward-ios /></el-icon>
                    </div>
                    <div class="check">
                      <el-checkbox v-model="collection.items[index].checked" @click.stop />
                    </div>
                    <div v-if="isSubscription(item)" class="left subscription">[已订阅]</div>
                    <div v-else class="left unsubscription">[未订阅]</div>
                    <div class="title">{{ item.title }}</div>
                    <div class="update">{{ SecondToDate(NOWTIME - item.timeUpdated) }}</div>
                    <div class="author">{{ item.author }}</div>
                    <div class="votes">
                      <a><i-icon-park-twotone:good-one />: {{ item.numUpvotes }}</a>
                      <a><i-icon-park-outline:bad-two />: {{ item.numDownvotes }}</a>
                    </div>
                  </div>
                  <WinCollapse :show="item.publishedFileId == selectId">
                    <div class="workshop-collection-extend">
                      {{ item.description }}
                    </div>
                  </WinCollapse>
                </div>
              </div>
            </template>
          </el-auto-resizer>
        </div>
      </el-main>
    </el-container>
  </el-drawer>
</template>

<script lang="tsx" setup>
import { ref, computed } from 'vue'
import { SecondToDate } from '@renderer/utils/time'

import WinCollapse from '@desktop/components/WinCollapse.vue'

import type { TSteamWorkshopCollectionDetails } from '@renderer/utils/steam-api/types'

const props = defineProps<{
  subscriptionItems: WorkshopItemSubscriptionDetail[]
  collectionList: TSteamWorkshopCollectionDetails<WorkshopCollectionItem>[]
}>()

const emit = defineEmits<{
  (e: 'update:subscriptionItems', value: WorkshopItemSubscriptionDetail[]): void
  (e: 'update:collectionList', value: TSteamWorkshopCollectionDetails<WorkshopCollectionItem>[]): void
}>()

const subscribe_items = computed({
  get: () => props.subscriptionItems,
  set: (val: WorkshopItemSubscriptionDetail[]) => {
    emit('update:subscriptionItems', val)
  }
})

const collection_list = computed({
  get: () => props.collectionList,
  set: (val: TSteamWorkshopCollectionDetails<WorkshopCollectionItem>[]) => {
    emit('update:collectionList', val)
  }
})

const NOWTIME = Math.floor(new Date().getTime() / 1000) // 当前时间: 秒

const createEmptyCollecitonData = () => {
  return {
    appid: 0,
    app_name: '',
    id: 0,
    author: '',
    title: '',
    content: '',
    background: '',
    create_time: '',
    update_time: '',
    items: []
  }
}

const collection = ref<TSteamWorkshopCollectionDetails<WorkshopCollectionItem>>(createEmptyCollecitonData())
const selectId = ref(0n)
const dialogVisible = ref(false)
const subscriptionLoading = ref(false)
const unSubscriptionLoading = ref(false)

const checkBoxSelectCount = computed(() => {
  let count = 0
  for (const item of collection.value.items) {
    if (!item.checked) continue
    count++
  }
  return count
})

const isStar = computed(() => {
  return collection_list.value.find((v) => v.id == (collection.value?.id || 0)) != undefined
})

const isSubscription = (item: WorkshopCollectionItemData) => {
  return subscribe_items.value.find((i) => i.publishedFileId == item.publishedFileId) != undefined
}

const drawerOnClose = () => {
  collection.value = createEmptyCollecitonData()
}

const selectAllWorkshopItem = () => {
  if (checkBoxSelectCount.value == collection.value.items.length) {
    for (const item of collection.value.items) {
      item.checked = false
    }
  } else {
    for (const item of collection.value.items) {
      item.checked = true
    }
  }
}

const onUnSubClick = async () => {
  unSubscriptionLoading.value = true
  const count = await new Promise((resolve) => {
    // 获取已订阅工坊物品
    const subscriptionItems = collection.value.items.filter(({ checked, item }) => checked && isSubscription(item))
    let unsubCount = 0
    for (const { item } of subscriptionItems) {
      // 如果操作取消
      window.steamworks.run('steamugc.unsubscribeItem', item.publishedFileId).then(() => {
        const index = subscribe_items.value.findIndex((v) => v.publishedFileId == item.publishedFileId)
        subscribe_items.value.splice(index, 1)
        unsubCount++
        if (subscriptionItems.length == unsubCount) {
          resolve(unsubCount)
        }
      })
    }
  })
  ElMessage.success({
    message: `已经成功取消订阅 ${count} 个物品!`,
    appendTo: '#workshop'
  })
  unSubscriptionLoading.value = false
}

const onSubClick = async () => {
  subscriptionLoading.value = true
  // 获取未订阅工坊物品
  const count = await new Promise((resolve) => {
    const nowtime = Math.floor(new Date().getTime() / 1000) // 当前时间: 秒
    const unSubscriptionItems = collection.value.items.filter(({ checked, item }) => checked && !isSubscription(item))
    let subCount = 0
    for (const { item } of unSubscriptionItems) {
      window.steamworks.run('steamugc.subscribeItem', item.publishedFileId).then(async () => {
        subscribe_items.value.push({
          ...item,
          timeDistance: nowtime - item.timeUpdated,
          install_info: await window.steamworks.run('steamugc.getItemInstallInfo', item.publishedFileId)
        })
        subCount++
        if (unSubscriptionItems.length == subCount) {
          resolve(subCount)
        }
      })
    }
  })
  ElMessage.success({
    message: `已经成功订阅 ${count} 个物品!`,
    appendTo: '#workshop'
  })
  subscriptionLoading.value = false
}

const onItemClick = (item: WorkshopCollectionItemData) => {
  if (selectId.value == item.publishedFileId) {
    selectId.value = 0n
  } else {
    selectId.value = item.publishedFileId
  }
}

const onStarClick = () => {
  if (!collection.value) return
  // 如果合集已收藏则进行删除处理
  if (isStar.value) {
    const { id } = collection.value
    const index = collection_list.value.findIndex((v) => v.id == id)
    collection_list.value.splice(index, 1)
  } else {
    collection_list.value.push(collection.value)
  }
  window.config.set(
    'starlist',
    'collections',
    730,
    collection_list.value.map((v) => ({ id: v.id, name: v.title }))
  )
}

defineExpose({
  async showCollectionItems(items: TSteamWorkshopCollectionDetails<WorkshopCollectionItem>) {
    dialogVisible.value = true
    collection.value = items
  }
})
</script>

<style lang="scss" scoped>
.el-container.show {
  height: 100%;
  overflow: hidden;

  & > .el-header {
    .el-button:first-child {
      font-size: 24px;
      padding: 0 4px;
      margin-right: 10px;
    }

    h1 {
      display: flex;
      align-items: center;
      .el-link {
        margin-left: 10px;
        font-size: inherit;
      }
    }
  }

  & > .el-main {
    flex: 1;
    display: flex;
    flex-direction: column;

    & > .btns {
      display: flex;
      align-items: center;
      margin-bottom: 4px;

      .actions-start {
        flex: 1;
      }

      .actions-end {
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      .el-button {
        &.star {
          color: orange;
        }
      }

      .el-button + .el-button {
        margin-left: 6px;
      }
    }

    & > .workshop-list {
      flex: 1 0px;
      overflow: hidden;
    }
  }
}

// 创意工坊列表内容
.workshop-collection-list {
  overflow: auto;

  .workshop-collection-item {
    --t-bg-image: '';
    z-index: 1;
    position: relative;
    border-radius: 5px;
    border: var(--theme-card-border-color) solid 1px;
    background-color: var(--theme-card-bg-color);
    overflow: auto;

    // 创意工坊物品预览背景
    &::before {
      --t-left: 40%;
      content: '';
      z-index: -1;
      position: absolute;
      inset: 0;
      mask: linear-gradient(to right, transparent calc(var(--t-left) + 5%), rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.75) 100%);
      background-image: var(--t-bg-image);
      background-size: calc(100% - var(--t-left)) auto;
      background-position: bottom 50% right;
      background-repeat: no-repeat;
    }

    &:hover {
      .workshop-collection-main,
      .workshop-collection-extend {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }

    // 创意工坊物品信息
    .workshop-collection-main {
      display: flex;
      font-size: 14px;
      padding: 4px 4px 4px 4px;
      box-sizing: border-box;
      align-items: center;

      & > div {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      & > .left {
        margin-right: 5px;

        &.subscription {
          color: #63b738;
        }

        &.unsubscription {
          color: #c65a5a;
        }
      }

      & > .icon {
        display: flex;
        align-items: center;
        margin-right: 5px;
        cursor: pointer;
        padding: 2px;

        &:hover {
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.1);
        }

        .el-icon {
          transition: transform 0.3s ease-in-out;
        }
      }

      & > .check {
        display: flex;
        align-items: center;
        margin-right: 5px;
      }

      & > .title {
        flex: 1;
      }

      & > .update {
        width: 10vw;
      }

      & > .author {
        width: 20vw;
      }

      & > .votes {
        width: 10vw;
        display: flex;
        margin-right: 10px;
        justify-content: flex-end;

        & > a {
          display: flex;
          align-items: center;
        }

        & > a + a {
          margin-left: 5px;
        }
      }

      &.is-active {
        .icon > .el-icon {
          transform: rotate(90deg);
        }
      }

      & + .workshop-collection-item {
        margin-top: 2px;
      }
    }

    .workshop-collection-extend {
      font-size: 12px;
      align-items: center;
      border-top: var(--theme-card-border-color) solid 1px;
      padding: 5px 10px 5px 5px;
    }
  }
}
</style>

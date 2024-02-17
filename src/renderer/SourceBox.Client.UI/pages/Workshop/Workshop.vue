<template>
  <el-container
    id="workshop"
    v-loading="loading"
    v-infinite-scroll="loadingItem"
    element-loading-text="加载订阅中..."
    element-loading-custom-class="v-loading-custom"
    class="w-container"
  >
    <el-header>
      <h1>
        创意工坊
        <a style="font-size: 14px">(共{{ rawDetails.length }}订阅, 占用 {{ totalSize }})</a>
      </h1>
      <el-button class="subscription" @click="refreshWorkshopItems">
        <template #icon>
          <i-material-symbols:refresh />
        </template>
        刷新
      </el-button>
      <el-button class="subscription" @click="collection.openWorkshopCollection()">
        <template #icon>
          <i-material-symbols:add />
        </template>
        订阅合集
      </el-button>
      <el-button :class="{ filter: true, active: showFilter }" @click="showFilterHandler">
        <template #icon>
          <i-material-symbols:filter-alt />
        </template>
        筛选器
        <el-icon>
          <i-material-symbols:arrow-forward-ios />
        </el-icon>
      </el-button>
    </el-header>
    <el-main v-if="loading || details.length">
      <WinCollapse :show="showFilter">
        <div class="workshop-options">
          <el-select v-model="selectSort" class="no-input" @change="selectChangeHandler">
            <el-option v-for="item in workshopSorts" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="selectTag" class="no-input" @change="selectChangeHandler">
            <el-option v-for="item in workshopTags" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
      </WinCollapse>
      <div>
        <WorkshopItem v-for="(detail, index) in details.slice(0, showCount)" :key="index.toString()" :item="detail" />
      </div>
    </el-main>
    <el-empty v-else description="当前应用无订阅信息">
      <el-button class="win" @click="gotoSetting">转到 "设置" 更改AppID</el-button>
    </el-empty>
    <WorkshopCollection ref="collection" v-model="rawDetails" />
    <el-backtop target="#workshop" :right="50" :bottom="50" @click="showCount = 10" />
  </el-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import router from '@desktop/services/router'
import useCounterStore from '@desktop/services/store'
import { chunkArray, uniqueArray, API, Files } from '@renderer/utils'

import WinCollapse from '@desktop/components/WinCollapse.vue'
import WorkshopItem from './WorkshopItem.vue'
import WorkshopCollection from './WorkshopCollection.vue'

import type { SteamPlayerInfo } from '@renderer/utils/api/types'

interface ItemsInfo {
  tags: string[]
  items: WorkshopItemDetail[]
}

interface SelectSlot {
  label: string
  value: string
}

const store = useCounterStore()

const collection = ref()

const SPLITE_LENGTH = 10

const rawDetails = ref<WorkshopItemDetail[]>([])
const workshopSorts = ref<SelectSlot[]>([
  { label: '文件大小', value: 'size' },
  { label: '创建时间', value: 'create' },
  { label: '更新时间', value: 'update' }
])
const workshopTags = ref<SelectSlot[]>([{ label: '全部类型', value: 'all' }])
const selectSort = ref('update')
const selectTag = ref('all')
const loading = ref(true)
const showFilter = ref(false)
const showCount = ref(SPLITE_LENGTH)
const totalSize = computed(() => {
  let size = 0n
  for (const item of rawDetails.value) {
    if (!item.install_info) continue
    size += item.install_info.sizeOnDisk
  }
  return Files.sizeof(size)
})

const details = computed(() => {
  let data = rawDetails.value
  // 首先排序
  switch (selectSort.value) {
    case 'size':
      data.sort((a, b) => {
        const aSize = a.install_info?.sizeOnDisk || 0n
        const bSize = b.install_info?.sizeOnDisk || 0n
        if (aSize < bSize) {
          return 1
        } else if (aSize > bSize) {
          return -1
        } else {
          return 0
        }
      })
      break
    case 'create':
      data.sort((a, b) => b.timeCreated - a.timeCreated)
      break
    case 'update':
      data.sort((a, b) => b.timeUpdated - a.timeUpdated)
      break
  }
  if (selectTag.value != 'all') {
    data = data.filter((val) => val.tags.includes(selectTag.value))
  }
  return data
})

const showFilterHandler = () => {
  showCount.value = SPLITE_LENGTH
  showFilter.value = !showFilter.value
}

const selectChangeHandler = () => {
  showCount.value = SPLITE_LENGTH
}

const loadingItem = () => {
  showCount.value += SPLITE_LENGTH
}

const gotoSetting = () => {
  router.replace('/setting')
}

const loadPlayerWorkshopItems = async () => {
  const itemIds = await window.steamworks.run('steamugc.getSubscribedItems')
  const items = await window.steamworks.run('steamugc.getItems', itemIds)
  // 如果获取到了物品列表
  if (items != undefined) {
    const nowtime = Math.floor(new Date().getTime() / 1000) // 当前时间: 秒
    const res: ItemsInfo = { tags: [], items: [] }
    const steamidDict: SteamPlayerInfo[] = []
    // 批量查询工坊作者SteamID
    const steamidRaw = uniqueArray(items.map((v) => (v ? v.owner.steamId64 : 0n)))
    for (const steamids of chunkArray(steamidRaw, 100)) {
      const response = await API.Steam.GetPlayerSummaries(steamids)
      if (response && response.players.length) {
        steamidDict.push(...response.players)
      }
    }
    // 遍历物品列表
    for (const item of items) {
      if (!item) continue
      // 添加订阅包含的tags
      for (const tag of item.tags) {
        if (!res.tags.find((v) => v == tag)) {
          res.tags.push(tag)
        }
      }
      // 查询物品信息
      const install_info = await window.steamworks.run('steamugc.getItemInstallInfo', item.publishedFileId)
      // 查询作者真实名称
      const player = steamidDict.find((v) => item.owner.steamId64 == BigInt(v.steamid))
      res.items.push({
        author: player?.personaname || 'Unknown',
        timeDistance: nowtime - item.timeUpdated,
        ...item,
        install_info
      })
    }
    return res
  } else {
    return undefined
  }
}

const refreshWorkshopItems = async () => {
  loading.value = true
  // 获取当前订阅的创意工坊
  const res = await loadPlayerWorkshopItems()
  if (res) {
    rawDetails.value = res.items
    workshopTags.value = res.tags.map((v) => ({ label: v, value: v }))
  }
  // 加载完毕
  loading.value = false
}

onMounted(async () => {
  // 设置应用App用于查询
  await window.steamworks.run('setAppid', store.steamApp.id)
  // 加载创意工坊内容
  await refreshWorkshopItems()
})

onUnmounted(() => {
  window.steamworks.run('setAppid', 480)
})
</script>

<style lang="scss" scoped>
.el-container {
  :deep(.v-loading-custom) {
    .circular > .path {
      stroke: var(--theme-menu-font-color);
    }
    .el-loading-text {
      color: var(--theme-menu-font-color);
    }
  }

  .el-header {
    .el-button + .el-button {
      margin-left: 4px;
    }

    .el-button.subscription {
      color: var(--theme-btn-color);
      background-color: transparent;
      border: none;

      &:hover {
        background-color: var(--theme-btn-bg-color);
      }
    }

    .el-button.filter {
      --t-bg-color: transparent;
      --t-border-color: transparent;
      color: var(--theme-btn-color);
      background-color: var(--t-bg-color);
      border: var(--t-border-color) solid 1px;

      .el-icon {
        margin-left: 10px;
        transform: rotate(90deg);
        transition: transform 200ms ease-in-out;
      }

      &.active {
        --t-bg-color: var(--theme-btn-bg-color);
        --t-border-color: var(--theme-btn-border-color);

        .el-icon {
          transform: rotate(-90deg);
        }
      }
    }
  }

  .el-empty {
    height: 100%;
  }
}

.workshop-options {
  width: 100%;
  padding: 22px;
  border-radius: 10px;
  background-color: var(--theme-card-bg-color);
  margin-bottom: 10px;

  .el-select + .el-select {
    margin-left: 10px;
  }
}
</style>

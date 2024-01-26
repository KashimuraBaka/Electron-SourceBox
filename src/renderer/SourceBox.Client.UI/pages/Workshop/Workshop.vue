<template>
  <el-container
    v-loading="loading"
    element-loading-text="加载订阅中..."
    element-loading-custom-class="v-loading-custom"
  >
    <el-header>创意工坊订阅 共{{ details.length }}订阅</el-header>
    <el-main v-if="support">
      <WorkshopItem
        v-for="(detail, index) in details"
        :key="index.toString()"
        :item="detail"
        :authorname="findAuthorName(detail)"
      />
    </el-main>
    <el-empty v-else description="当前应用不支持创意工坊">
      <el-button class="win" @click="gotoSetting">转到 "设置"</el-button>
    </el-empty>
  </el-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

import WorkshopItem from './WorkshopItem.vue'
import { chunkArray, uniqueArray } from '@renderer/utils'
import { Steam } from '@renderer/utils/api'
import { SteamPlayerInfo } from '@renderer/utils/api/types'
import router from '@renderer/services/router'

const rawDetails = ref<(WorkshopItem | null)[]>([])
const steamidMap = ref<SteamPlayerInfo[]>([])
const support = ref(true)
const loading = ref(true)

const details = computed(() => {
  return rawDetails.value.filter((val) => {
    if (!val) return false
    return true
  }) as WorkshopItem[]
})

const findAuthorName = (val: WorkshopItem) => {
  const steamid64 = val.owner.steamId64.toString()
  const res = steamidMap.value.find((v) => steamid64 == v.steamid)
  return res ? res.personaname : steamid64
}

const gotoSetting = () => {
  router.replace('/setting')
}

onMounted(async () => {
  const itemIds = await window.steamworks.run('steamugc.getSubscribedItems')
  const items = await window.steamworks.run('steamugc.getItems', itemIds)
  if (items != undefined) {
    rawDetails.value = items
    // 批量查询SteamID
    const steamidRaw = uniqueArray<bigint>(
      rawDetails.value.map((v) => (v ? v.owner.steamId64 : 0n))
    )
    const steamidChunk = chunkArray<bigint>(steamidRaw, 100)
    for (const steamids of steamidChunk) {
      const res = await Steam.GetPlayerSummaries(steamids)
      if (res && res.players.length) {
        steamidMap.value = res.players
      }
    }
  } else {
    support.value = false
  }
  loading.value = false
})
</script>

<style lang="scss" scoped>
.el-container {
  height: 100%;
  width: 100%;

  :deep(.v-loading-custom) {
    .circular > .path {
      stroke: var(--theme-menu-font-color);
    }
    .el-loading-text {
      color: var(--theme-menu-font-color);
    }
  }

  .el-header {
    display: flex;
    align-items: center;
    height: 40px;
  }

  .el-main {
    padding: 0 12px;
    box-sizing: border-box;
  }

  .el-empty {
    height: 100%;
  }
}
</style>

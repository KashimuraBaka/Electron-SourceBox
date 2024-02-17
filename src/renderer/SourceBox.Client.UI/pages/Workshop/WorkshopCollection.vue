<template>
  <el-drawer
    v-model="dialogVisible"
    size="100%"
    modal-class="win-page"
    :with-header="false"
    :close-on-press-escape="false"
    destroy-on-close
    @open="drawerOnOpen"
    @closed="drawerOnClose"
  >
    <el-container class="w-container main">
      <el-header>
        <el-button text @click="dialogVisible = false">
          <template #icon>
            <i-material-symbols:arrow-back-ios-new />
          </template>
        </el-button>
        <h1>创意工坊合集查询</h1>
      </el-header>
      <el-container class="workshop-collection-list">
        <!--
          合集查询
         -->
        <el-header>
          <div class="workshop-query">
            <el-input v-model="inputWorkshopColleciton" placeholder="请输入创意工坊合集 链接 或 ID" :disabled="inputWorkshopLoading" />
            <el-button :loading="inputWorkshopLoading" :disabled="!inputWorkshopColleciton.length" class="win" @click="queryCollection">
              <template #icon><i-material-symbols:search /></template>
              查询
            </el-button>
          </div>
          <div class="workshop-content">注意: 使用该功能需要通过魔法上网, 不然无法查询到结果</div>
        </el-header>
        <!--
          收藏合集列表
         -->
        <el-main>
          <el-table
            :data="collectionlist"
            class="w-table_1 full"
            size="small"
            row-class-name="table-row-bg"
            :row-style="tableRowStyle"
            @row-click="tableRowClick"
          >
            <el-table-column label="ID" prop="id" width="100" />
            <el-table-column label="名称" prop="title" />
            <el-table-column label="更新时间" width="160">
              <template #default="{ row }">
                <div v-if="!row.create_time">--</div>
                <div v-else>{{ row.create_time }}</div>
              </template>
            </el-table-column>
            <el-table-column label="已订阅/物品数量" width="120">
              <template #default="{ row }">
                <div v-if="!row.items.length">--</div>
                <div v-else>{{ getCollectionSubscriptionCount(row) }}/{{ row.items.length }}</div>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-container>
    <WorkshopCollectionItem ref="cCollectionItems" v-model:subscription-items="items" v-model:collection-list="collectionlist" />
  </el-drawer>
</template>

<script lang="tsx" setup>
import { ref, computed } from 'vue'
import { API } from '@renderer/utils'
import useCounterStore from '@desktop/services/store'
import El from '@renderer/utils/element-plus'

import type { TSteamWorkshopCollectionDetails } from '@renderer/utils/api/types'

import WorkshopCollectionItem from './WorkshopCollectionItem.vue'

// 传入当前订阅信息
const props = defineProps<{
  modelValue: WorkshopItemSubscriptionDetail[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: WorkshopItemSubscriptionDetail[]): void
}>()

// 修改父组件传入的订阅信息
const items = computed({
  get: () => props.modelValue,
  set: (val: WorkshopItemSubscriptionDetail[]) => {
    emit('update:modelValue', val)
  }
})

const store = useCounterStore()

const cCollectionItems = ref()

const collectionlist = ref<TSteamWorkshopCollectionDetails<WorkshopCollectionItem>[]>([])
const dialogVisible = ref(false)
const inputWorkshopLoading = ref(false)
const inputWorkshopColleciton = ref('https://steamcommunity.com/sharedfiles/filedetails/?id=3070739825')

const drawerOnOpen = async () => {
  const collection_info = await window.config.get('starlist', 'collections', 730, [])
  for (const info of collection_info) {
    collectionlist.value.push({
      appid: 0,
      app_name: '',
      id: info.id,
      author: '',
      title: info.name,
      content: '',
      background: '',
      create_time: '',
      update_time: '',
      items: []
    })
    asyncQueryCollection(info.id)
      .then((res) => {
        const index = collectionlist.value.findIndex((v) => v.id == info.id)
        if (index != -1) {
          collectionlist.value[index] = res
        }
      })
      .catch(() => {})
  }
}
const drawerOnClose = () => {
  collectionlist.value = []
}

const asyncQueryCollection = async (collection_id: number): Promise<TSteamWorkshopCollectionDetails<WorkshopCollectionItem>> => {
  // 开始合集输入框是否为合法合集ID
  if (isNaN(collection_id)) {
    const [, id] = inputWorkshopColleciton.value.match(/id=(\d+)/) || []
    if (!id) {
      throw new Error('输入合集链接有误, 请核对是否是ID或者该集合的链接!')
    } else {
      collection_id = Number(id)
    }
  }
  const res = await API.Steam.GetWorkshopCollectionDetails(collection_id)
  // 无法请求到Api
  if (!res) {
    throw new Error('获取失败! 请尝试使用魔法上网查询合集')
  }
  // 获取不到合集结果
  if (!res.success || !res.data) {
    throw new Error('获取失败! 该集合可能不存在或被收集者设置隐藏')
  }
  // 通过 Steamworks接口 完善 Web API 获取到的信息
  const { items } = res.data
  const cacheData: WorkshopCollectionItem[] = []
  const workshopIds = items.map((v) => v.id)
  const itemsDetail = await window.steamworks.run('steamugc.getItems', workshopIds)
  // 完善信息
  for (const item_detail of items) {
    const item = itemsDetail.find((v) => v?.publishedFileId == item_detail.id)
    if (item) {
      cacheData.push({
        checked: false,
        item: {
          author: item_detail.author,
          ...item
        }
      })
    }
  }
  // 排序更新时间
  return {
    ...res.data,
    items: cacheData.sort((a, b) => b.item.timeUpdated - a.item.timeUpdated)
  }
}

const queryCollection = async () => {
  // 开始合集输入框是否为合法合集ID
  const collection_id = Number(inputWorkshopColleciton.value)
  inputWorkshopLoading.value = true
  const response = await asyncQueryCollection(collection_id)
    .then(async (res) => {
      // 获取到的合集跟当前绑定AppID不符合
      if (
        res.appid != store.steamApp.id &&
        !(await El.MessageBox.ConfirmAsync(
          <div>
            <p style="color: indianred; font-size: 14px">
              发现集合「{res.app_name}」与当前绑定游戏「{store.steamApp.name}」不一致!
            </p>
            <p style="font-size: 12px">注意: 强行订阅非当前绑定游戏的合集, 将不会显示在当前创意工坊订阅列表上.</p>
            <p style="margin-top: 10px; font-size: 18px">是否继续查看当前合集订阅?</p>
          </div>,
          'Warning',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            appendTo: '#workshop',
            customClass: 'fit',
            showClose: false,
            closeOnClickModal: false,
            type: 'warning'
          }
        ))
      ) {
        return undefined
      } else {
        return res
      }
    })
    .catch((e: Error) => {
      ElMessage.error({
        message: e.message,
        appendTo: '#workshop'
      })
      return undefined
    })

  // 返回查询结果
  if (
    response &&
    (await El.MessageBox.ConfirmAsync(
      <div
        {...{
          style: {
            minWidth: '380px',
            padding: '5px',
            borderRadius: '5px',
            background: `linear-gradient(
              rgba(0, 0, 0, 0.5),
              rgba(0, 0, 0, 0.5)),
              url(${response.background}) no-repeat 0% 20%/ cover`
          }
        }}
      >
        <p>收集者: {response.author}</p>
        <p>创建时间: {response.create_time}</p>
        <p>更新时间: {response.update_time}</p>
        <p>该集合共有 {response.items.length} 物品</p>
        <div
          {...{
            style: {
              padding: '5px',
              borderRadius: '5px',
              background: '#000000aa',
              backdropFilter: 'blur(10px)'
            }
          }}
          v-html={response.content}
        ></div>
      </div>,
      `${response.title}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        appendTo: '#workshop',
        showClose: false,
        closeOnClickModal: false,
        customClass: 'fit'
      }
    ))
  ) {
    cCollectionItems.value.showCollectionItems(response)
  }
  inputWorkshopLoading.value = false
}

const getCollectionSubscriptionCount = (row: TSteamWorkshopCollectionDetails<WorkshopCollectionItem>) => {
  let count = 0
  for (const item of row.items) {
    if (props.modelValue.findIndex((v) => v.publishedFileId == item.item.publishedFileId) != -1) {
      count++
    }
  }
  return count
}

const tableRowStyle = ({ row }: { row: TSteamWorkshopCollectionDetails<WorkshopCollectionItem> }) => {
  return { '--t-bg-image': `url(${row.background})` }
}

const tableRowClick = (row: TSteamWorkshopCollectionDetails<WorkshopCollectionItem>) => {
  if (row.items.length) {
    cCollectionItems.value.showCollectionItems(row)
  } else {
    ElMessage.warning({ message: '该合集内容为空', appendTo: '#workshop' })
  }
}

defineExpose({
  async openWorkshopCollection() {
    dialogVisible.value = true
  }
})
</script>

<style lang="scss" scoped>
.el-container.main {
  height: 100%;
  overflow: hidden;

  & > .el-header {
    .el-button:first-child {
      font-size: 24px;
      padding: 0 4px;
      margin-right: 10px;
    }
  }

  & > .el-main {
    height: 100%;
    display: flex;
  }
}

.el-container.workshop-collection-list {
  & > .el-header {
    flex-direction: column;
    padding: 0 0 10px;
    height: auto;

    .workshop-query {
      display: flex;
      align-items: center;

      .el-button {
        margin-left: 10px;
      }
    }

    .workshop-content {
      font-size: 14px;
      margin-top: 4px;
    }
  }

  & > .el-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;

    .el-table {
      .el-link {
        font-size: 12px;
      }

      :deep(.table-row-bg) {
        --t-bg-image: '';
        z-index: 1;
        position: relative;

        &::after {
          --t-left: 40%;
          content: '';
          z-index: -1;
          position: absolute;
          border-radius: 5px;
          inset: 0;
          mask: linear-gradient(to right, transparent calc(var(--t-left) + 5%), rgba(0, 0, 0, 0.15) 50%, rgba(0, 0, 0, 0.35) 100%);
          background-image: var(--t-bg-image);
          background-size: calc(100% - var(--t-left)) auto;
          background-position: bottom 50% right;
          background-repeat: no-repeat;
        }
      }
    }
  }
}
</style>

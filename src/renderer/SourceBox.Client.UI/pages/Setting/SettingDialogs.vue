<template>
  <el-dialog
    v-model="dialogVisible"
    modal-class="w-modal"
    width="350"
    top="25vh"
    :show-close="false"
    @opened="handleOpen"
    @closed="handleClose"
  >
    <template #header>修改当前 AppID</template>
    <div class="container">
      <el-autocomplete
        v-model="editAppid"
        value-key="appid"
        popper-class="w-autocomplete"
        fit-input-width
        :teleported="false"
        :disabled="!appids.length"
        :fetch-suggestions="querySearchAsync"
        @select="handleSelect"
      >
        <template #default="{ item }">
          <div class="key">({{ item.appid }})</div>
          <div class="value">{{ item.name || '未发布' }}</div>
        </template>
        <template #suffix>
          <el-icon v-if="!appids.length" class="is-loading">
            <Loading />
          </el-icon>
        </template>
      </el-autocomplete>
      <span class="title">{{ appName }}</span>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmChangeAppid">修改</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Steam } from '@renderer/utils/api'
import { TSteamAppid } from '@renderer/utils/api/types'
import { ref } from 'vue'

import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits<{
  (e: 'appidChange', value: { appid: number; name: string }): void
}>()
const dialogVisible = ref(false)
const editAppid = ref('')
const appids = ref<TSteamAppid<string>[]>([])
const appName = ref('')

const handleOpen = async () => {
  const res = await Steam.GetAppList()
  if (dialogVisible.value) {
    appids.value = res
  } else {
    appids.value = []
  }
}

const handleClose = () => {
  appids.value = []
}

const querySearchAsync = (queryString: string, cb: (arg: TSteamAppid<string>[]) => void) => {
  const lowerQuery = queryString.toLocaleLowerCase()
  if (lowerQuery.length && appids.value.length) {
    const result = isNaN(Number(lowerQuery))
      ? appids.value.filter((v) =>
          v.name.length ? v.name.toLocaleLowerCase().includes(lowerQuery) : false
        )
      : appids.value.filter((v) => v.appid.toString().slice(0, lowerQuery.length) == lowerQuery)
    cb(result.slice(0, 25))
  } else {
    cb(appids.value.slice(0, 25))
  }
}

const handleSelect = (item: Record<string, any>) => {
  appName.value = item.name
}

const openWithAppID = ({ id, name }: { id: number; name: string }) => {
  editAppid.value = id.toString()
  appName.value = name
  dialogVisible.value = true
}

const confirmChangeAppid = async () => {
  const appid = Number(editAppid.value)
  const res = await window.steamworks.run('steamapps.isSubscribedApp', appid)
  if (res) {
    emit('appidChange', {
      appid: Number(editAppid.value),
      name: appName.value
    })
    dialogVisible.value = false
  } else {
    ElMessage.error('当前未购买此游戏')
  }
}

defineExpose({
  openWithAppID
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;

  .title {
    margin-top: 5px;
  }

  .key {
    margin-right: 5px;
    font-size: 13px;
  }

  .value {
    font-size: 12px;
    overflow: hidden; // 超出的文本隐藏
    text-overflow: ellipsis; // 溢出用省略号显示
    white-space: nowrap; // 溢出不换行
  }

  :deep(.el-autocomplete) {
    width: 100%;
  }
}
</style>

<template>
  <el-container id="server">
    <el-header>
      <a>服务器列表</a>
      <div class="btns">
        <!-- 刷新服务器 -->
        <el-button :loading="refreshing" @click="blockRefresh">
          <template #icon>
            <i-material-symbols:refresh />
          </template>
          <template #loading>
            <el-icon class="is-loading">
              <i-material-symbols:refresh />
            </el-icon>
          </template>
        </el-button>
        <!-- 添加服务器 -->
        <el-button @click="addCustomServer">
          <template #icon>
            <i-mdi:server-plus />
          </template>
        </el-button>
      </div>
    </el-header>
    <el-main>
      <el-table class="w-table_1 full" :data="tableData" size="small" @row-click="openExtend">
        <el-table-column prop="status" width="25">
          <template #default="{ row }">
            <div :class="getDelayClass(row.Delay)" />
          </template>
        </el-table-column>
        <el-table-column prop="Name" label="服务器" />
        <el-table-column prop="IP" label="IP" width="165" />
        <el-table-column label="人数" width="45">
          <template #default="{ row }">{{ row.Player }}/{{ row.PlayerMax }}</template>
        </el-table-column>
        <el-table-column prop="Map" label="地图" width="185" />
        <el-table-column label="延迟" width="60">
          <template #default="{ row }">
            {{ row.Delay == -1 ? '超时' : `${row.Delay}ms` }}
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <!-- 服务器列表扩展选项 -->
    <ServersDialogs ref="drawer" @remove="removeCustomServer" />
  </el-container>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import ServersDialogs from './ServersDialogs.vue'

const drawer = ref()

let timer: NodeJS.Timeout | undefined

const tableData = reactive<A2S.SourceServerInfoFormIP[]>([])
const refreshing = ref(false)

const getDelayClass = (delay: number) => {
  if (delay > -1) {
    if (delay > 100) {
      return 'dot warning'
    }
    return 'dot success'
  } else {
    return 'dot error'
  }
}

/**
 * 添加自定义服务器信息
 */
const addCustomServer = () => {
  ElMessageBox.prompt('请输出要添加的自定义服务器IP', '添加自定义服务器', {
    confirmButtonText: '添加',
    cancelButtonText: '取消',
    appendTo: '#server',
    showClose: false,
    inputPlaceholder: '格式: ***.***.***.***:27015 (支持域名)',
    inputPattern: /^(\d{1,3}\.\d{1,3}\.\d{1,3}.\d{1,3}|(\w*\.|)\w*\.\w*):(\d{1,5})$/,
    inputErrorMessage: '请输入正确的服务器IP/端口，例子: 127.0.0.1:27015'
  })
    .then(({ value }) => {
      if (tableData.findIndex((v) => v.IP == value) != -1) {
        ElMessage.error({
          message: '添加失败，服务器列表已存在！',
          appendTo: '#server'
        })
      } else {
        tableData.push(createNewList(value))
        window.config.set(
          'starlist',
          'servers',
          tableData.map((v) => v.IP)
        )
      }
    })
    .catch(() => undefined)
}

const removeCustomServer = (address: string) => {
  const index = tableData.findIndex((v) => v.IP == address)
  if (index != -1) {
    tableData.splice(index, 1)
    window.config.set(
      'starlist',
      'servers',
      tableData.map((v) => v.IP)
    )
  }
}

const createNewList = (IP: string) => ({
  IP,
  Delay: -1,
  Protocol: 0,
  Name: '',
  Map: '',
  Folder: '',
  Game: '',
  AppID: 0,
  Player: 0,
  PlayerMax: 0,
  Robot: 0,
  ServerType: '',
  Envirnoment: '',
  Visibility: false,
  Vac: false,
  Version: '',
  Port: 0,
  SteamID: 0n,
  TVPort: 0,
  TVName: '',
  Tags: '',
  GameID: 0n
})

const blockRefresh = () => {
  refreshing.value = true
  refreshTable()
  setTimeout(() => {
    refreshing.value = false
  }, 500)
}

/** 刷新服务器列表 */
const refreshTable = async () => {
  clearInterval(timer)
  for (let i = 0; i < tableData.length; i++) {
    window.steamworks.run('simpleQueryServer', tableData[i].IP).then((res) => {
      if (res.Delay == -1) {
        tableData[i].Delay = -1
      } else {
        tableData[i] = {
          ...tableData[i],
          ...res
        }
      }
    })
  }
  timer = setTimeout(() => refreshTable(), 5000)
}

/** 打开右侧扩展菜单 */
const openExtend = (row: A2S.SourceServerInfoFormIP) => {
  if (row.Delay != -1) {
    drawer.value.openWithServer(row)
  }
}

onMounted(async () => {
  const serversIP: string[] = await window.config.get('starlist', 'servers')
  serversIP.forEach((val) => tableData.push(createNewList(val)))
  refreshTable()
})

/** 取消自动刷新服务器 */
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.el-container {
  position: relative;
  height: 100%;
  width: 100%;

  .el-header {
    height: 40px;
    display: flex;
    align-items: center;

    & > a {
      flex: 1;
    }

    .btns {
      .el-button {
        padding: 0;
        width: 32px;
        height: 32px;
        border: 0;

        &:hover {
          color: var(--theme-btn-color);
          background-color: var(--theme-btn-hover-bg-color);
        }

        &:focus {
          color: var(--theme-btn-color);
          background: none;
        }

        :deep(.el-icon) {
          width: 24px;
          height: 24px;
          font-size: 24px;
        }

        & + .el-button {
          margin-left: 4px;
        }
      }
    }
  }
  .el-main {
    padding: 0 10px;
  }
}

// 状态圆点
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  &.success {
    background-color: #22b848;
  }

  &.error {
    background-color: #b82c22;
  }
  &.warning {
    background-color: #b87e28;
  }
}
</style>

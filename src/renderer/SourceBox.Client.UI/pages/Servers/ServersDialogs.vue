<template>
  <div id="overlay">
    <el-drawer v-model="display" :show-close="false" :with-header="false" modal-class="w-modal" size="50%">
      <div class="container">
        <div class="header">
          <el-tag>{{ raw?.Folder }}</el-tag>
          <span>
            {{ raw?.Name }}
          </span>
        </div>
        <div class="main">
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="当前地图">{{ raw?.Map }}</el-descriptions-item>
            <el-descriptions-item label="服务器环境">{{ raw?.Envirnoment }}</el-descriptions-item>
            <el-descriptions-item label="服务器类型"> {{ raw?.ServerType }} [{{ raw?.Visibility ? '私人' : '公开' }}] </el-descriptions-item>
            <el-descriptions-item label="人数"> {{ raw?.Player }}/{{ raw?.PlayerMax }} </el-descriptions-item>
            <el-descriptions-item label="VAC保护">
              {{ raw?.Vac ? '启用' : '禁用' }}
            </el-descriptions-item>
            <el-descriptions-item label="标签">
              {{ raw?.Tags }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="info">
          <el-radio-group v-model="selectMode" @change="refreshModeInfo">
            <el-radio-button label="玩家" />
            <el-radio-button label="参数" />
          </el-radio-group>
          <el-table v-if="selectMode == '玩家'" class="w-table_2 full" :data="players" size="small">
            <el-table-column label="玩家">
              <template #default="{ row }">
                {{ row.Name || '正在载入中...' }}
              </template>
            </el-table-column>
            <el-table-column prop="Score" label="分数" width="80" />
            <el-table-column prop="Time" label="游玩时间" width="80" />
          </el-table>
          <el-table v-else class="w-table_2" :data="rules" size="small">
            <el-table-column prop="Convar" label="参数" width="230" />
            <el-table-column prop="Value" label="数值" />
          </el-table>
        </div>
        <div class="btns">
          <el-button size="large" type="danger" @click="deleteServer">删除服务器</el-button>
          <el-button size="large" @click="refreshInfo">刷新</el-button>
          <el-button-group size="large">
            <el-button @click="connectToServer">进入服务器</el-button>
            <el-button :icon="CaretRight" @click="openForceConnect" />
          </el-button-group>
        </div>
      </div>
    </el-drawer>
    <!-- 挤服工具 -->
    <el-dialog v-model="enableGoServer" class="c-dialog" modal-class="w-modal" align-center :width="380" :show-close="false">
      <template #header>挤服小助手</template>
      <div class="content">
        <div><span>服务器</span>{{ raw?.Name }}</div>
        <div><span>地址</span>{{ raw?.IP }}</div>
        <div><span>人数</span>{{ raw?.Player }}/{{ raw?.PlayerMax }} [{{ raw?.Delay }}ms]</div>
      </div>
      <div class="option">
        <div>
          <h1>检测人数</h1>
          <el-input v-model="connectOptions.player" :disabled="connectOptions.start" />
        </div>
        <div>
          <h1>频率</h1>
          <el-input v-model="connectOptions.delay" :disabled="connectOptions.start">
            <template #append>ms</template>
          </el-input>
        </div>
      </div>
      <template #footer>
        <span>
          <el-button @click="closeForceConnect">取消</el-button>
          <el-button :type="connectOptions.start ? 'danger' : 'primary'" @click="runForceConnect">
            {{ connectOptions.start ? '停止' : '开始' }}
          </el-button>
        </span>
        <el-progress v-show="connectOptions.start" :percentage="50" :indeterminate="true" :show-text="false" :stroke-width="8" :duration="1.5" />
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { CaretRight } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { SteamConsole } from '@renderer/utils'
import useCounterStore from '@desktop/services/store'

let check_timer: NodeJS.Timeout

const emit = defineEmits<{
  (e: 'remove', value: string): void
}>()

const store = useCounterStore()

const display = ref(false)
const raw = ref<A2S.SourceServerInfoFormIP>()
const players = ref<A2S.SourceServerPlayer[]>([])
const rules = ref<A2S.SourceServerRule[]>([])
const enableGoServer = ref(false)
const connectOptions = reactive({
  start: false,
  player: 0,
  delay: 300
})
const selectMode = ref('玩家')

const refreshModeInfo = (mode: string | number | boolean) => {
  if (!raw.value) return
  const ip = raw.value.IP
  switch (mode) {
    case '玩家': {
      players.value = []
      window.steamworks.run('queryServerPlayers', ip).then(({ Players }) => {
        if (ip == raw.value?.IP) {
          players.value = Players
        }
      })
      break
    }
    case '参数': {
      rules.value = []
      window.steamworks.run('queryServerRules', ip).then(({ Rules }) => {
        if (ip == raw.value?.IP) {
          rules.value = Rules
        }
      })
      break
    }
  }
}

const connectToServer = () => {
  if (!raw.value) return
  SteamConsole.connect(raw.value.IP)
  if (store.web.enable) {
    store.createSourceServerMessage(raw.value.IP)
  }
}

/** 开始检测服务器人数 */
const runForceConnect = () => {
  connectOptions.start = !connectOptions.start
  if (connectOptions.start) {
    const check = () => {
      if (connectOptions.start && raw.value) {
        window.steamworks.run('simpleQueryServer', raw.value.IP).then((res) => {
          if (connectOptions.start && raw.value) {
            raw.value.Player = res.Player
            raw.value.PlayerMax = res.PlayerMax
            raw.value.Delay = res.Delay
            if (connectOptions.player > raw.value.Player) {
              connectOptions.start = false
              connectToServer()
            }
          }
        })
      } else {
        clearInterval(check_timer)
      }
    }
    check()
    check_timer = setInterval(check, connectOptions.delay)
  }
}

const refreshInfo = () => {
  if (raw.value) {
    refreshModeInfo(selectMode.value)
  }
}

const openForceConnect = () => {
  enableGoServer.value = true
  if (raw.value) {
    if (raw.value.Player < raw.value.PlayerMax) {
      connectOptions.player = raw.value.Player + 1
    } else {
      connectOptions.player = raw.value.PlayerMax
    }
  }
}

const closeForceConnect = () => {
  connectOptions.start = false
  enableGoServer.value = false
}

const deleteServer = () => {
  ElMessageBox.confirm('是否删除服务器', 'Warning', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    showClose: false,
    appendTo: '#overlay',
    type: 'warning'
  })
    .then(() => {
      emit('remove', raw.value?.IP || '')
      display.value = false
    })
    .catch(() => {})
}

defineExpose({
  async openWithServer(data: A2S.SourceServerInfoFormIP) {
    display.value = true
    selectMode.value = '玩家'
    raw.value = data
    refreshModeInfo(selectMode.value)
  }
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  height: 100%;
  font-size: 12px;
  flex-direction: column;
  box-sizing: border-box;

  --t-bg-color: hsl(from var(--el-drawer-bg-color) h s calc(l - 0.02));

  & > div:not(:last-child) {
    border-radius: 8px;

    & + div:not(:last-child) {
      margin-top: 5px;
    }
  }

  .header {
    display: flex;
    padding: 4px 8px;
    align-items: center;
    margin-bottom: 4px;
    background-color: color-mix(in srgb, var(--t-bg-color), transparent 50%);

    .el-tag {
      margin-right: 10px;
    }
  }

  .main {
    padding: 6px 12px;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow: auto;
    background-color: color-mix(in srgb, var(--t-bg-color), transparent 50%);
    box-sizing: border-box;

    .el-radio-group {
      display: flex;
      flex-direction: column;
      align-items: initial;
      flex-wrap: initial;
      border-right: hsl(from var(--el-drawer-bg-color) h s calc(l + 0.03)) solid 1px;

      :deep(.el-radio-button) {
        border: none;

        .el-radio-button__inner {
          color: var(--theme-menu-font-color);
          writing-mode: vertical-rl;
          padding: 8px;
          border: none;
          border-radius: 0;
        }

        &.is-active > .el-radio-button__inner {
          background: var(--theme-menu-active-bg-color);
        }

        &:hover > .el-radio-button__inner {
          color: initial;
        }
      }
    }

    .el-table {
      // 关闭表格边框
      --el-table-border: none;
      --el-table-border-color: transparent;
    }
  }

  .btns {
    margin-top: 10px;
    text-align: right;

    .el-button-group {
      margin-left: 10px;
    }
  }
}

.c-dialog {
  .content {
    font-size: 13px;
    margin-bottom: 10px;

    & > div {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      span {
        white-space: nowrap;
        margin-right: 5px;
      }
    }
  }

  .option {
    display: flex;
    flex-direction: row;

    & > div {
      box-sizing: border-box;
      width: 50%;

      h1 {
        font-weight: normal;
        margin: 0 0 5px 0;
      }

      &:first-child {
        padding-right: 5px;
      }

      &:last-child {
        padding-left: 5px;
      }
    }
  }

  .el-progress {
    inset: auto 0 0 0;
    position: absolute;

    :deep(.el-progress-bar) {
      .el-progress-bar__outer {
        border-radius: 0;
        background-color: transparent;

        .el-progress-bar__inner {
          background-color: #323232;
        }
      }
    }
  }
}
</style>

<template>
  <el-container class="mainwindow">
    <!-- 标题工具栏 -->
    <el-header class="mainwindow-header" height="50px">
      <WinToolBar>
        SourceBox
        <template #extends>
          <el-tag v-if="$route.path.match(/^\/main/)" :type="store.CSteamID.init ? 'success' : 'danger'" disable-transitions>
            {{ store.CSteamID.init ? 'Steam服务已启用' : 'Steam服务已禁用' }}
          </el-tag>
        </template>
      </WinToolBar>
    </el-header>
    <!-- 内容 -->
    <router-view />
  </el-container>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import router from '@desktop/services/router'
import useCounterStore from '@desktop/services/store'

import WinToolBar from '../components/WinToolBar.vue'

const store = useCounterStore()

onMounted(() => {
  router.replace('')
})
</script>

<style lang="scss" scoped>
.mainwindow {
  height: 100%;
  border-radius: 10px;
  user-select: none;

  .mainwindow-header {
    padding: 0;
  }
}
</style>

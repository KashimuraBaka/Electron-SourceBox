<template>
  <el-container class="mainwindow">
    <el-header class="mainwindow-header" height="50px">
      <WinToolBar />
    </el-header>
    <el-container class="mainwindow-views">
      <el-aside class="mainwindow-menu">
        <WinAside />
      </el-aside>
      <el-main class="mainwindow-content">
        <router-view v-slot="{ Component }">
          <transition name="zoom-in-bottom" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import WinToolBar from '../components/WinToolBar.vue'
import WinAside from '../components/WinAside.vue'
</script>

<style></style>

<style lang="scss" scoped>
.mainwindow {
  height: 100%;
  border-radius: 10px;
  user-select: none;

  .mainwindow-header {
    padding: 0;
  }

  .mainwindow-views {
    box-sizing: border-box;
    overflow: hidden;

    .mainwindow-menu {
      width: 70px;
      display: flex;
      justify-content: center;
    }

    .mainwindow-content {
      position: relative;
      padding: 0;
      border-radius: 8px 0 0 0;
      box-sizing: border-box;
      border: 1px solid var(--theme-content-border-color);
      background: var(--theme-content-bg);
      overflow: hidden;

      // 切入动画
      .zoom-in-bottom-enter-active {
        opacity: 1;
        transform: none;
        transition: all 150ms ease-out;
        transform-origin: center bottom;
      }

      .zoom-in-bottom-enter-from {
        opacity: 0;
        position: absolute;
        transform: translate3d(0, 100%, 0);
      }
    }
  }
}
</style>

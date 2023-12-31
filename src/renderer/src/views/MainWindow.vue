<template>
  <el-container class="mainWindow">
    <el-header height="50px">
      <ToolBar />
    </el-header>
    <el-container>
      <el-aside width="70px" class="menu">
        <el-menu :default-active="$route.path" :collapse="true" router>
          <el-menu-item index="/">
            <el-icon>
              <HomeFilled />
            </el-icon>
            <div class="item-name">主页</div>
          </el-menu-item>
          <div class="divider" />
          <el-menu-item index="/servers">
            <el-icon>
              <Postcard />
            </el-icon>
            <div class="item-name">服务器</div>
          </el-menu-item>
          <el-menu-item index="3" disabled>
            <el-icon>
              <document />
            </el-icon>
            <div class="item-name">服务器</div>
          </el-menu-item>
          <el-menu-item index="4">
            <el-icon>
              <setting />
            </el-icon>
            <div class="item-name">服务器</div>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="content">
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
import ToolBar from './components/ToolBar.vue'
import { onMounted } from 'vue'
import { Document, Postcard, HomeFilled, Setting } from '@element-plus/icons-vue'

onMounted(() => {})
</script>

<style lang="scss" scoped>
.mainWindow {
  height: 100%;
  border-radius: 10px;

  .el-header {
    padding: 0;
  }

  .content {
    border-radius: 8px 0 0 0;
    background-color: var(--theme-content-bg-color);
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

.menu {
  display: flex;
  justify-content: center;

  .el-menu {
    --el-menu-border-color: none;

    .divider {
      margin: 8px 0;
      border-top: 1px var(--theme-menu-divider) solid;
    }

    .el-menu-item {
      --menu-item-height-durition: 0.25s;
      color: var(--theme-menu-font-color);
      height: 60px;
      width: 60px;
      margin: 0 auto;
      border-radius: 5px;
      line-height: unset;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;

      .el-icon {
        font-size: 20px;
        will-change: transform;
        transition: transform var(--menu-item-height-durition) ease-in-out;
      }

      .item-name {
        --menu-item-name-height: 13px;
        margin-top: 6px;
        height: calc(var(--menu-item-name-height) + 2px);
        font-size: var(--menu-item-name-height);
        will-change: margin-top;
        transition: margin-top var(--menu-item-height-durition) ease-in-out;
        overflow: hidden;

        &::before {
          display: block;
          content: '';
          height: 0;
          will-change: height;
          transition: height var(--menu-item-height-durition) ease-in-out;
        }
      }

      // 菜单选中
      &.is-active {
        color: var(--theme-menu-active-font-color);
        box-shadow: 0 0 1px 1px var(--theme-menu-active-border) inset;
        background-color: var(--theme-menu-active-bg-color);

        .el-icon {
          transform: translateY(45%);
        }

        .item-name {
          margin-top: inherit;

          &::before {
            content: '';
            height: var(--menu-item-name-height);
          }
        }
      }

      &.is-active::before {
        content: '';
        position: absolute;
        inset: 50% auto auto 0;
        transform: translateY(-50%);
        height: 50%;
        width: 4px;
        border-radius: 4px;
        background-color: var(--theme-menu-active-font-color);
      }
    }
  }
}
</style>

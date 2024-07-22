<template>
  <el-menu :default-active="$route.path" :collapse="true" router>
    <el-menu-item index="/main" class="first">
      <el-icon>
        <HomeFilled />
      </el-icon>
      <div class="item-name">主页</div>
    </el-menu-item>
    <div class="main-menu">
      <el-menu-item index="/main/servers">
        <el-icon>
          <i-teenyicons:servers-outline />
        </el-icon>
        <div class="item-name">服务器</div>
      </el-menu-item>
      <el-menu-item index="/main/workshop">
        <el-icon>
          <i-bi:tools />
        </el-icon>
        <div class="item-name">创意工坊</div>
      </el-menu-item>
    </div>
    <el-menu-item v-if="store.web.enable" index="/main/obsliveoptions">
      <el-icon>
        <i-ic:round-live-tv />
      </el-icon>
      <div class="item-name">OBS设置</div>
    </el-menu-item>
    <el-menu-item index="/main/setting">
      <el-icon>
        <Setting />
      </el-icon>
      <div class="item-name">设置</div>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { HomeFilled, Setting } from '@element-plus/icons-vue'
import useCounterStore from '@desktop/services/store'

const store = useCounterStore()
</script>

<style lang="scss" scoped>
.el-menu {
  --el-menu-border-color: none;
  --el-menu-bg-color: transparent;
  display: flex;
  flex-direction: column;

  .main-menu {
    box-sizing: border-box;
    flex: 1;
    border-top: 1px var(--theme-menu-divider) solid;
    border-bottom: 1px var(--theme-menu-divider) solid;
  }

  .el-menu-item {
    --menu-item-height-durition: 0.25s;
    color: var(--theme-menu-font-color);
    height: 60px;
    width: 60px;
    margin: 4px auto;
    border-radius: 5px;
    line-height: unset;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;

    &.first {
      margin: 0px auto 4px;
    }

    .el-icon {
      color: var(--theme-menu-font-color);
      font-size: 20px;
      will-change: transform;
      margin: 0;
      transition: transform var(--menu-item-height-durition) ease-in-out;
    }

    .item-name {
      color: var(--theme-menu-font-color);
      --menu-item-name-height: 12px;
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

    &:hover {
      background-color: var(--theme-menu-active-bg-color);
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
</style>

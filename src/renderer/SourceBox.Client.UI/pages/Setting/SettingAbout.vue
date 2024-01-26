<template>
  <el-container class="about-box">
    <el-header>关于</el-header>
    <el-main>
      <el-collapse v-model="activeNames">
        <el-collapse-item name="1">
          <template #title>
            <div class="about">
              <img class="about-icon" :src="ICON" />
              <div class="about-content">
                <div>SourceBox</div>
                <div>Build Date: {{ pack_time }}</div>
              </div>
              <div class="about-version">版本 {{ soft_version }}</div>
            </div>
          </template>
          <div class="about-extend">
            <div>
              作者:
              <el-link
                target="_blank"
                :underline="false"
                href="https://steamcommunity.com/id/Kashimura"
              >
                Kashimura
              </el-link>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import ICON from '../../../../../resources/icon.png?asset'
import { FormatTime } from '@renderer/utils'

const activeNames = ref(['1'])

const pack_time = FormatTime(define.packtime)
const soft_version = define.version
</script>

<style lang="scss" scoped>
.el-container.about-box {
  .el-header {
    padding: 32px 0 8px;
    font-size: 15px;
  }

  .el-main {
    border-radius: 5px;
    background-color: var(--theme-card-bg-color);
    backdrop-filter: blur(10px);
    padding: 0;
    .el-collapse {
      border: var(--theme-card-border-color) solid 1px;
      border-radius: 5px;

      :deep(.el-collapse-item) {
        margin-bottom: 0;

        .el-collapse-item__header {
          height: auto;
          padding: 18px 20px;
          border: unset;
        }
        .el-collapse-item__content {
          background-color: var(--theme-card-content-color);
          padding: 0;
          border: unset;
        }
        .el-collapse-item__wrap {
          border-radius: 0 0 5px 5px;
          border: unset;
        }
      }
    }
  }

  .about {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    line-height: initial;
    font-family: 'HarmonyOS_Regular'; // 字体被 ElementPlus 覆盖

    .about-icon {
      height: 20px;
      width: 20px;
      margin-right: 20px;
    }
    .about-content {
      flex: 1;
      text-align: left;
      & > div:first {
        font-size: 13px;
        margin-bottom: 7px;
      }
      & > div:last-child {
        font-size: 12px;
      }
    }
    .about-version {
      margin-right: 15px;
      font-size: 12px;
    }
  }
  .about-extend {
    div {
      border-top: 1px solid rgba(0, 0, 0, 0.25);
      padding: 5px 5px 5px 60px;
    }
  }
}
</style>

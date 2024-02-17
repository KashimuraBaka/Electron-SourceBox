<template>
  <div class="home-main">
    <div class="header">
      <WinCard class="player-avatar">
        <div v-if="Avater.frame" class="player-avatar-frame">
          <img :src="Avater.frame" />
        </div>
        <WinImage :url="Avater.display">
          <template #name>{{ store.CSteamID.name }} Lv.{{ store.CSteamID.level }}</template>
          <template #content>{{ store.CSteamID.steamId64 }}</template>
        </WinImage>
      </WinCard>
      <WinCard class="player-friends">
        <el-skeleton :loading="loading" animated :rows="3">
          <div class="playing-friends">
            <span>正在游玩:</span>
            <div v-if="sameGameFriends.length" class="playing-friends-avatar-list">
              <div
                v-for="(friend, index) in sameGameFriends.slice(0, 10)"
                :key="index.toString()"
                class="playing-friends-avatar"
                @click="SteamConsole.viewFriendsGame(friend.steamid)"
              >
                <img :src="friend.avatar_url" />
              </div>
              <div>
                {{ sameGameFriends.length }}
              </div>
            </div>
            <div v-else class="playing-friends-avatar-list">暂无玩家游玩</div>
          </div>
        </el-skeleton>
      </WinCard>
    </div>
    <el-button-group class="btns">
      <el-button @click="runGame">
        <div class="title">启动游戏</div>
        <div class="content">{{ store.steamApp.name }}</div>
      </el-button>
    </el-button-group>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import useCounterStore from '@desktop/services/store'
import { API, SteamConsole, SteamConvert, chunkArray } from '@renderer/utils'

import WinCard from '@desktop/components/WinCard.vue'
import WinImage from '@desktop/components/WinImage.vue'

import STEAM_AVATER from '@renderer/assets/images/steam_avatar_empty.jpg'

const store = useCounterStore()

const loading = ref(true)

const Avater = reactive({
  display: localStorage.getItem('steam_avatar') || STEAM_AVATER,
  frame: localStorage.getItem('steam_avatar_frame') || ''
})

const steamFriends = reactive<SteamFriend[]>([])
const sameGameFriends = computed(() => {
  return steamFriends.filter((v) => v.game?.gameId == BigInt(store.steamApp.id))
})

const runGame = () => {
  SteamConsole.runCsgoGame()
}

onMounted(async () => {
  // 获取头像和头像框
  const iSteamID3 = SteamConvert.ID64To3Number(store.CSteamID.steamId64.toString())
  if (iSteamID3 != -1) {
    const res = await API.Steam.GetMiniProfile(iSteamID3)
    if (res) {
      Avater.display = res.avatar_url
      Avater.frame = res.avatar_frame
      localStorage.setItem('steam_avatar', res.avatar_url)
      localStorage.setItem('steam_avatar_frame', res.avatar_frame)
    }
  }
  // 获取好友信息
  const friends = await window.steamworks.run('steamfriends.getFriends', 11)
  const friends_stemaids = friends.map((v) => v.steamid)
  for (const steamids of chunkArray(friends_stemaids, 100)) {
    const res = await API.Steam.GetPlayerSummaries(steamids)
    if (res) {
      for (const steamid of steamids) {
        const friend = friends.find((v) => v.steamid == steamid)
        const friend_info = res.players.find((v) => BigInt(v.steamid) == steamid)
        if (friend && friend_info) {
          steamFriends.push({ ...friend, avatar_url: friend_info.avatarfull })
        }
      }
    }
  }
  loading.value = false
})
</script>

<style lang="scss" scoped>
.home-main {
  display: flex;
  height: 100%;
  flex-direction: column;
  box-sizing: border-box;
  padding: 16px;

  .header {
    display: flex;

    .player-avatar {
      height: 18vw;
      width: 18vw;
      display: flex;
      color: white;
      overflow: unset; // 头像显示需要overflow关闭, 不然会被裁剪

      :deep(.el-card__body) {
        flex: 1;
        padding: 0;
      }

      .player-avatar-frame {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;

        img {
          width: 100%;
          height: 100%;
          transform: scale(1.22);
        }
      }
    }

    // 游戏游玩列表
    .player-friends {
      flex: 1;
      margin-left: 2vw;
      height: 18vw;

      .playing-friends {
        display: flex;
        align-items: center;
        flex-direction: row;

        // 玩家头像
        .playing-friends-avatar-list {
          display: flex;
          margin-left: 6px;
          cursor: pointer;
          border-radius: 5px;
          overflow: hidden;

          & > .playing-friends-avatar {
            height: 24px;
            width: 24px;

            img {
              height: 100%;
              width: 100%;
            }

            & + div {
              margin-left: 5px;
            }
          }
        }
      }
    }
  }

  .el-button-group.btns {
    position: absolute;
    inset: auto 2vw 2vw auto;
    .el-button {
      height: auto;
      border: 0;
      min-width: 250px;
      padding: 20px 0;
      background-color: var(--theme-btn-bg-color);

      .title {
        font-size: 20px;
        margin-bottom: 5px;
      }

      :deep(span) {
        display: flex;
        flex-direction: column;
        line-height: unset;
      }
    }
  }
}
</style>

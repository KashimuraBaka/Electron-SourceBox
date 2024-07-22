import axios from 'axios'
import { DomHandler } from '@renderer/utils'

import type {
  TSteamAppList,
  TSteamAppid,
  TSteamGameDetails,
  TSteamMiniProfile,
  TSteamPlayersInfo,
  TSteamResponse,
  TSteamWorkshopCollectionDetailsRespones,
  TSteamWorkshopItemDetails
} from './types'

const STEAM_KEY = '2BC9D42BC957A0A39BFB784E069DF3ED'

/**
 * 获取SteamID资料
 * @param steamid64 STEAMID 64位
 * @returns 返回获取到的Steam个人资料
 */
const GetPlayerSummaries = async (steamid64: bigint[]) => {
  try {
    const { data } = await axios.get<TSteamResponse<TSteamPlayersInfo>>('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/', {
      params: { key: STEAM_KEY, steamids: steamid64.join(',') }
    })
    return data.response
  } catch {
    return null
  }
}

/**
 * 获取游戏详细描述
 * @param appid 游戏应用App
 * @returns 返回App信息
 */
const GetGameDetails = async (appid: number) => {
  try {
    const { data } = await axios.get<TSteamGameDetails>(`https://store.steampowered.com/api/appdetails?appids=${appid}`)
    return data[appid.toString()].data
  } catch {
    return null
  }
}

const FormatSteamTime = (date: string) => {
  if (!date) return ''
  // 例: 2016 年 10 月 14 日 下午 10:51 or 1 月 29 日 上午 12:11
  const [, , Year, Month, Day, timeFomate, time] = date.match(/^((\d+)\s年\s)?(\d+)\s月\s(\d+)\s日\s(.*)\s(\d+:\d+)$/) || []
  if (Year) {
    return `${Year}/${Month}/${Day} ${time} ${timeFomate}`
  } else {
    return `${new Date().getFullYear()}/${Month}/${Day} ${time} ${timeFomate}`
  }
}

const GetWorkshopCollectionDetails = async (collectionid: number): Promise<TSteamWorkshopCollectionDetailsRespones | null> => {
  try {
    const { data } = await axios.get<string>(`https://steamcommunity.com/workshop/filedetails/?id=${collectionid}`, { timeout: 3000 })
    const dom = new DomHandler(data)
    const title = dom.$nodeValue('.workshopItemDetailsHeader > .workshopItemTitle')
    if (title == '') {
      return { success: false }
    }
    const author = dom.$nodeValue('.creatorsBlock > div > .friendBlockContent').trim()
    const app_name = dom.$nodeValue('.apphub_AppDetails > .apphub_AppName')
    const appid = Number(dom.getAttribute('.apphub_OtherSiteInfo > .btn_medium', 'data-appid', '0'))
    const content = dom.$inner('#highlightContent')
    const background = dom.getAttribute('#CollectionBackgroundImage', 'src')
    const items: TSteamWorkshopItemDetails[] = []
    const [createDom, updateDom] = dom.$child(
      '#rightContents > .panel:nth-child(2) > .rightSectionHolder:last-child > .rightDetailsBlock > .detailsStatsContainerRight > .detailsStatRight'
    )
    const create_time = FormatSteamTime(createDom?.inner() || '')
    const update_time = FormatSteamTime(updateDom?.inner() || '')
    for (const item of dom.$child('.detailBox > .collectionChildren > .collectionItem')) {
      const authorWorkshopUrl = item.getAttribute('.workshopItemAuthorName > a', 'href')
      const [, url] = authorWorkshopUrl.match(/(https:\/\/steamcommunity.com\/\w+\/.*?)\//) || []
      const itemUrl = item.getAttribute('.collectionItemDetails > a', 'href')
      const [, itemid] = itemUrl.match(/id=(\d+)/) || []
      items.push({
        id: BigInt(itemid || '-1'),
        title: item.$nodeValue('.workshopItemTitle'),
        preview_url: item.getAttribute('.workshopItemPreviewImage', 'src'),
        author: item.$nodeValue('.workshopItemAuthorName > a'),
        author_url: url || '',
        desc: item.$nodeValue('.workshopItemShortDesc')
      })
    }
    return {
      success: true,
      data: {
        appid,
        app_name,
        author,
        id: collectionid,
        title,
        content,
        background,
        create_time,
        update_time,
        items
      }
    }
  } catch (e) {
    console.log(e)
    return null
  }
}

/**
 * 获取Steam所有App
 * @returns 返回所有AppID信息
 */
const GetAppList = async (): Promise<TSteamAppid<string>[]> => {
  try {
    const { data } = await axios.get<TSteamAppList>('https://api.steampowered.com/ISteamApps/GetAppList/v2/')
    const map = new Map()
    data.applist.apps.forEach(({ appid, name }) => {
      map.set(appid, { appid: appid.toString(), name })
    })
    return Array.from(map.values()).sort((a, b) => a.appid - b.appid)
  } catch (e) {
    return []
  }
}

const GetMiniProfile = async (steamid3: number) => {
  try {
    const { data } = await axios.get<TSteamMiniProfile>(`https://steamcommunity.com/miniprofile/${steamid3}/json/`)
    return data
  } catch (e) {
    return null
  }
}

export default {
  GetPlayerSummaries,
  GetGameDetails,
  GetWorkshopCollectionDetails,
  GetAppList,
  GetMiniProfile
}

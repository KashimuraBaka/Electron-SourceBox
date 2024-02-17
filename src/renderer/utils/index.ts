import Files from './files'
import Color from './color'
import * as SteamConsole from './steam_console'
import SteamConvert from './steam_convert'
import CssStyle from './css_style'
import API from './api'

export { Files, SteamConsole, Color, CssStyle, API, SteamConvert }

export class DomHandler {
  public dom: DocumentFragment | Element

  /**
   * html字符串转文档片段
   * @param html html字符串
   */
  constructor(html: string | Element) {
    if (typeof html === 'string') {
      this.dom = document.createRange().createContextualFragment(html)
    } else {
      this.dom = html
    }
  }

  public $(selectors: string) {
    return this.dom.querySelector(selectors)
  }

  public $nodeValue(selectors: string, defaultText = '') {
    return this.dom.querySelector(selectors)?.firstChild?.nodeValue || defaultText
  }

  public $content(selectors: string, defaultText = '') {
    return this.dom.querySelector(selectors)?.textContent || defaultText
  }

  public $inner(selectors: string, defaultText = '') {
    return this.dom.querySelector(selectors)?.innerHTML || defaultText
  }

  public inner(defaultText = '') {
    return (<Element>this.dom).innerHTML || defaultText
  }

  public $child(selectors: string) {
    const childs = this.dom.querySelectorAll(selectors)
    const elements: DomHandler[] = []
    childs?.forEach((node) => {
      elements.push(new DomHandler(node))
    })
    return elements
  }

  public getAttribute(selectors: string, qualifiedName: string, defaultValue = '') {
    return this.dom.querySelector(selectors)?.getAttribute(qualifiedName) || defaultValue
  }
}

/**
 * 按块分割数组
 * @param arr 需要进行分割的数组
 * @param size 块大小
 * @returns 分割后的数组
 */
export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const results: T[][] = []
  while (arr.length) {
    results.push(arr.splice(0, size))
  }
  return results
}

/**
 * 数组去重
 * @param arr 需要去重的数组
 * @returns 去重后的数组
 */
export const uniqueArray = <T = any>(arr: T[]) => {
  return Array.from(new Set(arr))
}

/**
 * 深拷贝对象
 * @param obj 响应式对象
 * @returns
 */
export const deepCopy = <T>(obj: T): T => {
  if (!obj) return obj
  let newobj: any
  switch (obj.constructor) {
    case Array:
      newobj = []
      break
    case Object:
      newobj = {}
      break
    default:
      return obj
  }
  for (const i in obj) {
    if (typeof obj[i] === 'object') {
      //判断对象的这条属性是否为对象
      newobj[i] = deepCopy(obj[i]) //若是对象进行嵌套调用
    } else {
      newobj[i] = obj[i]
    }
  }
  return newobj //返回深度克隆后的对象
}

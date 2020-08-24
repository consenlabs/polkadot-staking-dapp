import enTrans from './en_US'
import zhTrans from './zh_CN'

export const getLocale = () => {
  let val = navigator.language || ''
  const locale = val.toLowerCase().split(/[^\w+]/ig)[0] || 'en'
  return locale === 'zh' ? 'zh' : 'en'
}

/**
 * zh: {
 *   delegate: '委托',
 *   delegate_token_get_rewards: '委托 $s 获取收益 $s 每天',
 * }
 * 
 * t('delegate') ---> '委托'
 * t('delegate_token_get_rewards', 'Atom', 'Btom') --->  '委托 Atom 获取收益 Btom 每天'
 * 
 */
let trans: any = null
const t = (key, ...args) => {
  if (!trans) {
    const locale = getLocale()
    trans = (locale === 'zh' ? zhTrans : enTrans)
  }

  let value = trans[key] || key
  if (args.length) {
    let i = 0
    value = value.replace(/\$s/ig, () => {
      const o = args[i] || ''
      i++
      return o
    })
  }

  return value
}

export default t
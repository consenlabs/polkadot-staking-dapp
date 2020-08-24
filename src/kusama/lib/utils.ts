import BN from 'bn.js'
import numeral from 'numeral'
import cogoToast from 'cogo-toast'
import { formatBalance, isBoolean, formatDecimal, calcSi, findSi } from '@polkadot/util'

export const Toast = cogoToast

const M_LENGTH = 6 + 1;

export const fksm = (value, withSi = false) => {
  if (!isExist(value)) {
    return '~'
  }
  const currency = formatBalance.getDefaults().unit
  const decimals = formatBalance.getDefaults().decimals
  const [prefix, postfix] = _formatBalance(value, { forceUnit: currency, withSi, decimals }).split('.');

  if (prefix.length > M_LENGTH) {
    return formatBalance(value);
  }

  return `${prefix}.${`000${postfix || ''}`.slice(-4)}`
}

export const ellipsis = (str: string, lead: number = 12, tail: number = 6): string => {
  if (str && str.length > lead + tail + 8) {
    return `${str.substring(0, lead)}...${str.substring(str.length - tail, str.length)}`
  }
  return str
}

export const toBN = (x) => {
  if (isNaN(Number(x))) return new BN(0)
  if (x instanceof BN) return x
  if (String(x).startsWith('0x')) {
    return new BN(x.substring(2), 'hex')
  }
  return new BN(x)
}
/**
 * used for render balance in jsx
 * the decimals length depend on the value
 * if value < 1, at least keep the non-zero and following four places
 * if integer, keep interger
 * if otherwise, keep ${decimalLength} places decimals
 */

export const thousandCommas = (num: string | number, place: number = 4) => {
  const decimals = '0'.repeat(place)
  return numeral(num).format(`0,0.[${decimals}]`)
}

export const fPercent = (p: number, fixed = 3) => {
  return !isNaN(Number(p)) ? `${(p * 100).toFixed(fixed)}%` : '~'
}

export const isExist = (o: any) => {
  return typeof o !== 'undefined'
}

export const getBalanceFromAccount = (account) => {
  const v = account
  if (!v || !v.coins || !Array.isArray(v.coins)) return 0
  const atom = v.coins.find(
    c => c.denom === 'uatom' || c.denom === 'muon'
  )
  return atom.amount || 0
}

export const getDeletationBalance = (delegations) => {
  let balance = 0
  if (Array.isArray(delegations)) {
    delegations.forEach(d => {
      balance += d.balance * 1
    })
  }
  return balance.toFixed(0)
}

export const getRewardBalance = (rewards) => {
  let balance = 0
  if (Array.isArray(rewards)) {
    rewards.forEach(d => {
      balance += d.amount * 1
    })
  }
  return balance.toFixed(0)
}

export const getUnbondingBalance = (unbondingDelegations) => {
  let balance = 0
  if (Array.isArray(unbondingDelegations)) {
    unbondingDelegations.forEach(d => {
      if (Array.isArray(d.entries)) {
        d.entries.forEach(o => {
          balance += o.balance * 1
        })
      }
    })
  }
  return balance.toFixed(0)
}

export const IPHONEX_HEIGHT = 40

export const isiPhoneX = () => {
  if (typeof window !== 'undefined' && window) {
    return /iphone/gi.test(window.navigator.userAgent) && window.screen.height >= 812;
  }
  return false
}

export const getLocale = () => {
  let val = navigator.language || ''
  const locale = val.toLowerCase().split(/[^\w+]/ig)[0] || 'en'
  return locale === 'zh' ? 'zh' : 'en'
}

export const getAmountFromMsg = (msg) => {
  if (!msg || !msg.value || !msg.value.amount) return '0'
  const amountObj = msg.value.amount
  return amountObj && amountObj.amount
}

/**
 * check current page is load by reload
 * https://stackoverflow.com/questions/5004978/check-if-page-gets-reloaded-or-refreshed-in-javascript
 */
export const isReload = () => {
  return window.performance && window.performance.navigation && window.performance.navigation.type === 1
}

export function compareSemver(a, b) {
  const pa = a.split('.')
  const pb = b.split('.')
  for (let i = 0; i < 3; i++) {
    const na = Number(pa[i])
    const nb = Number(pb[i])
    if (na > nb) return 1
    if (nb > na) return -1
    if (!isNaN(na) && isNaN(nb)) return 1
    if (isNaN(na) && !isNaN(nb)) return -1
  }
  return 0
}

function _formatBalance(input, options = true as any, optDecimals = 0) {
  let text = toBN(input).toString();

  if (text.length === 0 || text === '0') {
    return '0';
  } // strip the negative sign so we can work with clean groupings, re-add this in the
  // end when we return the result (from here on we work with positive numbers)


  const isNegative = text[0].startsWith('-');

  if (isNegative) {
    text = text.substr(1);
  } // extract options - the boolean case is for backwards-compat


  const {
    decimals = optDecimals,
    forceUnit = undefined,
    withSi = true,
    withSiFull = false,
    withUnit = true
  } = isBoolean(options) ? {
    withSi: options
  } : options; // NOTE We start at midpoint (8) minus 1 - this means that values display as
  // 123.456 instead of 0.123k (so always 6 relevant). Additionally we us ceil
  // so there are at most 3 decimal before the decimal seperator

  const si = calcSi(text, decimals, forceUnit);
  const mid = text.length - (decimals + si.power);
  const prefix = text.substr(0, mid);
  const padding = mid < 0 ? 0 - mid : 0;
  const postfix = `${`${new Array(padding + 1).join('0')}${text}`.substr(mid < 0 ? 0 : mid)}0000`.substr(0, 4);
  const units = withSi || withSiFull ? si.value === '-' ? withUnit ? ` ${isBoolean(withUnit) ? si.text : withUnit}` : '' : `${withSiFull ? ` ${si.text}` : si.value}${withUnit ? ` ${isBoolean(withUnit) ? findSi('8').text : withUnit}` : ''}` : '';

  return `${isNegative ? '-' : ''}${formatDecimal(prefix || '0')}.${postfix}${units}`;
}
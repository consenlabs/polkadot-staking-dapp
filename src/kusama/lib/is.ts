export const isiPhoneX = () => {
  if (typeof window !== 'undefined' && window) {
    return /iphone/gi.test(window.navigator.userAgent) && window.screen.height >= 812;
  }
  return false
}

export const isExist = (o: any) => {
  return typeof o !== 'undefined'
}

export const isDecimalOverflow = (num: string, length) => {
  const fraction = num.split('.')[1]
  return !!(fraction && fraction.length > length)
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

export const isPolkadot = () => {
  return /polkadot/i.test(window.location.pathname)
}

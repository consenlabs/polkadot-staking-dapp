
window['imToken'] = window['imToken'] || {
  callAPI: () => {
    console.error('当前不是 imToken 环境')
  },
  callPromisifyAPI: (apiName: string, payload: any): Promise<any> => {
    switch (apiName) {
      case 'tron.getAccounts':
        return Promise.resolve(['TAUN6FwrnwwmaEqYcckffC7wYmbaS6eBi9'])
      case 'private.getHeaders':
        return Promise.resolve(`{"Authorization":"Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VUb2tlbiI6IkVBQjZBRTJELThFNEYtNEFDMS1CODM4LTA5MkQwMzE2NjlGQSIsImp0aSI6ImltMTR4NUxZck11Q1lxaXdTRzVBeFhaOXlGRDlIdml2VmJKdDVMRiJ9.rkJ2jziqRKwHvUKX2xkrkA2CDppGegElgVuZ2syHf5Y","X-IDENTIFIER":"im14x5LYrMuCYqiwSG5AxXZ9yFD9HvivVbJt5LF","X-CLIENT-VERSION":"ios:2.3.1.515:14","X-DEVICE-TOKEN":"EAB6AE2D-8E4F-4AC1-B838-092D031669FA","X-LOCALE":"en-US","X-CURRENCY":"CNY","X-DEVICE-LOCALE":"en","X-APP-ID":"im.token.app","X-API-KEY":"3bdc0a49ba634a8e8f3333f8e66e0b84","Content-Type":"application/json"}`)
      case 'ethereum.enable':
        return Promise.resolve([''])
      case 'user.showAccountSwitch':
        if (payload.chainType === 'ETHEREUM') {
          return Promise.resolve('')
        } else if (payload.chainType === 'POLKADOT') {
          return Promise.resolve('')
        }
      default:
        console.log(apiName, payload)
        return Promise.reject(new Error('当前不是 imToken 环境'))
    }
  }
}

var imToken = window['imToken']
/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ rn api requests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

export function getEthereumAccounts(): Promise<[string]> {
  // return Promise.resolve(['cosmos1zt57jwmlfl77k9urjha2xupgpk2j90axd9pxss'])
  return window.ethereum.enable()
}

export function routeTo(payload) {
  return imToken.callPromisifyAPI('navigator.routeTo', payload).catch(err => console.warn(err))
}

export function getHeaders(): Promise<{}> {
  return imToken.callPromisifyAPI('private.getHeaders')
    .then(headers => JSON.parse(headers))
    .then(headers => {
      delete headers['X-LOCALE']
      return {
        ...headers,
        // 'Access-Control-Allow-Origin': 'http://localhost:3000',
        // 'Access-Control-Allow-Credentials': 'true',
        // ...headers,
      }
    })
}

export function getTronAccounts(): Promise<string[]> {
  return imToken.callPromisifyAPI('tron.getAccounts')
}

export function configNavigator(color: string, theme?: 'default' | 'transparent') {
  imToken.callAPI('navigator.configure', {
    orientation: 'portrait',
    navigationStyle: theme || 'default',
    navigatorColor: color,
  })
}

export function setTitle(title: string) {
  document.title = title
  imToken.callAPI('navigator.setTitle', title)
}



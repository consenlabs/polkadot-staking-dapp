import Axios from "axios"
import { qs } from './url'

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ node requests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

export function isTestnet() {
  const qsTestnet = qs('testnet')
  return qsTestnet || (window['ethereum'] && window['ethereum'].networkVersion === '42')
}


export function get(url, params = {}) {
  return Axios({ method: 'get', url: url, params }).then(res => {
    if (res.data) {
      return res.data
    } else {
      throw new Error(`null response ${url} ${JSON.stringify(params)}`)
    }
  })
}


export function rpc(url, method, params) {
  const data = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params,
  }
  return Axios({ method: 'post', url, data }).then(res => {
    if (res.data) {
      return res.data.result
    } else {
      throw new Error(`null response ${url} ${JSON.stringify(params)}`)
    }
  })
}

export function getBizUrl() {
  const isStaging = window.location.host.indexOf('.staging.') !== -1
  return isTestnet() ? 'https://biz.dev.tokenlon.im/rpc' :
    isStaging ? 'https://biz.staging.tokenlon.im/rpc' :
      'https://mainnet-bizapi.tokenlon.im/rpc'
}

export default {}
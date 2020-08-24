import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import { pubsub } from './event';
import { web3FromSource } from '@polkadot/extension-dapp';
import toast from './toast';
import { BN_ZERO } from './format'
import { u8aToHex, u8aToString } from '@polkadot/util'
import { decodeAddress } from '@polkadot/util-crypto'
import { StatementKind } from '@polkadot/types/interfaces'
import { isPolkadot } from './is'

export let ready = false

let _api: ApiPromise


export const initClient = () => {

  if (_api) return _api
  const endpoint = isPolkadot() ? 'wss://polkadot-mainnet.token.im/ws' : 'wss://kusama-mainnet.token.im/ws'
  const provider = new WsProvider(endpoint)
  const api = new ApiPromise({ provider });

  api.rpc.chain.subscribeNewHeads((header) => {
    console.log(`Chain is at #${header.number}`);
    if (!ready) {
      ready = true
      pubsub.emit('api-ready')
    }
  }).catch((error) => {
    toast.error(error.message)
  });

  _api = api

  return api
}

export const getAPI = () => {
  return _api
}

function sendCallback(result) {
  const { status, events } = result
  if (status._index === 1) {
    pubsub.emit('sendingTx', {
      txHash: status.hash.toString()
    })
  }

  if (status.isInBlock || status.isFinalized) {
    events
      // find/filter for failed events
      .filter(({ section, method }) =>
        section === 'system' &&
        method === 'ExtrinsicFailed'
      )
      // we know that data for system.ExtrinsicFailed is
      // (DispatchError, DispatchInfo)
      .forEach(({ data: [error, info] }) => {
        if (error.isModule) {
          // for module errors, we have the section indexed, lookup
          const decoded = _api.registry.findMetaError(error.asModule);
          const { documentation, name, section } = decoded;

          console.log(`${section}.${name}: ${documentation.join(' ')}`);
        } else {
          // Other, CannotLookup, BadOrigin, no extra info
          console.log(error.toString());
          const hash = status.hash.toString()
          pubsub.emit('sendTxWrong', {
            hash,
            error: error
          })
        }
      });
  }
  if (result.isCompleted) {
    const hash = status.hash.toString()
    pubsub.emit('sendTxSuccess', {
      hash
    })
  }
}

const signAndSend = async (tx, account) => {
  const injected = await web3FromSource(account.meta.source)
  return tx.signAndSend(account.address, {
    signer: injected.signer,
    tip: BN_ZERO,
  }, sendCallback)
}

const send = async (tx, account) => {
  // const injected = await web3FromSource(account.meta.source);
  return tx.send(sendCallback)
}

export const getAccount = async () => {
  try {
    await web3Enable('imtoken-polkadot-staking')
    const accounts = await web3Accounts()
    if (accounts.length) {
      return accounts
    }
    // throw new Error('account_not_found')
    return []
  } catch (error) {
    console.log(error)
    throw error
  }
}

/**
 * ===================================  Claims start  ===================================
 */

export const getPreclaimAddress = async (accountId): Promise<string | null> => {
  if (_api) {
    if (!_api.query.claims || !_api.query.claims.preclaims) {
      return null
    }

    return await _api.query.claims
      .preclaims(accountId)
      .then(preclaim => {
        const address = preclaim && preclaim.toString()
        return address || null
      }).catch(() => {
        return null
      })
  }
  return null
}

export const getClaimsBalance = async (ethereumAddress): Promise<string | null> => {
  if (_api) {
    return await _api.query.claims
      .claims<any>(ethereumAddress)
      .then((claim): string => {
        return claim && claim.toString()
      })
      .catch(e => {
        return null
      })
  }
  return null
}

interface ConstructTx {
  params?: any[]
  tx?: string
}

export interface Statement {
  sentence: string;
  url: string;
}

// Depending on isOldClaimProcess, construct the correct tx.
export function constructTx(systemChain: string, accountId: string, ethereumSignature: string | null, kind: StatementKind | undefined, isOldClaimProcess: boolean): ConstructTx {
  if (!ethereumSignature) {
    return {};
  }

  return isOldClaimProcess || !kind
    ? { params: [accountId, ethereumSignature], tx: 'claims.claim' }
    : { params: [accountId, ethereumSignature, getStatement(systemChain, kind)?.sentence], tx: 'claims.claimAttest' };
}

export function claims(constructTx: ConstructTx, account: any) {
  const { tx = '', params } = constructTx
  console.log(tx, params)
  if (_api) {
    const [section, method] = tx.split('.')
    const claimsTx = _api.tx[section][method](...params)
    return send(claimsTx, account)
  }
}

export function attestOnly(statementSentence, account) {
  if (_api) {
    const attestTx = _api.tx.claims.attest(...[statementSentence])
    return signAndSend(attestTx, account)
  }
}

export function getClaimsToSigndMessage(accountId: string, statementSentence: string) {
  if (_api) {
    const prefix = u8aToString(_api.consts.claims.prefix.toU8a(true));
    return accountId
      ? `${prefix}${u8aToHex(decodeAddress(accountId), -1, false)}${statementSentence}`
      : ''
  }
  return ''
}

export function getStatement(network: string = 'Polkadot CC1', kind?: StatementKind | null): Statement | undefined {
  switch (network) {
    case 'Polkadot CC1': {
      if (!kind) {
        return undefined;
      }

      const url = kind.isRegular
        ? 'https://statement.polkadot.network/regular.html'
        : 'https://statement.polkadot.network/saft.html';

      const hash = kind.isRegular
        ? 'Qmc1XYqT6S39WNp2UeiRUrZichUWUPpGEThDE6dAb3f6Ny'
        : 'QmXEkMahfhHJPzT3RjkXiZVFi77ZeVeuxtAjhojGRNYckz';

      return {
        sentence: `I hereby agree to the terms of the statement whose SHA-256 multihash is ${hash}. (This may be found at the URL: ${url})`,
        url
      };
    }

    default:
      return undefined;
  }
}

export function getIsOldClaimProcess() {
  if (!ready) return false
  if (_api) {
    return !_api.tx.claims.claimAttest
  }
  // TODO: fix api not ready
  return false
}

/**
 * ===================================  Claims end  ===================================
 */

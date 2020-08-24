
import { ApiPromise } from '@polkadot/api'
import { WsProvider } from '@polkadot/rpc-provider'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'

import { BN_ONE, extractTime } from '@polkadot/util';
import { pubsub } from './event'
import { web3FromSource } from '@polkadot/extension-dapp'
import toast from './toast'
import BN from 'bn.js'
import { SubmittableExtrinsic, ApiTypes } from '@polkadot/api/types'
import { isPolkadot } from './is'
import { fksm } from './utils'

let ready = false

let _api: ApiPromise

export const getAPI = (): ApiPromise => _api

export const track = (eventLabel) => {
  console.log('ga track:', eventLabel);
  (window as any).ga && (window as any).ga('send', { hitType: 'event', eventCategory: 'staking', eventAction: 'click', eventLabel: eventLabel });
}

export const initClient = () => {
  const endpoint = isPolkadot() ? 'wss://polkadot-mainnet.token.im/ws' : 'wss://kusama-mainnet.token.im/ws'
  const provider = new WsProvider(endpoint)
  const api = new ApiPromise({ provider })

  api.rpc.chain.subscribeNewHeads((header) => {
    console.log(`Chain is at #${header.number}`)
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
const DEFAULT_CB = (txHash) => { }
// array of validators' address
export const nominate = async (validators, account, callback = DEFAULT_CB) => {
  if (_api) {
    const nominateTx = _api.tx.staking.nominate(validators)
    return signAndSend(nominateTx, account, callback)
  }
  throw new Error('api_not_ready')
}

export const unbond = async (value, account, callback = DEFAULT_CB) => {
  if (_api) {
    const unbondTx = _api.tx.staking.unbond(value)
    return signAndSend(unbondTx, account, callback)
  }
  throw new Error('api_not_ready')
}

export const bond = async (value, account, callback = DEFAULT_CB) => {
  if (_api) {
    const bondTx = _api.tx.staking.bond(account.address, value, 'Stash')
    return signAndSend(bondTx, account, callback)
  }
  throw new Error('api_not_ready')
}

export const bondExtra = async (value, account, callback = DEFAULT_CB) => {
  if (_api) {
    const bondExtraTx = _api.tx.staking.bondExtra(value)
    return signAndSend(bondExtraTx, account, callback)
  }
  throw new Error('api_not_ready')
}

export const batchBondNominate = async (value, validators, account, callback = DEFAULT_CB) => {
  if (_api) {
    const bondTx = _api.tx.staking.bond(account.address, value, 'Stash')
    const nominateTx = _api.tx.staking.nominate(validators)
    const batchTx = _api.tx.utility.batch([bondTx, nominateTx])
    return signAndSend(batchTx, account, callback)
  }
  throw new Error('api_not_ready')
}

export const withdrawUnbonded = async (stakingAccount, account, callback = DEFAULT_CB) => {
  if (_api) {
    const optSpans = await _api.query.staking.slashingSpans(stakingAccount.stashId)
    const spanCount = optSpans.isNone ? 0 : optSpans.unwrap().prior.length + 1
    const withdrawTx = _api.tx.staking.withdrawUnbonded(spanCount)

    return signAndSend(withdrawTx, account, callback)
  }
  throw new Error('api_not_ready')
}

export const calcWithdrawFee = async (stakingAccount) => {
  if (_api) {
    const optSpans = await _api.query.staking.slashingSpans(stakingAccount.stashId)
    const spanCount = optSpans.isNone ? 0 : optSpans.unwrap().prior.length + 1
    const withdrawTx = _api.tx.staking.withdrawUnbonded(spanCount)

    const result = await _api.rpc.payment.queryInfo(withdrawTx.toHex())
    return fksm(result.partialFee)
  }
  throw new Error('api_not_ready')
}

export const payoutRewards = async (stakingAccount, account, callback = DEFAULT_CB) => {
  if (_api) {
    const lastEra = await _api.derive.session.indexes()
    const txs = stakingAccount.nominators.map((t) => {
      return _api.tx.staking.payoutStakers(t, lastEra.currentEra.toNumber() - 1)
    })
    const batchTx = _api.tx.utility.batch(txs)
    return signAndSend(batchTx, account, callback)
  }
  throw new Error('api_not_ready')
}

export const calcPayoutRewardFee = async (stakingAccount) => {
  if (_api) {
    const lastEra = await _api.derive.session.indexes()
    const txs = stakingAccount.nominators.map((t) => {
      return _api.tx.staking.payoutStakers(t, lastEra.currentEra.toNumber() - 1)
    })
    const batchTx = _api.tx.utility.batch(txs)
    const result = await _api.rpc.payment.queryInfo(batchTx.toHex())
    return fksm(result.partialFee)
  }
  throw new Error('api_not_ready')
}

export const second = async (proposal, account, callback = DEFAULT_CB) => {
  if (_api) {
    const secondTx = _api.tx.democracy.second(proposal.index, proposal.seconds.length)
    return signAndSend(secondTx, account, callback)
  }
  throw new Error('api_not_ready')
}

export const democracyVote = async (params, account, callback = DEFAULT_CB) => {
  if (_api) {
    const voteTx = _api.tx.democracy.vote(params.index, params.vote)
    return signAndSend(voteTx, account, callback)
  }
  throw new Error('api_not_ready')
}

export const councilVote = async (params, account, callback = DEFAULT_CB) => {
  if (_api) {
    const voteTx = _api.tx.council.vote(params.proposal, params.index, params.approve)
    return signAndSend(voteTx, account, callback)
  }
  throw new Error('api_not_ready')
}

const signAndSend = async (tx: SubmittableExtrinsic<ApiTypes>, account, callback = DEFAULT_CB) => {
  const injected = await web3FromSource(account.meta.source);
  _api.setSigner(injected.signer)

  let emitted = false
  return tx.signAndSend(account.address, (result) => {
    const { status, events } = result
    if (!emitted) {
      const txHash = tx.hash.toString()
      pubsub.emit('sendingTx', {
        txHash,
      })
      track(`${tx.method.method}-send`)
      typeof callback === 'function' && callback(txHash)
      emitted = true
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
            track(`${tx.method.method}-fail`)
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(error.toString());
            toast.warn(error.toString())
          }
        });
    }

    if (result.isCompleted && result.isInBlock) {
      pubsub.emit('sendTxSuccess', {
        txHash: tx.hash.toString()
      })
      track(`${tx.method.method}-success`)
    }
  })
}

export const getAccount = async () => {
  try {
    await web3Enable('imtoken-polkadot-staking')
    const accounts = await web3Accounts()
    if (accounts.length) {
      return accounts
    }
    throw new Error('account_not_found')
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const checkTx = async (tx) => {
  if (_api) {
    // _api.tx.system
  }
}

const DEFAULT_TIME = new BN(6000);

export const blockToTime = (blocks = BN_ONE) => {
  if (_api) {
    const blockTime = (
      _api.consts.babe?.expectedBlockTime ||
      _api.consts.timestamp?.minimumPeriod.muln(2) ||
      DEFAULT_TIME
    );

    return [
      blockTime.toNumber(),
      extractTime(blockTime.mul(blocks).toNumber())
    ];
  }
  throw new Error('api_not_ready')
}
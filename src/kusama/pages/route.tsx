import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { connect } from "react-redux"

import { getAccount, initClient, getAPI } from 'kusama/lib/kusama'
import { extractInfo, baseBalance, getUnit, getRouteName, nomalizeValidator, normalizeBalances, nomalizeStakingAccount, nomalizeValidatorIdentity, mergeValidatorDisplayName } from 'kusama/lib/helper'
import { setTitle } from '@common/lib/sdk'
import { updateAccount, updateStakingAccount, updateValidators, updateSelectedValidators, updateEraElectionStatus, updateIsNominating, updateExistentialDeposit, updateReferendums, updateDemocracy, updateCouncil } from 'kusama/lib/redux/actions'
import Home from './index'
import Nominators from './nominators'
import Validators from './validators'
import Validator from './validator'
import Claims from './claims'
import ComingSoon from './comingSoon'
import { pubsub } from 'kusama/lib/event';
import { selectAccount, selectIsNominating } from 'kusama/lib/redux/selectors';
import Bond from 'kusama/pages/bond'
import Unbond from 'kusama/pages/unbond'
import Governance from 'kusama/pages/governance'
import { formatBalance } from '@polkadot/util';
import t from 'kusama/locales'
import toast from 'kusama/lib/toast'
import { BN_ZERO, ellipsis } from 'kusama/lib/format'
import { isPolkadot } from 'kusama/lib/is'
import axios from 'axios'
import SupportModal from 'kusama/components/SupportModal'
import { fksm } from 'kusama/lib/utils'
import '../theme/polkadot.scss'
// import { registry } from '@polkadot/react-api';

interface Props {
  account: any,
  isNominating: string,
  updateAccount: any,
  updateStakingAccount: any,
  updateValidators: any,
  updateSelectedValidators: any,
  updateEraElectionStatus: any,
  updateIsNominating: any,
  updateExistentialDeposit: any,
  updateReferendums: any
  updateCouncil: any
  updateDemocracy: any
}

class Polkadot extends React.Component<Props, any> {
  hideLoadingFn: any

  componentWillMount() {
    setTitle(`${isPolkadot() ? 'Polkadot' : 'Kusama'} Staking`)
    if (isPolkadot()) {
      // #FAFBFC
      document.getElementsByTagName('html')[0].style.background = '#FAFBFC'
      document.getElementsByTagName('body')[0].style.background = '#FAFBFC'
    }
    // eslint-disable-next-line no-restricted-globals
    if (location.pathname.endsWith('/claims')) return

    const api = initClient()

    const { updateAccount, updateIsNominating, updateExistentialDeposit } = this.props

    pubsub.on('api-ready', () => {
      formatBalance.setDefaults({
        decimals: isPolkadot() ? 10 : 12,
        unit: getUnit(),
      })

      api.isReady.then(async () => {
        const deposit = api.consts.balances.existentialDeposit
        updateExistentialDeposit(Number(fksm(deposit)))

        const accounts = await getAccount()
        if (accounts.length) {
          // console.log('###------------1')
          // api.derive.staking.stakerRewardsMulti([accounts[0].address], false).then((r) => console.log('### stakerRewardsMulti', r)).catch(e => console.log('### stakerRewardsMulti', e))
          // console.log('###------------2')

          api.derive.accounts.info(accounts[0].address).then(async (data) => {
            const address = data.accountId.toString()
            updateAccount({ ...accounts[0], accounts, address })

            this.updateLocalData()
          }).catch(console.error)
        } else {
          return toast.warn(t('no_kusama_wallet_title'))
        }
      })
    })

    pubsub.on('sendingTx', ({ txHash }) => {
      this.hideLoadingFn = toast.loading(ellipsis(txHash), { heading: t('tx_pending'), hideAfter: 0, onClick: () => this.hideLoadingFn() })
    })

    pubsub.on('sendTxSuccess', ({ txHash }) => {
      if (this.hideLoadingFn && typeof this.hideLoadingFn === 'function') {
        this.hideLoadingFn()
        this.hideLoadingFn = undefined
      }
      if (this.props.isNominating === txHash) {
        updateIsNominating('')
      }
      toast.success(t('tx_success'))
      this.updateLocalData()
    })
  }

  fetchValidatorIdentity = (api, validators, cb) => {
    const todayIndex = new Date().getDate()
    const yestodayIndex = new Date(Date.now() - 3600 * 24 * 1000).getDate()
    const yestodayKey = `${yestodayIndex}-${getRouteName()}-identitys`
    const todayKey = `${todayIndex}-${getRouteName()}-identitys`
    localStorage.removeItem(yestodayKey)

    let identitysStorage = localStorage.getItem(todayKey) as any
    if (identitysStorage) {
      const identitys = JSON.parse(identitysStorage)
      cb(identitys)
    }
    else {
      const all = (validators || []).map((t) => {
        return api.derive.accounts.info(t.accountId.toString())
      })
      Promise.all(all).then((results) => {
        const identitys = results.map(nomalizeValidatorIdentity)
        localStorage.setItem(todayKey, JSON.stringify(identitys))
        cb(identitys)
      }).catch(console.error)
    }
  }

  fetchValidators = async (api, address) => {
    const era = await api.derive.session.indexes()
    const lastEra = era.activeEra.gtn(0) ? era.activeEra.subn(1) : BN_ZERO
    const validatorReward = await api.query.staking.erasValidatorReward(lastEra)

    Promise.all([api.derive.staking.electedInfo(), api.derive.staking.waitingInfo()]).then(results => {
      const result = extractInfo([address], baseBalance(), results[0], results[1], validatorReward.unwrapOrDefault())
      const validators = result.validators.map(nomalizeValidator)
      updateValidators(validators)
      this.fetchValidatorIdentity(api, validators, (identitys) => {
        updateValidators(mergeValidatorDisplayName(validators, identitys))
      })
    }).catch(console.error)
  }

  updateLocalData = async () => {
    const _api = getAPI()
    const { account, updateEraElectionStatus, updateAccount, updateStakingAccount, updateSelectedValidators, updateValidators, updateReferendums, updateCouncil, updateDemocracy } = this.props
    if (_api && account.address) {
      _api.derive.balances.all(account.address).then((balances) => {
        updateAccount({ ...normalizeBalances(balances) })
      }).catch(console.error)

      _api.derive.democracy.referendums().then((results) => {
        const items = []
        results.map((result) => {
          let resultMeta = {}
          if (result.image) {
            resultMeta = _api.registry.findMetaCall(result.image.proposal.callIndex);
          }
          items.push({ ...result, ...resultMeta })
        })
        console.log('###referendums', results)
        updateReferendums(items)
      }).catch(console.error)

      _api.derive.democracy.proposals().then((results) => {
        const items = []
        results.map((result) => {
          let resultMeta = {}
          if (result.image) {
            resultMeta = _api.registry.findMetaCall(result.image.proposal.callIndex);
          }
          items.push({ ...result, ...resultMeta })
        })
        updateDemocracy(items)
      }).catch(console.error)

      _api.derive.council.proposals().then((results) => {
        const items = []
        results.map((result) => {
          const resultMeta = _api.registry.findMetaCall(result.proposal.callIndex);
          items.push({ ...result, ...resultMeta })
        })
        updateCouncil(items)
      }).catch(console.error)

      if (!(window.location.href.includes('governance') || window.location.href.includes('vote'))) {
        _api.query.staking.eraElectionStatus().then((status) => {
          updateEraElectionStatus(status.isOpen)
        }).catch(console.error)

        _api.derive.staking.account(account.address).then((stakingAccount) => {
          const _stakingAccount = nomalizeStakingAccount(stakingAccount)
          updateStakingAccount(_stakingAccount)
          updateSelectedValidators((_stakingAccount.nominators))
        }).catch(console.error)

        axios.get(`${window.location.origin}/api/${isPolkadot() ? 'polkadot' : 'kusama'}/validators`).then((res) => {
          if (res.data.length === 0) {
            this.fetchValidators(_api, account.address)
          } else {
            updateValidators(res.data)
          }
        }).catch(() => {
          this.fetchValidators(_api, account.address)
        })
      }
    }
  }

  componentWillUnmount() {
    pubsub.off('api-ready')
    pubsub.off('sendingTx')
    pubsub.off('sendingTx')
  }

  render() {

    return (
      <BrowserRouter>
        {process.env.NODE_ENV !== 'development' && <SupportModal />}
        <Switch>
          <Route exact path="/kusama" component={Home} />
          <Route exact path="/kusama/nominators" component={Nominators} />
          <Route exact path="/kusama/validators" component={Validators} />
          <Route path="/kusama/validator/:id" component={Validator} />
          <Route exact path="/kusama/bond" component={Bond} />
          <Route exact path="/kusama/unbond" component={Unbond} />
          <Route exact path="/kusama/vote" component={Governance} />
          <Route exact path="/kusama/claims" component={Claims} />
          <Route exact path="/kusama/governance" component={Governance} />
          <Route exact path="/kusama/coming-soon" component={ComingSoon} />
        </Switch>
        <Switch>
          <Route exact path="/polkadot" component={Home} />
          <Route exact path="/polkadot/nominators" component={Nominators} />
          <Route exact path="/polkadot/validators" component={Validators} />
          <Route path="/polkadot/validator/:id" component={Validator} />
          <Route exact path="/polkadot/bond" component={Bond} />
          <Route exact path="/polkadot/unbond" component={Unbond} />
          <Route exact path="/polkadot/vote" component={Governance} />
          <Route exact path="/polkadot/claims" component={Claims} />
          <Route exact path="/polkadot/governance" component={Governance} />
          <Route exact path="/polkadot/coming-soon" component={ComingSoon} />
        </Switch>
      </BrowserRouter >
    )
  }
}

const mapStateToProps = state => {
  return {
    account: selectAccount(state),
    isNominating: selectIsNominating(state),
  }
}

const mapDispatchToProps = {
  updateAccount,
  updateStakingAccount,
  updateValidators,
  updateSelectedValidators,
  updateEraElectionStatus,
  updateIsNominating,
  updateExistentialDeposit,
  updateReferendums,
  updateCouncil,
  updateDemocracy,
}


export default connect(mapStateToProps, mapDispatchToProps)(Polkadot)

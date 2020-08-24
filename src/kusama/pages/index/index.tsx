import React, { } from 'react'
import { connect } from "react-redux"
import { useHistory } from 'react-router-dom'
import './index.scss'
import Navbar from 'kusama/components/Navbar'
import { selectAccount, selectStakingAccount, selectValidators, selectEraElectionStatus, selectIsNominating } from 'kusama/lib/redux/selectors'
import AccountCard from 'kusama/components/AccountCard'
import VotedCard from 'kusama/components/Validators/VotedCard'
import BottomButton from 'kusama/components/BottomButton'
import t from 'kusama/locales'
import { isExist } from 'kusama/lib/utils'
import { updateSelectedValidators } from 'kusama/lib/redux/actions'
import { isPolkadot } from 'kusama/lib/is'
import { getRouteName, getUnit } from 'kusama/lib/helper'
import EraStatus from 'kusama/components/EraStatus'

const Page = ({ account, stakingAccount, validators, eraElectionStatus, updateSelectedValidators, isNominating }) => {
  const { nominators, controllerId } = stakingAccount
  const btnTitle = isExist(controllerId) ? t('change_nominators') : t('start_staking')
  const history = useHistory()
  const disabled = eraElectionStatus || validators.length === 0 || !!isNominating
  const accountTitle = isPolkadot() ? 'Polkadot Wallet' : 'Kusama Wallet'

  return (
    <div className="home" id="home">
      <Navbar index={0} chain={getRouteName()} />
      <AccountCard
        account={account}
        stakingAccount={stakingAccount}
        unit={getUnit()}
        accountTitle={accountTitle}
        eraElectionStatus={eraElectionStatus}
      />
      <EraStatus eraElectionStatus={eraElectionStatus} />
      <VotedCard
        stakingAccount={stakingAccount}
        validators={validators}
      />
      <BottomButton
        disabled={disabled}
        title={btnTitle}
        onClick={() => {
          updateSelectedValidators((nominators || []).map(t => t.toString()).filter((t => validators.find(s => s.accountId === t))))
          history.push(`/${getRouteName()}/nominators`)
        }} />
    </div>
  )
}


const mapStateToProps = _state => {
  return {
    account: selectAccount(_state),
    stakingAccount: selectStakingAccount(_state),
    validators: selectValidators(_state),
    eraElectionStatus: selectEraElectionStatus(_state),
    isNominating: selectIsNominating(_state),
  }
}

const mapDispatchToProps = {
  updateSelectedValidators,
}

export default connect(mapStateToProps, mapDispatchToProps)(Page)

import React, { useState } from 'react'
import { connect } from "react-redux"
import { selectSelectedValidators, selectStakingAccount, selectAccount, selectIsNominating, selectExistentialDeposit } from 'kusama/lib/redux/selectors'
import t from 'kusama/locales'
import './index.scss'
import { fksm, isExist, toBN } from 'kusama/lib/utils'
import BottomButton from 'kusama/components/BottomButton'
import { inputToBn } from 'kusama/lib/format'
import { bondExtra, batchBondNominate } from 'kusama/lib/kusama'
import toast from 'kusama/lib/toast'
import { useHistory } from 'react-router-dom'
import Statement from 'kusama/components/Statement'
import { getUnit, getRouteName, calcStakingAvailableBalance } from 'kusama/lib/helper'
import { updateIsNominating } from 'kusama/lib/redux/actions'
import { isPolkadot } from 'kusama/lib/is'

const Bond = ({ stakingAccount, account, selectedValidators, updateIsNominating, isNominating, existentialDeposit }) => {
  const { stakingLedger, controllerId } = stakingAccount
  const availableBalance = calcStakingAvailableBalance(account, stakingAccount)

  const [bondValue, setBondValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const number = Number(bondValue)

  const history = useHistory()

  return (
    <div className={`bond-page ${isPolkadot() ? 'polkadot' : ''}`}>
      <div className="form">
        <span>{t('bond_yet')}</span>
        <i>{`${isExist(stakingLedger) ? fksm(stakingLedger.active) : '0.000'} ${getUnit()}`}</i>
      </div>
      <div className="form">
        <span>{t('add_bond_balance')}</span>
        <p>
          <i style={{ marginRight: 10 }}>{t('available_balance')}</i>
          <i>{`${fksm(isExist(availableBalance) ? availableBalance : '')} ${getUnit()}`}</i>
        </p>
      </div>
      <div className="form">
        <input type="number" value={bondValue} onChange={(e) => {
          if (/^\d*\.?\d*$/.test(e.target.value)) {
            setBondValue(e.target.value)
          }
        }} />
      </div>

      <Statement
        title={t('bond_statement_title')}
        statements={[
          t('bond_statement_1', getUnit()),
          t(isPolkadot() ? 'bond_statement_2_polkadot' : 'bond_statement_2', getRouteName(true)),
          t('bond_statement_3', getUnit()),
          t('bond_statement_4', getUnit()),
          t('bond_statement_5', getUnit()),
        ]}
      />

      <BottomButton
        title={t('confirm')}
        disabled={Number(bondValue) <= 0 || !!isNominating}
        isLoading={isLoading}
        onClick={() => {
          if (isNaN(number) || number <= 0) {
            return toast.warn(t('bond_value_zero'))
          }
          if (number > toBN(availableBalance).toNumber()) {
            return toast.warn(t('balance_not_enough_for_bond'))
          }
          if (number > Number(fksm(availableBalance))) {
            return toast.warn(t('maxmum_bond_amount_limit'))
          }
          if (isLoading) return

          if (isExist(controllerId)) {
            setIsLoading(true)
            bondExtra(inputToBn(bondValue), account, () => history.goBack())
              .then((txHash) => {
                setIsLoading(false)
              }).catch(e => {
                setIsLoading(false)
                toast.warn(e.message)
              })
          } else {
            if (number < existentialDeposit) {
              return toast.warn(t('minimum_bond_amount_limit', existentialDeposit, getUnit()))
            }
            setIsLoading(true)
            // first time nominate & bond
            batchBondNominate(inputToBn(bondValue), selectedValidators, account, (txHash) => {
              updateIsNominating(txHash)
              history.go(-2)
            })
              .then((txHash) => {
                setIsLoading(false)
              }).catch(e => {
                setIsLoading(false)
                toast.warn(e.message)
              })
          }
        }}
      />
    </div>
  )
}

const mapStateToProps = state => {
  return {
    stakingAccount: selectStakingAccount(state),
    account: selectAccount(state),
    selectedValidators: selectSelectedValidators(state),
    isNominating: selectIsNominating(state),
    existentialDeposit: selectExistentialDeposit(state),
  }
}

const mapDispatchToProps = {
  updateIsNominating,
}

export default connect(mapStateToProps, mapDispatchToProps)(Bond)

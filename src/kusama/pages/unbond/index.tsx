import React, { useState } from 'react'
import './index.scss'
import { connect } from "react-redux"
import { selectSelectedValidators, selectStakingAccount, selectAccount } from 'kusama/lib/redux/selectors'
import t from 'kusama/locales'
import './index.scss'
import { fksm, isExist } from 'kusama/lib/utils'
import BottomButton from 'kusama/components/BottomButton'
import { unbond } from 'kusama/lib/kusama'
import { inputToBn, toBN } from 'kusama/lib/format'
import toast from 'kusama/lib/toast'
import Statement from 'kusama/components/Statement'
import { getUnit, getRouteName } from 'kusama/lib/helper'
import { isPolkadot } from 'kusama/lib/is'

const Unbond = ({ stakingAccount, account }) => {
  const { stakingLedger } = stakingAccount

  const [unbondValue, setUnbondValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const number = Number(unbondValue)

  return (
    <div className={`unbond-page ${isPolkadot() ? 'polkadot' : ''}`}>
      <div className="form">
        <span>{t('unbond')}</span>
        <p>
          <i style={{ marginRight: 10 }}>{t('unbondable_balance')}</i>
          <i>{`${fksm(isExist(stakingLedger) ? stakingLedger.active : '')} ${getUnit()}`}</i>
        </p>
      </div>
      <div className="form">
        <input type="number" value={unbondValue} onChange={(e) => setUnbondValue(e.target.value)} />
      </div>

      <Statement
        title={t('unbond_statement_title')}
        statements={[
          t(isPolkadot() ? 'unbond_statement_1_polkadot' : 'unbond_statement_1', getRouteName(true)),
          t('unbond_statement_2', getUnit()),
        ]}
      />

      <BottomButton
        title={t('confirm')}
        disabled={isNaN(number) || number <= 0}
        isLoading={isLoading}
        onClick={() => {
          if (isNaN(number) || number <= 0) {
            return toast.warn(t('unbond_value_zero'))
          }
          if (number > Number(fksm(stakingLedger.active))) {
            return toast.warn(t('maxmum_unbond_amount_limit'))
          }
          if (isExist(stakingLedger) && number <= toBN(stakingLedger.active).toNumber()) {
            setIsLoading(true)
            unbond(inputToBn(unbondValue), account, () => window.history.back())
              .then((txHash) => {
                setIsLoading(false)
              }).catch(e => {
                setIsLoading(false)
                toast.warn(e.message)
              })
          } else {
            return toast.warn(t('active_not_enough_for_unbond'))
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
  }
}

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(Unbond)

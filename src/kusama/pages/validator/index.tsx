import React from 'react'
import { connect } from "react-redux"
import { useRouteMatch } from 'react-router-dom'
import { selectValidators, selectStakingAccount, selectAccount } from 'kusama/lib/redux/selectors'
import { ellipsis, fksm } from 'kusama/lib/utils'
import Loading from 'kusama/components/loading'
import './index.scss'
import t from 'kusama/locales'
import { getRouteName, getUnit } from 'kusama/lib/helper'
import Bio from './Bio'
import { isPolkadot } from 'kusama/lib/is'

const Validator = ({ account, validators, stakingAccount }) => {

  let match = useRouteMatch(`/${getRouteName()}/validator/:id`)
  const { id } = match.params
  const v = validators.find(t => t.key === id)

  if (!validators || !validators.length || !v || !stakingAccount) return <Loading />

  let displayName = v.displayName || ellipsis(v.key)

  return (
    <div className={`validator-page ${isPolkadot() ? 'polkadot' : ''}`}>
      <div className="info-top">
        <div>
          <p className="display-name">{displayName}</p>
          <p className="address">{ellipsis(v.key)}</p>
        </div>

        <span className="rank">{`No.${v.rankOverall}`}</span>
      </div>

      <div className="digest">
        <div>
          <div>
            <span>{t('bond_total')}</span>
            <i>{fksm(v.bondTotal)}</i>
          </div>
          <div>
            <span>{t('bond_own')}</span>
            <i>{fksm(v.bondOwn)}</i>
          </div>
          <div>
            <span>{t('nominators')}</span>
            <i>{v.numNominators}</i>
          </div>
        </div>
        <div>
          <div>
            <span>{t('fee_payout')}</span>
            <i>{`${v.commissionPer.toFixed(2)}%`}</i>
          </div>
          <div>
            <span>{t('points')}</span>
            <i>{v.point || '~'}</i>
          </div>
          <div>
            <span>{t('reward_payout', getUnit())}</span>
            <i>{fksm(isPolkadot() ? v.rewardPayout / 100 : v.rewardPayout)}</i >
          </div>
        </div>
      </div>

      <Bio info={v} />

      <div className="bond-other-list">
        <div>
          <p>
            <span>{t('nominators')}</span>
            <span style={{ marginLeft: 8 }}>{t('bond_number')}</span>
          </p>

          <span>{t('bond_share')}</span>
        </div>
        {v.bondOtherList.sort(t => {
          if (t.who === account.address) {
            return -1
          }
          return 1
        }).map((item) => {
          return (
            <div key={item.who}>
              <div>
                <p>
                  <span>{ellipsis(item.who)}</span>
                  {item.who === account.address && <span className="self">{t('self')}</span>}
                </p>
                <p className="ksm-number">{`${fksm(item.value)} ${getUnit()}`}</p>
              </div>

              <i>{`${(item.value * 100 / v.bondTotal).toFixed(2)} %`}</i>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const mapStateToProps = _state => {
  return {
    account: selectAccount(_state),
    validators: selectValidators(_state),
    stakingAccount: selectStakingAccount(_state),
  }
}

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(Validator)

import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './index.scss'
import { ellipsis, fksm } from 'kusama/lib/utils'
import t from 'kusama/locales'
import { getRouteName, getUnit } from 'kusama/lib/helper'
import icons from 'kusama/lib/icons'
import { isPolkadot } from 'kusama/lib/is'

interface Props {
  validator: any
  pool?: any
  isHideBadge?: boolean
  onSelect?: any
  isSelected?: boolean
  isSelectable: boolean
}

class ValidatorCard extends Component<Props> {
  render() {
    const { onSelect, validator } = this.props

    if (onSelect) {
      return (
        <div onClick={() => onSelect(validator)}>
          {this.renderInner()}
        </div>
      )
    }

    return (
      <Link to={`/${getRouteName()}/validator/${validator.key}`}>
        {this.renderInner()}
      </Link>
    )
  }

  renderInner() {
    const { validator, isHideBadge, isSelected, isSelectable } = this.props
    const { commissionPer, accountId, bondTotal, rewardPayout, rankOverall, displayName } = validator

    let _displayName = displayName || ellipsis(accountId.toString())

    return (
      <div className={`validator ${isPolkadot() ? 'polkadot' : ''}`}>
        {!isHideBadge && <div className="validator-rank-badge">{rankOverall}</div>}
        <div className="content">
          <p>{_displayName}</p>
          <div className="detail">
            <div>
              <span>{t('commission_per')}</span>
              <i>{`${commissionPer < 1 ? '0' : commissionPer}%`}</i>
            </div>
            <div>
              <span>{t('bond_total')}</span>
              <i>{fksm(bondTotal)}</i>
            </div>
            <div>
              <span>{t('reward_payout', getUnit())}</span>
              <i>{fksm(isPolkadot() ? rewardPayout / 100 : rewardPayout)}</i>
            </div>
          </div>
        </div>
        {isSelectable && <img src={isSelected ? icons.CHECKED : icons.UNCHECKED} className="checkbox" alt="" />}
      </div>
    )
  }
}

export default ValidatorCard

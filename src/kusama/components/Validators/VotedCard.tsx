import React from 'react'
import t, { getLocale } from 'kusama/locales'
import './index.scss'
import { isExist } from 'kusama/lib/utils'
import ValidatorCard from 'kusama/components/ValidatorCard'
import icons from 'kusama/lib/icons'
import { isPolkadot } from 'kusama/lib/is'

export default ({ stakingAccount, validators }) => {
  const { nominators } = stakingAccount

  const isEmpty = (!isExist(nominators) || nominators.length === 0) && validators.length !== 0

  const _nominators = (nominators || []).map(t => {
    return validators.find(v => v.key === t.toString())
  }).filter(t => !!t)

  const elected = _nominators.filter(t => t.isElected)
  const notElected = _nominators.filter(t => !t.isElected)
  const isLoading = validators.length === 0

  return (
    <div className={`voted-card ${isPolkadot() ? 'polkadot' : ''}`}>
      <div className="card-title">
        <span>{t('my_nominators')}</span>
        <a href={`https://support.token.im/hc/${getLocale() === 'zh' ? 'zh-cn' : 'en-us'}/sections/${isPolkadot() ? '900000310003' : '900000306866'}`}>
          <img src={icons.QMARK} alt="link" />
        </a>
      </div>
      {isLoading && (
        <div className="placeholder">
          <img src={icons.LOADING_VALIDATORS} style={{ width: 60, height: 60 }} alt="loading" />
          <span>{t('fetching_validators')}</span>
        </div>
      )}
      {isEmpty && (
        <div className="placeholder">
          <img src={icons.NO_VOTED} alt="no nominators" />
          <span>{t('choose_validators_to_stake')}</span>
        </div>
      )}
      <div className="validator-list">
        {elected.map((v) => {
          return (
            <ValidatorCard
              key={v.key}
              validator={v}
              isSelectable={false}
            />
          )
        })}
        {!!notElected.length && (
          <div className="not-elected">
            <p>{t('nominator_not_elected')}</p>
          </div>
        )}
        {notElected.map((v) => {
          return (
            <ValidatorCard
              key={v.key}
              validator={v}
              isSelectable={false}
            />
          )
        })}
      </div>
    </div>
  )
}
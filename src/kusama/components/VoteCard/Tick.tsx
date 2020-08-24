import React from 'react'
import './index.scss'
import t from 'kusama/locales'

export default ({ nextReferenda, nextProposalSource }) => {
  return (
    <div className="tick-card">
      <p>{t('tick_board_title')}</p>
      <div>
        <dl>
          <dt>{t('next_voting')}</dt>
          <dd>{nextReferenda ? `${nextReferenda.days} ${t('days')} ${nextReferenda.hours}:${nextReferenda.minutes}` : ''}</dd>
        </dl>
        <dl>
          <dt>{t('next_voting_source')}</dt>
          <dd>{nextProposalSource}</dd>
        </dl>
      </div>
    </div>
  )
}
import React from 'react'
import t from 'kusama/locales'
import './index.scss'
import { isPolkadot } from 'kusama/lib/is'

const ComingSoon = ({ }) => {
  return (
    <div className="vote-page">
      <div className={`cs-img ${isPolkadot() ? 'dot' : 'ksm'}`}>
        <div className="coming-soon">
          <span>{t('coming_soon')}</span>
        </div>
      </div>
    </div>
  )
}

export default ComingSoon

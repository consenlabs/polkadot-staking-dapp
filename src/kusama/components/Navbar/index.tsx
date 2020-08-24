import React from 'react'
import { Link } from 'react-router-dom'
import t from 'kusama/locales'
import './index.scss'
import { isPolkadot } from 'kusama/lib/is'

export default ({ index, chain }) => {
  return (
    <div className={`navbar ${isPolkadot() ? 'polkadot' : ''}`}>
      <div>
        <Link className={index === 0 ? "selected" : ""} to={`/${chain}`}>
          <span>{t('my_nominators')}</span>
        </Link>
        <Link className={index === 1 ? "selected" : ""} to={`/${chain}/validators`}>
          <span>{t('validators')}</span>
        </Link>
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import { ellipsis } from 'kusama/lib/utils'
import t from 'kusama/locales'
import './index.scss'
import { isiPhoneX, isPolkadot } from 'kusama/lib/is'
import icons from 'kusama/lib/icons'

export default ({ selectedValidators, stakingAccount, setSelectedValidators }) => {
  const [isFold, setIsFold] = useState(false)

  return (
    <div className={`vote-selector ${isPolkadot() ? 'polkadot' : ''}`} style={{ bottom: isiPhoneX() ? 96 : 60 }}>
      <img src={icons.TO_TOP} className="to-top" onClick={() => window.scrollTo(0, 0)} alt="" />

      <div className="header">
        <p>
          <span>{`${t('voted_validators')} `}</span>
          <span style={{ color: 'white' }} className="nominator-number">{`${selectedValidators.length}/16`}</span>
          {isFold && <span className="clear" onClick={() => setSelectedValidators([])}>{t('clear')}</span>}
        </p>
        <img src={isFold ? icons.CHEVRON_DOWN : icons.CHEVRON_UP} onClick={() => setIsFold(!isFold)} alt="" />
      </div>
      {isFold && (
        <div className="list">
          {selectedValidators.map((t) => {
            return (
              <div key={t} onClick={() => setSelectedValidators(selectedValidators.filter(k => k !== t))}>
                <span>{ellipsis(t)}</span>
                <img src={icons.CHECKED} alt="" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
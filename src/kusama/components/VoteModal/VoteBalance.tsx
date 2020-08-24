import React from 'react'
import icons from 'kusama/lib/icons'
import t from 'kusama/locales'
import { getUnit } from 'kusama/lib/helper'
import { convictionOpts } from './Conviction'

export default ({ value, setValue, conviction, onSwitchConviction }) => {

  const opt = convictionOpts.find(t => t.value === conviction)
  const vote = value * (opt as any).lock
  return (
    <div className="modal-content vote-balance">
      <p className="vote-weight">{vote || '0'}</p>
      <p className="vote-weight-calc">{value ? `${value}${getUnit()} x ${(opt as any).lock}` : '0'}</p>
      <div className="balance-input">
        <input
          value={value}
          placeholder={t('input_vote_balance')}
          pattern="^\d*\.?\d*$"
          onChange={(e) => {
            if (/^\d*\.?\d*$/.test(e.target.value)) {
              setValue(e.target.value)
            }
          }}
        />
        <span>{getUnit()}</span>
      </div>

      <div className="convition" onClick={() => onSwitchConviction()}>
        <span>{t('conviction_title')}</span>
        <div>
          <dl>
            <dd>{t(`${opt.text}_label`)}</dd>
            <dd>{t(`${opt.text}`)}</dd>
          </dl>
          <img src={icons.RIGHT} alt="chevron" />
        </div>
      </div>

      {/* <p className="vote-tip">{t('vote_tip')}</p> */}
    </div>
  )
}
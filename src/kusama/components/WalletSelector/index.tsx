import React from 'react'
import './index.scss'
import t from 'kusama/locales'
import toast from 'kusama/lib/toast'
import { ellipsis } from 'kusama/lib/format'
import icons from 'kusama/lib/icons'

export default ({ chainType, address = '', onSelect }) => {

  const _chainType = chainType.toUpperCase()
  const onClick = () => {
    window.imToken.callPromisifyAPI('user.showAccountSwitch', { chainType: _chainType })
      .then(onSelect).catch(e => {
        if (e.code !== 1001) {
          toast.warn(e.message)
        }
      })
  }

  return (
    <div className="selector-box" onClick={onClick}>
      {!!address ?
        <div>
          <span>{chainType} {t('wallet')}</span>
          <span>{ellipsis(address, 10, 10)}</span>
        </div>
        :
        <span className="placeholder">{t('select_$chainType_wallet', chainType)}</span>
      }
      <img src={icons.selectorTriggerSvg} alt="" />
    </div>
  )
}
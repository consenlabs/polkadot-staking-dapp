import React, { useState, useEffect } from 'react'
import './index.scss'
import t, { getLocale } from 'kusama/locales'
import icons from 'kusama/lib/icons'
import { isPolkadot } from 'kusama/lib/is'

export default ({ eraElectionStatus }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (eraElectionStatus) {
      setIsVisible(true)
    }
  }, [eraElectionStatus]);

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="era-status"
      onClick={() => {
        window.location.href = `https://support.token.im/hc/${getLocale() === 'zh' ? 'zh-cn' : 'en-us'}/articles/${isPolkadot() ? '900001688006' : '900001603906'}`
      }}
    >
      <img src={icons.ERA_STATUS} alt="" />
      <div className="right">
        <p className="title">{t('era_electing_title')}</p>
        <p className="desc">{t('era_electing_desc')}</p>
      </div>
      <img src={icons.CLOSE_O} className="close-o" onClick={(e) => {
        setIsVisible(false)
        e.bubbles = false
        e.stopPropagation()
      }} alt="" />
    </div>
  )
}
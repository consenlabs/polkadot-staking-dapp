import React, { useState, useEffect } from 'react'
import './index.scss'
import t from 'kusama/locales'
import { pubsub } from 'kusama/lib/event'
import icons from 'kusama/lib/icons'

export default ({ txHash, amount, address, unit = "DOT", onSuccess = () => { }, onFailed = (e) => { } }) => {

  const [status, setStatus] = useState('pending')
  const isSuccess = status === 'success'
  const isFailed = status === 'failed'

  useEffect(() => {
    pubsub.once('sendTxSuccess', () => {
      setStatus('success')
      onSuccess && onSuccess()
    })

    pubsub.once('sendTxWrong', ({ error }) => {
      setStatus('failed')
      onFailed && onFailed(error)
    })
    return () => {
      pubsub.off('sendTxSuccess')
      pubsub.off('sendTxWrong')
    }
  }, [])

  return (
    <div className="claims-tx-status">
      <div>
        <img src={isSuccess ? icons.txDoneSvg : isFailed ? icons.txFailedSvg : icons.txPendingGif} alt="" />
        <span>{t(isSuccess ? 'claims_success' : isFailed ? 'claims_failed' : t('claims_pending', unit))}</span>
        <i>{amount} {unit}</i>
      </div>
      <span className="address-label">{t('claiming_dot_wallet_address', unit)}</span>
      <strong className="address">{address}</strong>
    </div>
  )
}
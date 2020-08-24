import React from 'react'
import { isiPhoneX, IPHONEX_HEIGHT } from 'kusama/lib/utils'
import './index.scss'
import Loading from 'react-loading'
import { isPolkadot } from 'kusama/lib/is'

export default ({ title, onClick, disabled = false, style = {}, isLoading = false }) => {
  return (
    <div className={`toolbar ${isPolkadot() ? 'polkadot' : ''}`} style={{ padding: 0 }}>
      <div className="toolbar-row" style={{ paddingBottom: isiPhoneX() ? IPHONEX_HEIGHT : 10 }}>
        <button
          className={`btn ${disabled ? 'disabled' : ''}`}
          style={style}
          disabled={disabled}
          onClick={() => {
            if (!isLoading) {
              onClick()
            }
          }}
        >
          {isLoading ? (
            <Loading type="spin" width={30} height={30} />
          ) : (
              <span>{title}</span>
            )}
        </button>
      </div>
    </div>
  )
}
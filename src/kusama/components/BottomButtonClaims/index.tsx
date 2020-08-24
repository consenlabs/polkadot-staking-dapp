import React from 'react'
import { isiPhoneX, IPHONEX_HEIGHT } from 'kusama/lib/utils'
import './index.scss'

export default ({ title, link = "", onClick, disabled = false, loading = false, fixed = false, rowStyle = {}, style = {} }) => {
  return (
    <div className={`bottom-button ${fixed ? 'fixed' : ''}`}>
      <div className="button-row" style={{ paddingBottom: isiPhoneX() ? IPHONEX_HEIGHT : 10, ...rowStyle }}>
        <button className={`btn ${disabled ? 'disabled' : ''}`} style={style} disabled={disabled} onClick={onClick}>
          <span>{loading ? ('loading...') : title}</span>
        </button>
      </div>
    </div>
  )
}
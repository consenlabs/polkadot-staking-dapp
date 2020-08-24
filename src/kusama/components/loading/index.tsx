import React from 'react'
import './index.scss'

export default (props) => {
  const { size, style } = props

  let ringStyle = {}
  let ldsRingStyle = {}
  if (!!size) {
    const len = 2 // size < 30 ? size - 4 : 10
    ringStyle = {
      width: size - len,
      height: size - len,
      border: '2px solid #51516c',
      margin: 2,
    }
    ldsRingStyle = { width: size, height: size }
  }
  return (
    <div className="loading-wrap" style={style || {}}>
      {props.endText ? <div style={ringStyle}>{props.endText}</div> :
        <div className="lds-ring" style={ldsRingStyle}>
          <div style={ringStyle}></div>
          <div style={ringStyle}></div>
          <div style={ringStyle}></div>
          <div style={ringStyle}></div>
        </div>
      }
    </div>
  )
}
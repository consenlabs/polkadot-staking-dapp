import React from 'react'
import "./index.scss"
import { isPolkadot } from 'kusama/lib/is'

export default ({ title, statements }) => {
  return (
    <div className={`statement-wrap ${isPolkadot() ? 'polkadot' : ''}`}>
      <p className="title">{title}</p>
      <ul className="statement-list">
        {statements.map(statement => {
          return (
            <li key={statement} >
              <span>{statement}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
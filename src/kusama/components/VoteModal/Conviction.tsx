import React from 'react'
import icons from 'kusama/lib/icons'
import t from 'kusama/locales'
import { isPolkadot } from 'kusama/lib/is'

const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock])
export const convictionOpts = [
  { text: 'x_0_1_voting_balance', value: 0, lock: 0.1 },
  ...CONVICTIONS.map(([value, lock]): { text: string; value: number } => ({
    text: `x${value}_voting_balance`,
    value,
    lock,
  } as any))
]

export default ({ conviction, setConviction }) => {

  return (
    <div className="modal-content convition-list">
      {convictionOpts.map((item) => {
        return (
          <dl key={item.text} onClick={() => setConviction(item.value)}>
            <dt>
              <img src={icons.CHECKED} style={{ visibility: item.value === conviction ? 'visible' : 'hidden' }} />
              <span>{t(isPolkadot() ? `${item.text}_label_dot` : `${item.text}_label`)}</span>
            </dt>
            <dd>
              <span>{t(item.text)}</span>
            </dd>
          </dl>
        )
      })}
    </div>
  )
}
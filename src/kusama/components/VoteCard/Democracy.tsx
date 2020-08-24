import React, { useState } from 'react'
import t from 'kusama/locales'
import icons from 'kusama/lib/icons'
import { getUnit, getRouteName } from 'kusama/lib/helper'
import { ellipsis } from 'kusama/lib/format'
import Modal from '../Modal'
import BottomButton from '../BottomButton'
import { second } from 'kusama/lib/kusama'
import toast from 'kusama/lib/toast'
import { isPolkadot } from 'kusama/lib/is'
import { fksm } from 'kusama/lib/utils'

export default ({ items = [], account }) => {

  const [fold, setFold] = useState(false);
  const [votingItem, setVotingItem] = useState(null);

  const { availableBalance } = account

  return (
    <div className="referenda-card democracy-card">
      <div className="header">
        <p className="title">{t('citizen_proposal_queue')}</p>
        <img src={fold ? icons.DOWN : icons.UP} style={{ padding: '0 5px' }} onClick={() => setFold(!fold)} alt="chevron" />
      </div>
      <Modal
        isOpen={!!votingItem}
        appElement={document.body}
      >
        <div className="modal-body">
          <div className="modal-header">
            <img src={icons.CANCEL} onClick={() => setVotingItem(null)} alt="cancel" />
            <span>{`VOTE`}</span>
            <img src={icons.CANCEL} style={{ visibility: 'hidden' }} alt="cancel-hidden" />
          </div>
          <div className="modal-content">
            <img src={icons.SECOND} alt="second" />
            <p>{t('second_desc')}</p>
            <div className="frozen with-border">
              <p>
                <span>{t('frozen_token')}</span>
              </p>

              <span>{`${votingItem ? fksm(votingItem.balance) : '1'} ${getUnit()}`}</span>
            </div>
            <div className="frozen">
              <p>
                <span>{t('available_balance')}</span>
              </p>

              <span>{`${fksm(availableBalance)} ${getUnit()}`}</span>
            </div>
          </div>
          <BottomButton
            title={t('second')}
            disabled={votingItem && account ? Number(fksm(availableBalance)) < Number(fksm(votingItem.balance)) : true}
            onClick={async () => {
              second(votingItem, account, () => {
                setVotingItem(null)
              }).catch(e => {
                toast.warn(e.message)
              })
            }}
          />
        </div>
      </Modal>
      {!fold && (
        <div className="items">
          {items.length === 0 && (
            <div className="no-proposal">
              <img src={isPolkadot() ? icons.DOT_PROPOSAL : icons.KSM_PROPOSAL} alt="no-proposal" />
              <p>{t('no_proposal')}</p>
            </div>
          )}
          {items.map((item, idx) => {
            let title = t('title_unset')
            if (item.meta) {
              const meta = item.meta.toJSON()
              title = item.method || meta.name
            }

            const isSeconded = !!item.seconds.find(t => t.toString() === account.address) || !account.address

            return (
              <div className="item" key={idx}>
                <a href={`https://${getRouteName()}.polkassembly.io/proposal/${item.index.toString()}`} className="item-link">
                  <img src={icons.UP_RIGHT} alt="link" />
                </a>
                <a className="top" href={`https://${getRouteName()}.polkassembly.io/proposal/${item.index.toString()}`}>
                  <div>
                    <p className="item-title">{`#${item.index.toString()} ${title}`}</p>
                  </div>
                </a>

                <div className="middle">
                  <dl>
                    <dt>{t('proposer')}</dt>
                    <dd>{ellipsis(item.proposer.toString())}</dd>
                  </dl>
                  <dl>
                    <dt>{t('frozen_balance')}</dt>
                    <dd>{`${Number(fksm(item.balance)) * item.seconds.length} ${getUnit()}`}</dd>
                  </dl>
                  <dl>
                    <dt>{t('second_amount')}</dt>
                    <dd>{item.seconds.length - 1}</dd>
                  </dl>
                </div>

                <div className="bottom">
                  <dl>
                    <dt>{t('second_cost')}</dt>
                    <dd>{`${fksm(item.balance)} ${getUnit()}`}</dd>
                  </dl>

                  <button disabled={isSeconded} className={isSeconded ? 'disabled' : ''} onClick={() => setVotingItem(item)}>
                    <span>{t('second')}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
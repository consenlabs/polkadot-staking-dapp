import React, { useState } from 'react'
import t from 'kusama/locales'
import icons from 'kusama/lib/icons'
import { isPolkadot } from 'kusama/lib/is'
import { getRouteName } from 'kusama/lib/helper'
import { Doughnut } from 'react-chartjs-2'
import { blockToTime, councilVote } from 'kusama/lib/kusama'
import Modal from '../Modal'
import BottomButton from '../BottomButton'
import toast from 'kusama/lib/toast'

export default ({ items = [], account, members, bestNumber }) => {

  const [fold, setFold] = useState(false);
  const [votingItem, setVotingItem] = useState(null);
  const [voteFor, setVoteFor] = useState('aye');

  const disabled = !(members || []).find(t => t.toString() === account.address)

  return (
    <div className="referenda-card">
      <div className="header">
        <p className="title">{t('concil_proposal_queue')}</p>
        <img src={fold ? icons.DOWN : icons.UP} style={{ padding: '0 5px' }} onClick={() => setFold(!fold)} alt="fold" />
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
          <div className="modal-content aye-or-nay">
            <dl onClick={() => setVoteFor('aye')}>
              <dt>{t('aye')}</dt>
              <dd>
                <img src={icons.CHECKED} style={{ visibility: voteFor === 'aye' ? 'visible' : 'hidden' }} alt="aye" />
              </dd>
            </dl>
            <dl onClick={() => setVoteFor('nay')}>
              <dt>{t('nay')}</dt>
              <dd>
                <img src={icons.CHECKED} style={{ visibility: voteFor === 'nay' ? 'visible' : 'hidden' }} alt="nay" />
              </dd>
            </dl>
          </div>
          <BottomButton
            title={t('confirm')}
            disabled={disabled}
            onClick={async () => {
              councilVote({
                proposal: votingItem.hash,
                index: votingItem.votes.index,
                approve: 'aye' === voteFor,
              }, account, () => {
                setVotingItem(null)
              }).catch(e => toast.warn(e.message))
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
            const _votes = item.votes.toJSON()
            let timeLeft = ''
            if (bestNumber) {
              const remainBlock = item.votes.end.sub(bestNumber).subn(1)
              const [, timeObj] = blockToTime(remainBlock) as any
              timeLeft = `${timeObj.days} ${t('days')} ${timeObj.hours}:${timeObj.minutes}`
            }
            const meta = item.meta.toJSON()

            return (
              <div className="item" key={idx}>
                <a href={`https://${getRouteName()}.polkassembly.io/motion/${_votes.index}`} className="item-link">
                  <img src={icons.UP_RIGHT} alt="link" />
                </a>
                <a className="top" href={`https://${getRouteName()}.polkassembly.io/motion/${_votes.index}`}>
                  <div className="chart">
                    <Doughnut
                      data={{
                        datasets: [{
                          data: [_votes.ayes.length, _votes.nays.length],
                          backgroundColor: ['#6CC8A1', '#F67676'],
                        }],
                        labels: [t('aye'), t('nay')],
                      }}
                      width={70}
                      height={70}
                      options={{ maintainAspectRatio: false }}
                      legend={{ display: false }}
                    />
                  </div>
                  <div style={{ flex: 1, paddingLeft: 20 }}>
                    <p className="item-title">{`#${_votes.index} ${item.method || meta.name}`}</p>
                    <div className="votes">
                      <dl>
                        <dt>
                          <img src={icons.APPROVE} alt="approve" />
                          <span>{t('aye')}</span>
                        </dt>
                        <dd>{`${_votes.ayes.length} ${t('ticket')}`}</dd>
                      </dl>
                      <dl>
                        <dt>
                          <img src={icons.REJECT} alt="reject" />
                          <span>{t('nay')}</span>
                        </dt>
                        <dd>{`${_votes.nays.length} ${t('ticket')}`}</dd>
                      </dl>
                    </div>
                  </div>
                </a>

                <div className="middle">
                  <dl>
                    <dt>{t('status')}</dt>
                    <dd>{t('status_open')}</dd>
                  </dl>
                  <dl>
                    <dt>{t('vote_clac_method')}</dt>
                    <dd>{t('$s_ticket_pass', _votes.threshold)}</dd>
                  </dl>
                </div>

                <div className="bottom">
                  <dl>
                    <dt>{t('vote_end')}</dt>
                    <dd>{timeLeft}</dd>
                  </dl>

                  <button className={disabled ? 'disabled' : ''} disabled={disabled} onClick={() => setVotingItem(item)}>
                    <span>{t('vote')}</span>
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
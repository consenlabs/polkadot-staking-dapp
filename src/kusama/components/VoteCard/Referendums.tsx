import React, { useState, useEffect } from 'react'
import t from 'kusama/locales'
import icons from 'kusama/lib/icons'
import { fksm } from 'kusama/lib/utils'
import { getUnit, getRouteName } from 'kusama/lib/helper'
import { Doughnut } from 'react-chartjs-2'
import VoteModal from '../VoteModal'
import { blockToTime, getAPI } from 'kusama/lib/kusama'
import { isPolkadot } from 'kusama/lib/is'
import { approxChanges } from './helper';


export default ({ items = [], account, bestNumber, members }) => {
  const [votingItem, setVotingItem] = useState(null);
  const [sqrtElectorate, setSqrtElectorate] = useState(null);

  useEffect(() => {
    if (items.length) {
      const api = getAPI()
      api.derive.democracy.sqrtElectorate().then(result => {
        setSqrtElectorate(result)
      }).catch(console.error)
    }
  }, [items]);

  return (
    <div className="referenda-card">
      <div className="header">
        <p className="title">{t('current_proposal')}</p>
      </div>
      <VoteModal
        isOpen={!!votingItem}
        votingItem={votingItem}
        account={account}
        onClose={() => setVotingItem(null)}
      />
      <div className="items">
        {items.length === 0 && (
          <div className="no-proposal">
            <img src={isPolkadot() ? icons.DOT_PROPOSAL : icons.KSM_PROPOSAL} alt="no-proposal" />
            <p>{t('no_proposal')}</p>
          </div>
        )}
        {items.map((item, idx) => {
          const _status = item.status.toJSON()

          let timeLeft = ''
          if (bestNumber) {
            const remainBlock = item.status.end.sub(bestNumber).subn(1)
            const [, timeObj] = blockToTime(remainBlock) as any
            timeLeft = `${timeObj.days} ${t('days')} ${timeObj.hours}:${timeObj.minutes}`
          }

          let title = t('title_unset')
          if (item.meta) {
            const meta = item.meta.toJSON()
            title = item.method || meta.name
          }

          let source = t('citizen_proposal')
          if (item.image && members.includes(item.image.proposer)) {
            source = t('parliament_proposal')
          }

          let ayeBal = '~'
          let nayBal = '~'
          if (sqrtElectorate) {
            const { changeAye, changeNay } = approxChanges(item.status.threshold, sqrtElectorate, {
              votedAye: item.votedAye,
              votedNay: item.votedNay,
              votedTotal: item.votedTotal,
            })
            ayeBal = fksm(changeAye).split('.')[0]
            nayBal = fksm(changeNay).split('.')[0]
          }

          return (
            <div className="item" key={idx}>
              <a href={`https://${getRouteName()}.polkassembly.io/referendum/${item.index.toString()}`} className="item-link">
                <img src={icons.UP_RIGHT} alt="link" />
              </a>
              <a className="top" href={`https://${getRouteName()}.polkassembly.io/referendum/${item.index.toString()}`}>
                <div className="chart">
                  <Doughnut
                    data={{
                      datasets: [{
                        data: [item.voteCountAye, item.voteCountNay],
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
                  <p className="item-title">{`#${item.index.toString()} ${title}`}</p>
                  <div className="votes">
                    <dl>
                      <dt>
                        <img src={icons.APPROVE} alt="approve" />
                        <span>{t('aye')}</span>
                      </dt>
                      <dd>{`${fksm(item.votedAye).split('.')[0]} ${getUnit()}`}</dd>
                      <dd className="vote-balance">{`${ayeBal} ${getUnit()}`}</dd>
                    </dl>
                    <div className="ver-divider"></div>
                    <dl>
                      <dt>
                        <img src={icons.REJECT} alt="reject" />
                        <span>{t('nay')}</span>
                      </dt>
                      <dd>{`${fksm(item.votedNay).split('.')[0]} ${getUnit()}`}</dd>
                      <dd className="vote-balance">{`${nayBal} ${getUnit()}`}</dd>
                    </dl>
                  </div>
                </div>
              </a>

              <div className="middle">
                <dl>
                  <dt>{t('source')}</dt>
                  <dd>{source}</dd>
                </dl>
                <dl>
                  <dt>{t('status')}</dt>
                  <dd>{t(item.isPassing ? 'status_successing' : 'status_failing')}</dd>
                </dl>
                <dl>
                  <dt>{t('vote_clac_method')}</dt>
                  <dd>{t(_status.threshold)}</dd>
                </dl>
              </div>

              <div className="bottom">
                <dl>
                  <dt>{t('vote_end')}</dt>
                  <dd>{timeLeft}</dd>
                </dl>

                <button onClick={() => setVotingItem(item)} disabled={!account.address}>
                  <span>{t('vote')}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux"
import { selectAccount, selectStakingAccount, selectReferendums, selectDemocracy, selectCouncil } from 'kusama/lib/redux/selectors'
import './index.scss'
import { getUnit, getRouteName } from 'kusama/lib/helper'
import { toBN, ellipsis, isExist, fksm } from 'kusama/lib/utils'
import Loading from 'react-loading'
import t from 'kusama/locales'
import Tick from 'kusama/components/VoteCard/Tick'
import Referendums from 'kusama/components/VoteCard/Referendums'
import Democracy from 'kusama/components/VoteCard/Democracy'
import { isPolkadot } from 'kusama/lib/is'
import Council from 'kusama/components/VoteCard/Council'
import { getAPI, blockToTime } from 'kusama/lib/kusama'
import { setTitle } from '@common/lib/sdk'

const Page = ({ account, referendums, democracy, council }) => {

  const [members, setMembers] = useState([]);
  const [bestNumber, setBestNumber] = useState(null);
  const [, setLaunchPeriod] = useState(null);
  const [, setIsReady] = useState(false);

  const [nextReferenda, setNextReferenda] = useState(null);

  const { address, availableBalance, lockedBalance, reservedBalance, vestedBalance } = account
  let totalBalance = undefined
  if (isExist(availableBalance)) {
    totalBalance = toBN(availableBalance).add(toBN(lockedBalance)).add(toBN(reservedBalance)).add(toBN(vestedBalance))
  }

  useEffect(() => {
    setTitle(`${isPolkadot() ? 'Polkadot' : 'Kusama'} Governance`)

    const nodeList = document.getElementsByTagName("link")
    for (var i = 0; i < nodeList.length; i++) {
      if ((nodeList[i].getAttribute("rel") === "icon") || (nodeList[i].getAttribute("rel") === "shortcut icon")) {
        nodeList[i].setAttribute("href", "/voting.png")
      }
    }
    if (isPolkadot()) {
      document.getElementsByTagName('html')[0].style.background = '#FAFBFC'
      document.getElementsByTagName('body')[0].style.background = '#FAFBFC'
    }

    const api = getAPI()
    if (api) {
      api.isReady.then(async () => {
        setIsReady(true)

        api.query.council.members().then(r => setMembers(r))

        api.derive.chain.bestNumber().then(r => {
          setBestNumber(r)

          const launchPeriod = api.consts.democracy.launchPeriod
          const result = blockToTime(launchPeriod.sub(r.mod(launchPeriod).addn(1)))
          setNextReferenda(result[1])
        })
        setLaunchPeriod(api.consts.democracy.launchPeriod)
      })
    }
  }, []);

  let nextProposalSource = t('citizen_proposal')
  const willPassCouncil = council.find(t => {
    const _votes = t.votes.toJSON()
    return _votes.ayes.length > _votes.threshold
  })
  if (willPassCouncil) {
    nextProposalSource = t('parliament_proposal')
  } else if (democracy.length === 0) {
    // 没有下一个提案
  }

  return (
    <div className={`governance-page ${isPolkadot() ? 'polkadot' : ''}`}>
      <div className="top">
        <dl>
          <dt>{`${getRouteName(true)} Wallet`}</dt>
          <dd>
            {address ? (
              <span>{ellipsis(address)}</span>
            ) : (
                <div className="loading-account">
                  <Loading type="spin" width={16} height={16} />
                  <span>{t('accessing_account')}</span>
                </div>
              )}
          </dd>
        </dl>
        <dl>
          <dt>{`${fksm(totalBalance)} ${getUnit()}`}</dt>
          <dd>{}</dd>
        </dl>
      </div>

      <Tick nextReferenda={nextReferenda} nextProposalSource={nextProposalSource} />

      <Referendums items={referendums} account={account} members={members} bestNumber={bestNumber} />

      <Democracy items={democracy} account={account} />

      <Council items={council} account={account} members={members} bestNumber={bestNumber} />

    </div>
  )
}

const mapStateToProps = _state => {
  return {
    account: selectAccount(_state),
    stakingAccount: selectStakingAccount(_state),
    referendums: selectReferendums(_state),
    democracy: selectDemocracy(_state),
    council: selectCouncil(_state),
  }
}

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(Page)

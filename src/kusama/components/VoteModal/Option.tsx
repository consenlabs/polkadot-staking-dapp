import React from 'react'
import icons from 'kusama/lib/icons'
import t from 'kusama/locales'

export default ({ setVoteFor, voteFor }) => {
  return (
    <div className="modal-content aye-or-nay">
      <dl onClick={() => setVoteFor('aye')}>
        <dt>
          <img src={icons.APPROVE} alt="aye" />
          <span>{t('aye')}</span>
        </dt>
        <dd>
          <img src={icons.CHECKED} style={{ visibility: voteFor === 'aye' ? 'visible' : 'hidden' }} alt="aye" />
        </dd>
      </dl>
      <dl onClick={() => setVoteFor('nay')}>
        <dt>
          <img src={icons.REJECT} alt="nay" />
          <span>{t('nay')}</span>
        </dt>
        <dd>
          <img src={icons.CHECKED} style={{ visibility: voteFor === 'nay' ? 'visible' : 'hidden' }} alt="nay" />
        </dd>
      </dl>
    </div>
  )
}
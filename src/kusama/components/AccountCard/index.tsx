import React, { useState } from 'react'
import { toBN, ellipsis, isExist, fksm } from 'kusama/lib/utils'
import t from 'kusama/locales'
import { useHistory } from 'react-router-dom'
import './index.scss'
import { withdrawUnbonded, payoutRewards, calcWithdrawFee, calcPayoutRewardFee } from 'kusama/lib/kusama'
import toast from 'kusama/lib/toast'
import Modal from '../Modal'
import { getRouteName, calcStakingAvailableBalance } from 'kusama/lib/helper'
import { isiPhoneX, isPolkadot } from 'kusama/lib/is'
import icons from 'kusama/lib/icons'
import Loading from 'react-loading'

export default ({ account, stakingAccount, unit, eraElectionStatus, price = { price: 0, currency: 'CNY' }, accountTitle }) => {
  const { address, freeBalance, reservedBalance } = account
  const { redeemable, unlocking, stakingLedger, accountId, controllerId, nominators, rewardDestination } = stakingAccount

  const [isUnfold, setIsUnfold] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isPayouting, setIsPayouting] = useState(false);
  const [withdrawFee, setWithdrawFee] = useState('~');
  const [payoutRewardFee, setPayoutRewardFee] = useState('~');

  const history = useHistory()

  let unlockValue = undefined
  if (isExist(unlocking) && Array.isArray(unlocking)) {
    unlockValue = toBN(0)
    unlocking.map((t) => {
      unlockValue = unlockValue.add(toBN(t.value))
    })
  }
  let totalBalance = undefined
  if (isExist(freeBalance)) {
    totalBalance = toBN(freeBalance).add(toBN(reservedBalance))
  }

  const notWithdrawable = eraElectionStatus || !isExist(controllerId) || (isExist(redeemable) && toBN(redeemable).isZero())
  const closeModal = () => {
    setIsWithdrawing(false)
    setIsPayouting(false)
  }

  return (
    <div className={`account-card ${isPolkadot() ? 'polkadot' : ''}`}>
      <div className="account-top">
        <div className="account-top-address">
          <strong>{accountTitle}</strong>
          {address ? (
            <span>{ellipsis(address)}</span>
          ) : (
              <div className="loading-account">
                <Loading type="spin" width={16} height={16} />
                <span>{t('accessing_account')}</span>
              </div>
            )}
        </div>
        <div className="account-top-amount">
          <strong>{`${fksm(totalBalance)} ${unit}`}</strong>
          {/* <span>{currency} {fksm(totalBalance)}</span> */}
        </div>
      </div>
      <div className={`account-bottom ${isUnfold ? 'unfold' : ''}`}>
        <div className="account-balance">
          <div>
            <div>
              <span>{t('available_balance')}</span>
              <i>{fksm(calcStakingAvailableBalance(account, stakingAccount))}</i>
            </div>
            <div>
              <span>{t('voted_number')}</span>
              <i>{isExist(nominators) ? nominators.length : '0'}</i>
            </div>
          </div>
        </div>
        {!isUnfold && (
          <div className="unfold" onClick={() => setIsUnfold(true)}>
            <img src={icons.CHEVRON_DOWN} alt="" />
          </div>
        )}
      </div>
      {isUnfold && (
        <div className="account-details">
          <div className="accounts">
            <div>
              <span>{t('stash_account')}</span>
              <i>{isExist(accountId) ? ellipsis(accountId.toString()) : '~'}</i>
            </div>
            <div>
              <span>{t('control_account')}</span>
              <i>{isExist(controllerId) ? ellipsis(controllerId.toString()) : t('not_set_yet')}</i>
            </div>
          </div>
          <div className="reward">
            <div>
              <span>{t('bond_yet')}</span>
              <i>{isExist(stakingLedger) ? fksm(stakingLedger.active) : '0.000'}</i>
            </div>
            <div>
              <span>{t('unbounding')}</span>
              <i>{isExist(unlockValue) ? fksm(unlockValue) : '0.000'}</i>
            </div>
            <div>
              <span>{t('redeemable')}</span>
              <i>{isExist(redeemable) ? fksm(redeemable) : '0.000'}</i>
            </div>
            <div>
              <span>{t('reward_will_be_sent_to')}</span>
              <i>{isExist(rewardDestination) ? t(`${rewardDestination.toString().toLowerCase()}_account`) : t('not_set_yet')}</i>
            </div>
          </div>
          <div className="actions">
            <div
              className={`${eraElectionStatus || !isExist(controllerId) ? 'disabled' : ''}`}
              onClick={() => {
                if (!eraElectionStatus && isExist(controllerId)) {
                  history.push(`/${getRouteName()}/bond`)
                }
              }}
            >
              <img src={icons.BOUND} alt="" />
              <span>{t('bond')}</span>
            </div>
            <div
              className={`${eraElectionStatus || !isExist(stakingLedger) ? 'disabled' : ''}`}
              onClick={() => {
                if (!eraElectionStatus && isExist(stakingLedger)) {
                  history.push(`/${getRouteName()}/unbond`)
                }
              }}
            >
              <img src={icons.UNBOUND} alt="" />
              <span>{t('unbond')}</span>
            </div>
            <div
              className={`${notWithdrawable ? 'disabled' : ''}`}
              onClick={async () => {
                if (!notWithdrawable && !isLoading) {
                  setIsWithdrawing(true)
                  try {
                    const fee = await calcWithdrawFee(stakingAccount)
                    setWithdrawFee(fee)
                  } catch (error) {
                    toast.warn(error.message)
                  }
                }
              }}
            >
              <img src={icons.RETRIVE} alt="" />
              <span>{t('retrive')}</span>
            </div>
            <div
              className={`${eraElectionStatus || !isExist(controllerId) ? 'disabled' : ''}`}
              onClick={async () => {
                if (!eraElectionStatus && isExist(controllerId) && !isLoading) {
                  setIsPayouting(true)
                  try {
                    const fee = await calcPayoutRewardFee(stakingAccount)
                    setPayoutRewardFee(fee)
                  } catch (error) {
                    toast.warn(error.message)
                  }
                }
              }}
            >
              <img src={icons.REWARD} alt="" />
              <span>{t('retrive_reward')}</span>
            </div>
          </div>
          <div className="unfold" onClick={() => setIsUnfold(false)}>
            <img src={icons.CHEVRON_UP} alt="" />
          </div>
        </div>
      )}

      <Modal
        isOpen={isWithdrawing || isPayouting}
        contentLabel="Reward Modal"
        onRequestClose={closeModal}
        styles={{ paddingBottom: isiPhoneX() ? '12px' : '0', bottom: 0, borderRadius: '8px 8px 0 0', border: 0, background: '#f7f8f9' }}
        appElement={document.body}
      >
        <div className="modal-inner" style={{ minHeight: 'unset' }}>
          <p className="title">{isWithdrawing ? t('retrive') : t('retrive_reward')}</p>
          <div className="content">
            <img src={isWithdrawing ? icons.WITHDRAW_ICON : icons.PAYOUT_ICON} alt="" />
            <div className="desc">
              {isWithdrawing ? t('withdraw_desc', fksm(redeemable), unit, withdrawFee, unit) : t('payout_reward_desc', payoutRewardFee, unit)}
            </div>
          </div>
          <div className="buttons">
            <div className="button cancel-button" onClick={closeModal}>{t('cancel')}</div>
            <div
              className="button confirm-button"
              onClick={() => {
                setIsLoading(true)
                if (isWithdrawing) {
                  withdrawUnbonded(stakingAccount, account)
                    .then((txHash) => {
                      setIsLoading(false)
                      closeModal()
                    }).catch(e => {
                      toast.warn(e.message)
                      setIsLoading(false)
                      closeModal()
                    })
                } else if (isPayouting) {
                  payoutRewards(stakingAccount, account)
                    .then((txHash) => {
                      setIsLoading(false)
                      closeModal()
                    }).catch(e => {
                      toast.warn(e.message)
                      setIsLoading(false)
                      closeModal()
                    })
                }
              }}
            >
              {isLoading ? (
                <Loading type="spin" width={30} height={30} />
              ) : (
                  <span>{t('confirm')}</span>
                )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

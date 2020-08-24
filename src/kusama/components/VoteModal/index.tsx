import React, { useState } from 'react'
import Modal from '../Modal'
import BottomButton from '../BottomButton'
import t from 'kusama/locales'
import icons from 'kusama/lib/icons'
import './index.scss'
import Option from './Option'
import VoteBalance from './VoteBalance'
import Conviction from './Conviction'
import { democracyVote } from 'kusama/lib/kusama'
import { inputToBn } from 'kusama/lib/format'
import toast from 'kusama/lib/toast'
import { isiPhoneX } from 'kusama/lib/is'
import { fksm } from 'kusama/lib/utils'

export default ({ isOpen, onClose, votingItem, account }) => {
  const [voteFor, setVoteFor] = useState('aye');
  const [title, setTitle] = useState(t('vote'));
  const [step, setStep] = useState(0);
  const [value, setValue] = useState('');
  const [conviction, setConviction] = useState(1);

  let paddingBottom = 30
  if (step === 2) {
    paddingBottom = isiPhoneX() ? 40 : 30
  } else {
    paddingBottom = isiPhoneX() ? 110 : 80
  }

  const { votingBalance } = account

  let disabled = false
  if (step === 1) {
    disabled = value === '' || Number(fksm(votingBalance)) < Number(value)
  }
  return (
    <Modal
      isOpen={isOpen}
      appElement={document.body}
    >
      <div className="modal-body" style={{ paddingBottom }}>
        <div className="modal-header">
          <img src={step === 0 ? icons.CANCEL : icons.LEFT} onClick={() => {
            switch (step) {
              case 0:
                onClose()
                break;
              case 1:
                setStep(0)
                setTitle(t('vote'))
                break;
              case 2:
                setStep(1)
                setTitle(t('vote_weight'))
                break;
              default:
                break;
            }
          }} />
          <span>{title}</span>
          <img src={icons.CANCEL} style={{ visibility: 'hidden' }} />
        </div>
        {step === 0 && (
          <Option
            voteFor={voteFor}
            setVoteFor={setVoteFor}
          />
        )}
        {step === 1 && (
          <VoteBalance
            value={value}
            setValue={setValue}
            conviction={conviction}
            onSwitchConviction={() => {
              setStep(2)
              setTitle(t('conviction_title'))
            }}
          />
        )}
        {step === 2 && (
          <Conviction
            conviction={conviction}
            setConviction={setConviction}
          />
        )}
        {step !== 2 && (
          <BottomButton
            title={step === 0 ? t('next') : t('confirm')}
            disabled={disabled}
            onClick={() => {
              switch (step) {
                case 0:
                  setStep(1)
                  setTitle(t('vote_weight'))
                  break;
                case 1:
                  {
                    const params = {
                      index: votingItem.index,
                      vote: {
                        Standard: { balance: inputToBn(value), vote: { aye: voteFor === 'aye', conviction } },
                      }
                    }
                    democracyVote(params, account, () => {
                      setStep(0)
                      onClose()
                    }).catch(e => toast.warn(e.message))
                  }
                  break;
                default:
                  break;
              }
            }}
          />
        )}
      </div>
    </Modal>
  )
}
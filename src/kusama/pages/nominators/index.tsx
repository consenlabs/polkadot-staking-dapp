import React, { useState } from 'react'
import { connect } from "react-redux"
import { selectValidators, selectStakingAccount, selectAccount, selectSelectedValidators, selectEraElectionStatus } from 'kusama/lib/redux/selectors'
import ValidatorList from 'kusama/components/ValidatorList'
import { updateSortby, updateSelectedValidators, updateIsNominating } from 'kusama/lib/redux/actions'
import { useHistory } from 'react-router-dom'
import { selectSortby } from 'kusama/lib/redux/selectors'
import BottomButton from 'kusama/components/BottomButton'
import t from 'kusama/locales'
import NominatorsCard from 'kusama/components/NominatorsCard'
import './index.scss'
import { nominate } from 'kusama/lib/kusama'
import toast from 'kusama/lib/toast'
import { isExist } from 'kusama/lib/utils'
import { getRouteName } from 'kusama/lib/helper'
import { isiPhoneX } from 'kusama/lib/is'

const Nominators = ({ validators, sortBy, stakingAccount, selectedValidators, updateSelectedValidators, account, updateIsNominating, eraElectionStatus }) => {
  const [selectedValidatorsState, setSelectedValidatorsState] = useState(selectedValidators)
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory()

  const { state } = history.location

  return (
    <div className="vote-wrap" style={{ paddingBottom: isiPhoneX() ? 150 : 110 }}>
      <ValidatorList
        validators={validators}
        sortBy={sortBy}
        updateSortby={updateSortby}
        isSelectable={true}
        selectedValidators={selectedValidatorsState}
        searchValue={isExist(state) ? state.address : ""}
        onCheckValidator={(validator) => {
          if (selectedValidatorsState.includes(validator.key)) {
            setSelectedValidatorsState(selectedValidatorsState.filter(t => t !== validator.key))
          } else {
            if (selectedValidatorsState.length < 16) {
              setSelectedValidatorsState([...selectedValidatorsState, validator.key])
            } else {
              toast.warn(t('at_most_16_validators_selected'))
            }
          }
        }}
      />
      <NominatorsCard
        selectedValidators={selectedValidatorsState}
        stakingAccount={stakingAccount}
        setSelectedValidators={setSelectedValidatorsState}
      />
      <BottomButton
        title={t('confirm_vote')}
        isLoading={isLoading}
        onClick={() => {
          if (isExist(stakingAccount.controllerId)) {
            setIsLoading(true)
            // just nominate
            nominate(selectedValidatorsState, account, (txHash) => {
              updateIsNominating(txHash)
              window.history.back()
            })
              .then(() => {
                setIsLoading(false)
              }).catch(e => {
                setIsLoading(false)
                toast.warn(e.message)
              })
          } else {
            updateSelectedValidators(selectedValidatorsState)
            setTimeout(() => {
              history.push(`/${getRouteName()}/bond`)
            }, 100);
          }
        }}
        disabled={!validators.length || !selectedValidatorsState.length || eraElectionStatus}
      />
    </div>
  )
}

const mapStateToProps = state => {
  return {
    validators: selectValidators(state),
    stakingAccount: selectStakingAccount(state),
    sortBy: selectSortby(state),
    account: selectAccount(state),
    selectedValidators: selectSelectedValidators(state),
    eraElectionStatus: selectEraElectionStatus(state),
  }
}

const mapDispatchToProps = {
  updateSortby,
  updateSelectedValidators,
  updateIsNominating,
}

export default connect(mapStateToProps, mapDispatchToProps)(Nominators)

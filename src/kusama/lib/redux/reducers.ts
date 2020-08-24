import produce from 'immer'
import * as types from './constant'

const initialState = {
  account: {},
  stakingAccount: {},
  validators: [],
  sortBy: '',
  selectedValidators: [],
  eraElectionStatus: false, // election status isClose
  isNominating: '',
  existentialDeposit: 0.0016,
  referendums: [],
  democracy: [],
  council: [],
}

export default function device(state = initialState, action) {
  return produce(state, draft => {
    switch (action.type) {
      case types.UPDATE_ACCOUNT:
        const account = action.payload.account
        if (account && typeof account === 'object') {
          draft.account = { ...draft.account, ...account }
        }
        return
      case types.UPDATE_STAKING_ACCOUNT:
        const stakingAccount = action.payload.account
        if (stakingAccount && typeof stakingAccount === 'object') {
          draft.stakingAccount = { ...draft.stakingAccount, ...stakingAccount }
        }
        return
      case types.UPDATE_VALIDATORS:
        const validators = action.payload.validators
        if (validators && Array.isArray(validators)) {
          draft.validators = validators
        }
        return
      case types.UPDATE_SORTBY:
        draft.sortBy = action.payload.sortBy
        return
      case types.UPDATE_SELECTED_VALIDATORS:
        draft.selectedValidators = action.payload.selectedValidators
        return
      case types.UPDATE_ERA_ELECTION_STATUS:
        draft.eraElectionStatus = action.payload.eraElectionStatus
        return
      case types.UPDATE_NOMINATING_STATUS:
        draft.isNominating = action.payload.isNominating
        return
      case types.UPDATE_EXISTENTIAL_DEPOSIT:
        draft.existentialDeposit = action.payload.existentialDeposit
        return
      case types.UPDATE_REFERENDUMS:
        draft.referendums = action.payload.referendums
        return
      case types.UPDATE_DEMOCRACY:
        draft.democracy = action.payload.democracy
        return
      case types.UPDATE_COUNCIL:
        draft.council = action.payload.council
        return
      default:
        return draft
    }
  })
}

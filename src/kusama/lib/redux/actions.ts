import * as types from './constant'

export const updateAccount = (account) => {
  return {
    type: types.UPDATE_ACCOUNT,
    payload: {
      account,
    }
  }
}

export const updateStakingAccount = (account) => {
  return {
    type: types.UPDATE_STAKING_ACCOUNT,
    payload: {
      account,
    }
  }
}

export const updateValidators = (validators) => {
  return {
    type: types.UPDATE_VALIDATORS,
    payload: {
      validators,
    }
  }
}

export const updateSortby = (sortBy) => {
  return {
    type: types.UPDATE_SORTBY,
    payload: {
      sortBy,
    }
  }
}

export const updateSelectedValidators = (selectedValidators) => {
  return {
    type: types.UPDATE_SELECTED_VALIDATORS,
    payload: {
      selectedValidators,
    }
  }
}

export const updateEraElectionStatus = (eraElectionStatus) => {
  return {
    type: types.UPDATE_ERA_ELECTION_STATUS,
    payload: {
      eraElectionStatus,
    }
  }
}

export const updateIsNominating = (isNominating) => {
  return {
    type: types.UPDATE_NOMINATING_STATUS,
    payload: {
      isNominating,
    }
  }
}

// api.consts.balances.existentialDeposit
export const updateExistentialDeposit = (existentialDeposit) => {
  return {
    type: types.UPDATE_EXISTENTIAL_DEPOSIT,
    payload: {
      existentialDeposit,
    }
  }
}

export const updateReferendums = (referendums) => {
  return {
    type: types.UPDATE_REFERENDUMS,
    payload: {
      referendums,
    }
  }
}

export const updateDemocracy = (democracy) => {
  return {
    type: types.UPDATE_DEMOCRACY,
    payload: {
      democracy,
    }
  }
}

export const updateCouncil = (council) => {
  return {
    type: types.UPDATE_COUNCIL,
    payload: {
      council,
    }
  }
}
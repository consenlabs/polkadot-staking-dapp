
// 'fee_asc', 'staked_total_desc', 'profit'
export const sortValidator = (validators, sortBy) => {
  switch (sortBy) {
    case 'fee_asc':
      return validators.sort((a, b) => a.commissionPer - b.commissionPer)
    case 'staked_total_desc':
      return validators.sort((a, b) => b.bondTotal - a.bondTotal)
    case 'profit':
      return validators.sort((a, b) => b.rewardPayout - a.rewardPayout)
    default:
      break;
  }
  return validators.sort((a, b) => a.rankOverall - b.rankOverall)
}
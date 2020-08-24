const BN = require('bn.js')
const types = require('@polkadot/types')

const BN_ZERO = new BN(0)
const BN_ONE = new BN(1)
const PERBILL = new BN(1000000000);

const registry = new types.TypeRegistry()

const baseBalance = () => {
  return new BN('1'.padEnd(16, '0'));
}

function extractInfo(electedDerive, waitingDerive, lastReward = BN_ONE) {
  const amount = baseBalance()
  const perValidatorReward = lastReward.div(new BN(electedDerive.info.length));
  const [elected, nominators, totalStaked] = extractSingle(amount, electedDerive, perValidatorReward, true);
  const [waiting] = extractSingle(amount, waitingDerive, perValidatorReward, false);
  const validators = sortValidators(elected.concat(waiting));

  return { nominators, totalStaked, validators: validators };
}

function extractSingle(amount, { info }, perValidatorReward, isElected) {
  const nominators = [];
  let totalStaked = BN_ZERO;
  const list = info.map(({ accountId, exposure: _exposure, stakingLedger, validatorPrefs }) => {
    const exposure = _exposure || {
      others: registry.createType('Vec<IndividualExposure>'),
      own: registry.createType('Compact<Balance>'),
      total: registry.createType('Compact<Balance>')
    };
    const prefs = validatorPrefs || {
      commission: registry.createType('Compact<Perbill>')
    };
    let bondOwn = exposure.own.unwrap();
    let bondTotal = exposure.total.unwrap();
    const skipRewards = bondTotal.isZero();

    if (bondTotal.isZero() && stakingLedger) {
      bondTotal = bondOwn = stakingLedger.total.unwrap();
    }

    const bondOtherList = [{
      who: accountId.toString(),
      value: bondOwn,
    }].concat(_exposure.others.map((t) => ({ who: t.who.toString(), value: t.value.unwrap() })))

    const validatorPayment = prefs.validatorPayment
      ? prefs.validatorPayment.unwrap()
      : prefs.commission.unwrap().mul(perValidatorReward).div(PERBILL);
    const key = accountId.toString();
    const rewardSplit = perValidatorReward.sub(validatorPayment);
    const rewardPayout = amount.isZero() || rewardSplit.isZero()
      ? BN_ZERO
      : amount.mul(rewardSplit).div(amount.add(bondTotal));

    totalStaked = totalStaked.add(bondTotal);

    return {
      accountId,
      bondOther: bondTotal.sub(bondOwn),
      bondOwn,
      bondShare: 0,
      bondTotal,
      bondOtherList,
      commissionPer: ((prefs.commission ? prefs.commission.unwrap() : BN_ZERO).toNumber() / 10000000),
      isCommission: !!prefs.commission,
      isElected,
      key,
      numNominators: exposure.others.length,
      rankBondOther: 0,
      rankBondOwn: 0,
      rankBondTotal: 0,
      rankComm: 0,
      rankNumNominators: 0,
      rankOverall: 0,
      rankPayment: 0,
      rankReward: 0,
      rewardPayout: skipRewards ? BN_ZERO : rewardPayout,
      rewardSplit,
      validatorPayment
    };
  });

  return [list, nominators, totalStaked];
}

function sortValidators(list) {
  return list
    .filter((a) => a.bondTotal.gtn(0))
    .sort((a, b) => b.commissionPer - a.commissionPer)
    .map(mapIndex('rankComm'))
    .sort((a, b) => b.bondOther.cmp(a.bondOther))
    .map(mapIndex('rankBondOther'))
    .sort((a, b) => b.bondOwn.cmp(a.bondOwn))
    .map(mapIndex('rankBondOwn'))
    .sort((a, b) => b.bondTotal.cmp(a.bondTotal))
    .map(mapIndex('rankBondTotal'))
    .sort((a, b) => b.validatorPayment.cmp(a.validatorPayment))
    .map(mapIndex('rankPayment'))
    .sort((a, b) => a.rewardSplit.cmp(b.rewardSplit))
    .map(mapIndex('rankReward'))
    .sort((a, b) => {
      const cmp = b.rewardPayout.cmp(a.rewardPayout);

      return cmp !== 0
        ? cmp
        : a.rankReward === b.rankReward
          ? a.rankPayment === b.rankPayment
            ? b.rankBondTotal - a.rankBondTotal
            : b.rankPayment - a.rankPayment
          : b.rankReward - a.rankReward;
    })
    .map(mapIndex('rankOverall'))
}

function mapIndex(mapBy) {
  return (info, index) => {
    info[mapBy] = index + 1;

    return info;
  };
}

const normalizeValidator = (v, pointsDict) => {
  const _v = { ...v }
  return {
    ..._v,
    accountId: _v.accountId.toString(),
    bondOther: _v.bondOther.toString(),
    bondOtherList: _v.bondOtherList.map(o => ({ who: o.who, value: o.value.toString() })),
    bondOwn: _v.bondOwn.toString(),
    bondTotal: _v.bondTotal.toString(),
    rewardPayout: _v.rewardPayout.toString(),
    rewardSplit: _v.rewardSplit.toString(),
    validatorPayment: _v.validatorPayment.toString(),
    point: pointsDict[_v.accountId.toString()] || "~",
  }
}

const mergeValidatorDisplayName = (validators, indentites) => {
  return validators.map(v => {
    let displayName = ''
    const i = indentites.find(i => v.accountId === i.accountId.toString())
    if (i.nickname) {
      displayName = i.nickName
    } else if (i.identity.displayParent) {
      displayName = i.identity.displayParent + (i.identity.display ? `(${i.identity.display})` : '')
    } else {
      displayName = i.identity.display
    }
    return {
      ...v,
      displayName,
      identity: i.identity,
    }
  })
}

exports.extractInfo = extractInfo
exports.BN_ZERO = BN_ZERO
exports.mergeValidatorDisplayName = mergeValidatorDisplayName
exports.normalizeValidator = normalizeValidator
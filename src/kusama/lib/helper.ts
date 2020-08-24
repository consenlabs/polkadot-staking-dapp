
import { isPolkadot } from './is'
import { DeriveStakingElected, DeriveStakingWaiting, DeriveBalancesAll, DeriveStakingAccount } from '@polkadot/api-derive/types';
import { ValidatorPrefs, ValidatorPrefsTo196 } from '@polkadot/types/interfaces';
import BN from 'bn.js'
import { TypeRegistry } from '@polkadot/types'
import { formatBalance } from '@polkadot/util'
import { SortedTargets, TargetSortBy, ValidatorInfo } from './types'
import { toBN } from 'kusama/lib/utils'

const PERBILL = new BN(1_000_000_000);
const BN_ONE = new BN(1)
const BN_ZERO = new BN(0)
const registry = new TypeRegistry()

export const baseBalance = (): BN => {
  return new BN('1'.padEnd(formatBalance.getDefaults().decimals + 4, '0'));
}

export const extractInfo = (allAccounts: string[], amount: BN = baseBalance(), electedDerive: DeriveStakingElected, waitingDerive: DeriveStakingWaiting, lastReward = BN_ONE): Partial<SortedTargets> => {
  const perValidatorReward = lastReward.div(new BN(electedDerive.info.length));
  const [elected, nominators, totalStaked] = extractSingle(allAccounts, amount, electedDerive, [], perValidatorReward, true);
  const [waiting] = extractSingle(allAccounts, amount, waitingDerive, [], perValidatorReward, false);
  const validators = sortValidators(elected.concat(waiting));

  return { nominators, totalStaked, validators: validators };
}

function extractSingle(allAccounts: string[], amount: BN = baseBalance(), { info }: DeriveStakingElected | DeriveStakingWaiting, favorites: string[], perValidatorReward: BN, isElected: boolean): [ValidatorInfo[], string[], BN] {
  const nominators: string[] = [];
  let totalStaked = BN_ZERO;
  const list = info.map(({ accountId, exposure: _exposure, stakingLedger, validatorPrefs }): ValidatorInfo => {
    const exposure = _exposure || {
      others: registry.createType('Vec<IndividualExposure>'),
      own: registry.createType('Compact<Balance>'),
      total: registry.createType('Compact<Balance>')
    };
    const prefs = (validatorPrefs as any) || {
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

    const validatorPayment = (prefs as ValidatorPrefsTo196).validatorPayment
      ? (prefs as ValidatorPrefsTo196).validatorPayment.unwrap() as BN
      : (prefs as ValidatorPrefs).commission.unwrap().mul(perValidatorReward).div(PERBILL);
    const key = accountId.toString();
    const rewardSplit = perValidatorReward.sub(validatorPayment);
    const rewardPayout = amount.isZero() || rewardSplit.isZero()
      ? BN_ZERO
      : amount.mul(rewardSplit).div(amount.add(bondTotal));

    const isNominating = (exposure.others as any).reduce((isNominating, indv): boolean => {
      const nominator = indv.who.toString();

      if (!nominators.includes(nominator)) {
        nominators.push(nominator);
      }

      return isNominating || allAccounts.includes(nominator);
    }, allAccounts.includes(key));

    totalStaked = totalStaked.add(bondTotal);

    return {
      accountId,
      bondOther: bondTotal.sub(bondOwn),
      bondOwn,
      bondShare: 0,
      bondTotal,
      bondOtherList,
      commissionPer: (((prefs as ValidatorPrefs).commission?.unwrap() || BN_ZERO).toNumber() / 10_000_000),
      hasIdentity: false,
      isCommission: !!(prefs as ValidatorPrefs).commission,
      isElected,
      isFavorite: favorites.includes(key),
      isNominating,
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

// https://github.com/polkadot-js/apps/blob/master/packages/page-staking/src/useSortedTargets.ts#L24
function mapIndex(mapBy: TargetSortBy): (info: ValidatorInfo, index: number) => ValidatorInfo {
  return (info, index): ValidatorInfo => {
    info[mapBy] = index + 1;

    return info;
  };
}

// https://github.com/polkadot-js/apps/blob/master/packages/page-staking/src/useSortedTargets.ts#L32
function sortValidators(list: ValidatorInfo[]): ValidatorInfo[] {
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
    .sort((a, b): number => {
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


export const nomalizeValidator = (v: ValidatorInfo) => {
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
  }
}

export const normalizeBalances = (b: DeriveBalancesAll) => {
  return {
    accountId: b.accountId.toString(),
    accountNonce: b.accountNonce.toNumber(),
    availableBalance: b.availableBalance.toString(),
    freeBalance: b.freeBalance.toString(),
    frozenFee: b.frozenFee.toString(),
    frozenMisc: b.frozenMisc.toString(),
    lockedBalance: b.lockedBalance.toString(),
    reservedBalance: b.reservedBalance.toString(),
    vestedBalance: b.vestedBalance.toString(),
    vestingTotal: b.vestingTotal.toString(),
    votingBalance: b.votingBalance.toString(),
  }
}

export const nomalizeStakingAccount = (sa: DeriveStakingAccount) => {
  return {
    accountId: sa.accountId.toString(),
    controllerId: sa.controllerId && sa.controllerId.toString(),
    exposure: null,
    nominators: (sa.nominators || []).map(t => t.toString()),
    redeemable: sa.redeemable && sa.redeemable.toString(),
    rewardDestination: sa.rewardDestination ? sa.rewardDestination.toString() : undefined,
    stakingLedger: sa.stakingLedger ? sa.stakingLedger.toJSON() : undefined,
    stashId: sa.stashId && sa.stashId.toString(),
    validatorPrefs: null,
    unlocking: sa.unlocking && sa.unlocking.map(ul => {
      return {
        remainingEras: ul.remainingEras.toString(),
        value: ul.value.toString(),
      }
    }),
  }
}

export const calcStakingAvailableBalance = (account, stakingAccount) => {
  const { freeBalance } = account
  const { stakingLedger } = stakingAccount
  return toBN(freeBalance).sub(toBN(stakingLedger?.total)).toString()
}

export const nomalizeValidatorIdentity = (o) => {
  const identity = { ...o.identity }
  return {
    accountId: o.accountId.toString(),
    nickname: o.nickname,
    identity: {
      ...identity,
      judgements: undefined,
      parent: identity.parent && identity.parent.toString()
    }
  }
}

export const mergeValidatorDisplayName = (validators, indentites) => {
  return validators.map(v => {
    let displayName = ''
    indentites.forEach(i => {
      if (v.accountId === i.accountId) {
        if (i.nickname) {
          displayName = i.nickName
        } else if (i.identity.displayParent) {
          displayName = i.identity.displayParent + (i.identity.display ? `(${i.identity.display})` : '')
        } else {
          displayName = i.identity.display
        }
      }
    })
    return {
      ...v,
      displayName
    }
  })
}

export const getRouteName = (uppercase = false) => {
  if (uppercase) {
    return isPolkadot() ? 'Polkadot' : 'Kusama'
  }
  return isPolkadot() ? 'polkadot' : 'kusama'
}

export const getUnit = () => {
  return isPolkadot() ? 'DOT' : 'KSM'
}

import React, { useState } from 'react'
import { formatBalance } from '@polkadot/util';

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;
const K_LENGTH = 3 + 1;

function format(value, currency: string, withSi?: boolean, _isShort?: boolean): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);

  if (prefix.length > M_LENGTH) {
    return formatBalance(value);
  }

  return <>{prefix}{!isShort && (<>.<span className='balance-value'>{`000${postfix || ''}`.slice(-3)}</span></>)} {currency}</>;
}

export default ({ value, withSi = false, isShort = false }) => {
  const [currency] = useState(formatBalance.getDefaults().unit);

  return (
    <span>
      {format(value, currency, withSi, isShort)}
    </span>
  )
}
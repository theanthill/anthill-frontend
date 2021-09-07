const JSBI = require('jsbi');

// constants used internally but not expected to be used externally
const NEGATIVE_ONE = JSBI.BigInt(-1);
const ZERO = JSBI.BigInt(0);
const ONE = JSBI.BigInt(1);

// used in liquidity amount math
const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2));

module.exports = {
    NEGATIVE_ONE,
    ZERO,
    ONE,
    Q96,
    Q192,
};

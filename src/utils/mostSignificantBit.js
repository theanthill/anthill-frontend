const JSBI = require('jsbi');
//import invariant from 'tiny-invariant'

const TWO = JSBI.BigInt(2);
const POWERS_OF_2 = [128, 64, 32, 16, 8, 4, 2, 1].map((pow) => [pow, JSBI.exponentiate(TWO, JSBI.BigInt(pow))]);

function mostSignificantBit(x) {
    //invariant(JSBI.greaterThan(x, ZERO), 'ZERO')
    //invariant(JSBI.lessThanOrEqual(x, MaxUint256), 'MAX')

    let msb = 0;
    for (const [power, min] of POWERS_OF_2) {
        if (JSBI.greaterThanOrEqual(x, min)) {
            x = JSBI.signedRightShift(x, JSBI.BigInt(power));
            msb += power;
        }
    }
    return msb;
}

module.exports = {
    mostSignificantBit,
};

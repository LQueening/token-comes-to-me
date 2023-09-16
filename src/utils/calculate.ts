/**
 * Library for calculaing
 */
import BigNumber from "bignumber.js";

/**
 * cut number by digit
 * unlike 'toFixed' function, this function won't round the number.
 * @param number
 * @param digit
 * @returns number after cut
 */
export const cutNumberByDigit = (number: number, digit = 4) => {
  return Math.floor(number * 10 ** digit) / 10 ** digit;
};

/**
 * transform bigInt to number type
 * @param bigInt
 * @returns value in 'number' type
 */
export const bigIntToNumber = (bigInt: any) => {
  return new BigNumber(bigInt).toNumber();
};

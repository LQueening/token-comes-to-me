/**
 * validation functions
 */

/**
 * Check if the address is a valid ETH address
 * @param address
 * @returns isValidEthereumAddress
 */
export const isValidEthereumAddress = (address: string) => {
  // step 1: check length
  if (address.length !== 42) {
    return false;
  }

  // step 2: Character set check
  if (!/^(0x)?[0-9a-fA-F]{40}$/.test(address)) {
    return false;
  }

  // step 3: prefix check
  if (!address.startsWith("0x")) {
    return false;
  }

  return true;
};

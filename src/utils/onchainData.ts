/**
 * Library for fetching on-chain data
 */
import { usePublicClient } from "wagmi";
import { cutNumberByDigit, bigIntToNumber } from "../utils/calculate";

/**
 * get on-chain native token balance
 * @param address
 * @returns native token balance
 */
export const getBalance = async (address: string) => {
  const publicClient = usePublicClient();
  const nativeCurrency = publicClient.chain.nativeCurrency;
  // @ts-ignore
  let balance: bigint | number = await publicClient.getBalance({ address });
  balance = cutNumberByDigit(
    bigIntToNumber(balance) / 10 ** nativeCurrency?.decimals,
    nativeCurrency?.decimals
  );
  return cutNumberByDigit(
    bigIntToNumber(balance) / 10 ** nativeCurrency?.decimals,
    nativeCurrency?.decimals
  );
};

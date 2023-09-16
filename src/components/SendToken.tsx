import React, { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useConnect,
  usePublicClient,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { sendTransaction, waitForTransaction } from "@wagmi/core";
import { parseEther } from "viem";
import {
  Box,
  Image,
  Input,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  InputGroup,
  InputRightAddon,
  Button,
  useToast,
  Select,
} from "@chakra-ui/react";
import * as chain from "wagmi/chains";
import { cutNumberByDigit, bigIntToNumber } from "../utils/calculate";
import taroHand from "../assets/taro-hand.jpg";

const supportChains = [
  chain.goerli,
  chain.mainnet,
  chain.bscTestnet,
  chain.bsc,
  chain.arbitrum,
  chain.polygon,
  chain.optimism,
];

const Header = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { isLoading: isSwitchChainLoading, switchNetwork } = useSwitchNetwork();
  const { chain, chains } = useNetwork();
  const [submitInfo, setSubmitInfo] = useState({
    targetAddress: "0x74E1360c90a73900d2Bfa6841ec66FC67A0a5060",
    amount: 0.0001,
    nonce: 0,
    network: 5,
  });
  const [errorMap, setErrorMap] = useState({
    targetAddress: false,
    amount: false,
    nonce: false,
  });
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [latestNonce, setLatestNonce] = useState(0);
  const toast = useToast();
  const publicClient = usePublicClient();

  // init native currency info
  const nativeCurrency = useMemo(() => {
    return publicClient.chain.nativeCurrency;
  }, [publicClient]);

  // init nonce
  useEffect(() => {
    // if current chain not in support chains list, disconnect wallet
    const isSupportedChain = supportChains.find(
      (chainItem) => chainItem.id === chain?.id
    );
    if (isSupportedChain) {
      // @ts-ignore
      publicClient.getTransactionCount({ address }).then((res: number) => {
        updateNonce(res, chain?.id as number);
      });
    } else {
      commonToast(
        `${chain?.name} is not supported, please switch to other chain`
      );
      disconnect();
    }
  }, [chain, address]);

  // update nonce info
  const updateNonce = (latestNonce: number, currentNetwork?: number) => {
    setSubmitInfo({
      ...submitInfo,
      nonce: latestNonce,
      network: currentNetwork || submitInfo.network,
    });
    setLatestNonce(latestNonce);
  };

  // change form value event
  const handleFormValueChange = (
    key: "targetAddress" | "amount" | "nonce" | "network",
    newVal: {
      targetAddress: string;
      nonce: number;
      amount: number;
      network: number;
    }
  ) => {
    setSubmitInfo(newVal);
    if (newVal[key]) {
      updateKeyStatus(key, false);
    }
  };

  // valid form data
  const validFormData = async () => {
    // not null & bigger than 0 validation
    for (let key of Object.keys(submitInfo)) {
      const value = submitInfo[key as "targetAddress" | "amount" | "nonce"];
      if (!value || (Number.isFinite(value) && value <= 0)) {
        commonToast(`${key} is not valid`);
        updateKeyStatus(key, true);
        throw new Error(
          JSON.stringify({
            errorKey: key,
          })
        );
      }
      // if the key is 'amount', check token balance
      if (key === "amount") {
        // @ts-ignore
        let balance = await publicClient.getBalance({ address });
        balance = cutNumberByDigit(
          bigIntToNumber(balance) / 10 ** nativeCurrency?.decimals,
          nativeCurrency?.decimals
        );
        if (balance < value) {
          commonToast(
            `You only have ${balance} ${nativeCurrency?.symbol} in wallet.`
          );
          updateKeyStatus(key, true);
          throw new Error(
            JSON.stringify({
              errorKey: key,
            })
          );
        }
      }
      // make sure the nonce is bigger than current nonce
      if (key === "nonce" && value < latestNonce) {
        commonToast(`Nonce can't less than ${latestNonce}`);
        updateKeyStatus(key, true);
        throw new Error(
          JSON.stringify({
            errorKey: key,
          })
        );
      }
    }
    return true;
  };

  // submit transaction
  const handleSubmitTransaction = async () => {
    setIsButtonLoading(true);
    const checkResult = await validFormData().catch(() => {
      return false;
    });
    if (!checkResult) {
      setIsButtonLoading(false);
      return;
    }
    // use latest gas price
    // @ts-ignore
    const feeData = await publicClient.estimateFeesPerGas();
    console.log(feeData);
    // send transaction
    const { hash } = await sendTransaction({
      to: submitInfo.targetAddress,
      value: parseEther(submitInfo.amount.toString()),
      nonce: submitInfo.nonce,
      // use EIP-1559 gas
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    }).catch(() => {
      setIsButtonLoading(false);
      return {
        hash: null,
      };
    });
    // if transaction has submitted successfully, waiting for block confirm
    if (hash) {
      commonToast(
        "Transaction submitted, waiting for block confirmation",
        "success"
      );
      const receipt = await waitForTransaction({
        hash,
      }).finally(() => {
        // unlock button
        setIsButtonLoading(false);
      });
      if (receipt.status === "success") {
        commonToast("🎉 Congratulations! Transaction comfirmed!", "success");
        // update nonce
        // @ts-ignore
        publicClient.getTransactionCount({ address }).then((res: number) => {
          updateNonce(res);
        });
      } else {
        commonToast("☹️ Transaction failed.");
      }
    }
  };

  const updateKeyStatus = (key: string, status: boolean) => {
    setErrorMap({
      ...errorMap,
      [key]: status,
    });
  };

  const commonToast = (desc: string, status: "error" | "success" = "error") => {
    toast({
      description: desc,
      position: "top",
      status,
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Image w="100%" draggable={false} src={taroHand}></Image>
      {/* target address */}
      <FormControl padding="4" isInvalid={errorMap.targetAddress}>
        <Box>
          <FormLabel>Target address</FormLabel>
          <Input
            value={submitInfo.targetAddress}
            onChange={(e) => {
              handleFormValueChange("targetAddress", {
                ...submitInfo,
                targetAddress: e.target.value,
              });
            }}
          />
          <FormHelperText>Send token to anyone you want.</FormHelperText>
        </Box>
      </FormControl>
      {/* target network */}
      <FormControl padding="4" isInvalid={errorMap.nonce}>
        <FormLabel>Target network</FormLabel>
        <Select
          placeholder="Select network"
          value={submitInfo.network}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!value) {
              return;
            }
            // switch network
            switchNetwork?.(value);
          }}
        >
          {supportChains.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </Select>
      </FormControl>
      {/* send amount */}
      <FormControl padding="4" isInvalid={errorMap.amount}>
        <FormLabel>Token amount</FormLabel>
        <InputGroup>
          <Input
            type="number"
            value={submitInfo.amount}
            onChange={(e) => {
              handleFormValueChange("amount", {
                ...submitInfo,
                amount: Number(e.target.value),
              });
            }}
          />
          <InputRightAddon children={<Text>{nativeCurrency?.symbol}</Text>} />
        </InputGroup>
      </FormControl>
      {/* nonce */}
      <FormControl padding="4" isInvalid={errorMap.nonce}>
        <FormLabel>Nonce</FormLabel>
        <Input
          type="number"
          value={submitInfo.nonce}
          onChange={(e) => {
            handleFormValueChange("nonce", {
              ...submitInfo,
              nonce: Number(e.target.value),
            });
          }}
        />
        <FormHelperText>
          You can't set nonce less than {latestNonce}.
        </FormHelperText>
      </FormControl>
      {/* submit button */}
      <Button
        display="block"
        margin="0 auto"
        mt="8"
        mb="8"
        colorScheme="blue"
        isLoading={isButtonLoading || isSwitchChainLoading}
        onClick={handleSubmitTransaction}
      >
        Abracadabra
      </Button>
    </Box>
  );
};

export default Header;

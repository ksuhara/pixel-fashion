import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Icon,
  Image,
  Input,
  Link,
  Select,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { ethers } from "ethers";
import type { NextPage } from "next";
import React from "react";
import { FaCheckCircle } from "react-icons/fa";

import { Header } from "../components/Header";
import contract from "../constants/contract.json";
import { ChainId, explorers, getContractsForChainId } from "../lib/web3";
const { pixelFashionAbi } = contract;

declare global {
  interface Window {
    ethereum: any;
  }
}

const FittingRoom: NextPage = () => {
  const [chainId, setChainId] = React.useState<ChainId>("4");
  const [contractAddress, setContractAddress] = React.useState("");
  const [tokenId, setTokenId] = React.useState("");
  const [accessoryAddress, setAccessoryAddress] = React.useState("");
  const [accessoryTokenId, setAccessoryTokenId] = React.useState("");
  const [currentAccount, setCurrentAccount] = React.useState(null);
  const [image, setImage] = React.useState("");
  const [error, setError] = React.useState("");
  const [txHash, setTxHash] = React.useState("");
  const [txStatus, setTxStatus] = React.useState("ended");

  React.useEffect(() => {
    checkWalletIsConnected();
  }, []);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
      window.open("https://metamask.app.link/dapp/https://pixel-onchained.vercel.app/");
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const setAccessoryHandler = async () => {
    setError("");
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const { pixelFashionAddress } = getContractsForChainId(chainId);
        const moldContract = new ethers.Contract(pixelFashionAddress, pixelFashionAbi, provider);

        const nftTxn = await moldContract
          .attach(contractAddress)
          .connect(signer)
          .setAccessory(tokenId, accessoryAddress, accessoryTokenId);
        setTxStatus("started");
        setTxHash(nftTxn.hash);
        await nftTxn.wait();
        setTxStatus("ended");
        console.log(`Set, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        setError("Must be owner of both token. Check you are connected to right wallet");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getData = async () => {
    setError("");
    setTxHash("");
    setTxStatus("");
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const { pixelFashionAddress } = getContractsForChainId(chainId);
        const moldContract = new ethers.Contract(pixelFashionAddress, pixelFashionAbi, provider);

        const partsOfBase = await moldContract.attach(contractAddress).getPartsForTokenId(tokenId);
        const partsOfAccessory = await moldContract.attach(accessoryAddress).getPartsForTokenId(accessoryTokenId);
        const parts = partsOfBase.concat(partsOfAccessory);
        const colorsOfBase = await moldContract.attach(contractAddress).getPalletesForTokenId(tokenId);
        const colorsOfAccessory = await moldContract.attach(accessoryAddress).getPalletesForTokenId(accessoryTokenId);
        const colors = colorsOfBase.concat(colorsOfAccessory);
        axios
          .post("/api/dress-up", {
            parts: parts,
            hexColors: colors,
          })
          .then(function (response: any) {
            const buff = new Buffer(response.data.svg);
            const base64data = buff.toString("base64");
            console.log(base64data);
            setImage(`data:image/svg+xml;base64,${base64data}`);
          })
          .catch(function (err: any) {
            console.error(err);
          });
        // const encodedData = tokenURI.replace(/^data:\w+\/\w+;base64,/, "");
        // const originJson = JSON.parse(atob(encodedData));
        // console.log(originJson);
        // setImage(originJson.image);
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const removeAccessoriesHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const { pixelFashionAddress } = getContractsForChainId(chainId);
        const moldContract = new ethers.Contract(pixelFashionAddress, pixelFashionAbi, provider);

        const nftTxn = await moldContract.attach(contractAddress).connect(signer).removeAccessories(tokenId);

        console.log(`Set, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <Header />
      <Container maxW="container.xl" textAlign="center" pb="10">
        <Box maxW="2xl" mx="auto" px={{ base: "6", lg: "8" }} py={{ base: "4", sm: "4" }} textAlign="center">
          <Heading size="3xl" fontWeight="extrabold" letterSpacing="tight">
            Fitting Room
          </Heading>
          <Text mt="4" fontSize="lg">
            Try on your onchain apparel.
          </Text>
        </Box>
        <Box my="8">
          <Heading mt="2" fontSize="xl">
            ① Select Chain
          </Heading>
          <Select
            w={{ base: "xs", sm: "md" }}
            mx="auto"
            onChange={(e) => setChainId(e.target.value as ChainId)}
            value={chainId}
            my="2"
          >
            <option value="4">Rinkeby</option>
            <option value="137">Polygon mainnet</option>
            {/* <option value="592">Astar Network mainnet</option> */}
          </Select>
        </Box>
        <Box my="8">
          <Heading mt="2" fontSize="xl">
            ② Select Base NFT
          </Heading>
          <VStack my="2">
            <Input
              placeholder="Contract Address"
              my="1"
              w={{ base: "xs", sm: "md" }}
              variant="filled"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
            ></Input>
            <Input
              placeholder="Token ID"
              my="1"
              w={{ base: "xs", sm: "md" }}
              variant="filled"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            ></Input>
          </VStack>
        </Box>
        <Box my="8">
          <Heading mt="2" fontSize="xl">
            ③ Select Accessory NFT
          </Heading>
          <VStack my="2">
            <Input
              placeholder="Contract Address"
              my="1"
              w={{ base: "xs", sm: "md" }}
              variant="filled"
              value={accessoryAddress}
              onChange={(e) => setAccessoryAddress(e.target.value)}
            ></Input>
            <Input
              placeholder="Token ID"
              my="1"
              w={{ base: "xs", sm: "md" }}
              variant="filled"
              value={accessoryTokenId}
              onChange={(e) => setAccessoryTokenId(e.target.value)}
            ></Input>
            <Button onClick={getData}>Try on</Button>
            {image ? (
              <Center>
                <Image src={image} w="64" alt=""></Image>{" "}
              </Center>
            ) : (
              <Center>
                <Image src={"back.png"} w="64" alt=""></Image>{" "}
              </Center>
            )}
            {currentAccount ? (
              <Button my="4" size="lg" colorScheme="blue" fontWeight="bold" onClick={setAccessoryHandler}>
                ④Set Accessory
              </Button>
            ) : (
              <Button my="4" size="lg" colorScheme="blue" fontWeight="bold" onClick={connectWalletHandler}>
                ConnectWallet
              </Button>
            )}
            {error ? (
              <Text color={"red"} my="4">
                {error}
              </Text>
            ) : (
              <></>
            )}
          </VStack>
        </Box>
        <VStack my="2">
          {currentAccount ? (
            <Button my="4" size="lg" colorScheme="gray" fontWeight="bold" onClick={removeAccessoriesHandler}>
              ※Remove All Accessories
            </Button>
          ) : (
            <Button my="4" size="lg" colorScheme="blue" fontWeight="bold" onClick={connectWalletHandler}>
              ConnectWallet
            </Button>
          )}
        </VStack>
        {txHash && (
          <Center>
            <Flex direction={{ base: "column", sm: "row" }} alignItems={"center"}>
              <Link href={`${explorers[chainId]}${txHash}`} isExternal>
                <Text
                  mx="2"
                  isTruncated
                  w={{ base: "sm", sm: "md" }}
                >{`see transaction: ${explorers[chainId]}${txHash}`}</Text>
              </Link>
              {txStatus == "started" && <Spinner />}
              {txStatus == "ended" && <Icon as={FaCheckCircle} w={8} h={8} color="green"></Icon>}
            </Flex>
          </Center>
        )}
      </Container>
    </>
  );
};

export default FittingRoom;

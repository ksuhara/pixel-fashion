import { Box, Button, Center, Container, Heading, Image, Input, Select, Text, VStack } from "@chakra-ui/react";
import axios from "axios";
import { ethers } from "ethers";
import type { NextPage } from "next";
import React from "react";

import { Header } from "../components/Header";
import contract from "../constants/contract.json";
import { ChainId, explorers, getContractsForChainId } from "../lib/web3";
const { pixelFasionAbi } = contract;

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
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const { pixelFasionAddress } = getContractsForChainId(chainId);
        const moldContract = new ethers.Contract(pixelFasionAddress, pixelFasionAbi, provider);

        const nftTxn = await moldContract
          .attach(contractAddress)
          .connect(signer)
          .setAccessory(tokenId, accessoryAddress, accessoryTokenId);

        console.log(`Set, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getData = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const { pixelFasionAddress } = getContractsForChainId(chainId);
        const moldContract = new ethers.Contract(pixelFasionAddress, pixelFasionAbi, provider);

        const partsOfBase = await moldContract.attach(contractAddress).returnParts(tokenId);
        const partsOfAccessory = await moldContract.attach(accessoryAddress).returnParts(accessoryTokenId);
        const parts = [partsOfBase, partsOfAccessory];
        const colorsOfBase = await moldContract.attach(contractAddress).returnPalletes(tokenId);
        const colorsOfAccessory = await moldContract.attach(accessoryAddress).returnPalletes(accessoryTokenId);
        const colors = [colorsOfBase, colorsOfAccessory];
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
        const { pixelFasionAddress } = getContractsForChainId(chainId);
        const moldContract = new ethers.Contract(pixelFasionAddress, pixelFasionAbi, provider);

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
      <Container maxW="container.xl" textAlign="center" pb="10">
        <Header />
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
            <option value="592">Astar Network mainnet</option>
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
            <Button onClick={getData}>check</Button>
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
      </Container>
    </>
  );
};

export default FittingRoom;

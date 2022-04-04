import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
import hre, { ethers } from "hardhat";

chai.use(solidity);
const { expect } = chai;
const MOLD_NAME = "FllnchnModal";
const MOLD_SYMBOL = "FM";
const MOLD_NAME2 = "FllnchnModal2";
const MOLD_SYMBOL2 = "FM2";
const MOLD_NAME3 = "FllnchnModal3";
const MOLD_SYMBOL3 = "FM3";

const chocofactoryABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "version",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "deployedContract",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "Deployed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "deploy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "deployWithSig",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "deployWithTypedSig",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "predictDeployResult",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "verifySig",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "verifyTypedSig",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

describe.only("NFT", function () {
  let signer: SignerWithAddress;
  let notHolder: SignerWithAddress;
  let factoryContract: any;
  let deployedMoldContract: any;
  let deployedMoldContract2: any;
  let deployedMoldContract3: any;

  this.beforeEach(async function () {
    [signer, notHolder] = await ethers.getSigners();
    factoryContract = new ethers.Contract("0x53B688a8Fb9e6a0bC8ca49bF0bBfddac4696ec72", chocofactoryABI, signer);
    const NFTDescriptorContract = await ethers.getContractFactory("NFTDescriptor");
    const descriptorContract = await NFTDescriptorContract.deploy();
    const FllnchnMoldContract = await ethers.getContractFactory("FllnchnMold", {
      libraries: {
        NFTDescriptor: descriptorContract.address,
      },
    });
    const moldContract = await FllnchnMoldContract.deploy();
    const deployedMold = await factoryContract.predictDeployResult(
      moldContract.address,
      signer.address,
      MOLD_NAME,
      MOLD_SYMBOL
    );
    await factoryContract.deploy(moldContract.address, MOLD_NAME, MOLD_SYMBOL);
    deployedMoldContract = moldContract.attach(deployedMold);

    const deployedMold2 = await factoryContract.predictDeployResult(
      moldContract.address,
      signer.address,
      MOLD_NAME2,
      MOLD_SYMBOL2
    );
    await factoryContract.deploy(moldContract.address, MOLD_NAME2, MOLD_SYMBOL2);
    deployedMoldContract2 = moldContract.attach(deployedMold2);

    const deployedMold3 = await factoryContract.predictDeployResult(
      moldContract.address,
      signer.address,
      MOLD_NAME3,
      MOLD_SYMBOL3
    );
    await factoryContract.deploy(moldContract.address, MOLD_NAME3, MOLD_SYMBOL3);
    deployedMoldContract3 = moldContract.attach(deployedMold3);
  });
  it("Mint", async function () {
    const name = "Name";
    const seeds =
      "0x00061b1b06050002010e0004000101020203010b0004000101050202010100020106000500010106020101020201010500040001010a02010105000400010101020101070201010600030001010a02010106000200010107020101030201010600020001010a02010101020101050002000101020201010702010101020101050002000101040201010402010102020101050003000101080201010302010104000400030104020101040201010300010103000101030202010203050201010100020101000300010106020103060201010300030001010602010306020101030003000101020201010a0201010300010002010302010103020101020201010202010104000101020201010202040102020101010201010102010104000100010102020201030001010102010103020101050002000201060002010202010106000c0002010700";

    const colors = ["000000", "889FB8", "00E6FF", "00E6FF", "00E6FF"];
    const bgColor = "FFFFFF";

    await deployedMoldContract.mintNFT(name, seeds, colors, bgColor, signer.address);
    const uri = await deployedMoldContract.tokenURI(1);
    console.log(uri);

    const seeds2 =
      "0x00071c1f0414000101030013000101010201010200020001011100010103000100010101020101060004010a0002000101040003010103030403010700060001010103090401010600060001010204010104040101020401010600060001010a040101060003000301050404010304030103000200010101040103010402030d040101020003000b0102050501030006000502020602020105020206000600050202060202010502020600050006020206060205000500060202060602050004000602010701060802040004000402020702020106020201070402040003000702050706020300030007020507060203000200080201070106010201070802020002000a0201060902020001000a0201060b02010001000b0201060a0201000b0201060c020c0201060b02";

    const colors2 = ["000000", "FFDA00", "FFFFFF", "6F94A5", "00E6FF", "FFF6BE", "EC49E3"];
    const bgColor2 = "FF2F2F";

    await deployedMoldContract2.mintNFT(name, seeds2, colors2, bgColor2, signer.address);
    await deployedMoldContract2.mintNFT(name, seeds2, colors2, bgColor2, notHolder.address);

    const uri2 = await deployedMoldContract2.tokenURI(1);
    console.log(uri2);

    const seeds3 =
      "0x0004120b0a010006020100020204000202010206000102010206000102010206000102010206000102030202000302020004020200";

    const colors3 = ["DA5753", "DA5753"];
    const bgColor3 = "FFFFFF";

    await deployedMoldContract3.mintNFT(name, seeds3, colors3, bgColor3, signer.address);

    const uri3 = await deployedMoldContract2.tokenURI(1);
    console.log(uri3);

    await deployedMoldContract.setAccessory(1, deployedMoldContract2.address, 1);
    await deployedMoldContract.setAccessory(1, deployedMoldContract3.address, 1);
    await expect(deployedMoldContract.setAccessory(1, deployedMoldContract2.address, 2)).to.revertedWith(
      "Fllnchn: must be owner of accessory token"
    );
    await expect(
      deployedMoldContract.connect(notHolder).setAccessory(1, deployedMoldContract2.address, 1)
    ).to.revertedWith("Fllnchn: must be owner of this token");
    const uri4 = await deployedMoldContract.tokenURI(1);
    console.log(uri4);

    await deployedMoldContract2.transferFrom(signer.address, notHolder.address, 1);

    const uri6 = await deployedMoldContract.tokenURI(1);
    console.log(uri6);
    await deployedMoldContract.removeAccessories(1);
    const uri5 = await deployedMoldContract.tokenURI(1);
    console.log(uri5);
  });
});

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

import {NFTDescriptor} from "./NFTDescriptor.sol";

import {IPixelFasion} from "./IPixelFasion.sol";

contract PixelFasionMold is Initializable, ERC721Upgradeable, OwnableUpgradeable, IERC2981 {
  using StringsUpgradeable for uint256;
  using SafeMathUpgradeable for uint256;

  struct Accessory {
    address contractAddress;
    uint256 tokenId;
  }

  struct Royalty {
    address recipient;
    uint256 salePrice;
  }

  mapping(uint256 => Royalty) internal _royalties;

  mapping(uint256 => string[]) public palettes;
  mapping(uint256 => string) public names;
  mapping(uint256 => string) public backgrounds;
  mapping(uint256 => bytes) public parts;
  mapping(uint256 => Accessory[]) public accessories;
  uint256 private _totalSupply;
  string public contractName;

  function initialize(
    address _owner,
    string memory _name,
    string memory _symbol
  ) public initializer {
    __Ownable_init_unchained();
    transferOwnership(_owner);
    __ERC721_init_unchained(_name, _symbol);
    contractName = _name;
  }

  function supportsInterface(bytes4 _interfaceId) public view override(ERC721Upgradeable, IERC165) returns (bool) {
    return super.supportsInterface(_interfaceId);
  }

  function _addColorToPalette(uint256 _paletteIndex, string calldata _color) internal {
    palettes[_paletteIndex].push(_color);
  }

  function setAccessory(
    uint256 tokenId,
    address _accessoryAddress,
    uint256 _accessorieTokenId
  ) public {
    require(this.ownerOf(tokenId) == msg.sender, "PixelFasion: must be owner of this token");
    require(
      IPixelFasion(_accessoryAddress).ownerOf(_accessorieTokenId) == msg.sender,
      "PixelFasion: must be owner of accessory token"
    );
    accessories[tokenId].push(Accessory({contractAddress: _accessoryAddress, tokenId: _accessorieTokenId}));
  }

  function mintNFT(
    string calldata name,
    bytes memory seed,
    string[] calldata colors,
    string memory bgColor,
    address toAddress
  ) public onlyOwner {
    uint256 tokenId = _totalSupply + 1;
    require(palettes[tokenId].length + colors.length <= 256, "Palettes can only hold 256 colors");
    for (uint256 i = 0; i < colors.length; i++) {
      _addColorToPalette(tokenId, colors[i]);
    }
    parts[tokenId] = seed;
    backgrounds[tokenId] = bgColor;
    names[tokenId] = name;
    _totalSupply++;
    _safeMint(toAddress, tokenId);
  }

  function totalSupply() public view returns (uint256) {
    return _totalSupply;
  }

  function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable) returns (string memory) {
    require(_exists(tokenId), "URI query for nonexistent token");
    return dataURI(tokenId);
  }

  /**
   * @notice Given a token ID and seed, construct a base64 encoded data URI for an official Nouns DAO noun.
   */
  function dataURI(uint256 tokenId) public view returns (string memory) {
    string memory name = names[tokenId];
    string memory description = string(abi.encodePacked(contractName, " #", tokenId.toString()));
    return genericDataURI(name, description, tokenId);
  }

  /**
   * @notice Given a name, description, and seed, construct a base64 encoded data URI.
   */
  function genericDataURI(
    string memory name,
    string memory description,
    uint256 tokenId
  ) public view returns (string memory) {
    NFTDescriptor.TokenURIParams memory params = NFTDescriptor.TokenURIParams({
      name: name,
      description: description,
      parts: getPartsForTokenId(tokenId),
      background: backgrounds[tokenId]
    });
    return NFTDescriptor.constructTokenURI(params, getPalletesForTokenId(tokenId));
  }

  function returnParts(uint256 tokenId) public view returns (bytes memory) {
    return parts[tokenId];
  }

  function returnPalletes(uint256 tokenId) public view returns (string[] memory) {
    return palettes[tokenId];
  }

  function getPartsForTokenId(uint256 tokenId) public view returns (bytes[] memory) {
    bytes[] memory _parts = new bytes[](accessories[tokenId].length + 1);
    _parts[0] = parts[tokenId];
    for (uint8 p = 0; p < accessories[tokenId].length; p++) {
      _parts[p + 1] = IPixelFasion(accessories[tokenId][p].contractAddress).returnParts(
        accessories[tokenId][p].tokenId
      );
    }
    return _parts;
  }

  function getPalletesForTokenId(uint256 tokenId) public view returns (string[][] memory) {
    string[][] memory _palletes = new string[][](accessories[tokenId].length + 1);
    _palletes[0] = palettes[tokenId];
    for (uint8 p = 0; p < accessories[tokenId].length; p++) {
      _palletes[p + 1] = IPixelFasion(accessories[tokenId][p].contractAddress).returnPalletes(
        accessories[tokenId][p].tokenId
      );
    }
    return _palletes;
  }

  function removeAccessories(uint256 tokenId) public {
    require(this.ownerOf(tokenId) == msg.sender, "PixelFasion: must be owner of this token");
    delete accessories[tokenId];
  }

  function setRoyalties(
    uint256 _tokenId,
    address _receiver,
    uint256 _percentage
  ) public onlyOwner {
    require(_percentage <= 10000, "ERC2981Royalities: Too high");
    _royalties[_tokenId] = Royalty(_receiver, _percentage);
  }

  function royaltyInfo(uint256 tokenId, uint256 salePrice) public view override returns (address, uint256) {
    require(_exists(tokenId), "PixelFasion: royalty query for nonexistent token");
    if (_royalties[tokenId].recipient != address(0)) {
      return (_royalties[tokenId].recipient, (salePrice * _royalties[tokenId].salePrice) / 10000);
    }
    return (address(0x0), 0);
  }
}

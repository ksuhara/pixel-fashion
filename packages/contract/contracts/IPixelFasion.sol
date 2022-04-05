// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

interface IPixelFasion {
  function returnParts(uint256 tokenId) external view returns (bytes memory);

  function returnPalletes(uint256 tokenId) external view returns (string[] memory);

  function getPartsForTokenId(uint256 tokenId) external view returns (bytes[] memory);

  function getPalletesForTokenId(uint256 tokenId) external view returns (string[][] memory);

  function ownerOf(uint256 tokenId) external view returns (address owner);

  function removeAccessories(uint256 tokenId) external;

  function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address, uint256);
}

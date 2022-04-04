// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

interface IFllnchn {
  function returnParts(uint256 tokenId) external view returns (bytes memory);

  function returnPalletes(uint256 tokenId) external view returns (string[] memory);

  function ownerOf(uint256 tokenId) external view returns (address owner);
}

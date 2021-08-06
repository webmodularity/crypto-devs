//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
// ERC721
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// Utils
import "@openzeppelin/contracts/utils/Counters.sol";
// Access
import "@openzeppelin/contracts/access/Ownable.sol";

contract CryptoDev is ERC721URIStorage, Ownable
{
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() ERC721("Crypto Devs", "CRYPTODEV") {}

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
    super._beforeTokenTransfer(from, to, amount);
    // Disable transfer but allow mint and burn
    require(from == address(0) || to == address(0), "Crypto Devs are non-transferable");
  }

  function mint() public {
    // Only allow 1 NFT per address
    require(balanceOf(msg.sender) == 0, "Only 1 Crypto Dev NFT allowed per address");
    // Increment first so our _tokenIds start at 1
    _tokenIds.increment();
    _safeMint(msg.sender, _tokenIds.current());
    // TODO set tokenURI
    // TODO Add some data on chain
  }

  function burn(uint256 tokenId) public {
    // Only owner can burn
    require(ownerOf(tokenId) == msg.sender, "Only owner can burn NFT");
    _burn(tokenId);
    // TODO Remove some data on chain
  }
}

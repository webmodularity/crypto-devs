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
  bool private _publicMinting;
  mapping(address => bool) private _inviteList;
  uint256[] private _lookingForWork;

  constructor(address[] memory _invites) ERC721("Crypto Devs", "CRYPTODEV") {
    _addInvites(_invites);
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
    super._beforeTokenTransfer(from, to, amount);
    // Disable transfer but allow mint and burn
    require(from == address(0) || to == address(0), "Crypto Devs are non-transferable");
  }

  function allowPublicMinting(bool _publicMintingAllowed) external onlyOwner {
    _publicMinting = _publicMintingAllowed;
  }

  function mint() external {
    // If minting is invite only make sure this address is in _inviteList
    require(_publicMinting || _inviteList[msg.sender], "This address is not allowed to mint at this time");
    // Only allow 1 NFT per address
    require(balanceOf(msg.sender) == 0, "Only 1 Crypto Dev NFT allowed per address");
    // Increment first so our _tokenIds start at 1
    _tokenIds.increment();
    _safeMint(msg.sender, _tokenIds.current());
    // TODO set tokenURI
    // TODO Add some data on chain
  }

  function burn(uint256 tokenId) external {
    // Only owner can burn
    require(ownerOf(tokenId) == msg.sender, "Only owner can burn NFT");
    _burn(tokenId);
    // TODO Remove some data on chain
  }

  function _addInvites(address[] memory _invites) private {
    for (uint i = 0;i < _invites.length; i++) {
      _inviteList[_invites[i]] = true;
    }
  }

  function _removeInvites(address[] memory _invites) private {
    for (uint i = 0;i < _invites.length; i++) {
      _inviteList[_invites[i]] = false;
    }
  }
}

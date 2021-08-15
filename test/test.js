const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crypto Devs", function () {
  let cryptoDevsDeployed;
  let addresses = [];

  before(async () => {
    addresses = await ethers.getSigners();
    const CryptoDevsContract = await ethers.getContractFactory("CryptoDev");
    cryptoDevsDeployed = await CryptoDevsContract.deploy([addresses[0].address, addresses[1].address]);
    // Wait for contract to deploy
    await cryptoDevsDeployed.deployed();
  });

  describe("Minting", function () {
    it("Should mint a new CryptoDev NFT for the first 2 test accounts (on invite list)", async function () {
      for (let i = 0;i < 2;i++) {
        const mintTx = await cryptoDevsDeployed.connect(addresses[i]).mint("ipfs_url");
        await mintTx.wait();
        expect(await cryptoDevsDeployed.balanceOf(addresses[i].address)).to.equal(1);
      }
    });
    it("Should NOT allow minting for next 2 test accounts (NOT on invite list)", async function () {
      for (let i = 2;i < 4;i++) {
        expect(cryptoDevsDeployed.connect(addresses[i]).mint()).to.be.reverted;
      }
    });
    it("Should switch to publicMinting mode and allow minting from any address", async function () {
      const publicTx = await cryptoDevsDeployed.connect(addresses[0]).allowPublicMinting(true);
      await publicTx.wait();
      for (let i = 2;i < 5;i++) {
        const mintTx = await cryptoDevsDeployed.connect(addresses[i]).mint("ipfs_url");
        await mintTx.wait();
        expect(await cryptoDevsDeployed.balanceOf(addresses[i].address)).to.equal(1);
      }
    });
    it("Should NOT allow minting of more than one NFT per account", async function () {
      for (let i = 0;i < 2;i++) {
        expect(cryptoDevsDeployed.connect(addresses[i]).mint()).to.be.reverted;
      }
    });
    it("Should NOT allow transfers", async function () {
      expect(cryptoDevsDeployed.connect(addresses[0]).transferFrom(addresses[0].address, addresses[1].address, 1))
          .to.be.revertedWith('Crypto Devs are non-transferable');
      expect(cryptoDevsDeployed.connect(addresses[1]).transferFrom(addresses[1].address, addresses[0].address, 2))
          .to.be.revertedWith('Crypto Devs are non-transferable');
    });
    it("Should burn the NFTs from the first 2 test accounts", async function () {
      for (let i = 0;i < 2;i++) {
        const burnTx = await cryptoDevsDeployed.connect(addresses[i]).burn(i+1);
        await burnTx.wait();
        expect(await cryptoDevsDeployed.balanceOf(addresses[i].address)).to.equal(0);
      }
    });
  });
});

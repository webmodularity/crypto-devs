const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crypto Devs", function () {
  let cryptoDevsDeployed;
  let addresses = [];

  before(async () => {
    const CryptoDevsContract = await ethers.getContractFactory("CryptoDev");
    cryptoDevsDeployed = await CryptoDevsContract.deploy();
    // Wait for contract to deploy
    await cryptoDevsDeployed.deployed();
    addresses = await ethers.getSigners();
  });

  describe("Minting", function () {
    it("Should mint a new CryptoDev NFT for the first 3 test accounts", async function () {
      for (let i = 0;i < 3;i++) {
        const mintTx = await cryptoDevsDeployed.connect(addresses[i]).mint();
        await mintTx.wait();
        expect(await cryptoDevsDeployed.balanceOf(addresses[i].address)).to.equal(1);
      }
    });
    it("Should NOT allow minting of more than one NFT per account", async function () {
      for (let i = 0;i < 3;i++) {
        expect(cryptoDevsDeployed.connect(addresses[i]).mint()).to.be.reverted;
      }
    });
    it("Should NOT allow transfers", async function () {
      expect(cryptoDevsDeployed.connect(addresses[0]).transferFrom(addresses[0].address, addresses[1].address, 1))
          .to.be.revertedWith('Crypto Devs are non-transferable');
      expect(cryptoDevsDeployed.connect(addresses[0]).transferFrom(addresses[0].address, addresses[2].address, 1))
          .to.be.revertedWith('Crypto Devs are non-transferable');
    });
    it("Should burn the NFTs from last 2 test accounts", async function () {
      for (let i = 1;i < 3;i++) {
        const burnTx = await cryptoDevsDeployed.connect(addresses[i]).burn(i+1);
        await burnTx.wait();
        expect(await cryptoDevsDeployed.balanceOf(addresses[i].address)).to.equal(0);
      }
    });
  });
});
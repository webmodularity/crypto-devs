const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const cryptoDevsContract = await hre.ethers.getContractFactory("CryptoDev");
  const cryptoDevsDeployed = await cryptoDevsContract.deploy(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]);

  await cryptoDevsDeployed.deployed();

  console.log("CryptoDevs deployed to:", cryptoDevsDeployed.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

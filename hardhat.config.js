require("@nomiclabs/hardhat-waffle");
require('hardhat-abi-exporter');
require("dotenv").config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.INFURA_URL,
      accounts: [process.env.PRIVATE_KEY],
      gas: 10000000
    },
    hardhat: {
      mining: {
        auto: false,
        interval: 12000
      }
    }
  },
  abiExporter: {
    path: './frontend/src/contracts',
    clear: true,
    flat: true
  }
};

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const { ALCHEMY_API_KEY_URL, RINKEBY_PRIVATE_KEY, ETHERSCAN_API_KEY } =
  process.env;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: ALCHEMY_API_KEY_URL,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    bsc: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    polygon: {
      url: "https://speedy-nodes-nyc.moralis.io/40a88f8745bc01d3bb660792/polygon/mumbai",
      accounts: [RINKEBY_PRIVATE_KEY],
    },
  },
  etherscan: {
    // Obtain one at https://etherscan.io/
    //Polygon
    //apiKey: "RZ2RSK3GIMZHPGF57NN42A9PZQET8K4FD6",
    //BSC apikey
    //apiKey: "MDY4Z2KVM3QRTSF5WBUE4YDRIKA3S8KZTD",
    //ethereum api key
    apiKey: ETHERSCAN_API_KEY,
  },
};

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so whitelistContract here is a factory for instances of our Whitelist contract.
  */
  const nftContract = await ethers.getContractFactory("Payment");

  // here we deploy the contract
  const deployedNftContract = await nftContract.deploy(
    "0xCF59aC8b973A5B1fF452f2d1654899F97edecdFF"
  );

  // Wait for it to finish deploying
  await deployedNftContract.deployed();

  // print the address of the deployed contract
  console.log("NFT Contract Address:", deployedNftContract.address);

  console.log("Sleeping.....");
  // Wait for etherscan to notice that the contract has been deployed
  await sleep(30000);

  // Verify the contract after deploying
  await hre.run("verify:verify", {
    address: deployedNftContract.address,
    constructorArguments: ["0xCF59aC8b973A5B1fF452f2d1654899F97edecdFF"],
    contract: "contracts/Pay.sol:Payment",
  });

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

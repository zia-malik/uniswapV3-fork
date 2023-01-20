const hre = require("hardhat");

async function main() {
  //ERC20 BOO TOKEN
  // const BooToken = await hre.ethers.getContractFactory("BooToken");
  // const booToken = await BooToken.deploy();
  // await booToken.deployed();
  // console.log(`BOO deployed to ${booToken.address}`);

  //ERC20 LIFE TOKEN
  // const LifeToken = await hre.ethers.getContractFactory("LifeToken");
  // const lifeToken = await LifeToken.deploy();
  // await lifeToken.deployed();
  // console.log(`LIfe deployed to ${lifeToken.address}`);

  //SingleSwapToken
  const SingleSwapToken = await hre.ethers.getContractFactory(
    "SwapExamples"
  );
  const singleSwapToken = await SingleSwapToken.deploy("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
  await singleSwapToken.deployed();
  console.log(`SingleSwapToken deployed to ${singleSwapToken.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
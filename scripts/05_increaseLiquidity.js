const {
  WETH_ADDRESS, FACTORY_ADDRESS, SWAP_ROUTER_ADDRESS, 
  NFT_DESCRIPTOR_ADDRESS, POSITION_DESCRIPTOR_ADDRESS, 
  POSITION_MANAGER_ADDRESS, TETHER_ADDRESS, USDC_ADDRESS, WRAPPED_BITCOIN_ADDRESS
} = require('./addresses.js');

// Pool addresses
USDT_USDC_500= '0x1FA8DDa81477A5b6FA1b2e149e93ed9C7928992F'

const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
  Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract } = require("ethers")
const { Token } = require('@uniswap/sdk-core')
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')
const { ethers } = require("hardhat")

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])
  console.log("Tick Spacing", await poolContract.tickSpacing() )
  console.log("Fee",await poolContract.fee())
  console.log("Liquidity", await poolContract.liquidity())
  console.log("Slot 0",await poolContract.slot0() )

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}

async function main(){
  
  const [owner, signer2] = await ethers.getSigners();
  const provider = waffle.provider;

  const usdtContract = new Contract(TETHER_ADDRESS,artifacts.Usdt.abi,provider)
  const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider)

  await usdtContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'))
  await usdcContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'))

  const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)

  const poolData = await getPoolData(poolContract)

  const UsdtToken = new Token(31337, TETHER_ADDRESS, 18, 'USDT', 'Tether')
  const UsdcToken = new Token(31337, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')

  params = {
    tokenId: ethers.utils.parseUnits("1",0),
    amount0Desired:   ethers.BigNumber.from("10"),
    amount1Desired:   ethers.utils.parseUnits("10",0),
    amount0Min: ethers.utils.parseUnits("1",0),
    amount1Min:   ethers.utils.parseUnits("1",0),
    deadline: ethers.BigNumber.from(ethers.utils.parseUnits(Math.floor(Date.now()).toString(),0).div(1000).add(ethers.utils.parseUnits('60',0).mul(10)))   
  }

  console.log("HERE2", params)  
  const nonfungiblePositionManager = new ethers.Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  )

  const gasLimit = 103000;
    
  const tx = await nonfungiblePositionManager.connect(signer2).increaseLiquidity(
    params,
    { gasLimit: '1000000' }
  )

  const receipt = await tx.wait()
  const event1 = await receipt.events[5];
  console.log("EVENT1-----------", event1)
  let value1 = event1.args[0]
  console.log("VALUE1---------", value1)
  let value2 = event1.args[1]
  console.log("VALUE2---------", value2)
  let value3 = event1.args[2]
  console.log("VALUE3---------", value3)
  let value4 = event1.args[3]
  console.log("VALUE4---------", value4)
}

/*
npx hardhat run --network localhost scripts/05_increaseLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
   
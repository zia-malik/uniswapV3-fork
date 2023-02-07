const {
  WETH_ADDRESS, FACTORY_ADDRESS, SWAP_ROUTER_ADDRESS, 
  NFT_DESCRIPTOR_ADDRESS, POSITION_DESCRIPTOR_ADDRESS, 
  POSITION_MANAGER_ADDRESS, TETHER_ADDRESS, USDC_ADDRESS, WRAPPED_BITCOIN_ADDRESS,
  POOL_USDT_USDC_500
} = require('./addresses.js');

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
  console.log("Pool data Slot 0: ",await poolContract.slot0() )

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}

async function main() {

  const [owner, signer2] = await ethers.getSigners();
  const provider = waffle.provider;

  const usdtContract = new Contract(TETHER_ADDRESS,artifacts.Usdt.abi,provider)
  const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider)

  await usdtContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'))
  await usdcContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'))

  const poolContract = new Contract(POOL_USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider);

  // setFeeProtocol
  const set_tx =  await poolContract.connect(owner).setFeeProtocol(10, 10);
  console.log("set protocolFees logs: ", (await set_tx.wait()).events.find(event => event.event === 'SetFeeProtocol').args);

  const poolData = await getPoolData(poolContract);

  const UsdtToken = new Token(31337, TETHER_ADDRESS, 18, 'USDT', 'Tether')
  const UsdcToken = new Token(31337, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')

  const pool = new Pool(
    UsdtToken,
    UsdcToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  )

  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther('1'),
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
  })

  const { amount0: amount0Desired, amount1: amount1Desired} = position.mintAmounts

  params = {
    token0: TETHER_ADDRESS,
    token1: USDC_ADDRESS,
    fee: poolData.fee,
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer2.address,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10)
  }

  const nonfungiblePositionManager = new ethers.Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  )

  console.log("------mint-------: ", await nonfungiblePositionManager.totalSupply())


  const tx = await nonfungiblePositionManager.connect(signer2).mint(
    params,
    { gasLimit: '1000000' }
  )

  const receipt = await tx.wait()
  const event1 = await receipt.events[6];
  console.log("EVENT1-----------", event1)
  let value = event1.args[0]
  console.log("VALUE---------", value)
}

/*
npx hardhat run --network localhost scripts/04_mintPosition.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
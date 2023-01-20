// Token addresses
TETHER_ADDRESS= '0x0165878A594ca255338adfa4d48449f69242Eb8F'
USDC_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
WRAPPED_BITCOIN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'

// Uniswap contract address
WETH_ADDRESS= '0x5FbDB2315678afecb367f032d93F642f64180aa3'
FACTORY_ADDRESS= '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
SWAP_ROUTER_ADDRESS= '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
NFT_DESCRIPTOR_ADDRESS= '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
POSITION_DESCRIPTOR_ADDRESS= '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
POSITION_MANAGER_ADDRESS= '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'

const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Wbtc: require("../artifacts/contracts/WrappedBitcoin.sol/WrappedBitcoin.json"),
  Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract, BigNumber } = require("ethers")
const { Token } = require('@uniswap/sdk-core')
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')
const { ethers } = require("hardhat")



// deploy pool
const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

const provider = waffle.provider;

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  artifacts.NonfungiblePositionManager.abi,
  provider
)
const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory.abi,
  provider
)

async function deployPool(token0, token1, fee, price) {
  
  const [owner] = await ethers.getSigners();
  await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(
    token0,
    token1,
    fee,
    price,
    { gasLimit: 5000000 }
  )
  const poolAddress = await factory.connect(owner).getPool(
    token0,
    token1,
    fee,
  )
  return poolAddress
}



// mint possition

async function getPoolData(poolContract) {
  const [token0, token1, tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])
  console.log("token0: ", token0 )
  console.log("token1: ", token1 )
  console.log("Tick Spacing: ", tickSpacing)
  console.log("Fee: ", fee)
  console.log("Liquidity: ", liquidity)
  console.log("Slot 0: ", slot0)

  return {
    token0: token0,
    token1: token1,
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}



async function mintNewPossition(wbtcUsdc500) {

  const [owner, signer2] = await ethers.getSigners();
  const provider = waffle.provider;

  const wbtcContract = new Contract(WRAPPED_BITCOIN_ADDRESS,artifacts.Wbtc.abi,provider)
  const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider)

  await wbtcContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('10000'))
  await usdcContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('10000'))

  const poolContract = new Contract(wbtcUsdc500, artifacts.UniswapV3Pool.abi, provider)

  const poolData = await getPoolData(poolContract)

  const WBTC = new Token(31337, WRAPPED_BITCOIN_ADDRESS, 18, 'WBTC', 'WrappedBitcoin')
  const UsdcToken = new Token(31337, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')

  const pool = new Pool(
    WBTC,
    UsdcToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  )
    console.log("Get pool: ")
  const tickLower = nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2;
  const tickUpper = nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2;


  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther('1000'),
    tickLower: tickLower,
    tickUpper: tickUpper,
  })

  const { amount0: amount0Desired, amount1: amount1Desired} = position.mintAmounts

  params = {
    token0: poolData.token0,
    token1: poolData.token1,
    fee: poolData.fee,
    tickLower: tickLower,
    tickUpper: tickUpper,
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


  const tx = await nonfungiblePositionManager.connect(signer2).mint(
    params,
    { gasLimit: '1000000' }
  )

  const receipt = await tx.wait()
  const event1 = await receipt.events[6];
  console.log("EVENT1 args: ", event1.args)
  let value = event1.args[0]
  console.log("VALUE: ", value)
}




async function main() {
  let wbtcUsdc500 = await deployPool(WRAPPED_BITCOIN_ADDRESS, USDC_ADDRESS, 500, encodePriceSqrt(1, 1))
  console.log('\nWBTC_USDC_500= ', `'${wbtcUsdc500}'\n`)
  // wbtcUsdc500 = "0xD8Dc8176F0fC3668527445463bCb6089AbC2CD82";
  await mintNewPossition(wbtcUsdc500);
}

/*
npx hardhat run --network localhost scripts/01_deployContracts.js
npx hardhat run --network localhost scripts/02_deployTokens.js
npx hardhat run --network localhost scripts/03_deployPools.js
npx hardhat run --network localhost scripts/04_mintPosition.js
npx hardhat run --network localhost scripts/05_increaseLiquidity.js

clear
npx hardhat run --network localhost scripts/11_exactInputSingle.js

npx hardhat run --network localhost scripts/01_deployContracts.js
npx hardhat run --network localhost scripts/02_deployTokens.js
npx hardhat run --network localhost scripts/13_deployAndMintPoolPositionForWetWithUsdc.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
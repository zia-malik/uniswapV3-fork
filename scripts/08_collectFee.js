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

    const poolContract = new Contract(POOL_USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)

    const poolData = await getPoolData(poolContract)
    console.log("POOL DATA", poolData);

    const UsdtToken = new Token(31337, TETHER_ADDRESS, 18, 'USDT', 'Tether')
    const UsdcToken = new Token(31337, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')

    params = {
    tokenId: 3,
    recipient:   signer2.address,
    amount0Max:  1,
    amount1Max:  1,
    }
    // ethers.BigNumber.from('1000000')
    console.log("HERE2", params)  
    const nonfungiblePositionManager = new ethers.Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
    )//   console.log("HERE3", signer2)
    const gasLimit = 838520
    const tx = await nonfungiblePositionManager.connect(signer2).collect(params, {gasLimit})

    // Collect

    console.log("HERE4", tx)
    console.log("Collect logs: ", (await tx.wait()).events.find(event => event.event === 'Collect').args);
}

/*
npx hardhat run --network localhost scripts/08_collectFee.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
   
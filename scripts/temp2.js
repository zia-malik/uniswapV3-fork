SingleSwapToken = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82"


const artifacts = {
    SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
    Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
    Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
    Swap: require("../artifacts/contracts/SingleSwap.sol/SwapExamples.json"),
    UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
  };


  const { Contract } = require("ethers")
const { Token } = require('@uniswap/sdk-core')
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')
const { ethers } = require("hardhat")

async function main(){
    const [owner, signer2,signer3] = await ethers.getSigners();
    const provider = waffle.provider;

    // const usdtContract = new Contract(TETHER_ADDRESS,artifacts.Usdt.abi,provider)
    // const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider)

    // await usdtContract.connect(signer3).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther('1000'))
    // await usdcContract.connect(signer3).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther('1000'))
    
    // const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)
    // const poolData = await getPoolData(poolContract)
    // console.log("POOL DATA", poolData);

    // const UsdtToken = new Token(31337, TETHER_ADDRESS, 18, 'USDT', 'Tether')
    // const UsdcToken = new Token(31337, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')

    // params = {
    //     tokenIn: TETHER_ADDRESS,
    //     tokenOut: USDC_ADDRESS,
    //     fee: poolData.fee,
    //     recipient: signer3,
    //     deadline: Math.floor(Date.now() / 1000) + (60 * 10),
    //     amountIn: 10,
    //     amountOutMinimum: 1,
    //     sqrtPriceLimitX96: 79228162514264337593543950336,
    // }

    const swaprouter = new ethers.Contract(
        SingleSwapToken, 
        artifacts.Swap.abi,
        provider,
    )

    // console.log(swaprouter)

    const tx = await swaprouter.connect(signer2).swapExactInputSingle(
        1,
        { gasLimit: '10000000' }
    )

    const receipt = await tx.wait()
    console.log(receipt);




}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
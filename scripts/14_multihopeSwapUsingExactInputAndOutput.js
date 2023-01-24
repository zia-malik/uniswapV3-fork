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

// Pool addresses
USDT_USDC_500= '0x1FA8DDa81477A5b6FA1b2e149e93ed9C7928992F'
WBTC_USDC_500=  '0xD8Dc8176F0fC3668527445463bCb6089AbC2CD82'

const artifacts = {
    SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
    Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
    Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
    Wbtc: require("../artifacts/contracts/WrappedBitcoin.sol/WrappedBitcoin.json"),
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
    return {
      tickSpacing: tickSpacing,
      fee: fee,
      liquidity: liquidity,
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
    }
  }

  async function exectInputSingle(signer, swaprouter, tokenInContract, tokenOutContract, poolData, amountIn ){
    await tokenInContract.connect(signer).approve(SWAP_ROUTER_ADDRESS, amountIn.toString())

    paramsExectInputSingle = {
      tokenIn: TETHER_ADDRESS,
      tokenOut: USDC_ADDRESS,
      fee: poolData.fee,
      recipient: signer.address,
      deadline: Math.floor(Date.now() / 1000) + (60 * 10),
      amountIn: amountIn.toString(),
      amountOutMinimum: 0,
      sqrtPriceLimitX96:0
    }


    const tokenBalanceBefore = (await tokenOutContract.balanceOf(signer.address)).toString();

    const tx = await swaprouter.connect(signer).exactInputSingle(
      paramsExectInputSingle,
        { gasLimit: '30000000' }
    );
    await tx.wait();

    const tokenBalanceAfter = (await tokenOutContract.balanceOf(signer.address)).toString();
    const tokenBalanceDifference = ethers.utils.parseUnits(tokenBalanceAfter, 0)
    .sub(ethers.utils.parseUnits(tokenBalanceBefore, 0)).toString();
    console.log("paramsExectInputSingle USDC balance after: ", tokenBalanceDifference);
  }



  async function exectOutputSingle(signer, swaprouter, tokenInContract, tokenOutContract, poolData, amountInMaximum, amountOut){
    await tokenInContract.connect(signer).approve(SWAP_ROUTER_ADDRESS, amountInMaximum.toString())

    paramsExectOutputSingle = {
      tokenIn: TETHER_ADDRESS,
      tokenOut: USDC_ADDRESS,
      fee: poolData.fee,
      recipient: signer.address,
      deadline: Math.floor(Date.now() / 1000) + (60 * 10),
      amountOut: amountOut,
      amountInMaximum: amountInMaximum,
      sqrtPriceLimitX96:0
    }


    const tokenBalanceBefore = (await tokenOutContract.balanceOf(signer.address)).toString();

    const tx = await swaprouter.connect(signer).exactOutputSingle(
      paramsExectOutputSingle,
        { gasLimit: '30000000' }
    );
    await tx.wait();

    const tokenBalanceAfter = (await tokenOutContract.balanceOf(signer.address)).toString();
    const tokenBalanceDifference = ethers.utils.parseUnits(tokenBalanceAfter, 0)
    .sub(ethers.utils.parseUnits(tokenBalanceBefore, 0)).toString();
    console.log("exectOutputSingle USDC reveived: ", tokenBalanceDifference);
  }




  async function exactInputMultiHope(signer, swaprouter, tokenInContract, tokenOutContract, poolData, amountIn){
    await tokenInContract.connect(signer).approve(SWAP_ROUTER_ADDRESS, amountIn.toString())

    paramsExectInput = {
      path: ethers.utils.solidityPack(["address", "uint24", "address", "uint24", "address"], 
      [WRAPPED_BITCOIN_ADDRESS, poolData.fee, USDC_ADDRESS, poolData.fee, TETHER_ADDRESS]),
      recipient: signer.address,
      deadline: Math.floor(Date.now() / 1000) + (60 * 10),
      amountIn: amountIn,
      amountOutMinimum: 0
    }


    const tokenBalanceBefore = (await tokenOutContract.balanceOf(signer.address)).toString();

    const tx = await swaprouter.connect(signer).exactInput(
      paramsExectInput,
        { gasLimit: '30000000' }
    );
    await tx.wait();

    const tokenBalanceAfter = (await tokenOutContract.balanceOf(signer.address)).toString();
    const tokenBalanceDifference = ethers.utils.parseUnits(tokenBalanceAfter, 0)
    .sub(ethers.utils.parseUnits(tokenBalanceBefore, 0)).toString();
    console.log("exactInputMultiHope TETHER reveived: ", tokenBalanceDifference);
  }





  async function exactOutputMultiHope(signer, swaprouter, tokenInContract, tokenOutContract, poolData, amountInMaximum, amountOut){
    await tokenInContract.connect(signer).approve(SWAP_ROUTER_ADDRESS, amountInMaximum.toString())

    paramsExectOutput = {
      path: ethers.utils.solidityPack(["address", "uint24", "address", "uint24", "address"], 
      [TETHER_ADDRESS, poolData.fee, USDC_ADDRESS, poolData.fee, WRAPPED_BITCOIN_ADDRESS]),
      recipient: signer.address,
      deadline: Math.floor(Date.now() / 1000) + (60 * 10),
      amountOutMinimum: 0,
      amountOut: amountOut,
      amountInMaximum: amountInMaximum
    }


    const tokenBalanceBefore = (await tokenOutContract.balanceOf(signer.address)).toString();

    const tx = await swaprouter.connect(signer).exactOutput(
      paramsExectOutput,
        { gasLimit: '30000000' }
    );
    await tx.wait();

    const tokenBalanceAfter = (await tokenOutContract.balanceOf(signer.address)).toString();
    const tokenBalanceDifference = ethers.utils.parseUnits(tokenBalanceAfter, 0)
    .sub(ethers.utils.parseUnits(tokenBalanceBefore, 0)).toString();
    console.log("exactOutputMultiHope TETHER received: ", tokenBalanceDifference);
  }




async function main(){
    const [owner, signer2,signer3, signer4] = await ethers.getSigners();
    const provider = waffle.provider;

  
    const usdtContract = new Contract(TETHER_ADDRESS,artifacts.Usdt.abi,provider)
    const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider)
    const wbtcContract = new Contract(WRAPPED_BITCOIN_ADDRESS,artifacts.Wbtc.abi,provider)

    const poolContract = new Contract(WBTC_USDC_500, artifacts.UniswapV3Pool.abi, provider)
    const poolData = await getPoolData(poolContract)
  

    const swaprouter = new ethers.Contract(
        SWAP_ROUTER_ADDRESS, 
        artifacts.SwapRouter.abi,
        provider,
    );


    await exectInputSingle(signer2, swaprouter, usdtContract, usdcContract, poolData, 10000);
    await exectOutputSingle(signer2, swaprouter, usdtContract, usdcContract, poolData, 1000000, 999);
    await exactInputMultiHope(signer2, swaprouter, wbtcContract, usdtContract, poolData, 10000);
    await exactOutputMultiHope(signer2, swaprouter, wbtcContract, usdtContract, poolData, 1000000, 999);

}

/*

npx hardhat run --network localhost scripts/01_deployContracts.js
npx hardhat run --network localhost scripts/02_deployTokens.js
npx hardhat run --network localhost scripts/03_deployPools.js
npx hardhat run --network localhost scripts/04_mintPosition.js
npx hardhat run --network localhost scripts/13_deployAndMintPoolPositionForWetWithUsdc.js
clear
npx hardhat run --network localhost scripts/14_multihopeSwapUsingExactInputAndOutput.js 
*/


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });                  
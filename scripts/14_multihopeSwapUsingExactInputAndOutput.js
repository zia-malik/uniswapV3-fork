const {
  WETH_ADDRESS, FACTORY_ADDRESS, SWAP_ROUTER_ADDRESS, 
  NFT_DESCRIPTOR_ADDRESS, POSITION_DESCRIPTOR_ADDRESS, 
  POSITION_MANAGER_ADDRESS, TETHER_ADDRESS, USDC_ADDRESS, WRAPPED_BITCOIN_ADDRESS,
  POOL_USDT_USDC_500, POOL_WBTC_USDC_500, 
} = require('./addresses.js');


const artifacts = {
    SwapRouter: require("../artifacts/contracts/v3-periphery/SwapRouter.sol/SwapRouter.json"),
    Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
    Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
    Wbtc: require("../artifacts/contracts/WrappedBitcoin.sol/WrappedBitcoin.json"),
    UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
    NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
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
      
    ]);

    console.log("pooldata slot0: ", slot0);

    return {
      tickSpacing: tickSpacing,
      fee: fee,
      liquidity: liquidity,
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
    }
  }

  async function exectInputSingle(signer, swaprouter, tokenInContract, tokenOutContract, inAddress, outAddress, poolData, amountIn ){
    await tokenInContract.connect(signer).approve(SWAP_ROUTER_ADDRESS, amountIn.toString())

    paramsExectInputSingle = {
      tokenIn: inAddress,
      tokenOut: outAddress,
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
    await tokenInContract.connect(signer).approve(SWAP_ROUTER_ADDRESS, amountInMaximum.toString());

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

  
    const usdtContract = new Contract(TETHER_ADDRESS,artifacts.Usdt.abi,provider);
    const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider);
    const wbtcContract = new Contract(WRAPPED_BITCOIN_ADDRESS,artifacts.Wbtc.abi,provider);

    const poolContract_WBTC_USDC_500 = new Contract(POOL_WBTC_USDC_500, artifacts.UniswapV3Pool.abi, provider);
    const poolData = await getPoolData(poolContract_WBTC_USDC_500);
  
    const poolContract_USDT_USDC_500 = new Contract(POOL_USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider);

    const swaprouter = new ethers.Contract(
        SWAP_ROUTER_ADDRESS, 
        artifacts.SwapRouter.abi,
        provider,
    );


    // await exectInputSingle(signer2, swaprouter, usdtContract, usdcContract, TETHER_ADDRESS, USDC_ADDRESS, poolData, 100000);
    // await exectOutputSingle(signer2, swaprouter, usdtContract, usdcContract, poolData, 1000000, 999);
    // await exactInputMultiHope(signer2, swaprouter, wbtcContract, usdtContract, poolData, 10000);
    // await exactOutputMultiHope(signer2, swaprouter, wbtcContract, usdtContract, poolData, 1000000, 999);
    // await exectInputSingle(signer2, swaprouter, wbtcContract, usdcContract, WRAPPED_BITCOIN_ADDRESS, USDC_ADDRESS, poolData, 10000000);



    // await getPoolData(poolContract_WBTC_USDC_500);
    // await getPoolData(poolContract_USDT_USDC_500);

    // const tx =  await poolContract_WBTC_USDC_500.connect(owner).setFeeProtocol(9,9);
    // console.log("collect protocolFees logs: ", (await tx.wait()).events.find(event => event.event === 'SetFeeProtocol').args);


    console.log("\nprotocolFees WBTC_USDC_500: ", await poolContract_WBTC_USDC_500.protocolFees());

    const tx =  await poolContract_WBTC_USDC_500.connect(owner).collectProtocol(owner.address, 100, 100);
    console.log("set protocolFees logs: ", (await tx.wait()).events.find(event => event.event === 'CollectProtocol').args);



    // console.log("\nprotocolFees USDT_USDC_500: ", await poolContract_USDT_USDC_500.protocolFees());

    // const nonfungiblePositionManager = new Contract(
    //   POSITION_MANAGER_ADDRESS,
    //   artifacts.NonfungiblePositionManager.abi,
    //   provider
    // );

    // console.log("\n\nget token 1 info: ", await nonfungiblePositionManager.connect(owner).positions(1));
    // console.log("\n\nget token 2 info: ", await nonfungiblePositionManager.connect(owner).positions(2));
    // console.log("\n\nget token 3 info: ", await nonfungiblePositionManager.connect(owner).positions(3));




}

/*

npx hardhat run --network localhost scripts/01_deployContracts.js
npx hardhat run --network localhost scripts/02_deployTokens.js
npx hardhat run --network localhost scripts/03_deployPools.js
npx hardhat run --network localhost scripts/04_mintPosition.js
npx hardhat run --network localhost scripts/11_exactInputSingle.js
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
const {
  WETH_ADDRESS, FACTORY_ADDRESS, SWAP_ROUTER_ADDRESS, 
  NFT_DESCRIPTOR_ADDRESS, POSITION_DESCRIPTOR_ADDRESS, 
  POSITION_MANAGER_ADDRESS, TETHER_ADDRESS, USDC_ADDRESS, WRAPPED_BITCOIN_ADDRESS,
  POOL_USDT_USDC_500
} = require('./addresses.js');

const artifacts = {
    SwapRouter: require("../artifacts/contracts/v3-periphery/SwapRouter.sol/SwapRouter.json"),
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
    //  console.log("Tick Spacing----------", await poolContract. feeGrowthGlobal0X128() )
    // console.log("Fee-----------------------------------",await poolContract)
    // console.log("Liquidity", await poolContract.liquidity())
    // console.log("Slot 0",await poolContract.slot0() )
  
    return {
      tickSpacing: tickSpacing,
      fee: fee,
      liquidity: liquidity,
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
    }
  }



async function main(){
    const [owner, signer2,signer3, signer4] = await ethers.getSigners();
    const provider = waffle.provider;

  
    const usdtContract = new Contract(TETHER_ADDRESS,artifacts.Usdt.abi,provider)
    const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider)
    // console.log("usdcContract",usdcContract)


// const balanceOfAdd = await usdcContract.balanceOf(signer2.address)
// console.log("balanceOfAdd signer2: ",balanceOfAdd.toString())
    a = await usdtContract.connect(signer2).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther('100'))
    b = await usdcContract.connect(signer2).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther('100'))
    c = await usdtContract.connect(signer2).transfer(signer3.address, ethers.utils.parseEther('10'))
    d = await usdtContract.connect(signer3).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther('10'))
    // console.log( (await usdtContract.allowance(signer2.address, signer3.address)).toString())

    // await usdtContract.connect(signer2).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther('10'))
    // await usdcContract.connect(signer2).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther('10'))

    // await usdcContract.connect(signer3).transferFrom(signer2.address, signer4.address,ethers.utils.parseEther('10'))
    // console.log("balance signer4: ", (await usdcContract.balanceOf(signer4.address)).toString())
    // await usdtContract.connect(signer4).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther('10'))
    // console.log("allowance signer4 to SWAP_ROUTER_ADDRESS: ", (await usdtContract.allowance(signer4.address, SWAP_ROUTER_ADDRESS)).toString())

    



    const poolContract = new Contract(POOL_USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)
    const poolData = await getPoolData(poolContract)

    // console.log("address poolContract: ", poolContract.address)
    // console.log("===> from: ", (await usdcContract.balanceOf("0x90f79bf6eb2c4f870365e785982e1f101e93b906")).toString())
    // console.log("usdc balance poolContract: ", (await usdcContract.balanceOf(poolContract.address)).toString())
    // console.log("usdt balance poolContract: ", (await usdtContract.balanceOf(poolContract.address)).toString())

    // console.log("POOL DATA", poolContract);

    // const UsdtToken = new Token(31337, TETHER_ADDRESS, 18, 'USDT', 'Tether')
    // const UsdcToken = new Token(31337, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')
  // console.log("UsdtToken.address",UsdtToken.address)
  
    

    const amountIn = 9;
    params = {
        tokenIn: TETHER_ADDRESS,
        tokenOut: USDC_ADDRESS,
        fee: poolData.fee,
        recipient: signer3.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: amountIn.toString(),
        amountOutMinimum: 0,
        sqrtPriceLimitX96:0}

    const swaprouter = new ethers.Contract(
        SWAP_ROUTER_ADDRESS, 
        artifacts.SwapRouter.abi,
        provider,
    )


    // console.log("===> swaprouter", swaprouter.functions);
    // console.log("===> swaprouter", await swaprouter.factory());

    const tx = await swaprouter.connect(signer3).exactInputSingle(
        params,
        { gasLimit: '30000000' }
    )

    const receipt = await tx.wait()

}

/*
npx hardhat run --network localhost scripts/11_exactInputSingle.js
*/


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });                  
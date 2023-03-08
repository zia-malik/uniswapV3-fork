const Web3Eth  = require("web3-eth");
const eth = new Web3Eth('http://localhost:8545');

const V3_NonfungiblePositionManager = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");
// console.log(eth);
// eth.getAccounts(console.log);

const increaseLiqudityInputs = [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint128",
      "name": "liquidity",
      "type": "uint128"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount0",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount1",
      "type": "uint256"
    }
  ];
  const increaseLiqudity = {
    "anonymous": false,
    "inputs": increaseLiqudityInputs,
    "name": "IncreaseLiquidity",
    "type": "event"
  };



  const transferInput = [
    {
      "indexed": true,
      "internalType": "address",
      "name": "from",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "to",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }
  ];

  const transfer = {
    "anonymous": false,
    "inputs": transferInput,
    "name": "Transfer",
    "type": "event"
  };


// const eventAbi = [apprival, approvalAll, collect, decreaseLiquidity, increaseLiqudity, transfer]
const eventAbi = [transfer]
eventAbi.map( (log) => {
    const eventHash = eth.abi.encodeEventSignature(log);
    console.log("eventHash: ", eventHash);
});





// const eventHashDecode = eth.abi.decodeLog(transferInput,
//     '0x',
//     [
//         '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//         '0x0000000000000000000000000000000000000000000000000000000000000000',
//         '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
//         '0x000000000000000000000000000000000000000000000000000000000000ca15'
//       ]);



// console.log("\n\neventHashDecode: ", eventHashDecode);


eth.getTransactionReceipt('0xa8eebacf659a1e9b857978eadf84e3271eb86b75f107a18f6a7db9d5ee44e6bc').then((recp)=> {
    recp.logs.map(log => console.log(log.address))
})
// eth.getTransactionReceipt('0xa8eebacf659a1e9b857978eadf84e3271eb86b75f107a18f6a7db9d5ee44e6bc')
// .then((rcpt)=>{
//     console.log("Token Info: ", rcpt.logs.filter( log => log.address === '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'));
// });

// async function getEvent(tx, contractAddress, contractABI, eventName){
//     eth.getTransactionReceipt('0x9d7214344d2c5fb5590de0c0d7b4f8dd6678f6da7fcc90839a57cb13e27be7f0')
//     .then((rcpt)=>{
//         rcpt.logs.filter( log => log.address === V3_NonfungiblePositionManager).map((log) => {
//             const eventAbi = artifacts.V3_NonfungiblePositionManager.abi.find(event => event?.name === 'IncreaseLiquidity');
//             if (log.topics[0] === eth.abi.encodeEventSignature(eventAbi)){
//                 const tInfo = eth.abi.decodeLog(eventAbi.inputs, log.data, log.topics);
//                 console.log("Token Info: ", {tokenId: tInfo.tokenId, liquidity: tInfo.liquidity, amount0: tInfo.amount0, amount1: tInfo.amount1});
//             }
//         });
//     });
// }



// async function getEvent(tx, contractAddress, contractABI, eventName){
//     eth.getTransactionReceipt(tx)
//     .then((rcpt)=>{
//         rcpt.logs.filter( log => log.address === contractAddress).map((log) => {
//             const eventAbi = contractABI.find(event => event?.name === eventName);
//             if (log.topics[0] === eth.abi.encodeEventSignature(eventAbi)){
//                 const tInfo = eth.abi.decodeLog(eventAbi.inputs, log.data, log.topics);
//                 console.log("Token Info: ", {tokenId: tInfo.tokenId, liquidity: tInfo.liquidity, amount0: tInfo.amount0, amount1: tInfo.amount1});
//             }
//         });
//     });
// }

// (async ()=>{
//     await getEvent('0x9d7214344d2c5fb5590de0c0d7b4f8dd6678f6da7fcc90839a57cb13e27be7f0',
//     '0xC36442b4a4522E871399CD717aBDD847Ab11FE88', V3_NonfungiblePositionManager.abi, 'IncreaseLiquidity');
// })();

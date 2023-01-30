require("@nomiclabs/hardhat-waffle");




const LOW_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 2_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const LOWEST_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}




module.exports = {
  // solidity: {
  //   // compilers: [
  //   //   {
  //   //     version: "=0.7.6",
  //   //   },
  //   //   {
  //   //     version: "0.8.17",
  //   //   },
  //   //   {
  //   //     version: "^0.8.0",
  //   //   },
  //   //   {
  //   //     version: "^0.7.0",
  //   //   },
  //   //   {
  //   //     version: "^0.8.17",
  //   //   },
  //   // ],
  //   // version: "0.8.17",
  //   settings: {
  //     optimizer: {
  //       enabled: true,
  //       runs: 5000,
  //       details: { yul: false },
  //     },
  //   }
  // },

  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
    overrides: {
      'contracts/NonfungiblePositionManager.sol': LOW_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/test/MockTimeNonfungiblePositionManager.sol': LOW_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/test/NFTDescriptorTest.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/NonfungibleTokenPositionDescriptor.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/libraries/NFTDescriptor.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
    },
  },
};

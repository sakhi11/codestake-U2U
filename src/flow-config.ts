import { config } from "@onflow/config";

// Flow blockchain configuration
export const flowConfig = {
  // Testnet configuration
  testnet: {
    accessNode: "https://rest-testnet.onflow.org",
    discoveryWallet: "https://fcl-discovery.onflow.org/testnet/authn",
    contractAddress: "0x151494e9e083c718" // Updated with your deployed contract address
  },
  
  // Mainnet configuration
  mainnet: {
    accessNode: "https://rest-mainnet.onflow.org",
    discoveryWallet: "https://fcl-discovery.onflow.org/mainnet/authn",
    contractAddress: "" // Update this after mainnet deployment
  }
};

// Initialize Flow client
export function initializeFlow(network: 'testnet' | 'mainnet' = 'testnet') {
  const configData = flowConfig[network];
  
  config({
    "accessNode.api": configData.accessNode,
    "discovery.wallet": configData.discoveryWallet,
    "0xCodeStake": configData.contractAddress,
    "app.detail.title": "CodeStake",
    "app.detail.icon": "https://placekitten.com/g/200/200"
  });
}

// Contract interaction functions
export const contractFunctions = {
  // Create a new challenge
  createChallenge: `
    import CodeStake from 0xCodeStake
    
    transaction(
      name: String,
      track: String,
      duration: UFix64,
      participants: [Address],
      milestoneNames: [String],
      milestoneRewards: [UFix64],
      stakeAmount: UFix64
    ) {
      execute {
        CodeStake.createChallenge(
          name: name,
          track: track,
          duration: duration,
          participants: participants,
          milestoneNames: milestoneNames,
          milestoneRewards: milestoneRewards,
          stakeAmount: stakeAmount
        )
      }
    }
  `,
  
  // Join a challenge
  joinChallenge: `
    import CodeStake from 0xCodeStake
    
    transaction(challengeId: Int, stakeAmount: UFix64) {
      execute {
        CodeStake.joinChallenge(challengeId: challengeId, stakeAmount: stakeAmount)
      }
    }
  `,
  
  // Complete a milestone
  completeMilestone: `
    import CodeStake from 0xCodeStake
    
    transaction(challengeId: Int, milestoneIndex: Int) {
      execute {
        CodeStake.completeMilestone(challengeId: challengeId, milestoneIndex: milestoneIndex)
      }
    }
  `,
  
  // Deposit FLOW tokens
  deposit: `
    import CodeStake from 0xCodeStake
    import FlowToken from 0x7e60df042a9c0868
    import FungibleToken from 0x9a0766d93b6608b7
    
    transaction(amount: UFix64) {
      let flowVault: &FlowToken.Vault
      
      prepare(acct: AuthAccount) {
        self.flowVault = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
          ?? panic("Could not borrow Flow token vault")
      }
      
      execute {
        CodeStake.deposit(amount: amount)
      }
    }
  `,
  
  // Withdraw FLOW tokens
  withdraw: `
    import CodeStake from 0xCodeStake
    
    transaction(amount: UFix64) {
      execute {
        CodeStake.withdraw(amount: amount)
      }
    }
  `
};

// Script functions for reading data
export const scriptFunctions = {
  // Get challenge details
  getChallenge: `
    import CodeStake from 0xCodeStake
    
    access(all) fun main(challengeId: Int): CodeStake.Challenge? {
      return CodeStake.getChallenge(challengeId: challengeId)
    }
  `,
  
  // Get wallet summary
  getWalletSummary: `
    import CodeStake from 0xCodeStake
    
    access(all) fun main(address: Address): CodeStake.WalletSummary? {
      return CodeStake.getWalletSummary(address: address)
    }
  `,
  
  // Get user transactions
  getUserTransactions: `
    import CodeStake from 0xCodeStake
    
    access(all) fun main(address: Address): [CodeStake.Transaction]? {
      return CodeStake.getUserTransactions(address: address)
    }
  `,
  
  // Get all challenges
  getAllChallenges: `
    import CodeStake from 0xCodeStake
    
    access(all) fun main(): [CodeStake.Challenge] {
      var challenges: [CodeStake.Challenge] = []
      var i = 0
      while i < CodeStake.challengeCounter {
        if let challenge = CodeStake.getChallenge(challengeId: i) {
          challenges.append(challenge)
        }
        i = i + 1
      }
      return challenges
    }
  `,
  
  // Check if user has joined a challenge
  hasUserJoined: `
    import CodeStake from 0xCodeStake
    
    access(all) fun main(challengeId: Int, address: Address): Bool {
      return CodeStake.hasUserJoined(challengeId: challengeId, address: address)
    }
  `
};

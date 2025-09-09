import * as fcl from "@onflow/fcl";
import { contractFunctions, scriptFunctions } from "../flow-config";

export class FlowService {
  
  // Create a new challenge
  static async createChallenge(
    name: string,
    track: string,
    duration: number,
    participants: string[],
    milestoneNames: string[],
    milestoneRewards: number[],
    stakeAmount: number
  ) {
    try {
      const result = await fcl.send([
        {
          cadence: contractFunctions.createChallenge,
          args: [
            { value: name, type: "String" },
            { value: track, type: "String" },
            { value: duration.toString(), type: "UFix64" },
            { value: participants, type: "[Address]" },
            { value: milestoneNames, type: "[String]" },
            { value: milestoneRewards.map(r => r.toString()), type: "[UFix64]" },
            { value: stakeAmount.toString(), type: "UFix64" }
          ]
        }
      ]);
      
      return {
        success: true,
        transactionId: result.transactionId,
        data: result
      };
    } catch (error) {
      console.error("Error creating challenge:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Join a challenge
  static async joinChallenge(challengeId: number, stakeAmount: number) {
    try {
      const result = await fcl.send([
        {
          cadence: contractFunctions.joinChallenge,
          args: [
            { value: challengeId, type: "Int" },
            { value: stakeAmount.toString(), type: "UFix64" }
          ]
        }
      ]);
      
      return {
        success: true,
        transactionId: result.transactionId,
        data: result
      };
    } catch (error) {
      console.error("Error joining challenge:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Complete a milestone
  static async completeMilestone(challengeId: number, milestoneIndex: number) {
    try {
      const result = await fcl.send([
        {
          cadence: contractFunctions.completeMilestone,
          args: [
            { value: challengeId, type: "Int" },
            { value: milestoneIndex, type: "Int" }
          ]
        }
      ]);
      
      return {
        success: true,
        transactionId: result.transactionId,
        data: result
      };
    } catch (error) {
      console.error("Error completing milestone:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Deposit FLOW tokens
  static async deposit(amount: number) {
    try {
      const result = await fcl.send([
        {
          cadence: contractFunctions.deposit,
          args: [
            { value: amount.toString(), type: "UFix64" }
          ]
        }
      ]);
      
      return {
        success: true,
        transactionId: result.transactionId,
        data: result
      };
    } catch (error) {
      console.error("Error depositing:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Withdraw FLOW tokens
  static async withdraw(amount: number) {
    try {
      const result = await fcl.send([
        {
          cadence: contractFunctions.withdraw,
          args: [
            { value: amount.toString(), type: "UFix64" }
          ]
        }
      ]);
      
      return {
        success: true,
        transactionId: result.transactionId,
        data: result
      };
    } catch (error) {
      console.error("Error withdrawing:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get challenge details
  static async getChallenge(challengeId: number) {
    try {
      const result = await fcl.query({
        cadence: scriptFunctions.getChallenge,
        args: [
          { value: challengeId, type: "Int" }
        ]
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("Error getting challenge:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get all challenges
  static async getAllChallenges() {
    try {
      const result = await fcl.query({
        cadence: scriptFunctions.getAllChallenges,
        args: []
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("Error getting all challenges:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get wallet summary
  static async getWalletSummary(address: string) {
    try {
      const result = await fcl.query({
        cadence: scriptFunctions.getWalletSummary,
        args: [
          { value: address, type: "Address" }
        ]
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("Error getting wallet summary:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get user transactions
  static async getUserTransactions(address: string) {
    try {
      const result = await fcl.query({
        cadence: scriptFunctions.getUserTransactions,
        args: [
          { value: address, type: "Address" }
        ]
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("Error getting user transactions:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Check if user has joined a challenge
  static async hasUserJoined(challengeId: number, address: string) {
    try {
      const result = await fcl.query({
        cadence: scriptFunctions.hasUserJoined,
        args: [
          { value: challengeId, type: "Int" },
          { value: address, type: "Address" }
        ]
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("Error checking if user joined:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get current user account
  static async getCurrentUser() {
    try {
      const user = await fcl.getAccount();
      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get current block information
  static async getCurrentBlock() {
    try {
      const block = await fcl.getBlock();
      return {
        success: true,
        data: block
      };
    } catch (error) {
      console.error("Error getting current block:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as fcl from "@onflow/fcl";
import { toast } from "sonner";
import { initializeFlow, flowConfig } from "../flow-config";

interface FlowContextProps {
  user: any;
  isConnected: boolean;
  address: string;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  networkDetails: {
    name: string;
    isCorrectNetwork: boolean;
  };
}

const FlowContext = createContext<FlowContextProps | undefined>(undefined);

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow must be used within a FlowProvider");
  }
  return context;
};

export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [networkDetails, setNetworkDetails] = useState({
    name: "Flow Testnet",
    isCorrectNetwork: true
  });

  // Initialize Flow client
  useEffect(() => {
    initializeFlow('testnet');
    
    // Subscribe to user changes
    const unsubscribe = fcl.currentUser.subscribe((user) => {
      setUser(user);
      setIsConnected(user.loggedIn);
      setAddress(user.addr || "");
    });

    return () => unsubscribe();
  }, []);

  // Update balance when user changes
  useEffect(() => {
    if (user?.loggedIn && user?.addr) {
      updateBalance(user.addr);
    }
  }, [user]);

  const updateBalance = async (userAddress: string) => {
    try {
      console.log("Fetching balance for address:", userAddress);
      // Get FLOW token balance using modern Cadence syntax
      const result = await fcl.query({
        cadence: `
          import FlowToken from 0x7e60df042a9c0868
          import FungibleToken from 0x9a0766d93b6608b7
          
          access(all) fun main(address: Address): UFix64 {
            let account = getAccount(address)
            let vaultRef = account.capabilities.get<&{FungibleToken.Balance}>(/public/flowTokenBalance)
              .borrow()
              ?? panic("Could not borrow Balance reference to the Vault")
            return vaultRef.balance
          }
        `,
        args: (arg: any, t: any) => [arg(userAddress, t.Address)]
      });
      
      console.log("Balance result:", result);
      setBalance(result.toString());
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("0");
    }
  };

  const connectWallet = useCallback(async () => {
    try {
      await fcl.authenticate();
      toast.success("Successfully connected to Flow wallet!");
    } catch (error: any) {
      console.error("Flow wallet connection error:", error);
      toast.error("Failed to connect Flow wallet: " + (error.message || "Unknown error"));
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      await fcl.unauthenticate();
      setUser(null);
      setIsConnected(false);
      setAddress("");
      setBalance("0");
      toast.success("Disconnected from Flow wallet");
    } catch (error: any) {
      console.error("Flow wallet disconnection error:", error);
      toast.error("Failed to disconnect Flow wallet: " + (error.message || "Unknown error"));
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (user?.loggedIn && user?.addr) {
      await updateBalance(user.addr);
    }
  }, [user]);

  const providerValue = {
    user,
    isConnected,
    address,
    balance,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    networkDetails
  };

  return (
    <FlowContext.Provider value={providerValue}>
      {children}
    </FlowContext.Provider>
  );
};

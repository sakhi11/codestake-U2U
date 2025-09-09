import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"; 
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFlow } from "@/context/FlowProvider";
import { FlowService } from "@/services/flowService";
import { Loader2, Wallet, ArrowUp, ArrowDown, Coins, TrendingUp } from "lucide-react";

interface WalletSummary {
  balance: number;
  totalEarned: number;
  totalStaked: number;
}

interface Transaction {
  id: string;
  txType: string;
  amount: number;
  timestamp: number;
  description: string;
  challenge: string;
}

const WalletManager: React.FC = () => {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { address, isConnected, balance } = useFlow();

  useEffect(() => {
    if (address) {
      loadWalletData();
    }
  }, [address]);

  const loadWalletData = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      // Load wallet summary
      const summaryResult = await FlowService.getWalletSummary(address);
      if (summaryResult.success) {
        setWalletSummary(summaryResult.data);
      }
      
      // Load transactions
      const txResult = await FlowService.getUserTransactions(address);
      if (txResult.success) {
        setTransactions(txResult.data || []);
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your Flow wallet first");
      return;
    }
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const balanceNum = parseFloat(balance);
    if (amount > balanceNum) {
      toast.error(`Insufficient balance. You have ${balance} FLOW`);
      return;
    }

    setIsDepositing(true);
    try {
      const result = await FlowService.deposit(amount);
      if (result.success) {
        toast.success(`Successfully deposited ${amount} FLOW!`);
        setDepositAmount("");
        await loadWalletData();
      } else {
        toast.error(result.error || "Failed to deposit");
      }
    } catch (error: any) {
      console.error("Error depositing:", error);
      toast.error(error.message || "Failed to deposit");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your Flow wallet first");
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!walletSummary || amount > walletSummary.balance) {
      toast.error("Insufficient balance in contract wallet");
      return;
    }

    setIsWithdrawing(true);
    try {
      const result = await FlowService.withdraw(amount);
      if (result.success) {
        toast.success(`Successfully withdrew ${amount} FLOW!`);
        setWithdrawAmount("");
        await loadWalletData();
      } else {
        toast.error(result.error || "Failed to withdraw");
      }
    } catch (error: any) {
      console.error("Error withdrawing:", error);
      toast.error(error.message || "Failed to withdraw");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTransactionIcon = (txType: string) => {
    switch (txType) {
      case "deposited":
        return <ArrowDown className="h-4 w-4 text-green-400" />;
      case "withdrawn":
        return <ArrowUp className="h-4 w-4 text-red-400" />;
      case "staked":
        return <Coins className="h-4 w-4 text-blue-400" />;
      case "earned":
        return <TrendingUp className="h-4 w-4 text-yellow-400" />;
      default:
        return <Wallet className="h-4 w-4 text-white/60" />;
    }
  };

  const getTransactionColor = (txType: string) => {
    switch (txType) {
      case "deposited":
      case "earned":
        return "text-green-400";
      case "withdrawn":
      case "staked":
        return "text-red-400";
      default:
        return "text-white/60";
    }
  };

  if (!isConnected) {
    return (
      <Card className="glassmorphism border border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="h-12 w-12 text-white/40 mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-white/60 text-center">
            Connect your Flow wallet to manage your funds and view transactions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <Card className="glassmorphism border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Summary
          </CardTitle>
          <CardDescription className="text-white/60">
            Manage your FLOW tokens and track your earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {walletSummary?.balance.toFixed(3) || "0.000"} FLOW
                </div>
                <div className="text-white/60 text-sm">Contract Balance</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {walletSummary?.totalEarned.toFixed(3) || "0.000"} FLOW
                </div>
                <div className="text-white/60 text-sm">Total Earned</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">
                  {walletSummary?.totalStaked.toFixed(3) || "0.000"} FLOW
                </div>
                <div className="text-white/60 text-sm">Total Staked</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposit/Withdraw Tabs */}
      <Card className="glassmorphism border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Manage Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit" className="text-white">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw" className="text-white">Withdraw</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposit" className="space-y-4">
              <form onSubmit={handleDeposit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="depositAmount" className="text-white">
                      Amount to Deposit (FLOW)
                    </Label>
                    <Input
                      type="number"
                      id="depositAmount"
                      placeholder="0.0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      step="0.001"
                      min="0"
                      required
                    />
                    <p className="text-white/60 text-sm mt-1">
                      Wallet Balance: {balance} FLOW
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isDepositing}
                  >
                    {isDepositing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Depositing...
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Deposit FLOW
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="withdraw" className="space-y-4">
              <form onSubmit={handleWithdraw}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdrawAmount" className="text-white">
                      Amount to Withdraw (FLOW)
                    </Label>
                    <Input
                      type="number"
                      id="withdrawAmount"
                      placeholder="0.0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      step="0.001"
                      min="0"
                      required
                    />
                    <p className="text-white/60 text-sm mt-1">
                      Contract Balance: {walletSummary?.balance.toFixed(3) || "0.000"} FLOW
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isWithdrawing}
                  >
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Withdrawing...
                      </>
                    ) : (
                      <>
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Withdraw FLOW
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="glassmorphism border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.txType)}
                    <div>
                      <div className="text-white font-medium">{tx.description}</div>
                      {tx.challenge && (
                        <div className="text-white/60 text-sm">{tx.challenge}</div>
                      )}
                      <div className="text-white/40 text-xs">
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${getTransactionColor(tx.txType)}`}>
                    {tx.txType === "withdrawn" || tx.txType === "staked" ? "-" : "+"}
                    {tx.amount.toFixed(3)} FLOW
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletManager;

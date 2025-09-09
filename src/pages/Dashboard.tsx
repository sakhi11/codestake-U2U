
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFlow } from "@/context/FlowProvider";
import { Wallet, Trophy, Users, TrendingUp } from "lucide-react";
import CreateChallengeFlow from "@/components/dashboard/CreateChallengeFlow";
import ChallengesList from "@/components/dashboard/ChallengesList";
import WalletManager from "@/components/dashboard/WalletManager";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("challenges");
  const { address, isConnected, balance, connectWallet, disconnectWallet } = useFlow();

  const handleChallengeCreated = () => {
    setActiveTab("challenges");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">CodeStake Dashboard</h1>
              <p className="text-white/60">
                Create challenges, stake FLOW tokens, and earn rewards
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {isConnected ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                    <div className="text-white/60 text-sm">
                      {balance} FLOW
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={disconnectWallet}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  variant="gradient"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  Connect Flow Wallet
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glassmorphism border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Wallet className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{balance}</div>
                    <div className="text-white/60 text-sm">FLOW Balance</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-white/60 text-sm">Active Challenges</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-white/60 text-sm">Total Participants</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">0.000</div>
                    <div className="text-white/60 text-sm">Total Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="challenges" className="text-white">Challenges</TabsTrigger>
            <TabsTrigger value="create" className="text-white">Create Challenge</TabsTrigger>
            <TabsTrigger value="wallet" className="text-white">Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-6">
            <ChallengesList />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            {isConnected ? (
              <CreateChallengeFlow onChallengeCreated={handleChallengeCreated} />
            ) : (
              <Card className="glassmorphism border border-white/10">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="h-12 w-12 text-white/40 mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-white/60 text-center mb-6">
                    Connect your Flow wallet to create challenges and start earning FLOW tokens.
                  </p>
                  <Button
                    onClick={connectWallet}
                    variant="gradient"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  >
                    Connect Flow Wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <WalletManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

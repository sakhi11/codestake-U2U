
import React, { useState, useEffect } from "react";
import { useFlow } from "@/context/FlowProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Users, Calendar, Coins } from "lucide-react";

interface Challenge {
  id: number;
  name: string;
  description: string;
  stakeAmount: number;
  participantCount: number;
  endDate: string;
  progress: number;
  status: 'active' | 'completed' | 'expired';
}

const OngoingChallenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useFlow();

  useEffect(() => {
    // Simulate loading challenges
    setTimeout(() => {
      setChallenges([
        {
          id: 1,
          name: "Web3 Development Challenge",
          description: "Build a complete DApp with smart contracts and frontend",
          stakeAmount: 0.5,
          participantCount: 8,
          endDate: "2024-02-15",
          progress: 65,
          status: 'active'
        },
        {
          id: 2,
          name: "React Advanced Patterns",
          description: "Master advanced React patterns and state management",
          stakeAmount: 0.3,
          participantCount: 12,
          endDate: "2024-02-20",
          progress: 40,
          status: 'active'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const joinChallenge = (challengeId: number) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    console.log(`Joining challenge ${challengeId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Ongoing Challenges</h2>
        <Badge variant="secondary" className="text-white bg-white/10">
          {challenges.length} active
        </Badge>
      </div>
      
      <div className="grid gap-6">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="glassmorphism border border-white/10">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white">{challenge.name}</CardTitle>
                  <CardDescription className="text-white/60">
                    {challenge.description}
                  </CardDescription>
                </div>
                <Badge 
                  variant={challenge.status === 'active' ? 'default' : 'secondary'}
                  className={challenge.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                >
                  {challenge.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <Users className="h-4 w-4" />
                  <span>{challenge.participantCount} participants</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Calendar className="h-4 w-4" />
                  <span>Ends: {challenge.endDate}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Coins className="h-4 w-4" />
                  <span>{challenge.stakeAmount} FLOW stake</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/60">Progress</span>
                  <span className="text-white">{challenge.progress}%</span>
                </div>
                <Progress value={challenge.progress} className="h-2" />
              </div>
              
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => joinChallenge(challenge.id)}
                  disabled={!isConnected}
                  className="w-full md:w-auto"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Join Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OngoingChallenges;

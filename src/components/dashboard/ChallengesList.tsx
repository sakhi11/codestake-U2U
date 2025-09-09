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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFlow } from "@/context/FlowProvider";
import { FlowService } from "@/services/flowService";
import { Loader2, Trophy, Users, Calendar, Coins, CheckCircle, Play } from "lucide-react";

interface Challenge {
  id: number;
  name: string;
  track: string;
  creator: string;
  startDate: number;
  endDate: number;
  stakedAmount: number;
  totalStake: number;
  participants: string[];
  isActive: boolean;
  milestones: Milestone[];
}

interface Milestone {
  id: number;
  name: string;
  unlockDate: number;
  reward: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  firstCompletedBy?: {
    user: string;
    timestamp: number;
  };
}

const ChallengesList: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningChallenge, setJoiningChallenge] = useState<number | null>(null);
  const [completingMilestone, setCompletingMilestone] = useState<{challengeId: number, milestoneIndex: number} | null>(null);
  const [userJoinedChallenges, setUserJoinedChallenges] = useState<Set<number>>(new Set());
  
  const { address, isConnected } = useFlow();

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    if (address && challenges.length > 0) {
      checkUserJoinedChallenges();
    }
  }, [address, challenges]);

  const loadChallenges = async () => {
    try {
      const result = await FlowService.getAllChallenges();
      if (result.success) {
        setChallenges(result.data || []);
      } else {
        console.error("Failed to load challenges:", result.error);
      }
    } catch (error) {
      console.error("Error loading challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserJoinedChallenges = async () => {
    if (!address) return;
    
    const joined = new Set<number>();
    for (const challenge of challenges) {
      try {
        const result = await FlowService.hasUserJoined(challenge.id, address);
        if (result.success && result.data) {
          joined.add(challenge.id);
        }
      } catch (error) {
        console.error(`Error checking if user joined challenge ${challenge.id}:`, error);
      }
    }
    setUserJoinedChallenges(joined);
  };

  const joinChallenge = async (challengeId: number, stakeAmount: number) => {
    if (!isConnected) {
      toast.error("Please connect your Flow wallet first");
      return;
    }

    setJoiningChallenge(challengeId);
    try {
      const result = await FlowService.joinChallenge(challengeId, stakeAmount);
      if (result.success) {
        toast.success("Successfully joined the challenge!");
        await loadChallenges();
        await checkUserJoinedChallenges();
      } else {
        toast.error(result.error || "Failed to join challenge");
      }
    } catch (error: any) {
      console.error("Error joining challenge:", error);
      toast.error(error.message || "Failed to join challenge");
    } finally {
      setJoiningChallenge(null);
    }
  };

  const completeMilestone = async (challengeId: number, milestoneIndex: number) => {
    if (!isConnected) {
      toast.error("Please connect your Flow wallet first");
      return;
    }

    setCompletingMilestone({ challengeId, milestoneIndex });
    try {
      const result = await FlowService.completeMilestone(challengeId, milestoneIndex);
      if (result.success) {
        toast.success("Milestone completed successfully!");
        await loadChallenges();
      } else {
        toast.error(result.error || "Failed to complete milestone");
      }
    } catch (error: any) {
      console.error("Error completing milestone:", error);
      toast.error(error.message || "Failed to complete milestone");
    } finally {
      setCompletingMilestone(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getProgressPercentage = (challenge: Challenge) => {
    const completedMilestones = challenge.milestones.filter(m => m.isCompleted).length;
    return (completedMilestones / challenge.milestones.length) * 100;
  };

  const isUserParticipant = (challenge: Challenge) => {
    return challenge.participants.includes(address || "");
  };

  const canJoinChallenge = (challenge: Challenge) => {
    return isUserParticipant(challenge) && 
           !userJoinedChallenges.has(challenge.id) && 
           challenge.isActive;
  };

  const canCompleteMilestone = (milestone: Milestone) => {
    return milestone.isUnlocked && 
           !milestone.isCompleted && 
           userJoinedChallenges.has(milestone.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="glassmorphism border border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-12 w-12 text-white/40 mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">No Challenges Yet</h3>
          <p className="text-white/60 text-center">
            Be the first to create a challenge and start earning FLOW tokens!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Active Challenges</h2>
        <Badge variant="secondary" className="text-white bg-white/10">
          {challenges.length} challenges
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
                    Track: {challenge.track}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={challenge.isActive ? "default" : "secondary"}
                    className={challenge.isActive ? "bg-green-500" : "bg-gray-500"}
                  >
                    {challenge.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {userJoinedChallenges.has(challenge.id) && (
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      Joined
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <Users className="h-4 w-4" />
                  <span>{challenge.participants.length} participants</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Calendar className="h-4 w-4" />
                  <span>Ends: {formatDate(challenge.endDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Coins className="h-4 w-4" />
                  <span>{challenge.totalStake} FLOW staked</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/60">Progress</span>
                  <span className="text-white">
                    {challenge.milestones.filter(m => m.isCompleted).length}/{challenge.milestones.length} milestones
                  </span>
                </div>
                <Progress value={getProgressPercentage(challenge)} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <h4 className="text-white font-semibold">Milestones</h4>
                <div className="grid gap-2">
                  {challenge.milestones.map((milestone, index) => (
                    <div 
                      key={milestone.id} 
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {milestone.isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : milestone.isUnlocked ? (
                            <Play className="h-4 w-4 text-blue-400" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-white/20" />
                          )}
                          <span className="text-white">{milestone.name}</span>
                        </div>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                          {milestone.reward} FLOW
                        </Badge>
                      </div>
                      
                      {canCompleteMilestone(milestone) && (
                        <Button
                          size="sm"
                          onClick={() => completeMilestone(challenge.id, index)}
                          disabled={completingMilestone?.challengeId === challenge.id && 
                                   completingMilestone?.milestoneIndex === index}
                        >
                          {completingMilestone?.challengeId === challenge.id && 
                           completingMilestone?.milestoneIndex === index ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Complete"
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {canJoinChallenge(challenge) && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => joinChallenge(challenge.id, challenge.stakedAmount)}
                    disabled={joiningChallenge === challenge.id}
                    className="w-full md:w-auto"
                  >
                    {joiningChallenge === challenge.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join Challenge ({challenge.stakedAmount} FLOW)
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              <div className="text-xs text-white/40 pt-2 border-t border-white/10">
                Created by {formatAddress(challenge.creator)} on {formatDate(challenge.startDate)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChallengesList;

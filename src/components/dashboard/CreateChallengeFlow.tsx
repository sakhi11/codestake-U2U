import React, { useState } from "react";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"; 
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import { useFlow } from "@/context/FlowProvider";
import { FlowService } from "@/services/flowService";
import { Loader2, AlertCircle, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Milestone {
  name: string;
  reward: number;
}

interface CreateChallengeFlowProps {
  onChallengeCreated: () => void;
}

const CreateChallengeFlow: React.FC<CreateChallengeFlowProps> = ({ onChallengeCreated }) => {
  const [name, setName] = useState("");
  const [track, setTrack] = useState("");
  const [duration, setDuration] = useState(7); // days
  const [stakeAmount, setStakeAmount] = useState("");
  const [participants, setParticipants] = useState<string[]>([""]);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { name: "", reward: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const { address, isConnected, balance, refreshBalance } = useFlow();

  const validateInputs = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = "Challenge name cannot be empty";
    }
    
    if (!track.trim()) {
      errors.track = "Track cannot be empty";
    }
    
    if (duration <= 0) {
      errors.duration = "Duration must be greater than 0";
    }
    
    const stakeNum = parseFloat(stakeAmount);
    const balanceNum = parseFloat(balance);
    
    if (isNaN(stakeNum) || stakeNum <= 0) {
      errors.stakeAmount = "Stake amount must be greater than 0";
    } else if (stakeNum > balanceNum) {
      errors.stakeAmount = `Insufficient funds (balance: ${balance} FLOW)`;
    }
    
    // Validate participants
    const validParticipants = participants.filter(p => p.trim() !== "");
    if (validParticipants.length === 0) {
      errors.participants = "At least one participant is required";
    }
    
    // Validate milestones
    const validMilestones = milestones.filter(m => m.name.trim() !== "" && m.reward > 0);
    if (validMilestones.length === 0) {
      errors.milestones = "At least one milestone is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addParticipant = () => {
    setParticipants([...participants, ""]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { name: "", reward: 0 }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (index: number, field: 'name' | 'reward', value: string | number) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestones(newMilestones);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your Flow wallet first");
      return;
    }
    
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    try {
      const validParticipants = participants.filter(p => p.trim() !== "");
      const validMilestones = milestones.filter(m => m.name.trim() !== "" && m.reward > 0);
      
      const result = await FlowService.createChallenge(
        name,
        track,
        duration * 24 * 60 * 60, // Convert days to seconds
        validParticipants,
        validMilestones.map(m => m.name),
        validMilestones.map(m => m.reward),
        parseFloat(stakeAmount)
      );
      
      if (result.success) {
        toast.success("Challenge created successfully!");
        onChallengeCreated();
        
        // Reset form
        setName("");
        setTrack("");
        setDuration(7);
        setStakeAmount("");
        setParticipants([""]);
        setMilestones([{ name: "", reward: 0 }]);
      } else {
        toast.error(result.error || "Failed to create challenge");
      }
    } catch (error: any) {
      console.error("Error creating challenge:", error);
      toast.error(error.message || "Failed to create challenge");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "bg-white/5 border-white/10 text-white";
  const errorClass = "border-red-500";

  return (
    <Card className="glassmorphism border border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Create Challenge</CardTitle>
        <CardDescription className="text-white/60">
          Create a new coding challenge and stake FLOW tokens!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-white">
                Challenge Name
              </Label>
              <Input
                type="text"
                id="name"
                placeholder="e.g. Web3 Development Challenge"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputClass} ${validationErrors.name ? errorClass : ""}`}
                disabled={isLoading}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.name}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="track" className="text-white">
                Track
              </Label>
              <Input
                type="text"
                id="track"
                placeholder="e.g. Frontend, Backend, Full Stack"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className={`${inputClass} ${validationErrors.track ? errorClass : ""}`}
                disabled={isLoading}
              />
              {validationErrors.track && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.track}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="text-white">
                Duration (days)
              </Label>
              <Input
                type="number"
                id="duration"
                placeholder="7"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className={`${inputClass} ${validationErrors.duration ? errorClass : ""}`}
                disabled={isLoading}
                min="1"
              />
              {validationErrors.duration && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.duration}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="stakeAmount" className="text-white">
                Stake Amount (FLOW)
              </Label>
              <Input
                type="number"
                id="stakeAmount"
                placeholder="0.0"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className={`${inputClass} ${validationErrors.stakeAmount ? errorClass : ""}`}
                disabled={isLoading}
                step="0.001"
                min="0"
              />
              {validationErrors.stakeAmount && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.stakeAmount}
                </p>
              )}
              {address && (
                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-sm mt-1">
                    Wallet Balance: {balance} FLOW
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={refreshBalance}
                    className="text-xs border-white/20 text-white hover:bg-white/10"
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Participants Section */}
          <div>
            <Label className="text-white">Participants</Label>
            <div className="space-y-2">
              {participants.map((participant, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={participant}
                    onChange={(e) => updateParticipant(index, e.target.value)}
                    className={inputClass}
                    disabled={isLoading}
                  />
                  {participants.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeParticipant(index)}
                      disabled={isLoading}
                      className="text-red-400 border-red-400 hover:bg-red-400/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addParticipant}
                disabled={isLoading}
                className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Participant
              </Button>
            </div>
            {validationErrors.participants && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.participants}
              </p>
            )}
          </div>
          
          {/* Milestones Section */}
          <div>
            <Label className="text-white">Milestones</Label>
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    type="text"
                    placeholder="Milestone name"
                    value={milestone.name}
                    onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                    className={inputClass}
                    disabled={isLoading}
                  />
                  <Input
                    type="number"
                    placeholder="Reward (FLOW)"
                    value={milestone.reward}
                    onChange={(e) => updateMilestone(index, 'reward', parseFloat(e.target.value) || 0)}
                    className={inputClass}
                    disabled={isLoading}
                    step="0.001"
                    min="0"
                  />
                  {milestones.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMilestone(index)}
                      disabled={isLoading}
                      className="text-red-400 border-red-400 hover:bg-red-400/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
                disabled={isLoading}
                className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            </div>
            {validationErrors.milestones && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.milestones}
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full"
            variant="gradient"
            disabled={isLoading || !isConnected}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Challenge"
            )}
          </Button>
          
          {!isConnected && (
            <p className="text-amber-400 text-sm text-center mt-2">
              Please connect your Flow wallet to create a challenge
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateChallengeFlow;

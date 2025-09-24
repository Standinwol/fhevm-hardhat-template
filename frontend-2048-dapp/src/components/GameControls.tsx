import { FC } from "react";
import { MILESTONES } from "../config";

interface GameState {
  board: number[][];
  score: number;
  maxTile: number;
  gameOver: boolean;
  won: boolean;
  milestones: Record<number, boolean>;
}

interface GameControlsProps {
  account: string;
  gameState: GameState;
  claimedMilestones: Record<number, boolean>;
  loading: boolean;
  onBuyPlay: () => void;
  onClaimReward: (milestone: number) => void;
}

const GameControls = ({
  account,
  gameState,
  claimedMilestones,
  loading,
  onBuyPlay,
  onClaimReward,
}: GameControlsProps) => {
  const getMilestoneStatus = (milestone: number) => {
    if (!gameState.milestones[milestone]) {
      return { status: "locked", text: "Not Reached", color: "gray" };
    }
    if (claimedMilestones[milestone]) {
      return { status: "claimed", text: "Claimed", color: "green" };
    }
    return { status: "available", text: "Claim Now!", color: "blue" };
  };

  const getButtonClass = (status: string, disabled = false) => {
    if (disabled || loading) {
      return "bg-gray-600 cursor-not-allowed opacity-50";
    }

    switch (status) {
      case "available":
        return "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700";
      case "claimed":
        return "bg-gradient-to-r from-green-600 to-emerald-600 cursor-not-allowed";
      case "locked":
      default:
        return "bg-gray-600 cursor-not-allowed opacity-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Buy Play Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-bold mb-4 text-white">Buy Play Attempt</h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">0.01 ETH</div>
          <button
            onClick={onBuyPlay}
            disabled={!account || loading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all transform hover:scale-105 ${getButtonClass("available", !account || loading)}`}
          >
            {loading ? "Processing..." : "Buy Play (0.01 ETH)"}
          </button>
          <p className="text-sm text-white/60 mt-2">Each play attempt lets you start a new game</p>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-bold mb-4 text-white">Milestone Rewards</h3>
        <div className="space-y-4">
          {[2048, 4096, 8192].map((milestone) => {
            const status = getMilestoneStatus(milestone);
            const canClaim = status.status === "available" && !loading;

            return (
              <div key={milestone} className="flex items-center justify-between p-4 border border-white/20 rounded-xl bg-white/5">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold text-purple-400">{milestone}</div>
                  <div>
                    <div className="font-semibold text-white">{MILESTONES[milestone]} ETH Reward</div>
                    <div className={`text-sm ${status.color === 'green' ? 'text-green-400' : status.color === 'blue' ? 'text-blue-400' : 'text-white/60'}`}>{status.text}</div>
                  </div>
                </div>

                <button
                  onClick={() => onClaimReward(milestone)}
                  disabled={!canClaim || !account}
                  className={`px-6 py-3 rounded-xl font-semibold text-white transition-all transform hover:scale-105 ${getButtonClass(status.status, !canClaim || !account)}`}
                >
                  {status.status === "claimed" ? "✓ Claimed" : status.status === "available" ? "Claim" : "Locked"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-sm text-white/60">
          <p>• Reach the milestone tile value in the game to unlock rewards</p>
          <p>• Each milestone can only be claimed once per player</p>
          <p>• Claiming a reward consumes one play attempt</p>
        </div>
      </div>

      {/* Game Stats */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-bold mb-4 text-white">Game Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/10 rounded-xl border border-white/20">
            <div className="text-2xl font-bold text-green-400">{gameState.score}</div>
            <div className="text-sm text-white/60">Current Score</div>
          </div>

          <div className="text-center p-3 bg-white/10 rounded-xl border border-white/20">
            <div className="text-2xl font-bold text-purple-400">{gameState.maxTile}</div>
            <div className="text-sm text-white/60">Highest Tile</div>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2 text-white">Milestone Progress</div>
          <div className="space-y-2">
            {[2048, 4096, 8192].map((milestone) => {
              const achieved = gameState.milestones[milestone];
              const claimed = claimedMilestones[milestone];

              return (
                <div key={milestone} className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      claimed ? "bg-green-400" : achieved ? "bg-blue-400" : "bg-white/30"
                    }`}
                  ></div>
                  <span className="text-sm text-white/80">
                    {milestone} {claimed ? "(Claimed)" : achieved ? "(Available)" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameControls;

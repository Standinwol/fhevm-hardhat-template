// Contract configuration and ABI
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

export const CONTRACT_ABI = [
  "function buyPlay() external payable",
  "function claimReward(uint256 milestone) external",
  "function getAvailablePlays(address player) external view returns (uint256)",
  "function hasClaimed(address player, uint256 milestone) external view returns (bool)",
  "function getRewardAmount(uint256 milestone) external pure returns (uint256)",
  "function getContractBalance() external view returns (uint256)",
  "function availablePlays(address) external view returns (uint256)",
  "function claimedMilestones(address, uint256) external view returns (bool)",
  "function PLAY_COST() external view returns (uint256)",
  "function REWARD_2048() external view returns (uint256)",
  "function REWARD_4096() external view returns (uint256)",
  "function REWARD_8192() external view returns (uint256)",
  "function MILESTONE_2048() external view returns (uint256)",
  "function MILESTONE_4096() external view returns (uint256)",
  "function MILESTONE_8192() external view returns (uint256)",
  "event PlayBought(address indexed player)",
  "event RewardClaimed(address indexed player, uint256 milestone, uint256 reward)",
];

export const MILESTONES: Record<number, string> = {
  2048: "0.001",
  4096: "0.005",
  8192: "0.01",
};

export const PLAY_COST = "0.01";

// Sepolia testnet configuration
export const SEPOLIA_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "11155111");
export const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL || "https://ethereum-sepolia.publicnode.com";

// App configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || "2048 dApp",
  description: import.meta.env.VITE_APP_DESCRIPTION || "Play the classic 2048 game on Ethereum and earn ETH rewards!",
  version: "1.0.0",
};

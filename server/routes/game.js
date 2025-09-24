const express = require("express");
const { ethers } = require("ethers");
const router = express.Router();

// Contract configuration
const CONTRACT_ADDRESS = process.env.REACT_APP_FHEVM_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
const CONTRACT_ABI = [
  "function getAvailablePlays(address player) external view returns (uint256)",
  "function hasClaimed(address player, uint256 milestone) external view returns (bool)",
  "function getContractBalance() external view returns (uint256)",
  "function PLAY_COST() external view returns (uint256)",
  "function REWARD_2048() external view returns (uint256)",
  "function REWARD_4096() external view returns (uint256)",
  "function REWARD_8192() external view returns (uint256)",
];

// Get player information
router.get("/player/:address", async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid address format" });
    }

    const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const [availablePlays, claimed2048, claimed4096, claimed8192] = await Promise.all([
      contract.getAvailablePlays(address),
      contract.hasClaimed(address, 2048),
      contract.hasClaimed(address, 4096),
      contract.hasClaimed(address, 8192),
    ]);

    res.json({
      address,
      availablePlays: Number(availablePlays),
      claimedMilestones: {
        2048: claimed2048,
        4096: claimed4096,
        8192: claimed8192,
      },
    });
  } catch (error) {
    console.error("Error fetching player info:", error);
    res.status(500).json({
      error: "Failed to fetch player information",
      message: error.message,
    });
  }
});

// Get contract information
router.get("/contract", async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const [balance, playCost, reward2048, reward4096, reward8192] = await Promise.all([
      contract.getContractBalance(),
      contract.PLAY_COST(),
      contract.REWARD_2048(),
      contract.REWARD_4096(),
      contract.REWARD_8192(),
    ]);

    res.json({
      address: CONTRACT_ADDRESS,
      balance: ethers.formatEther(balance),
      playCost: ethers.formatEther(playCost),
      rewards: {
        2048: ethers.formatEther(reward2048),
        4096: ethers.formatEther(reward4096),
        8192: ethers.formatEther(reward8192),
      },
    });
  } catch (error) {
    console.error("Error fetching contract info:", error);
    res.status(500).json({
      error: "Failed to fetch contract information",
      message: error.message,
    });
  }
});

module.exports = router;

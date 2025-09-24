const express = require("express");
const router = express.Router();

// Simple stats storage (in production, use a database)
let gameStats = {
  totalGames: 0,
  totalRewards: 0,
  topScores: [],
  milestoneStats: {
    2048: 0,
    4096: 0,
    8192: 0,
  },
};

// Get game statistics
router.get("/", (req, res) => {
  res.json(gameStats);
});

// Update game statistics (would be called from game events)
router.post("/update", (req, res) => {
  const { score, milestone, reward } = req.body;

  if (score) {
    gameStats.totalGames++;
    gameStats.topScores.push(score);
    gameStats.topScores.sort((a, b) => b - a);
    gameStats.topScores = gameStats.topScores.slice(0, 10); // Keep top 10
  }

  if (milestone && gameStats.milestoneStats[milestone] !== undefined) {
    gameStats.milestoneStats[milestone]++;
  }

  if (reward) {
    gameStats.totalRewards += reward;
  }

  res.json({ message: "Stats updated", stats: gameStats });
});

module.exports = router;

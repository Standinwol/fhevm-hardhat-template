const express = require("express");
const router = express.Router();

// Basic API info
router.get("/", (req, res) => {
  res.json({
    name: "2048 dApp API",
    version: "1.0.0",
    description: "Backend API for 2048 dApp game",
    endpoints: {
      health: "/health",
      game: "/api/game",
      stats: "/api/stats",
    },
  });
});

module.exports = router;

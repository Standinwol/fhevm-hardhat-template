import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Game2048 } from "./utils/gameLogic";
import { CONTRACT_ADDRESS, CONTRACT_ABI, MILESTONES, PLAY_COST, SEPOLIA_CHAIN_ID } from "./config";
import GameBoard from "./components/GameBoard";
import WalletInfo from "./components/WalletInfo";
import GameControls from "./components/GameControls";
import TransactionStatus from "./components/TransactionStatus";
import "./index.css";

function App() {
  // Game state
  const [game] = useState(new Game2048());
  const [gameState, setGameState] = useState(game.getState());

  // Web3 state
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [availablePlays, setAvailablePlays] = useState(0);
  const [claimedMilestones, setClaimedMilestones] = useState<Record<number, boolean>>({});

  // Transaction state
  const [txStatus, setTxStatus] = useState({ type: "", message: "", hash: "" });
  const [loading, setLoading] = useState(false);

  // Initialize Web3 connection
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setTxStatus({
          type: "error",
          message: "MetaMask not found. Please install MetaMask.",
          hash: "",
        });
        return;
      }

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      // Check if we're on Sepolia
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // Sepolia chainId in hex
          });
        } catch (switchError) {
          setTxStatus({
            type: "error",
            message: "Please switch to Sepolia testnet in MetaMask.",
            hash: "",
          });
          return;
        }
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(account);

      // Update balance and plays
      await updateWalletInfo(provider, account, contract);

      setTxStatus({
        type: "success",
        message: "Wallet connected successfully!",
        hash: "",
      });
    } catch (error: any) {
      console.error("Connection error:", error);
      setTxStatus({
        type: "error",
        message: "Failed to connect wallet: " + error.message,
        hash: "",
      });
    }
  };

  // Update wallet information
  const updateWalletInfo = async (provider: ethers.BrowserProvider, account: string, contract: ethers.Contract) => {
    try {
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));

      if (contract) {
        const plays = await contract.getAvailablePlays(account);
        setAvailablePlays(Number(plays));

        // Check claimed milestones
        const claimed: Record<number, boolean> = {};
        for (const milestone of [2048, 4096, 8192]) {
          claimed[milestone] = await contract.hasClaimed(account, milestone);
        }
        setClaimedMilestones(claimed);
      }
    } catch (error) {
      console.error("Error updating wallet info:", error);
    }
  };

  // Buy a play
  const buyPlay = async () => {
    if (!contract || !signer) {
      setTxStatus({
        type: "error",
        message: "Please connect your wallet first.",
        hash: "",
      });
      return;
    }

    try {
      setLoading(true);
      setTxStatus({
        type: "pending",
        message: "Buying play attempt...",
        hash: "",
      });

      const tx = await contract.buyPlay({
        value: ethers.parseEther(PLAY_COST),
      });

      setTxStatus({
        type: "pending",
        message: "Transaction submitted. Waiting for confirmation...",
        hash: tx.hash,
      });

      await tx.wait();

      setTxStatus({
        type: "success",
        message: "Play purchased successfully!",
        hash: tx.hash,
      });

      // Update wallet info
      await updateWalletInfo(provider!, account, contract);
    } catch (error: any) {
      console.error("Buy play error:", error);
      setTxStatus({
        type: "error",
        message: "Failed to buy play: " + error.message,
        hash: "",
      });
    } finally {
      setLoading(false);
    }
  };

  // Claim reward for a milestone
  const claimReward = async (milestone: number) => {
    if (!contract || !signer) {
      setTxStatus({
        type: "error",
        message: "Please connect your wallet first.",
        hash: "",
      });
      return;
    }

    if (!gameState.milestones[milestone]) {
      setTxStatus({
        type: "error",
        message: `You need to reach ${milestone} to claim this reward!`,
        hash: "",
      });
      return;
    }

    if (claimedMilestones[milestone]) {
      setTxStatus({
        type: "error",
        message: `You have already claimed the ${milestone} reward!`,
        hash: "",
      });
      return;
    }

    if (availablePlays === 0) {
      setTxStatus({
        type: "error",
        message: "You need to buy a play attempt first!",
        hash: "",
      });
      return;
    }

    try {
      setLoading(true);
      setTxStatus({
        type: "pending",
        message: `Claiming ${milestone} reward (${MILESTONES[milestone]} ETH)...`,
        hash: "",
      });

      const tx = await contract.claimReward(milestone);

      setTxStatus({
        type: "pending",
        message: "Transaction submitted. Waiting for confirmation...",
        hash: tx.hash,
      });

      await tx.wait();

      setTxStatus({
        type: "success",
        message: `Successfully claimed ${MILESTONES[milestone]} ETH for reaching ${milestone}!`,
        hash: tx.hash,
      });

      // Update wallet info
      await updateWalletInfo(provider!, account, contract);
    } catch (error: any) {
      console.error("Claim reward error:", error);
      setTxStatus({
        type: "error",
        message: "Failed to claim reward: " + error.message,
        hash: "",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();

        if (availablePlays === 0) {
          setTxStatus({
            type: "error",
            message: "You need to buy a play attempt first!",
            hash: "",
          });
          return;
        }

        const moved = game.move(e.key);
        if (moved) {
          setGameState(game.getState());
        }
      }
    },
    [game, availablePlays],
  );

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Auto-connect wallet if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        await connectWallet();
      }
    };
    autoConnect();
  }, []);

  // Clear transaction status after 5 seconds
  useEffect(() => {
    if (txStatus.type && txStatus.type !== "pending") {
      const timer = setTimeout(() => {
        setTxStatus({ type: "", message: "", hash: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [txStatus]);

  // Reset game
  const resetGame = () => {
    game.reset();
    setGameState(game.getState());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎮 2048 dApp</h1>
          <p className="text-gray-600">Play the classic 2048 game on Ethereum and earn ETH rewards!</p>
        </div>

        {/* Wallet Connection */}
        {!account ? (
          <div className="text-center mb-8">
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Connect MetaMask Wallet
            </button>
            <p className="text-sm text-gray-500 mt-2">Make sure you're on Sepolia testnet</p>
          </div>
        ) : (
          <WalletInfo account={account} balance={balance} availablePlays={availablePlays} />
        )}

        {/* Transaction Status */}
        <TransactionStatus txStatus={txStatus} />

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Game Board */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-lg font-semibold">Score: {gameState.score}</div>
                <div className="text-lg font-semibold">Best: {gameState.maxTile}</div>
              </div>
            </div>

            <GameBoard gameState={gameState} />

            <div className="mt-4 text-center">
              <button
                onClick={resetGame}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                New Game
              </button>
              <p className="text-sm text-gray-500 mt-2">Use arrow keys to play</p>
            </div>

            {gameState.gameOver && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <strong>Game Over!</strong> No more moves possible.
              </div>
            )}
          </div>

          {/* Game Controls */}
          <GameControls
            account={account}
            gameState={gameState}
            claimedMilestones={claimedMilestones}
            loading={loading}
            onBuyPlay={buyPlay}
            onClaimReward={claimReward}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">How to Play & Earn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">🎯 Game Rules</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use arrow keys to move tiles</li>
                <li>• Tiles with same numbers merge when they touch</li>
                <li>• Try to reach 2048, 4096, or 8192 tiles</li>
                <li>• Game ends when no moves are possible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">💰 Earning Rewards</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Buy play attempts for 0.01 ETH each</li>
                <li>• Reach 2048 → claim 0.001 ETH</li>
                <li>• Reach 4096 → claim 0.005 ETH</li>
                <li>• Reach 8192 → claim 0.01 ETH</li>
                <li>• Each milestone can only be claimed once</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

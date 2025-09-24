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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header with Web3 branding */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">⚛</span>
              </div>
              <span className="text-white font-semibold">0.000</span>
              <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">⚛</span>
              </div>
              <span className="text-white font-semibold">Lisk Sepolia Testnet</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Game Title and Stats */}
        <div className="text-center mb-8">
          <div className="inline-block bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold mb-4">
            Web3 Game
          </div>
          <div className="flex items-center justify-center space-x-8 mb-4">
            <div className="text-8xl font-bold text-white">2048</div>
            <div className="space-y-4">
              <div className="bg-yellow-400 text-black px-6 py-3 rounded-lg">
                <div className="text-sm font-bold">MOVE COUNT</div>
                <div className="text-2xl font-bold">{gameState.score > 0 ? Math.floor(gameState.score / 10) + 1 : 0}</div>
              </div>
              <div className="bg-yellow-400 text-black px-6 py-3 rounded-lg">
                <div className="text-sm font-bold">PRIZE POOL</div>
                <div className="text-2xl font-bold">1.041529 ETH</div>
              </div>
            </div>
          </div>
          <p className="text-white/80 text-lg">Join the tiles, get to 2048!</p>
        </div>

        {/* Wallet Connection */}
        {!account ? (
          <div className="text-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <p className="text-white text-lg mb-4">Please connect to your Web3 Wallet of choice...</p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <WalletInfo account={account} balance={balance} availablePlays={availablePlays} />
          </div>
        )}

        {/* Transaction Status */}
        <TransactionStatus txStatus={txStatus} />

        {/* Main Game Area */}
        <div className="flex flex-col items-center">
          {/* Game Board */}
          <div className="mb-8">
            <GameBoard gameState={gameState} />
          </div>

          {/* Directional Controls */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            <div></div>
            <button className="w-16 h-16 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-white text-2xl">
              ↑
            </button>
            <div></div>
            <button className="w-16 h-16 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-white text-2xl">
              ←
            </button>
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              RESET
            </div>
            <button className="w-16 h-16 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-white text-2xl">
              →
            </button>
            <div></div>
            <button className="w-16 h-16 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-white text-2xl">
              ↓
            </button>
            <div></div>
          </div>

          {/* Game Controls */}
          {account && (
            <GameControls
              account={account}
              gameState={gameState}
              claimedMilestones={claimedMilestones}
              loading={loading}
              onBuyPlay={buyPlay}
              onClaimReward={claimReward}
            />
          )}

          {gameState.gameOver && (
            <div className="mt-6 p-6 bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl backdrop-blur-sm">
              <strong>Game Over!</strong> No more moves possible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

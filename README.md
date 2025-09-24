# 🎮 2048 dApp - Decentralized Game on Ethereum

A fully decentralized implementation of the classic 2048 game running on Ethereum Sepolia testnet. Players pay ETH to play and can earn rewards for reaching milestone tiles. Built with a professional structure inspired by modern dApp architecture.

**Author**: @Standinwol

## 🌟 Features

### 🎯 Game Mechanics
- **Classic 2048 Gameplay**: Use arrow keys to merge tiles and reach higher numbers
- **Play-to-Earn**: Pay 0.01 ETH per play attempt and earn rewards for achievements
- **Milestone Rewards**:
  - 2048 tile → 0.001 ETH
  - 4096 tile → 0.005 ETH  
  - 8192 tile → 0.01 ETH
- **Smart Contract Security**: Prevents double claiming and ensures fair gameplay
- **MetaMask Integration**: Seamless wallet connection and transaction handling

### 🏗️ Technical Architecture

```
2048_zama/
├── contracts/                    # Smart contract source files
│   └── Game2048.sol             # Main game contract
├── frontend-2048-dapp/           # React frontend application
│   ├── src/
│   │   ├── components/           # UI components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── utils/                # Utility functions
│   │   ├── abi/                  # Contract ABIs
│   │   ├── config.ts             # Configuration
│   │   └── App.tsx               # Main React component
│   ├── public/                   # Static assets
│   └── package.json              # Frontend dependencies
├── server/                       # Express.js backend API
│   ├── routes/                   # API route handlers
│   └── index.js                  # Server entry point
├── deploy/                       # Hardhat deployment scripts
├── scripts/                      # Utility scripts
├── test/                         # Contract tests
└── README.md
```

### 🔧 Technology Stack

#### Smart Contract
- **Solidity** - Smart contract language
- **Hardhat** - Development framework
- **ethers.js** - Ethereum interaction library

#### Frontend
- **React 18** - UI framework with TypeScript
- **TailwindCSS** - Utility-first CSS framework
- **ethers.js** - Ethereum interaction
- **Vite** - Build tool and dev server

#### Backend
- **Express.js** - REST API server
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

#### Infrastructure
- **MetaMask** - Wallet connection
- **Sepolia Testnet** - Ethereum test network
- **Etherscan** - Contract verification and monitoring

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 18 or higher
- **MetaMask**: Browser extension installed
- **Sepolia ETH**: Get test ETH from [Sepolia faucet](https://sepoliafaucet.com/)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo-url>
   cd 2048_zama
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp frontend-2048-dapp/.env.example frontend-2048-dapp/.env
   cp server/.env.example server/.env
   
   # Set your private key for deployment
   npx hardhat vars set PRIVATE_KEY
   
   # Set your Sepolia RPC URL
   npx hardhat vars set SEPOLIA_RPC_URL
   
   # Optional: Set Etherscan API key
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

### Smart Contract Deployment

1. **Compile contracts**
   ```bash
   npm run compile
   ```

2. **Deploy to Sepolia testnet**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Verify contract (optional)**
   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

4. **Update frontend configuration**
   - Copy the deployed contract address
   - Update `CONTRACT_ADDRESS` in `frontend-2048-dapp/src/config.ts`

### Frontend Development

1. **Install frontend dependencies**
   ```bash
   cd frontend-2048-dapp
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

### Backend Development

1. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

## 🎯 How to Play

### Getting Started

1. **Connect Wallet**
   - Click "Connect MetaMask Wallet"
   - Ensure you're on Sepolia testnet
   - Approve the connection

2. **Buy Play Attempts**
   - Click "Buy Play (0.01 ETH)" 
   - Confirm the transaction in MetaMask
   - Wait for transaction confirmation

3. **Play the Game**
   - Use arrow keys to move tiles
   - Merge tiles with same numbers
   - Try to reach 2048, 4096, or 8192

4. **Claim Rewards**
   - When you reach a milestone, click "Claim" button
   - Confirm transaction to receive ETH reward
   - Each milestone can only be claimed once

### Game Rules

- **Movement**: Use ↑↓←→ arrow keys to slide tiles
- **Merging**: When two tiles with same number touch, they merge
- **Objective**: Create higher-value tiles to reach milestones
- **Game Over**: When no more moves are possible

## 🔧 Smart Contracts

### Contract Addresses

```
Sepolia: <CONTRACT_ADDRESS> (Update after deployment)
```

### Key Functions

```solidity
// Buy a play attempt for 0.01 ETH
function buyPlay() external payable

// Claim reward for reaching milestone
function claimReward(uint256 milestone) external

// Check available plays for a player
function getAvailablePlays(address player) external view returns (uint256)

// Check if milestone was claimed
function hasClaimed(address player, uint256 milestone) external view returns (bool)
```

### Security Features

- **Payment Validation**: Ensures exact 0.01 ETH payment for plays
- **Double Claim Prevention**: Tracks claimed milestones per player
- **Play Requirement**: Must have available plays to claim rewards
- **Balance Checks**: Verifies contract has sufficient funds for rewards

### Events

```solidity
event PlayBought(address indexed player);
event RewardClaimed(address indexed player, uint256 milestone, uint256 reward);
```

## 🛠️ Development

### Project Structure Explanation

- **`contracts/`** - Solidity smart contracts
- **`frontend-2048-dapp/`** - React frontend with TypeScript
- **`server/`** - Express.js backend API
- **`deploy/`** - Hardhat deployment configurations
- **`scripts/`** - Utility and deployment scripts
- **`test/`** - Smart contract test suites

### Development Commands

```bash
# Smart Contract
npm run compile          # Compile Solidity contracts
npm run test            # Run contract tests
npm run coverage        # Generate test coverage

# Frontend
cd frontend-2048-dapp
npm start               # Start development server
npm run build           # Build for production

# Backend
cd server
npm run dev             # Start development server
npm start               # Start production server

# Deployment
npx hardhat run scripts/deploy.js --network sepolia    # Deploy to Sepolia
npx hardhat verify --network sepolia <ADDRESS>         # Verify contract
```

## 📊 API Endpoints

### Backend API

```
GET  /health                    # Health check
GET  /api                       # API information
GET  /api/game/player/:address  # Get player information
GET  /api/game/contract         # Get contract information
GET  /api/stats                 # Get game statistics
POST /api/stats/update          # Update statistics
```

## 🔒 Security Features

### Smart Contract Security

- **Reentrancy Protection**: Uses checks-effects-interactions pattern
- **Access Control**: Owner functions for emergency management
- **Input Validation**: Validates all milestone values
- **Error Handling**: Custom errors for better gas efficiency

### Frontend Security

- **Game Logic Separation**: Game runs on frontend, rewards verified on-chain
- **Transaction Validation**: All milestone claims verified by smart contract
- **Network Verification**: Ensures connection to correct Sepolia network

## 🌐 Network Configuration

### Sepolia Testnet

- **Chain ID**: 11155111
- **RPC URL**: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
- **Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

## 📋 Environment Variables

### Root (.env)
```
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Frontend (.env)
```
REACT_APP_FHEVM_CONTRACT_ADDRESS=<CONTRACT_ADDRESS>
REACT_APP_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
REACT_APP_BACKEND_API_URL=http://localhost:4009/api
```

### Backend (.env)
```
PORT=4009
REACT_APP_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
REACT_APP_FHEVM_CONTRACT_ADDRESS=<CONTRACT_ADDRESS>
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Connect repository to platform
2. Set environment variables
3. Deploy automatically on push

### Backend (Render/Railway)

1. Deploy server to cloud platform
2. Set environment variables
3. Update frontend `REACT_APP_BACKEND_API_URL`

### Smart Contract

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ethereum Foundation** - For the blockchain infrastructure
- **MetaMask** - For wallet integration
- **Hardhat** - For development tools
- **React Team** - For the amazing UI framework

## 📞 Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: This README and inline code comments
- **Author**: @Standinwol

---

**⚠️ Disclaimer**: This is a demo application for educational purposes. Use at your own risk and never use real funds on testnet applications.

**Built with ❤️ using Hardhat, React, TypeScript, and ethers.js**
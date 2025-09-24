# Vercel Deployment Guide

## 🚀 Deploy 2048 dApp to Vercel

This guide will help you deploy the 2048 dApp frontend to Vercel.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Deployed Contract**: Smart contract deployed to Sepolia testnet

### Step 1: Deploy Smart Contract

First, deploy your smart contract to Sepolia:

```bash
# Set your private key
npx hardhat vars set PRIVATE_KEY

# Deploy to Sepolia
npx hardhat run deploy/deploy.ts --network sepolia

# Copy the deployed contract address
```

### Step 2: Deploy to Vercel

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend-2048-dapp`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Set Environment Variables**:
   ```
   VITE_CONTRACT_ADDRESS=0x[YOUR_DEPLOYED_CONTRACT_ADDRESS]
   VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
   VITE_CHAIN_ID=11155111
   VITE_APP_NAME=2048 dApp
   VITE_APP_DESCRIPTION=Play the classic 2048 game on Ethereum and earn ETH rewards!
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete

### Step 3: Update Contract Address

After deployment, update the contract address in Vercel:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Update `VITE_CONTRACT_ADDRESS` with your deployed contract address
4. Redeploy the project

### Step 4: Test the dApp

1. Open your deployed Vercel URL
2. Connect MetaMask wallet
3. Switch to Sepolia testnet
4. Buy play attempts and test the game

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_CONTRACT_ADDRESS` | Deployed contract address | `0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6` |
| `VITE_SEPOLIA_RPC_URL` | Sepolia RPC endpoint | `https://ethereum-sepolia.publicnode.com` |
| `VITE_CHAIN_ID` | Sepolia chain ID | `11155111` |
| `VITE_APP_NAME` | App name | `2048 dApp` |
| `VITE_APP_DESCRIPTION` | App description | `Play the classic 2048 game...` |

### Troubleshooting

**Build Fails**:
- Check that all dependencies are in `package.json`
- Ensure TypeScript compilation passes
- Verify Vite configuration

**Contract Not Found**:
- Verify contract address is correct
- Check that contract is deployed on Sepolia
- Ensure RPC URL is accessible

**MetaMask Connection Issues**:
- Verify chain ID is set to 11155111 (Sepolia)
- Check that RPC URL is correct
- Ensure user has Sepolia ETH

### Production Checklist

- [ ] Smart contract deployed to Sepolia
- [ ] Contract address updated in environment variables
- [ ] All environment variables set in Vercel
- [ ] Build passes without errors
- [ ] MetaMask connection works
- [ ] Game functionality tested
- [ ] Mobile responsiveness checked

### Support

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test locally first with `npm run dev`
4. Check browser console for errors

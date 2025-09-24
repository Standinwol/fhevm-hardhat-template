import { ethers } from "ethers";

async function main() {
  const privateKey = "0xd8d81d0f51bafc652eacd1d8c73450c76c001570ae9a00266319d0b0a94ead8d";
  const wallet = new ethers.Wallet(privateKey);

  console.log("🔑 Wallet Address:", wallet.address);
  console.log("🔑 Private Key:", privateKey);

  // Check balance on Sepolia
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia.publicnode.com");
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Sepolia Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.log("\n❌ No Sepolia ETH found!");
    console.log("🔗 Get Sepolia ETH from these faucets:");
    console.log("1. https://sepoliafaucet.com/");
    console.log("2. https://faucet.sepolia.dev/");
    console.log("3. https://sepolia-faucet.pk910.de/");
    console.log("\n📋 Enter this wallet address in the faucet:", wallet.address);
  } else {
    console.log("✅ You have Sepolia ETH! Tests should work.");
  }
}

main().catch(console.error);

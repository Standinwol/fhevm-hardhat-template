import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { ethers } = hre;

  console.log("Deploying Game2048 contract with deployer:", deployer);

  // Get deployer balance
  const balance = await ethers.provider.getBalance(deployer);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  const deployedGame2048 = await deploy("Game2048", {
    from: deployer,
    args: [], // No constructor arguments
    log: true,
  });

  console.log(`\n🎮 Game2048 deployed to: ${deployedGame2048.address}`);
  console.log(`📄 Transaction hash: ${deployedGame2048.transactionHash}`);

  // Fund the contract with some ETH for rewards if on local network
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    const fundAmount = ethers.parseEther("1.0"); // 1 ETH for testing
    const [signer] = await ethers.getSigners();

    console.log(`\n💰 Funding contract with ${ethers.formatEther(fundAmount)} ETH for testing...`);
    const tx = await signer.sendTransaction({
      to: deployedGame2048.address,
      value: fundAmount,
    });
    await tx.wait();
    console.log(`✅ Contract funded successfully!`);
  }

  console.log(`\n📋 Contract Details:`);
  console.log(`   - Network: ${hre.network.name}`);
  console.log(`   - Play Cost: 0.01 ETH`);
  console.log(`   - Rewards: 2048 → 0.001 ETH | 4096 → 0.005 ETH | 8192 → 0.01 ETH`);
};
export default func;
func.id = "deploy_game2048"; // id required to prevent reexecution
func.tags = ["Game2048"];

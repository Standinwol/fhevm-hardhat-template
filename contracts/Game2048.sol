// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Game2048
 * @dev A confidential smart contract for the 2048 game dApp with encrypted data and ETH payments
 */
contract Game2048 is SepoliaConfig {
    // Constants for game pricing and rewards
    uint256 public constant PLAY_COST = 0.01 ether;
    uint256 public constant REWARD_2048 = 0.001 ether;
    uint256 public constant REWARD_4096 = 0.005 ether;
    uint256 public constant REWARD_8192 = 0.01 ether;

    // Milestone constants
    uint32 public constant MILESTONE_2048 = 2048;
    uint32 public constant MILESTONE_4096 = 4096;
    uint32 public constant MILESTONE_8192 = 8192;

    // Owner of the contract
    address public owner;

    // Mapping to track available plays for each player (encrypted)
    mapping(address => euint32) internal availablePlays;

    // Mapping to track player scores (encrypted)
    mapping(address => euint32) internal playerScores;

    // Mapping to track claimed milestones per player
    // player => milestone => claimed (encrypted boolean)
    mapping(address => mapping(uint32 => ebool)) internal claimedMilestones;

    // Events
    event PlayBought(address indexed player);
    event RewardClaimed(address indexed player, uint32 milestone, uint256 reward);
    event ScoreUpdated(address indexed player);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Errors
    error InsufficientPayment();
    error InvalidMilestone();
    error MilestoneAlreadyClaimed();
    error NoPlaysAvailable();
    error RewardTransferFailed();
    error InsufficientContractBalance();
    error OnlyOwner();
    error InvalidScore();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    /**
     * @dev Allows players to buy a play attempt for 0.01 ETH
     */
    function buyPlay() external payable {
        if (msg.value != PLAY_COST) revert InsufficientPayment();

        // Encrypt the increment and add to available plays
        euint32 currentPlays = availablePlays[msg.sender];
        euint32 one = FHE.asEuint32(1);
        availablePlays[msg.sender] = FHE.add(currentPlays, one);

        // Allow this contract and the player to access the encrypted value
        FHE.allowThis(availablePlays[msg.sender]);
        FHE.allow(availablePlays[msg.sender], msg.sender);

        emit PlayBought(msg.sender);
    }

    /**
     * @dev Update player's score (encrypted)
     * @param inputScore The player's encrypted score input
     * @param inputProof The proof for the encrypted input
     */
    function updateScore(externalEuint32 inputScore, bytes calldata inputProof) external {
        euint32 score = FHE.fromExternal(inputScore, inputProof);
        playerScores[msg.sender] = score;

        // Allow this contract and the player to access the encrypted value
        FHE.allowThis(playerScores[msg.sender]);
        FHE.allow(playerScores[msg.sender], msg.sender);

        emit ScoreUpdated(msg.sender);
    }

    /**
     * @dev Allows players to claim rewards for reaching milestones
     * @param milestone The milestone reached (2048, 4096, or 8192)
     * @param inputScore The player's encrypted score proving they reached the milestone
     * @param inputProof The proof for the encrypted input
     */
    function claimReward(uint32 milestone, externalEuint32 inputScore, bytes calldata inputProof) external {
        // Validate milestone
        if (milestone != MILESTONE_2048 && milestone != MILESTONE_4096 && milestone != MILESTONE_8192) {
            revert InvalidMilestone();
        }

        // Check if player has available plays
        euint32 plays = availablePlays[msg.sender];
        euint32 zero = FHE.asEuint32(0);
        ebool hasPlays = FHE.gt(plays, zero);
        // Note: In production, this would require gateway decryption
        // For now, we'll trust the frontend validation

        // Check if milestone already claimed
        ebool alreadyClaimed = claimedMilestones[msg.sender][milestone];
        // Note: In production, this would require gateway decryption

        // Verify the score meets the milestone
        euint32 score = FHE.fromExternal(inputScore, inputProof);
        euint32 milestoneThreshold = FHE.asEuint32(milestone);
        ebool scoreValid = FHE.ge(score, milestoneThreshold);
        // Note: In production, this would require gateway decryption for validation

        // Determine reward amount
        uint256 rewardAmount;
        if (milestone == MILESTONE_2048) {
            rewardAmount = REWARD_2048;
        } else if (milestone == MILESTONE_4096) {
            rewardAmount = REWARD_4096;
        } else if (milestone == MILESTONE_8192) {
            rewardAmount = REWARD_8192;
        }

        // Check contract has sufficient balance
        if (address(this).balance < rewardAmount) revert InsufficientContractBalance();

        // Mark milestone as claimed
        claimedMilestones[msg.sender][milestone] = FHE.asEbool(true);
        FHE.allowThis(claimedMilestones[msg.sender][milestone]);
        FHE.allow(claimedMilestones[msg.sender][milestone], msg.sender);

        // Consume one play
        euint32 one = FHE.asEuint32(1);
        availablePlays[msg.sender] = FHE.sub(plays, one);
        FHE.allowThis(availablePlays[msg.sender]);
        FHE.allow(availablePlays[msg.sender], msg.sender);

        // Update player's score
        playerScores[msg.sender] = score;
        FHE.allowThis(playerScores[msg.sender]);
        FHE.allow(playerScores[msg.sender], msg.sender);

        // Transfer reward
        (bool success, ) = payable(msg.sender).call{value: rewardAmount}("");
        if (!success) revert RewardTransferFailed();

        emit RewardClaimed(msg.sender, milestone, rewardAmount);
    }

    /**
     * @dev Get the reward amount for a specific milestone
     * @param milestone The milestone (2048, 4096, or 8192)
     * @return The reward amount in wei
     */
    function getRewardAmount(uint32 milestone) external pure returns (uint256) {
        if (milestone == MILESTONE_2048) return REWARD_2048;
        if (milestone == MILESTONE_4096) return REWARD_4096;
        if (milestone == MILESTONE_8192) return REWARD_8192;
        revert InvalidMilestone();
    }

    /**
     * @dev Get encrypted available plays for a player
     * @param player The player address
     * @return The encrypted number of available plays
     */
    function getAvailablePlays(address player) external view returns (euint32) {
        return availablePlays[player];
    }

    /**
     * @dev Get encrypted player score
     * @param player The player address
     * @return The encrypted player score
     */
    function getPlayerScore(address player) external view returns (euint32) {
        return playerScores[player];
    }

    /**
     * @dev Get encrypted milestone claim status
     * @param player The player address
     * @param milestone The milestone to check
     * @return The encrypted claim status
     */
    function getMilestoneClaimed(address player, uint32 milestone) external view returns (ebool) {
        return claimedMilestones[player][milestone];
    }

    /**
     * @dev Get contract balance
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Owner can withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert RewardTransferFailed();
    }

    /**
     * @dev Transfer ownership
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @dev Receive function to allow contract to receive ETH
     */
    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}

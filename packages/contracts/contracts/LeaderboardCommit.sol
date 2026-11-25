// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LeaderboardCommit
 * @notice Stores cryptographic hashes of weekly leaderboard states for auditability and transparency.
 */
contract LeaderboardCommit is Ownable {
    // Mapping from weekId (e.g. keccak256("2026-W47") or bytes32 representation) to keccak256 hash
    mapping(bytes32 => bytes32) public commits;

    event Committed(bytes32 indexed weekId, bytes32 hash);

    error AlreadyCommitted(bytes32 weekId);
    error InvalidWeekId();
    error InvalidHash();

    /**
     * @param initialOwner Initial contract owner
     */
    constructor(address initialOwner) Ownable(initialOwner == address(0) ? msg.sender : initialOwner) {}

    /**
     * @notice Commit a weekly leaderboard hash. Can only be committed once per weekId.
     * @param weekId Identifier for the week (e.g. bytes32 of "YYYY-Www")
     * @param hash keccak256 hash of the weekly leaderboard snapshot
     */
    function commit(bytes32 weekId, bytes32 hash) external onlyOwner {
        if (weekId == bytes32(0)) revert InvalidWeekId();
        if (hash == bytes32(0)) revert InvalidHash();
        if (commits[weekId] != bytes32(0)) revert AlreadyCommitted(weekId);

        commits[weekId] = hash;
        emit Committed(weekId, hash);
    }

    /**
     * @notice Retrieves the committed hash for a given weekId
     * @param weekId Identifier for the week
     */
    function getCommit(bytes32 weekId) external view returns (bytes32) {
        return commits[weekId];
    }
}

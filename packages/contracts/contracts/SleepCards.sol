// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC5192} from "./IERC5192.sol";

/**
 * @title SleepCards
 * @notice ERC-721 Soulbound NFT implementation adhering to ERC-5192 for SimpliSleep collectible cards.
 * @dev Transfers and approvals are blocked after minting.
 */
contract SleepCards is ERC721, AccessControl, IERC5192 {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _nextTokenId = 1;
    string private _baseTokenURI;

    // Mapping from tokenId to cardId (identifying card in catalog)
    mapping(uint256 tokenId => uint256) private _cardIds;

    // Custom errors
    error SoulboundToken();

    // Event
    event BaseURISet(string newBaseURI);

    /**
     * @param initialAdmin Address receiving DEFAULT_ADMIN_ROLE and MINTER_ROLE (falls back to msg.sender)
     * @param initialBaseURI Base URI prefix for token metadata
     */
    constructor(address initialAdmin, string memory initialBaseURI) ERC721("SleepCards", "SLEEP") {
        address admin = initialAdmin == address(0) ? msg.sender : initialAdmin;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _baseTokenURI = initialBaseURI;
    }

    /**
     * @notice Mints a new soulbound SleepCard to the designated address
     * @param to Recipient address
     * @param cardId Identifier of the card in the SimpliSleep catalog
     * @return tokenId The newly minted token identifier
     */
    function mint(address to, uint256 cardId) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _cardIds[tokenId] = cardId;
        _safeMint(to, tokenId);

        // ERC-5192 event indicating the token is locked immediately on mint
        emit Locked(tokenId);

        return tokenId;
    }

    /**
     * @notice Returns the card ID associated with a given tokenId
     * @param tokenId The identifier for the token
     */
    function getCardId(uint256 tokenId) external view returns (uint256) {
        _requireOwned(tokenId);
        return _cardIds[tokenId];
    }

    /**
     * @notice Alias getter for card ID
     * @param tokenId The identifier for the token
     */
    function cardIdOf(uint256 tokenId) external view returns (uint256) {
        _requireOwned(tokenId);
        return _cardIds[tokenId];
    }

    /**
     * @notice Returns the current base URI
     */
    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice Updates the base URI for metadata (admin only)
     * @param newBaseURI New base URI string
     */
    function setBaseURI(string calldata newBaseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = newBaseURI;
        emit BaseURISet(newBaseURI);
    }

    /**
     * @notice Returns the metadata URI for a token (baseURI + cardId + '.json')
     * @param tokenId The identifier for the token
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_baseTokenURI, Strings.toString(_cardIds[tokenId]), ".json");
    }

    /**
     * @notice ERC-5192 locked query
     * @dev Always returns true for valid existing tokens as they are soulbound
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        _requireOwned(tokenId);
        return true;
    }

    /**
     * @notice ERC-165 support check
     * @dev Explicitly supports ERC-5192 interface ID 0xb45a3c0e
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return interfaceId == 0xb45a3c0e || super.supportsInterface(interfaceId);
    }

    /**
     * @dev Block token transfers after minting to ensure soulbound property
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0)) {
            revert SoulboundToken();
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Block approvals for soulbound tokens
     */
    function approve(address /*to*/, uint256 /*tokenId*/) public virtual override {
        revert SoulboundToken();
    }

    /**
     * @dev Block operator approvals for soulbound tokens
     */
    function setApprovalForAll(address /*operator*/, bool /*approved*/) public virtual override {
        revert SoulboundToken();
    }
}

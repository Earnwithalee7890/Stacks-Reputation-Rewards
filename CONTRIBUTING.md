# Contributing to ProofOfBuilder 🤝

Thank you for your interest in contributing to ProofOfBuilder — the on-chain reputation engine for Stacks builders!

## 🏷️ Tags

This project uses: **Stacks**, **Clarity**, **Bitcoin Layer 2**, **DeFi**, **sBTC**, **SBT**

---

## 🚀 Getting Started

### Prerequisites

1. Install [Clarinet](https://docs.hiro.so/clarinet)
2. Install [Node.js](https://nodejs.org/) (v18+)
3. Install [Leather Wallet](https://leather.io/) browser extension
4. Have STX tokens for sandbox testing

### Setup

```bash
git clone https://github.com/Earnwithalee7890/ProofOfBuilder.git
cd ProofOfBuilder
clarinet check    # Verify all contracts compile
clarinet console  # Open interactive testing console
```

---

## 🧪 How to Test Contracts

### Using Clarinet Console

After running `clarinet console`, you can interact with all contracts:

```clarity
;; Register yourself
(contract-call? .proof-of-builder register-builder "your-github")

;; Check in daily
(contract-call? .daily-check-in check-in)

;; Mint your SBT
(contract-call? .builder-sbt mint-sbt)

;; Stake STX
(contract-call? .builder-staking stake-stx u5000000)

;; Post a bounty
(contract-call? .builder-bounties post-bounty u1000000 "Improve docs")

;; Create a swap order (5 STX at 1.5 USDC/STX)
(contract-call? .stx-swap create-sell-order u5000000 u1500000)

;; Create sBTC escrow
(contract-call? .sbtc-escrow create-escrow u10000000 u500000)

;; Check treasury revenue
(contract-call? .treasury get-total-revenue)
```

### Using Hiro Sandbox

1. Go to [Hiro Explorer Sandbox](https://explorer.hiro.so/sandbox)
2. Connect your Leather wallet
3. Deploy contracts in the order listed in README.md
4. Use the "Call contract" tab to interact

---

## 📝 Contribution Guidelines

### Smart Contracts

- All Clarity contracts should be in `/contracts/`
- Follow existing naming conventions (kebab-case)
- Include header comments with Title, Description, Tags, Fee, Network
- All fee-generating functions must route fees to `.treasury` and call `record-fee`
- Add read-only helper functions for frontend integration

### Frontend

- The frontend is a self-contained `index.html` using CDN scripts
- Uses `@stacks/connect` for wallet integration
- All contract addresses are configurable at the top of the script

### Documentation

- Update README.md when adding new contracts
- Add sandbox testing commands for every new function
- Tag all files with: `Stacks, Clarity, Bitcoin Layer 2`

### Commits

- Use descriptive commit messages
- Reference contract names in commits
- Example: `feat: add time-locked escrow to sbtc-escrow contract`

---

## 🔧 Project Structure

```
ProofOfBuilder/
├── contracts/               # All Clarity smart contracts
│   ├── nft-trait.clar       # SIP-009 NFT trait
│   ├── treasury.clar        # Central fee vault
│   ├── daily-check-in.clar  # 24h heartbeat
│   ├── proof-of-builder.clar # Identity registry
│   ├── builder-sbt.clar     # Soulbound Token
│   ├── builder-staking.clar # STX staking
│   ├── project-verifier.clar # Contribution verification
│   ├── stx-swap.clar        # STX-USDC swap desk
│   ├── sbtc-escrow.clar     # sBTC bridge escrow
│   └── builder-bounties.clar # Bounty board
├── index.html               # Frontend dashboard
├── Clarinet.toml            # Project config
├── README.md                # Documentation
├── CONTRIBUTING.md          # This file
├── LICENSE                  # MIT License
└── SANDBOX_GUIDE.md         # Sandbox interaction guide
```

---

## 🐛 Reporting Issues

Open an issue on GitHub with:
- Steps to reproduce
- Expected vs actual behavior
- Contract name and function involved
- Network (mainnet/testnet/sandbox)

---

## 📜 Code of Conduct

Be respectful, constructive, and inclusive. We're all building on Stacks together.

---

Thank you for helping build the reputation layer for Stacks! 🛡️

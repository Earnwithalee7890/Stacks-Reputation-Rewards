# Sandbox Interaction Guide 🧪

> Step-by-step guide to testing all ProofOfBuilder contracts in the Hiro Sandbox

**Tags:** Stacks, Clarity, Bitcoin Layer 2

---

## 📋 Prerequisites

- [Leather Wallet](https://leather.io/) installed and configured
- STX tokens in your wallet (testnet or mainnet)
- Access to [Hiro Explorer Sandbox](https://explorer.hiro.so/sandbox)

---

## 🚀 Deployment Order

Deploy contracts in this exact order via the Sandbox "Write & Deploy" tab:

| Step | Contract | Notes |
|------|----------|-------|
| 1 | `nft-trait.clar` | Required dependency for SBT |
| 2 | `treasury.clar` | Must be first — all fees route here |
| 3 | `daily-check-in.clar` | Uses `.treasury` |
| 4 | `proof-of-builder.clar` | Uses `.treasury` |
| 5 | `builder-sbt.clar` | Uses `.treasury` + `.nft-trait` |
| 6 | `builder-staking.clar` | Uses `.treasury` |
| 7 | `project-verifier.clar` | Uses `.treasury` |
| 8 | `stx-swap.clar` | Uses `.treasury` |
| 9 | `sbtc-escrow.clar` | Uses `.treasury` |
| 10 | `builder-bounties.clar` | Uses `.treasury` |

---

## ⚠️ Post-Deployment: Authorize Contracts

After deploying, you MUST authorize each contract in the Treasury:

```clarity
;; Call treasury.set-authorized-contract for each:
(contract-call? .treasury set-authorized-contract .daily-check-in true)
(contract-call? .treasury set-authorized-contract .proof-of-builder true)
(contract-call? .treasury set-authorized-contract .builder-sbt true)
(contract-call? .treasury set-authorized-contract .builder-staking true)
(contract-call? .treasury set-authorized-contract .project-verifier true)
(contract-call? .treasury set-authorized-contract .stx-swap true)
(contract-call? .treasury set-authorized-contract .sbtc-escrow true)
(contract-call? .treasury set-authorized-contract .builder-bounties true)
```

---

## 🧪 Verified Function Calls

### 1. Daily Check-In (0.03 STX)

```clarity
;; Check in
(contract-call? .daily-check-in check-in)
;; → (ok true)

;; Read your stats
(contract-call? .daily-check-in get-check-in-count tx-sender)
;; → u1

(contract-call? .daily-check-in get-streak tx-sender)
;; → u1

(contract-call? .daily-check-in can-check-in tx-sender)
;; → false (must wait 144 blocks)
```

### 2. Identity Registry (0.05 STX)

```clarity
;; Register with GitHub username
(contract-call? .proof-of-builder register-builder "aleekhoso")
;; → (ok true)

;; Read profile
(contract-call? .proof-of-builder get-builder tx-sender)
;; → (some {github: "aleekhoso", reputation: u0, joined-at: u12345, verified: false})

;; Total registered builders
(contract-call? .proof-of-builder get-total-builders)
;; → u1
```

### 3. Mint SBT (0.07 STX)

```clarity
;; Mint your soulbound token
(contract-call? .builder-sbt mint-sbt)
;; → (ok u1)

;; Check ownership
(contract-call? .builder-sbt get-owner u1)
;; → (ok (some ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM))

;; Try to transfer — should fail
(contract-call? .builder-sbt transfer u1 tx-sender 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)
;; → (err u101) — Non-transferable!
```

### 4. Stake STX (0.04 STX fee + stake amount)

```clarity
;; Stake 5 STX
(contract-call? .builder-staking stake-stx u5000000)
;; → (ok true)

;; Check your stake
(contract-call? .builder-staking get-stake tx-sender)
;; → u5000000

;; Total value locked
(contract-call? .builder-staking get-total-staked)
;; → u5000000

;; Unstake 2 STX
(contract-call? .builder-staking unstake-stx u2000000)
;; → (ok true)
```

### 5. Project Verification (0.10 STX)

```clarity
;; Verify a builder
(contract-call? .project-verifier verify-builder 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)
;; → (ok true)

;; Check verification status
(contract-call? .project-verifier is-verified tx-sender 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)
;; → true
```

### 6. STX-USDC Swap (0.05 STX fee)

```clarity
;; Create sell order: 5 STX at 1.5 USDC/STX
(contract-call? .stx-swap create-sell-order u5000000 u1500000)
;; → (ok u1)

;; Read order
(contract-call? .stx-swap get-order u1)
;; → (some {seller: ..., stx-amount: u5000000, price-per-stx: u1500000, ...})

;; Cancel order
(contract-call? .stx-swap cancel-order u1)
;; → (ok true)
```

### 7. sBTC Bridge Escrow (0.08 STX fee)

```clarity
;; Create escrow: lock 10 STX, want 0.5 sBTC
(contract-call? .sbtc-escrow create-escrow u10000000 u500000)
;; → (ok u1)

;; Read escrow
(contract-call? .sbtc-escrow get-escrow u1)
;; → (some {creator: ..., stx-locked: u10000000, sbtc-requested: u500000, status: "open"})

;; Reclaim after expiry (720 blocks)
(contract-call? .sbtc-escrow reclaim-escrow u1)
```

### 8. Builder Bounties (0.06 STX fee)

```clarity
;; Post bounty with 5 STX reward
(contract-call? .builder-bounties post-bounty u5000000 "Fix documentation formatting")
;; → (ok u1)

;; Another user claims it
(contract-call? .builder-bounties claim-bounty u1)
;; → (ok true)

;; Poster approves and releases reward
(contract-call? .builder-bounties approve-bounty u1)
;; → (ok true)
```

### 9. Treasury Queries

```clarity
;; Total protocol revenue
(contract-call? .treasury get-total-revenue)

;; Your total fees spent
(contract-call? .treasury get-total-spent tx-sender)

;; Check if a contract is authorized
(contract-call? .treasury is-authorized .daily-check-in)
;; → true
```

---

## ✅ Expected Results

After running through all the above:

- ✅ 1 builder registered with GitHub handle
- ✅ 1 SBT minted (non-transferable)
- ✅ 1+ daily check-ins recorded
- ✅ STX staked in contract
- ✅ 1 swap order created
- ✅ 1 escrow created
- ✅ 1 bounty posted
- ✅ Treasury tracking all fees

---

*All verified on Stacks Mainnet/Testnet via Hiro Sandbox* 🛡️

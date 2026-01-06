# Cinexit Mining Protocol — Audit Overview

## 1. High-Level Summary

Cinexit is a settlement-based mining rewards protocol.

External off-chain mining operations generate multi-currency revenue
(BTC, LTC, ETC, etc). Revenue is converted off-chain to USDC and then
settled on-chain once per epoch via a quorum-based oracle.

Users do NOT rely on new user deposits for rewards.
All rewards originate from externally generated mining revenue.

---

## 2. Core Components

### Oracle
- Reports total USDC revenue per epoch
- Quorum-based signer model
- Cannot mint, withdraw, or transfer funds
- Monotonic epoch enforcement

### RewardDistributor
- Accepts oracle settlement data
- Tracks `totalSettled[epoch]`
- Tracks `totalClaimed[epoch]`
- Enforces:
- Distributes USDC using SafeERC20

### CircuitBreaker
- Emergency pause for all state-changing functions
- Guardian role can pause
- Unpause restricted to owner / multisig

### Deposit / Mining Pool (Optional)
- Users may optionally deposit USDC
- Deposits are not required to earn rewards
- Deposits do not affect oracle settlement values

---

## 3. Trust & Threat Model

### Trusted
- Oracle quorum (majority honest assumption)
- USDC ERC20 contract

### Not Trusted
- Frontend
- Users
- RPC providers
- Individual oracle signers

---

## 4. Invariants (CRITICAL)

For every epoch `E`:

- Epochs are strictly increasing
- Oracle cannot overwrite past epochs
- `totalClaimed[E] <= totalSettled[E]`
- Users cannot claim the same epoch twice
- Rewards are capped by available USDC balance

---

## 5. Attack Scenarios Considered

### Reentrancy
- Claims use checks-effects-interactions
- State updated before transfer
- SafeERC20 used

### Oracle Over-Reporting
- Settlement capped by actual USDC balance
- Reverts if insufficient balance

### Deposit Timing Abuse
- Rewards calculated via epoch snapshots
- Deposits do not retroactively earn rewards

### Pause Abuse
- Pause blocks all deposits and claims
- View functions remain available

---

## 6. Roles

| Role | Capabilities |
|----|-------------|
Guardian | Pause only |
Oracle | Submit settlement data |
Owner / Multisig | Unpause, config |
Users | Claim rewards |

No single role can:
- Pause + withdraw
- Oracle-update + withdraw
- Upgrade + oracle-report

---

## 7. Upgradeability

[Specify one]

- Non-upgradeable contracts (preferred)
OR
- UUPS with:
- implementation locked
- upgrade protected
- storage layout frozen

---

## 8. Known Risks & Assumptions

- Oracle quorum honesty assumed
- Off-chain mining performance not verifiable on-chain
- USDC blacklist risk acknowledged

These are disclosed to users.

---

## 9. Out of Scope

- Off-chain mining infrastructure
- Fiat conversions
- Exchange custody risk
- AI mining optimization logic

---

## 10. Contact

Security contact:
- email: security@cinexit.xyz
- disclosure window: 90 days

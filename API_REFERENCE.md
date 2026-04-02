# 📚 EarnWithAlee API Reference

This document outlines the traits and contracts available for integration within the EarnWithAlee ecosystem.

## 1. Event Logger Trait (`event-logger-trait`)
Standard interface for emitting reputation-impacting events.

**Functions:**
- `(log-event (string-ascii 50) principal (string-ascii 100) (ok bool))`
  - `event-type`: The name of the event (e.g., "check-in").
  - `user`: The principal associated with the event.
  - `metadata`: Additional context (e.g., "tier-up").

## 2. Builder Reputation Trait (`builder-reputation-trait`)
Standard interface for querying builder status.

**Functions:**
- `(get-reputation (principal) (response uint uint))`
  - Returns the numeric reputation score of a builder.
- `(get-tier (principal) (response (string-ascii 20) uint))`
  - Returns the ranking tier (e.g., "Master").
- `(is-verified (principal) (response bool uint))`
  - Returns true if the builder is verified by a project.

## 3. Implementation Contracts
- **`proof-of-builder`**: Identity registry linking GitHub IDs to Stacks addresses.
- **`daily-check-in`**: 24h heartbeat and streak tracking.
- **`builder-sbt`**: Soulbound Token implementation (SIP-009 compliant).
- **`treasury`**: Central fee consolidation and reward vault.

Frontend quick audit — findings & recommended fixes

Location: `frontend/` (and `frontends/` alternate UI folder)

Findings
--------
- ABI / Hook mismatch:
  - `frontend/hooks/useRewards.ts` expects a `claimable(user)` view and a `claim()` no-arg function.
  - Contract `RewardDistributor` exposes `claim(uint256 epochId)` and `claimBatch(uint256[] epochIds)` plus `previewClaim(address,uint256)` view.
  - Result: the current `Claim Rewards` button uses `claim()` (no args), which does not match the deployed contract signature and will fail.

- Multiple frontends directories:
  - There are two UI directories: `frontend/` and `frontends/` (maybe different versions). `frontends/lib/abis` contains ABIs that look closer to the contracts (e.g., `rewardDistributor.ts` includes `claim` and `claimBatch`). The active UI components in `frontend/` include inline ABI snippets that do not match the contracts.

- Missing ABI entries for recently-added helpers/events:
  - `RewardDistributor.previewClaim(address, uint256)` is present in contracts but not exposed in the `frontend` ABIs; this view is useful for quickly computing per-epoch claimable amounts.
  - `ParticipationVault.EpochFinalized` event exists in the contracts; some hooks look for epochFinalized (via EpochManager), but adding the event to ABI would help event-listening where needed.

Recommendations
---------------
1. Align ABIs and hooks with contracts (priority):
   - In `frontend/hooks/useRewards.ts`: replace the `claimable` view with a client-side aggregation that calls `previewClaim(user, epochId)` for recent epochs or add `previewClaim` to the ABI and a helper to sum claimable over epochs.
   - Update the `Claim Rewards` button in `frontend/app/page.tsx` to call `claimBatch` with the list of claimable epochIds (or call `claim` with a selected epoch) rather than calling `claim()` with no args.

2. Consolidate frontends: decide on a single primary frontend folder and migrate ABI files and hooks accordingly. `frontends/lib/abis/` has cleaner ABIs that match contracts and could be the source of truth.

3. Add `previewClaim` and `EpochFinalized` to the frontend ABI files where applicable to enable richer UI functionality (previewing per-epoch claim amounts, subscribing to finalization events).

4. Add a small unit/integration test in the MFE (or storybook) that simulates a claim flow to catch ABI mismatches in CI.

Suggested quick patch (minimal):
- Add `previewClaim` to `frontend` ABI and implement a simple `getTotalClaimable` helper that calls `previewClaim` for last N epochs and sums results.
- Change the `Claim Rewards` button's onClick to call `claimBatch` with the list of claimable epochs (available in the UI already as `claimable`).

If you'd like, I can make the minimal ABI + UI changes (small, localized edits) and add them to the PR draft so you can push and review.

Notes
-----
- I did not modify front-end code yet — this file documents my findings and suggested next steps.
- Let me know whether you prefer I implement the minimal frontend changes now (I can add a small commit to the branch), or leave them for a separate PR.

# Implementation Plan: Runner Upgrade — Strategic Review + Meta-analysis

## Phase 1: Foundation Scripts
- [x] Task 1.1: Create trend-analyzer.sh — read round summaries, output structured trend JSON
- [x] Task 1.2: Create scan-strategies.yaml — scan strategy definitions for runner Strategic Review

## Phase 2: Safety Architecture
- [x] Task 2.1: Restructure safety.yaml — add immutable_core + auto_fixable sections, preserve existing rules

## Phase 3: Runner Brain Upgrade
- [x] Task 3.1: Rewrite runner.md — add Step 1 Reasoning Self-check, Step 2 Strategic Review, Step 4 Meta-analysis, Step 5 enhanced summary

## Phase 4: Integration & Cleanup
- [x] Task 4.1: Smoke test — run trend-analyzer.sh with real data, verify runner.md coherence
- [x] Task 4.2: Update tracks.md and metadata.json

## Post-Implementation Checklist
- [x] trend-analyzer.sh outputs valid JSON for last 3 rounds
- [x] scan-strategies.yaml parseable by runner
- [x] safety.yaml immutable_core protects 4 files
- [x] runner.md has all 5 steps (self-check, strategic review, spawn, meta-analysis, summary)
- [x] Track metadata.json updated
- [x] tracks.md status updated

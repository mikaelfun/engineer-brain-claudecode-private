# Specification: Fix Cron Job Execution — Replace SDK query() with CLI subprocess

**Track ID:** cron-exec-fix_20260401
**Type:** Bug
**Created:** 2026-04-01
**Status:** Draft
**Issue:** ISS-199

## Summary

Dashboard cron job execution uses Claude Agent SDK `query()` which doesn't support slash commands. Replace with `claude -p` CLI subprocess that properly handles slash commands and skill system.

## Context

Dashboard's `cron-manager.ts` manages scheduled jobs (e.g., `/onenote-export sync` every 3 hours). The execution engine uses `@anthropic-ai/claude-agent-sdk` `query()` to run the prompt. However, SDK's `query()` doesn't recognize slash commands (a Claude Code CLI concept), causing all cron jobs to "succeed" in ~1.8 seconds without actually performing any work.

## Problem Description

1. User creates cron job with prompt `/onenote-export sync` via Dashboard UI
2. On trigger (manual or scheduled), `runTriggerNow()` calls SDK `query({ prompt: "/onenote-export sync" })`
3. SDK doesn't understand slash commands → likely responds with text → loop ends in 1.8s
4. `lastStatus` set to `"success"` despite no actual work done
5. **All cron jobs are affected**, not just onenote-export

## Acceptance Criteria

- [ ] Cron jobs using slash commands (e.g., `/onenote-export sync`) execute correctly via CLI
- [ ] Cron jobs using plain prompts (e.g., "summarize recent cases") still work
- [ ] Job execution captures real duration, exit code, and output summary
- [ ] Job status reflects actual success/failure (not just "prompt was sent")
- [ ] WebUI shows execution output/logs for debugging

## Dependencies

- `claude` CLI available in PATH (confirmed: `/c/Users/fangkun/AppData/Roaming/npm/claude`)
- Claude Code CLI supports `-p` (print mode) for non-interactive execution

## Out of Scope

- Cron expression improvements (ISS-196 covers UI management)
- Adding new cron job types
- Retry logic for failed jobs

## Technical Notes

- Use `child_process.spawn('claude', ['-p', prompt, '--cwd', projectRoot])` for execution
- Capture stdout/stderr for logging
- Set reasonable timeout (e.g., 30 minutes for long-running tasks like onenote sync)
- Preserve existing cron-jobs.json schema — only change execution engine

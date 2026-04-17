# AVD W365 Boot 启动模式 - Quick Reference

**Entries**: 1 | **21V**: all applicable
**Keywords**: agent, boot, delayed-start, servicespipetimeout, timeout
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | RDAgentBootLoader startup timeout at OS boot - session host shows Needs Assistan... | Boot loader service doesn't start fast enough during OS boot due to boot pressur... | Set RDAgentBootLoader to Automatic (Delayed Start); increase ServicesPipeTimeout... | 🔵 6.5 | MS Learn |

## Quick Triage Path

1. Check: Boot loader service doesn't start fast enough duri `[Source: MS Learn]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-boot.md#troubleshooting-flow)

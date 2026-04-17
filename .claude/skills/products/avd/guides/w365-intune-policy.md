# AVD W365 Intune 策略 - Quick Reference

**Entries**: 4 | **21V**: all applicable
**Keywords**: ai-enabled, cloud-device-agent, disk-expansion, edge-case, hyper-v, nested-virtualization, not-expanding, partial-expansion
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Semantic File Search not working on AI-enabled Cloud PC when nested virtualizati... | Nested virtualization conflicts with Semantic File Search on Cloud PCs | Disable Virtual Machine Platform, Windows Hypervisor Platform, and all Hyper-V f... | 🔵 7.5 | ADO Wiki |
| 2 📋 | UES auto-expanding disk does not expand despite high disk usage - disk stays at ... | Possible causes: Cloud Device Agent not healthy, policy/metadata settings miscon... | 1) Confirm user has existing profile disk. 2) Validate storage type and max size... | 🔵 7.5 | ADO Wiki |
| 3 📋 | UES auto-expanding disk - user runs out of storage before expansion completes, e... | Edge case where rapid large file operations (ISO downloads, OneDrive sync, git c... | This is a known edge case. Workaround: pre-expand disk by downloading smaller fi... | 🔵 7.0 | ADO Wiki |
| 4 📋 | UES auto-expanding disk expansion stops before reaching configured maximum size | Potential issue with expansion logic, Cloud Device Agent health, or storage plat... | 1) Validate max size configuration. 2) Check agent logs for expansion errors. 3)... | 🔵 7.0 | ADO Wiki |

## Quick Triage Path

1. Check: Nested virtualization conflicts with Semantic File `[Source: ADO Wiki]`
2. Check: Possible causes: Cloud Device Agent not healthy, p `[Source: ADO Wiki]`
3. Check: Edge case where rapid large file operations (ISO d `[Source: ADO Wiki]`
4. Check: Potential issue with expansion logic, Cloud Device `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-intune-policy.md#troubleshooting-flow)

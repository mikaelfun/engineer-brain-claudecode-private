# AVD W365 Boot 启动模式 - Comprehensive Troubleshooting Guide

**Entries**: 1 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-captive-portal-setup.md, ado-wiki-boot-to-cloud-btc-troubleshooting.md, ado-wiki-w365-boot-dedicated-pc-mode.md, ado-wiki-w365-boot-guided-scenario.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| RDAgentBootLoader startup timeout at OS boot - session host ... | Boot loader service doesn't start fast enough during OS boot... | Set RDAgentBootLoader to Automatic (Delayed Start); increase... |

### Phase 2: Detailed Investigation

#### Additional Private/Public Preview steps
> Source: [ado-wiki-a-captive-portal-setup.md](guides/drafts/ado-wiki-a-captive-portal-setup.md)

- Minimum Windows App version 2.0.916.0.

#### Boot To Cloud (BTC)
> Source: [ado-wiki-boot-to-cloud-btc-troubleshooting.md](guides/drafts/ado-wiki-boot-to-cloud-btc-troubleshooting.md)

These steps are meant to help diagnose and triage issues specifically

#### Important Clarification: Multi-user access
> Source: [ado-wiki-w365-boot-dedicated-pc-mode.md](guides/drafts/ado-wiki-w365-boot-dedicated-pc-mode.md)

Windows365 Boot can be deployed on either Shared PC mode or Dedicated PC mode.

#### Overview - What is the Windows 365 Boot Guided Scenario?
> Source: [ado-wiki-w365-boot-guided-scenario.md](guides/drafts/ado-wiki-w365-boot-guided-scenario.md)

> **Scope:** This page covers only the **Intune Guided Scenario** for Windows365 Boot - what it does, prerequisites, the exact resources it creates today, settings you'll see, known issues that affect

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | RDAgentBootLoader startup timeout at OS boot - session host shows Needs Assistan... | Boot loader service doesn't start fast enough during OS boot due to boot pressur... | Set RDAgentBootLoader to Automatic (Delayed Start); increase ServicesPipeTimeout... | 🔵 6.5 | MS Learn |

# AVD W365 Intune 策略 - Comprehensive Troubleshooting Guide

**Entries**: 4 | **Drafts fused**: 10 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-b-issues-routing-and-escalation-guide.md, ado-wiki-settings-framework-faq.md, ado-wiki-settings-framework-troubleshooting.md, ado-wiki-ues-automatic-cleanup-faq.md, ado-wiki-ues-automatic-cleanup-scoping-questions.md, ado-wiki-ues-automatic-cleanup-setup-guide.md, ado-wiki-ues-disks-auto-expand-faq.md, ado-wiki-ues-disks-expand-scoping-questions.md, ado-wiki-ues-disks-expand-setup-guide.md, ado-wiki-user-experience-sync-faq.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Semantic File Search not working on AI-enabled Cloud PC when... | Nested virtualization conflicts with Semantic File Search on... | Disable Virtual Machine Platform, Windows Hypervisor Platfor... |
| UES auto-expanding disk does not expand despite high disk us... | Possible causes: Cloud Device Agent not healthy, policy/meta... | 1) Confirm user has existing profile disk. 2) Validate stora... |
| UES auto-expanding disk - user runs out of storage before ex... | Edge case where rapid large file operations (ISO downloads, ... | This is a known edge case. Workaround: pre-expand disk by do... |
| UES auto-expanding disk expansion stops before reaching conf... | Potential issue with expansion logic, Cloud Device Agent hea... | 1) Validate max size configuration. 2) Check agent logs for ... |

### Phase 2: Detailed Investigation

#### AVD Sub-Issue Routing and Escalation Guide
> Source: [ado-wiki-b-issues-routing-and-escalation-guide.md](guides/drafts/ado-wiki-b-issues-routing-and-escalation-guide.md)

> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

#### Windows 365 Settings Framework FAQ
> Source: [ado-wiki-settings-framework-faq.md](guides/drafts/ado-wiki-settings-framework-faq.md)

Settings are split into three categories with distinct delivery paths:

#### Settings Framework Troubleshooting
> Source: [ado-wiki-settings-framework-troubleshooting.md](guides/drafts/ado-wiki-settings-framework-troubleshooting.md)

Monitor Settings Framework changes in **CPCD > Settings** or using Kusto.

*Contains 2 KQL query template(s)*

#### UES Automatic Cleanup - FAQ
> Source: [ado-wiki-ues-automatic-cleanup-faq.md](guides/drafts/ado-wiki-ues-automatic-cleanup-faq.md)

## Q1. What happens to the user after cleanup?

#### UES Automatic Cleanup - Scoping Questions
> Source: [ado-wiki-ues-automatic-cleanup-scoping-questions.md](guides/drafts/ado-wiki-ues-automatic-cleanup-scoping-questions.md)

## Environment and Configuration

#### UES Automatic Cleanup - Setup Guide
> Source: [ado-wiki-ues-automatic-cleanup-setup-guide.md](guides/drafts/ado-wiki-ues-automatic-cleanup-setup-guide.md)

## Step 1: Access policy storage settings

#### UES Disks Auto Expand - FAQ
> Source: [ado-wiki-ues-disks-auto-expand-faq.md](guides/drafts/ado-wiki-ues-disks-auto-expand-faq.md)

## Q1. When does disk expansion occur?

#### UES Disks Automatically Expand - Scoping Questions
> Source: [ado-wiki-ues-disks-expand-scoping-questions.md](guides/drafts/ado-wiki-ues-disks-expand-scoping-questions.md)

## 1. Environment & Configuration

#### UES Disks Automatically Expand - Setup Guide
> Source: [ado-wiki-ues-disks-expand-setup-guide.md](guides/drafts/ado-wiki-ues-disks-expand-setup-guide.md)

1. Admin creates or edits a UES-enabled policy

#### User Experience Sync FAQ
> Source: [ado-wiki-user-experience-sync-faq.md](guides/drafts/ado-wiki-user-experience-sync-faq.md)

| 1. What User data is persisted with this feature? | UES redirects the entire user profile including files and folders under C:\Users\%username% which importantly, also includes a user's NTUser.dat f

### Key KQL Queries

**Query 1:**
```kql
let TenantID = ''; // Enter TenantID
fn_GetSettingProfileEntity
| where ChangeType == "Update"
| where TenantId == TenantID
| extend SettingsArray = parse_json(Settings)
| mv-expand Setting = SettingsArray
| extend 
    SettingDefinitionId = tostring(Setting.SettingDefinitionId),
    Value = tostring(Setting.Value),
    SettingProfileID = tostring(Setting.ProfileId),
    Priority = toint(Setting.Priority)
| extend SettingDefinitionId = extract(@"[^.]+\.[^.]+\.(.+)", 1, SettingDefinitionId)
| pro
```

**Query 2:**
```kql
let TenantID = '';
let cluster = cluster("https://cloudpc.eastus2.kusto.windows.net").database("CloudPC").CloudPCEvent
| union (cluster("https://cloudpcneu.northeurope.kusto.windows.net").database("CloudPCProd").CloudPCEvent);
cluster
| where AccountId == TenantID
| where ApplicationName == "wset"
| where env_cloud_environment == "PROD"
| where Col1 contains "Created SettingProfileEntity:" or Col1 contains "Updated SettingProfileEntity:"
| extend JsonData = parse_json(extract(@"(?:Created|Update
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Semantic File Search not working on AI-enabled Cloud PC when nested virtualizati... | Nested virtualization conflicts with Semantic File Search on Cloud PCs | Disable Virtual Machine Platform, Windows Hypervisor Platform, and all Hyper-V f... | 🔵 7.5 | ADO Wiki |
| 2 | UES auto-expanding disk does not expand despite high disk usage - disk stays at ... | Possible causes: Cloud Device Agent not healthy, policy/metadata settings miscon... | 1) Confirm user has existing profile disk. 2) Validate storage type and max size... | 🔵 7.5 | ADO Wiki |
| 3 | UES auto-expanding disk - user runs out of storage before expansion completes, e... | Edge case where rapid large file operations (ISO downloads, OneDrive sync, git c... | This is a known edge case. Workaround: pre-expand disk by downloading smaller fi... | 🔵 7.0 | ADO Wiki |
| 4 | UES auto-expanding disk expansion stops before reaching configured maximum size | Potential issue with expansion logic, Cloud Device Agent health, or storage plat... | 1) Validate max size configuration. 2) Check agent logs for expansion errors. 3)... | 🔵 7.0 | ADO Wiki |

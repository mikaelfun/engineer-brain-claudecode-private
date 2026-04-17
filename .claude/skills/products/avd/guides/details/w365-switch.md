# AVD W365 Switch - Comprehensive Troubleshooting Guide

**Entries**: 5 | **Drafts fused**: 2 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-w365-switch-setup-guide.md, ado-wiki-w365-switch-troubleshooting-guide.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Stale Cloud PC remains in Windows 365 Switch Task view after... | Previously added Cloud PC is no longer accessible but entry ... | 1. Uninstall Windows App. 2. Reinstall Windows App. 3. Selec... |
| Reconnect button in disconnect message dialog does not work ... | Using the Reconnect option from disconnect dialog may fail t... | Let the disconnect complete fully, then launch a new connect... |
| Cloud PC quietly disconnects while user is focused on local ... | Cloud PCs connected via Task view are designed to quietly di... | When the re-connectable error message is displayed, reconnec... |
| After providing sign-in credentials when selecting Cloud PC ... | In some builds of Windows, the sign-in prompt flow does not ... | Select the Task view button for the Cloud PC again. The conn... |
| Local PC missing from Cloud PC Task view bar in Windows 365 ... | Azure Virtual Desktop (HostApp) may be outdated, causing the... | Uninstall and reinstall the Azure Virtual Desktop (HostApp) ... |

### Phase 2: Detailed Investigation

#### Windows 365 Switch Setup Guide
> Source: [ado-wiki-w365-switch-setup-guide.md](guides/drafts/ado-wiki-w365-switch-setup-guide.md)

Open the Windows app, choose one Cloud PC, select the ellipses, and then select **Add to Task view**. Only one Cloud PC can be added to your Task view.

#### Windows 365 Switch Troubleshooting Guide
> Source: [ado-wiki-w365-switch-troubleshooting-guide.md](guides/drafts/ado-wiki-w365-switch-troubleshooting-guide.md)

## Getting Logs for Windows 365 and AVDHostApp

*Contains 1 KQL query template(s)*

### Key KQL Queries

**Query 1:**
```kql
//Windows App correlationid sessionid lookup
let correlation = '<CORRELATION_ID>';
let SessionId = '';
let CorrelationId = ['correlation'];
cluster('https://cpctelemetry.eastus2.kusto.windows.net').database("CloudPC-EndUserExperience-Prod").windows365_user_action
| union (cluster('https://cpctelemetryneu.northeurope.kusto.windows.net').database('CloudPC-EndUserExperience-Prod').windows365_user_action)
| union cluster('https://cpctelemetry.eastus2.kusto.windows.net').database("CloudPC-EndUserExpe
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Stale Cloud PC remains in Windows 365 Switch Task view after user loses access t... | Previously added Cloud PC is no longer accessible but entry persists in Task vie... | 1. Uninstall Windows App. 2. Reinstall Windows App. 3. Select 'Add to Task view'... | 🔵 7.5 | ADO Wiki |
| 2 | Reconnect button in disconnect message dialog does not work properly or results ... | Using the Reconnect option from disconnect dialog may fail to re-establish a wor... | Let the disconnect complete fully, then launch a new connection using Task view ... | 🔵 7.5 | ADO Wiki |
| 3 | Cloud PC quietly disconnects while user is focused on local PC in Windows 365 Sw... | Cloud PCs connected via Task view are designed to quietly disconnect to avoid di... | When the re-connectable error message is displayed, reconnect through the messag... | 🔵 7.5 | ADO Wiki |
| 4 | After providing sign-in credentials when selecting Cloud PC from Task view, user... | In some builds of Windows, the sign-in prompt flow does not automatically naviga... | Select the Task view button for the Cloud PC again. The connection continues in ... | 🔵 7.5 | ADO Wiki |
| 5 | Local PC missing from Cloud PC Task view bar in Windows 365 Switch | Azure Virtual Desktop (HostApp) may be outdated, causing the local PC button to ... | Uninstall and reinstall the Azure Virtual Desktop (HostApp) app from the Microso... | 🔵 7.5 | ADO Wiki |

# AVD W365 Switch - Quick Reference

**Entries**: 5 | **21V**: all applicable
**Keywords**: black-screen, disconnect, hostapp, local-pc-missing, navigation, reconnect, sign-in, stale-cpc
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Stale Cloud PC remains in Windows 365 Switch Task view after user loses access t... | Previously added Cloud PC is no longer accessible but entry persists in Task vie... | 1. Uninstall Windows App. 2. Reinstall Windows App. 3. Select 'Add to Task view'... | 🔵 7.5 | ADO Wiki |
| 2 📋 | Reconnect button in disconnect message dialog does not work properly or results ... | Using the Reconnect option from disconnect dialog may fail to re-establish a wor... | Let the disconnect complete fully, then launch a new connection using Task view ... | 🔵 7.5 | ADO Wiki |
| 3 📋 | Cloud PC quietly disconnects while user is focused on local PC in Windows 365 Sw... | Cloud PCs connected via Task view are designed to quietly disconnect to avoid di... | When the re-connectable error message is displayed, reconnect through the messag... | 🔵 7.5 | ADO Wiki |
| 4 📋 | After providing sign-in credentials when selecting Cloud PC from Task view, user... | In some builds of Windows, the sign-in prompt flow does not automatically naviga... | Select the Task view button for the Cloud PC again. The connection continues in ... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Local PC missing from Cloud PC Task view bar in Windows 365 Switch | Azure Virtual Desktop (HostApp) may be outdated, causing the local PC button to ... | Uninstall and reinstall the Azure Virtual Desktop (HostApp) app from the Microso... | 🔵 7.5 | ADO Wiki |

## Quick Triage Path

1. Check: Previously added Cloud PC is no longer accessible `[Source: ADO Wiki]`
2. Check: Using the Reconnect option from disconnect dialog `[Source: ADO Wiki]`
3. Check: Cloud PCs connected via Task view are designed to `[Source: ADO Wiki]`
4. Check: In some builds of Windows, the sign-in prompt flow `[Source: ADO Wiki]`
5. Check: Azure Virtual Desktop (HostApp) may be outdated, c `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-switch.md#troubleshooting-flow)

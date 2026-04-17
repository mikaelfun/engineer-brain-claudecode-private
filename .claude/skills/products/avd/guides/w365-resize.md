# AVD W365 Resize 调整 - Quick Reference

**Entries**: 9 | **21V**: all applicable
**Keywords**: 403-forbidden, blob-storage, blockresizeforgen1vm, by-design, cse-handler, customscriptextension, disk-expansion, disk-full
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | After resizing a Cloud PC, the increased storage is not reflected within the mac... | The WinRE (Windows Recovery Environment) partition is enabled on the Cloud PC an... | Option 1 (Manual): Run DISKPART to select and delete the WinRE partition (DELETE... | 🔵 7.5 | ADO Wiki |
| 2 📋 | Windows 365 Cloud PC resize precheck fails with 'The requested feature is not su... | Resize precheck function (ResizePrecheckService.cs → BlockResizeForGen1VM) detec... | 1) Use CPCD CPC Availability section to confirm VM generation. 2) If CPC shows G... | 🔵 7.5 | ADO Wiki |
| 3 📋 | Windows 365 Cloud PC resize fails early before processing begins | Cloud PC not in Provisioned state before resize, or VM is Gen1 (Gen2 required) | 1) Confirm VM is Gen2. 2) Confirm Cloud PC was in Provisioned state. 3) Retry re... | 🔵 7.5 | ADO Wiki |
| 4 📋 | Windows 365 Cloud PC resize fails mid-process during snapshot or VM extension ph... | Snapshot creation failure or VM extension did not complete successfully during r... | 1) Check snapshot creation status. 2) Validate VM extension completion. 3) Retry... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Windows 365 Cloud PC resize with group-based licensing shows license/VM spec mis... | Group-based licensing assignment state inconsistency during resize V2 process | 1) Validate license assignment state. 2) Trigger retry from MEM portal. 3) Escal... | 🔵 7.5 | ADO Wiki |
| 6 📋 | Windows 365 Resize V2 fails with invalid disk size error when attempting to down... | Downsizing (reducing disk size) is not supported in Resize V2. Only equal or lar... | Resize only to equal or larger disk size SKU. Inform customer that downsizing is... | 🔵 7.5 | ADO Wiki |
| 7 📋 | Cloud PC resize fails with error CheckVmAgentStatus_customScriptExtensionHandler... | Stale registry key and folder for previous version of Microsoft.Compute.CustomSc... | Connect to impacted Cloud PC as admin: 1) reg delete "HKLM\SOFTWARE\Microsoft\Wi... | 🔵 7.5 | ADO Wiki |
| 8 📋 | Cloud PC resize/upgrade fails with RegisterRDAgent_internalError; blob download ... | Network connectivity issue preventing Cloud PC from accessing Windows 365 provis... | Investigate and fix network path between Cloud PC and blob storage URL (saprod.i... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Cloud PC inaccessible. CPCD: AVDStatus=Unavailable, FailType=RunScriptTimeout. H... | Cloud PC disk completely full preventing VM agent from functioning | Option 1: Restore Cloud PC to time when disk was not full, then clean up. Option... | 🔵 7.5 | ADO Wiki |

## Quick Triage Path

1. Check: The WinRE (Windows Recovery Environment) partition `[Source: ADO Wiki]`
2. Check: Resize precheck function (ResizePrecheckService.cs `[Source: ADO Wiki]`
3. Check: Cloud PC not in Provisioned state before resize, o `[Source: ADO Wiki]`
4. Check: Snapshot creation failure or VM extension did not `[Source: ADO Wiki]`
5. Check: Group-based licensing assignment state inconsisten `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-resize.md#troubleshooting-flow)

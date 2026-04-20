# AVD AVD Classic 迁移 - Quick Reference

**Entries**: 5 | **21V**: all applicable
**Keywords**: arm, authorization, avd-classic, contentidea-kb, drive-redirection, file-upload, host-pool, migration, migration-api, migration-mode, rate-limit, rdp-property, snapshot-import, throttling, validation
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Cannot create new host pool in WVD Classic tenant that is currently being migrat... | A WVD Classic tenant in migration mode cannot accept new host pool creation unti... | Either: 1) Create a new separate WVD Classic tenant for the new host pool; or 2)... | 🟢 8.0 | ADO Wiki |
| 2 📋 | Need to disable file upload option on WVD sessions. drivestoredirect:s:1 is set ... | Drivestore redirect value set to 1 in RDP properties for the WVD hostpool. | Classic: Set-RdsHostPool -CustomRdpProperty drivestoredirect:s:0. ARM: Change dr... | 🔵 6.5 | ContentIdea |
| 3 📋 | AVD (Classic) PowerShell error "User is not authorized to query the management s... | Customer account has no "RDS Owner" role on the tenant. Error: WVD_50001: user i... | Ask PG to manually grant the customer account the RDS Owner role on the AVD Clas... | 🔵 6.5 | ContentIdea |
| 4 📋 | Windows 365 Migration API importSnapshot fails with InvalidVHD error - VHD file ... | The uploaded VHD file is in VHDX or dynamic VHD format. Windows 365 snapshot imp... | Convert the VHD to fixed format before upload. Use Convert-VHD PowerShell cmdlet... | 🔵 6.0 | ADO Wiki |
| 5 📋 | Windows 365 Migration API importSnapshot fails with TooManyRequests error - dail... | The tenant has exceeded the daily request limit of 1000 importSnapshot API calls | Wait until the next day for the limit to reset. Implement rate limiting and batc... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: A WVD Classic tenant in migration mode cannot accept new hos... `[Source: ADO Wiki]`
2. Check: Drivestore redirect value set to 1 in RDP properties for the... `[Source: ContentIdea]`
3. Check: Customer account has no "RDS Owner" role on the tenant. Erro... `[Source: ContentIdea]`
4. Check: The uploaded VHD file is in VHDX or dynamic VHD format. Wind... `[Source: ADO Wiki]`
5. Check: The tenant has exceeded the daily request limit of 1000 impo... `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-migration-classic.md#troubleshooting-flow)
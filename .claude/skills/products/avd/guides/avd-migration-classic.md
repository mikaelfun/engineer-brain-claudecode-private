# AVD AVD Classic 迁移 - Quick Reference

**Entries**: 4 | **21V**: partial
**Keywords**: authorization, avd-classic, drive-redirection, file-upload, migration-api, rate-limit, rdp-property, snapshot-import
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Need to disable file upload option on WVD sessions. drivestoredirect:s:1 is set ... | Drivestore redirect value set to 1 in RDP properties for the WVD hostpool. | Classic: Set-RdsHostPool -CustomRdpProperty drivestoredirect:s:0. ARM: Change dr... | 🔵 6.5 | KB |
| 2 | AVD (Classic) PowerShell error "User is not authorized to query the management s... | Customer account has no "RDS Owner" role on the tenant. Error: WVD_50001: user i... | Ask PG to manually grant the customer account the RDS Owner role on the AVD Clas... | 🔵 6.5 | KB |
| 3 | Windows 365 Migration API importSnapshot fails with InvalidVHD error - VHD file ... | The uploaded VHD file is in VHDX or dynamic VHD format. Windows 365 snapshot imp... | Convert the VHD to fixed format before upload. Use Convert-VHD PowerShell cmdlet... | 🔵 6.0 | ADO Wiki |
| 4 | Windows 365 Migration API importSnapshot fails with TooManyRequests error - dail... | The tenant has exceeded the daily request limit of 1000 importSnapshot API calls | Wait until the next day for the limit to reset. Implement rate limiting and batc... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: Drivestore redirect value set to 1 in RDP properti `[Source: KB]`
2. Check: Customer account has no "RDS Owner" role on the te `[Source: KB]`
3. Check: The uploaded VHD file is in VHDX or dynamic VHD fo `[Source: ADO Wiki]`
4. Check: The tenant has exceeded the daily request limit of `[Source: ADO Wiki]`

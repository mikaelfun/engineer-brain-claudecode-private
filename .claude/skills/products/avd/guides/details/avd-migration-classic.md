# AVD AVD Classic 迁移 - Issue Details

**Entries**: 4 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. Need to disable file upload option on WVD sessions. drivestoredirect:s:1 is set in RDP properties.
- **ID**: `avd-contentidea-kb-030`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: Drivestore redirect value set to 1 in RDP properties for the WVD hostpool.
- **Solution**: Classic: Set-RdsHostPool -CustomRdpProperty drivestoredirect:s:0. ARM: Change drivestoredirect from 1 to 0 in Azure portal RDP properties.
- **Tags**: drive-redirection, file-upload, RDP-property, contentidea-kb

### 2. AVD (Classic) PowerShell error "User is not authorized to query the management service."
- **ID**: `avd-contentidea-kb-069`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: Customer account has no "RDS Owner" role on the tenant. Error: WVD_50001: user is not authorized, code=Forbidden errorCode=UnauthorizedAccess.
- **Solution**: Ask PG to manually grant the customer account the RDS Owner role on the AVD Classic tenant using New-RdsRoleAssignment cmdlet with -RoleDefinitionName "RDS Owner".
- **Tags**: avd-classic, authorization, contentidea-kb

### 3. Windows 365 Migration API importSnapshot fails with InvalidVHD error - VHD file is not a fixed hard ...
- **ID**: `avd-ado-wiki-c-r1-003`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: The uploaded VHD file is in VHDX or dynamic VHD format. Windows 365 snapshot import only supports fixed-format VHD files
- **Solution**: Convert the VHD to fixed format before upload. Use Convert-VHD PowerShell cmdlet: Convert-VHD -Path source.vhdx -DestinationPath dest.vhd -VHDType Fixed. Ensure data file is 10MB-2TB and OS disk only (no data disks)
- **Tags**: migration-api, vhd-format, snapshot-import, validation

### 4. Windows 365 Migration API importSnapshot fails with TooManyRequests error - daily request limit exce...
- **ID**: `avd-ado-wiki-c-r1-005`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: The tenant has exceeded the daily request limit of 1000 importSnapshot API calls
- **Solution**: Wait until the next day for the limit to reset. Implement rate limiting and batching in the migration automation. Spread large migration waves across multiple days
- **Tags**: migration-api, throttling, rate-limit, snapshot-import

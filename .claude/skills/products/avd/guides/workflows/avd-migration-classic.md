# AVD Classic 迁移 — Troubleshooting Workflow

**Scenario Count**: 5
**Generated**: 2026-04-18

---

## Scenario 1: Cannot create new host pool in WVD Classic tenant that is cu...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Either: 1) Create a new separate WVD Classic tenant for the new host pool; or 2) Complete the in-progress migration first before creating new host pools

**Root Cause**: A WVD Classic tenant in migration mode cannot accept new host pool creation until migration completes or is aborted

## Scenario 2: Need to disable file upload option on WVD sessions. drivesto...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Classic: Set-RdsHostPool -CustomRdpProperty drivestoredirect:s:0. ARM: Change drivestoredirect from 1 to 0 in Azure portal RDP properties.

**Root Cause**: Drivestore redirect value set to 1 in RDP properties for the WVD hostpool.

## Scenario 3: AVD (Classic) PowerShell error "User is not authorized to qu...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Ask PG to manually grant the customer account the RDS Owner role on the AVD Classic tenant using New-RdsRoleAssignment cmdlet with -RoleDefinitionName "RDS Owner".

**Root Cause**: Customer account has no "RDS Owner" role on the tenant. Error: WVD_50001: user is not authorized, code=Forbidden errorCode=UnauthorizedAccess.

## Scenario 4: Windows 365 Migration API importSnapshot fails with InvalidV...
> Source: ADO Wiki | Applicable: ❓

### Troubleshooting Steps
- Convert the VHD to fixed format before upload. Use Convert-VHD PowerShell cmdlet: Convert-VHD -Path source.vhdx -DestinationPath dest.vhd -VHDType Fixed. Ensure data file is 10MB-2TB and OS disk only (no data disks)

**Root Cause**: The uploaded VHD file is in VHDX or dynamic VHD format. Windows 365 snapshot import only supports fixed-format VHD files

## Scenario 5: Windows 365 Migration API importSnapshot fails with TooManyR...
> Source: ADO Wiki | Applicable: ❓

### Troubleshooting Steps
- Wait until the next day for the limit to reset. Implement rate limiting and batching in the migration automation. Spread large migration waves across multiple days

**Root Cause**: The tenant has exceeded the daily request limit of 1000 importSnapshot API calls

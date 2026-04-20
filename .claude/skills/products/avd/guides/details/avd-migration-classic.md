# AVD AVD Classic 迁移 - Comprehensive Troubleshooting Guide

**Entries**: 5 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, ContentIdea

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Cannot create new host pool in WVD Classic tenant that is currently be... | A WVD Classic tenant in migration mode cannot accept new host pool cre... | Either: 1) Create a new separate WVD Classic tenant for the new host p... |
| Need to disable file upload option on WVD sessions. drivestoredirect:s... | Drivestore redirect value set to 1 in RDP properties for the WVD hostp... | Classic: Set-RdsHostPool -CustomRdpProperty drivestoredirect:s:0. ARM:... |
| AVD (Classic) PowerShell error "User is not authorized to query the ma... | Customer account has no "RDS Owner" role on the tenant. Error: WVD_500... | Ask PG to manually grant the customer account the RDS Owner role on th... |
| Windows 365 Migration API importSnapshot fails with InvalidVHD error -... | The uploaded VHD file is in VHDX or dynamic VHD format. Windows 365 sn... | Convert the VHD to fixed format before upload. Use Convert-VHD PowerSh... |
| Windows 365 Migration API importSnapshot fails with TooManyRequests er... | The tenant has exceeded the daily request limit of 1000 importSnapshot... | Wait until the next day for the limit to reset. Implement rate limitin... |

### Phase 2: Detailed Investigation

#### Entry 1: Cannot create new host pool in WVD Classic tenant that is cu...
> Source: ADO Wiki | ID: avd-ado-wiki-0892 | Score: 8.0

**Symptom**: Cannot create new host pool in WVD Classic tenant that is currently being migrated; error 'HostPool cannot be created. Environment is in migration mode and being converted to ARM.'

**Root Cause**: A WVD Classic tenant in migration mode cannot accept new host pool creation until migration completes or is aborted

**Solution**: Either: 1) Create a new separate WVD Classic tenant for the new host pool; or 2) Complete the in-progress migration first before creating new host pools

> 21V Mooncake: Applicable

#### Entry 2: Need to disable file upload option on WVD sessions. drivesto...
> Source: ContentIdea | ID: avd-contentidea-kb-030 | Score: 6.5

**Symptom**: Need to disable file upload option on WVD sessions. drivestoredirect:s:1 is set in RDP properties.

**Root Cause**: Drivestore redirect value set to 1 in RDP properties for the WVD hostpool.

**Solution**: Classic: Set-RdsHostPool -CustomRdpProperty drivestoredirect:s:0. ARM: Change drivestoredirect from 1 to 0 in Azure portal RDP properties.

> 21V Mooncake: Applicable

#### Entry 3: AVD (Classic) PowerShell error "User is not authorized to qu...
> Source: ContentIdea | ID: avd-contentidea-kb-069 | Score: 6.5

**Symptom**: AVD (Classic) PowerShell error "User is not authorized to query the management service."

**Root Cause**: Customer account has no "RDS Owner" role on the tenant. Error: WVD_50001: user is not authorized, code=Forbidden errorCode=UnauthorizedAccess.

**Solution**: Ask PG to manually grant the customer account the RDS Owner role on the AVD Classic tenant using New-RdsRoleAssignment cmdlet with -RoleDefinitionName "RDS Owner".

> 21V Mooncake: Applicable

#### Entry 4: Windows 365 Migration API importSnapshot fails with InvalidV...
> Source: ADO Wiki | ID: avd-ado-wiki-c-r1-003 | Score: 6.0

**Symptom**: Windows 365 Migration API importSnapshot fails with InvalidVHD error - VHD file is not a fixed hard disk format (VHDX or dynamic VHD rejected)

**Root Cause**: The uploaded VHD file is in VHDX or dynamic VHD format. Windows 365 snapshot import only supports fixed-format VHD files

**Solution**: Convert the VHD to fixed format before upload. Use Convert-VHD PowerShell cmdlet: Convert-VHD -Path source.vhdx -DestinationPath dest.vhd -VHDType Fixed. Ensure data file is 10MB-2TB and OS disk only (no data disks)

> 21V Mooncake: Not verified

#### Entry 5: Windows 365 Migration API importSnapshot fails with TooManyR...
> Source: ADO Wiki | ID: avd-ado-wiki-c-r1-005 | Score: 6.0

**Symptom**: Windows 365 Migration API importSnapshot fails with TooManyRequests error - daily request limit exceeded (more than 1000 requests per day)

**Root Cause**: The tenant has exceeded the daily request limit of 1000 importSnapshot API calls

**Solution**: Wait until the next day for the limit to reset. Implement rate limiting and batching in the migration automation. Spread large migration waves across multiple days

> 21V Mooncake: Not verified

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.

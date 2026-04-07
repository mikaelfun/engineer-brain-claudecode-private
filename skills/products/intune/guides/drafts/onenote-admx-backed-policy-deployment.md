# ADMX-Backed Policy Deployment via Intune OMA-URI

## Overview
Guide for deploying on-premises GPO policies as ADMX-backed custom OMA-URI profiles in Intune, including migration from Group Policy to MDM.

## Tools
- **GPSearch**: https://gpsearch.azurewebsites.net/ - Check ADMX & registry key values
- **MMAT (MDM Migration Analysis Tool)**: https://github.com/WindowsDeviceManagement/MMAT - Identify which GPO policies can be migrated to MDM

## Step-by-Step Process

### 1. Find the Policy CSP
Search the corresponding CSP in Policy CSP docs. Example for `BootStartDriverInitialization`:
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/System/BootStartDriverInitialization`
- Determine scope: `./User` or `./Device`
- Locate ADMX name and policy name from CSP docs (e.g., `earlylauncham.admx`, policy `POL_DriverLoadPolicy_Name`)

### 2. Get the ADMX Source File
- If ADMX ships with Windows: copy from `%SystemRoot%\policydefinitions`
- If custom: obtain from vendor

### 3. Ingest ADMX via Intune
OMA-URI for ingestion:
```
./Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/{appname}/Policy/admxfile01
```
- `{appname}` = ADMX filename without extension (e.g., `earlylauncham`)
- Data Type: String
- Value: Full content of the .admx file (copy from Notepad++)

### 4. Configure Specific Settings
- Check element type from ADMX content: Text, MultiText, Boolean, Enum, Decimal, or List
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/{Area}/{PolicyName}`
- Value format: `<enabled/><data id="{elementId}" value="{value}"/>`

Example:
```xml
<enabled/><data id="SelectDriverLoadPolicy" value="8"/>
```

### 5. Verify Deployment

#### Client Side
1. **Access Work or School** > Info > check policy listed
2. **Registry locations**:
   - `HKLM\Software\Microsoft\PolicyManager\Providers\{ProviderGUID}\default\Device\{Area}`
   - `HKLM\Software\Microsoft\Provisioning\NodeCache\CSP\Device\MS DM Server\Nodes\{NodeId}`

#### MDM Diagnostic Log
- Export from Settings > Access Work or School > Export management log
- Check `EndtraceRegistry.txt` for policy values

#### Kusto Query
```kql
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "<deviceId>"
| where message contains "<keyword>"
| project env_time, ActivityId, deviceId, PolicyName=name, PolicyType=typeAndCategory,
          Applicability=applicablilityState, Compliance=reportComplianceState, TaskName, EventId, EventMessage, message
| order by env_time asc
```

## Known Limitations
- Some CSPs are **Enterprise/Education edition only** (e.g., AppVirtualization) - Professional edition shows "Not applicable"
- Always verify CSP edition support before deploying

## References
- Understanding ADMX-backed policies: https://docs.microsoft.com/en-us/windows/client-management/mdm/understanding-admx-backed-policies
- Enable ADMX-backed policies: https://docs.microsoft.com/en-us/windows/client-management/mdm/enable-admx-backed-policies-in-mdm

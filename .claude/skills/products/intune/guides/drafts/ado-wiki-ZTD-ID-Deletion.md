---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/SAW Actions/SAW Team Member Reference/ZTD ID Deletion"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FSAW%20Actions%2FSAW%20Team%20Member%20Reference%2FZTD%20ID%20Deletion"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# SAW Process: Autopilot ZTDID Device De-registration

**SAW Team Members Only** - Requires PME account in Intune-Support-SAW-Users group (OneIdentity).

## Step 1: Verify pre-requisites
- If needed, request diagnostic cab file
- Open MdmDiagReport_RegistryDump.reg or AutopilotDDSZTDFile.json, search for "ZtdRegistrationId"
- Run Kusto query on IntuneGlobalProd_DeviceService_Device to verify device

## Step 2: Execute Lookup in Jarvis
- Portal: https://portal.microsoftgeneva.com/actions
- Environment: Public → Microsoft Intune → Windows Autopilot Support Operations → Look up device by hardware hash
- Get Access with Work-Item ID: 187261959

## Step 3: Execute Deregister
- Deregister device by registration/ZTD ID with TenantId and RegistrationId from lookup

## Step 4: Verify
- Run lookup again, confirm DeletedTime changed from NULL to current date

## Step 5-7: Record & Notify
- Add note to ICM 187261959: "DFM case# | ZTD ID Deletion"
- Add notes to DFM case
- Notify case owner (Non-ATZ SAW)

## Surface Devices
- Option 1: Customer contacts Surface support for deregistration
- Option 2: Email deviceAPEsc@microsoft.com with case#, serial numbers, tenant name

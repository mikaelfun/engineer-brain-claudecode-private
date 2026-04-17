---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/MDE Compliance"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FMDE%20Compliance"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting compliance issues between MDE and Intune

This article provides a step-by-step guide for performing investigations using Kusto queries to analyze data related to Microsoft Defender for Endpoint (MDE) and Microsoft Intune.

## Prerequisites

- MDE Supportability Entitlement: CoreIdentity (mtpkustosupp-mwdt)
- MDE Scrubbed Clusters: CoreIdentity (mtpscrubbedk-x5ze)
- Intune Events: CoreIdentity (intunekustop-iav4)
- Cluster: https://wcdprod.kusto.windows.net/
- Cluster: https://intune.kusto.windows.net/Intune

## Step 1 - Confirm notification sent from MDE to Intune

```kusto
cluster('wcdprod').database('Geneva').
IntuneDeviceStateUpdates
| where AadDeviceId == ""
| where OrgId == ""
| project UploadTime, DeviceState, MdeDeviceId, AadDeviceId, AadTenantId, UploadGuid, UploadSource
```

Key fields: UploadTime, UploadStatus, UploadGUID (cross-reference in Intune).

**DeviceState values:**
- **Secured** — device fits compliance, signal received within threshold
- **Deactivated** — device exceeded compliance grace period (7 or 14 days). Requires deeper investigation into device health from MDE perspective.

Threshold configured in: Intune > Endpoint Security > Microsoft Defender for Endpoint > "Number of days until partner is unresponsive"

## Step 2A (Deactivated) - Investigating device heartbeat to MDE

```kusto
let _MACHINEIDVAR = "";
let _ORGIDVAR = "";
macro-expand WcdScrubbedData as X (
    X.MachineInfoEvents
    | where MachineId == _MACHINEIDVAR
    | where OrgId == _ORGIDVAR)
| project MachineId, OrgId, ReportArrivalTimeUtc
```

Look for gaps in ReportArrivalTimeUTC to identify periods of inactivity.

## Step 2B (Secured) - Investigating compliance data received by Intune

```kusto
IntuneEvent
| where env_cloud_name == cloudName
| where env_time between (startTime .. endTime)
| where ComponentName == "PartnerAPI"
| where Col3 startswith "Received data upload message [{\"EntityType\":1,\""
| where Col3 contains aadDeviceId
| project env_time, Col1, Col3
```

Compare Col1 (MessageID) with UploadGuid from Step 1.

## Step 3 - Checking device compliance status

```kusto
IntuneEvent
| where env_cloud_name == "cloudName"
| where env_time between (startTime .. endTime)
| where ServiceName == "StatelessComplianceCalculationService"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
| where DeviceId == "deviceId"
| project env_time, ServiceName, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, cV, ScenarioType, TraceLevel, ActivityId
```

## Step 4 - Verifying Entra compliance patching

```kusto
IntuneEvent
| where env_cloud_name == "cloudName"
| where env_time between (startTime .. endTime)
| where ComponentName == "MSGraphHelper"
| where EventUniqueName == "MSGraphUpdateDeviceSuccessfully"
| where AccountId == intuneAccountId
| where DeviceId contains aadDeviceId
| project env_time, Col1, Col2, Col3, Col4, cV, ActivityId, ScenarioType
```

Col3 shows: IsCompliant, ComplianceExpirationDateTime, IsManaged, MdmAppId

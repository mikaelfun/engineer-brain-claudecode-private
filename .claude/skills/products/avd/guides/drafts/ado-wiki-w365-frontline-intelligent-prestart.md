---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Frontline/Frontline Dedicated/Intelligent pre-start for Frontline"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Frontline/Frontline%20Dedicated/Intelligent%20pre-start%20for%20Frontline"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intelligent Pre-start for Frontline - Investigation Guide

## Overview

Intelligent pre-start predicts when a Frontline user will log in and pre-starts the Cloud PC before the predicted login time to improve user experience.

## Kusto Queries

### 1. Daily Prestart History (Tenant Level)

Provides insights into daily prestart history: predicted devices, active/inactive predictions, execution count, success/failure, and improved user experience count.

```kql
let tenantId = "<Placeholder for Tenant ID>";
let cutoffDate = datetime(6-6-2025); // GA date
cluster('cpcdeedprptprodgbl.eastus2').database('Reporting').DailyFrontlinePreStartPredictionCalculation_Snapshot
| where UsageDate >= cutoffDate
| where TenantId == tenantId
| summarize PredictedDevices=sum(DeviceCount), PredictedActiveDevices=sumif(DeviceCount, PredictedUserActive == "Active"), PredictedInactiveDevices=sumif(DeviceCount, PredictedUserActive == "Inactive") by UsageDate
| join kind=leftouter(
    cluster('cpcdeedprptprodgbl.eastus2').database('Reporting').DailyFrontlinePreStart_Snapshot
    | where UsageDate >= cutoffDate
    | where TenantId == tenantId
    | summarize ExecutedDevices=sum(DevicesCount), SuccessfullyPrestartedDevices=sumif(DevicesCount, PreStartReasonCode == "Success"), PrestartFailedDevices=sumif(DevicesCount, PreStartReasonCode != "Success") by UsageDate
) on UsageDate
| join kind=leftouter(
    cluster('cpcdeedprptprodgbl.eastus2').database('Reporting').DailyFrontlinePreStartStopOperations_Snapshot
    | where UsageDate >= cutoffDate
    | where TenantId == tenantId
    | summarize ImprovedUserExperienceCount=sumif(DevicesCount, IsImprovedUserExperience) by UsageDate
) on UsageDate
| project UsageDate, PredictedDevices, PredictedActiveDevices, PredictedInactiveDevices, ExecutedDevices, SuccessfullyPrestartedDevices, PrestartFailedDevices, ImprovedUserExperienceCount
```

### 2. Daily Prestart Failure Breakdown

```kql
let tenantId = "<Placeholder for Tenant ID>";
let cutoffDate = datetime(6-6-2025);
cluster('cpcdeedprptprodgbl.eastus2').database('Reporting').DailyFrontlinePreStart_Snapshot
| where UsageDate >= cutoffDate
| where TenantId == tenantId
| where PreStartReasonCode != "Success"
| summarize DevicesCount = sum(DevicesCount) by UsageDate, PreStartReasonCode
```

## Reason Codes

| Code | Meaning |
|------|---------|
| ExpectedTermination-CloudPCHoldingLicense | User already active and using the machine |
| ExpectedTermination-CloudPCExpectedPowerState | Cloud PC already running, prestart not needed. SkipDeallocationIsEnabled means no deallocation due to capacity outage |
| DeviceActionRequestNotAccepted | Another action already executing on device (e.g., user connect/disconnect) |
| CASUpdateAccessStateFailed | User already active or no more licenses available |
| Cancelled | License removed, Cloud PC in deprovisioning |
| AzureComputeError | AllocationFailed, VmStartTimeOut, or Azure internal errors |
| ExpectedTermination-CloudPCDoesNotExistException | Cannot get workspace from RMS |

## Per-Device Investigation

### Query 3: Device Prestart History

Shows per-device prestart details including prediction, execution time, success/failure, stop workflow, and user experience improvement. Uses multi-cluster union across all regions:

- NA01: cpccradxigprna01.eastus / cpccradxidprna01.eastus
- NA02: cpccradxigprna02.centralus / cpccradxidprna02.centralus
- EU01: cpccradxigpreu01.northeurope / cpccradxidpreu01.northeurope
- EU02: cpccradxigpreu02.westeurope / cpccradxidpreu02.westeurope
- AP01: cpccradxigprap01.southeastasia / cpccradxidprap01.southeastasia
- AU01: cpccradxigprau01.australiaeast / cpccradxidprau01.australiaeast

Tables:
- `idledetect.DailyFrontlinePreStartPredictionCalculationByDevice_Snapshot`
- `idledetect.FrontlinePreStartDataEntity_FastStream`
- `idledetect.DailyFrontlinePreStartStopOperationsByDevice_Snapshot`

### Query 4: Future Predictions

Check `idledetect.FrontlinePredictionDataEntity_Snapshot` for DayOfObservation >= today.

### Query 5: User Activity Check

If Cloud PC not in prediction results, check if user was active on at least 4 of past 30 days using `idledetect.DailyDeviceActivities15MinAggByDevice_Snapshot`.

## Notes

- If user predicted inactive: PredictedPreStartTimeUTC empty, no prestart that day
- Stop only scheduled after successful prestart (PrestartReasonCode == Success)
- Empty stop fields = stop cancelled due to user connecting after prestart

## Escalation

- SaaF team: Use PR 13191154 investigation guide
- Prediction model questions: Contact Sathvik
- Other questions: Contact Nurlan/Naga/Sandhya

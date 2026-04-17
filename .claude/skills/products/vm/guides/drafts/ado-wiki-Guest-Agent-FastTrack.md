---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/GA/Guest Agent FastTrack_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FGA%2FGuest%20Agent%20FastTrack_AGEX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Guest Agent FastTrack

## What is FastTrack?

FastTrack skips Fabric when updating goal state and writes directly to the VMArtifactsProfile blob. Agents poll this every 3 seconds (Windows) or each decision cycle (Linux).

## When is FastTrack Used?

CRP uses FastTrack when ALL of these are true:
1. Only extension changes present (no other changes)
2. Subscription or regional setting enabled for FastTrack
3. No keyvault secrets
4. Agent reports FastTrack support (via Etag header from HostGAPlugin)

## How it Works

1. CRP writes goal state to VMArtifactsProfile blob (skips tenant pipeline)
2. Agent polls blob every 3 seconds
3. HostGAPlugin returns 304 (no change) or 200 (with new etag)
4. Agent translates blob into ExtensionsConfig and runs pipeline

### Linux vs Windows Behavior
- **Linux**: Retrieves both Fabric and FastTrack goal states each cycle; always runs Fabric first
- **Windows**: Polls blob on separate thread; only processes if no current Fabric change

## Debugging

### Getting VMArtifactsProfile Blob
- **Windows**: `C:\WindowsAzure\Config\*.xml` → look for InVmArtifactsProfileBlob
- **Linux**: `/var/lib/waagent/history/{date}/ExtensionConfig.xml`

### CRP Debugging (Kusto)
```kql
cluster("azcrp").database("crp_allprod").ContextActivity
| where activityId =~ "<operationId>"
| project PreciseTimeStamp, message
```

Key messages:
- `VM has FastTrack only changes` → FastTrack used
- `Only FastTrack components have changed, but still using the tenant pipeline because FastTrack is not enabled` → eligible but not enabled
- `Agent on VM {0} doesn't support FastTrack` → agent doesn't support it

### Agent Log Messages
- **Windows**: "Received new extensions in the VmArtifactsProfile blob", "Processing goal state from VmArtifactsProfile"
- **Both**: "Goal state method was {0}. New goal state method: {1}"

## Tracking Goal State Method
- **Windows**: Registry key `LastGoalStateMethod` for extension handler; `VMAP_ExtensionConfig.json`
- **Linux**: File called `LastGoalState`

## Escalations
Support/EEE GA/PA - https://aka.ms/CRI-GAPA

---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Host or AVD Agent/Health Check Failures/URLCheck/Agent can't talk to Broker"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FWorkflows%2FHost%20or%20AVD%20Agent%2FHealth%20Check%20Failures%2FURLCheck%2FAgent%20can%27t%20talk%20to%20Broker"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Agent Can't Talk to Broker - Troubleshooting Guide

## Step 1: Collect MSRD-Collect
Run MSRD-Collect diagnostic tool on the session host.

## Step 2: Review Application Logs
Look for Event ID 3277 in Application event log.

## Step 3: Check Proxy Configuration
- Review `_Proxy.txt` from MSRD-Collect output
- If VM goes through proxy:
  - Confirm all WVD URLs are whitelisted
  - SSL inspection must be turned off for all WVD URLs
  - Ask customer to remove proxy temporarily to test
  - If help needed with proxy config, send collab to on-prem Networking

## Step 4: Check NVA (Network Virtual Appliance)
- Ask customer if VM routes through NVA
- If yes:
  - Confirm all WVD URLs are whitelisted
  - SSL inspection must be turned off for all WVD URLs
  - If help needed with NVA config, send collab to ANP

## Step 5: Confirm TLS 1.2 and Supported Ciphers
- Verify TLS 1.2 is enabled on the VM
- Verify supported ciphers are enabled

## Kusto Queries

### RDOperation (Broker Connection Failures)
```kql
cluster("rdsprod.eastus2").database("WVD").RDOperation
| union cluster("rdsprodus.eastus2").database("WVD").RDOperation
| union cluster("rdsprodeu.westeurope").database("WVD").RDOperation
| where HostInstance == "<VM NAME>"
| where Name contains "broker"
| where PreciseTimeStamp >= ago(1d)
| where ResType != "Success"
| project PreciseTimeStamp, ActivityId, HostInstance, Role, Name, ResType, ResSignature, ResDesc
```

### RDInfraTrace (WebSocket Errors)
```kql
cluster("rdsprod.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodus.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodeu.westeurope").database("WVD").RDInfraTrace
| where HostInstance == "<VM NAME>"
| where PreciseTimeStamp >= ago(1d)
| where Role == "RDAgent" and Msg contains "System.Net.Websockets"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, HostInstance, Msg
```

## Browser Tests (On Session Host VM)
1. Open registry: `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\RDInfraAgent`
2. Note values of `BrokerURI` and `BrokerURLGlobal`
3. Open browser and navigate to:
   - `https://<BrokerURI>/api/health`
   - `https://<BrokerURIGlobal>/api/health`
4. Both pages should load successfully
5. If network is blocking, pages will not load

> **Note**: WVD-Agent event 3701 can be misleading. Agent only reports URL as inaccessible when DNS resolution fails. Agent does a plain HTTP connect; if successful, it reports accessible. This does not prove the VM can successfully talk to WVD service.

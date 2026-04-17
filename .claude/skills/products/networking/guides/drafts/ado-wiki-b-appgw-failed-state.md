---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Failed State on Application Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFailed%20State%20on%20Application%20Gateway"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Failed State on Application Gateway — Systematic Troubleshooting

## Step 1: Get the Right Operation ID from NRP

1. In ASC → Application Gateway → **Operations** → set time range → Search
2. Filter OperationName to **PutApplicationGatewayOperation**
3. Find the **first failed Operation ID** — subsequent failures won't provide useful info
4. Look for the Operation ID where one entry shows Succeeded and one shows Failed

## Step 2: Check NRP Frontend Logs

```kql
cluster('Nrp').database("mdsnrp").FrontendOperationEtwEvent
| where OperationId == "XXXXXXXXXXX"
| where TIMESTAMP > datetime("2024-08-23 00:00") and TIMESTAMP < datetime("2024-08-23 23:59")
| project PreciseTimeStamp, Message, ActivityId, OperationId, CorrelationRequestId, InternalCorrelationId
```

**Common NRP error patterns:**
- Resource not in Succeeded state → cascading failure from prior failed operation
- GwmOperationTimeOut → GWM cannot communicate with GWT (check UDR/NSG/DNS/BGP)

## Step 3: Check Gateway Manager (GWM) Logs

```kql
cluster("hybridnetworking.kusto.windows.net").database('aznwmds').AsyncWorkerLogsTable
| where PreciseTimeStamp >= datetime(2024-08-20 00:00) and PreciseTimeStamp <= datetime(2024-08-20 23:59)
| where ActivityId contains "XXXXXXXXXXXX"
| where Message contains ("exception")
```

**Common GWM error patterns:**
- `ApplyUpdateThroughWebApi: Application Gateway update failed due to Timeout` → connectivity GWM↔GWT issue
- `Failed to get secret ServiceBusConnectionString in KeyVault` → internal KeyVault connectivity
- `StorageException: (404) Not Found` → storage issue
- `HostName: *.xxx is not valid` → invalid configuration

**⚠️ Timeout in GWM = GWM cannot communicate with GWT. Check: UDR, NSG, Custom DNS, Private DNS Zones, BGP (VPN/ExpressRoute)**

## Step 4: Check Gateway Tenant (GWT) Logs

```kql
cluster('Hybridnetworking').database('aznwmds').ApplicationGatewayTenant
| where PreciseTimeStamp >= datetime(2024-08-08 00:00) and PreciseTimeStamp <= datetime(2024-08-08 23:59)
| where GatewayId contains "XXXXXXXXXXX"
| where Level contains "Error"
| where ActivityName contains "Update"
| project PreciseTimeStamp, ActivityName, Level, Msg
```

**Common GWT error patterns:**
- `ssl_stapling ignored, host not found in OCSP responder` → DNS resolution failure for OCSP
- `Failed to obtain refreshed identity credentials` → Managed Identity issue
- **⚠️ Errors with `appgwkv-` prefix = Internal AppGW KeyVault**, NOT customer's KeyVault → indicates GWM↔GWT connectivity issues

## Step 5: Check Control Plane Detailed (Configuration Changes)

1. Open [Jarvis CRUD Dashboard](https://portal.microsoftgeneva.com/s/70398C3E) with Activity ID from GWM
2. Navigate to **OperationHistory on GWM** → copy **ResourceDiff** column
3. Paste into Notepad → look for lines starting with "+" (changes)
4. Identify what customer changed that caused the failure

## Troubleshooting Specific Causes

### DNS Resolution Failures
- Use [CRUD Dashboard](https://portal.microsoftgeneva.com/s/165A6199) with correct GatewayManagerActivityID
- Navigate to Tenant Logs → Fast Update Logs
- Look for: `host not found in OCSP responder "ocsp.sectigo.com"`
- PTA can verify DNS resolution via **Jarvis Actions**
- Fix: Customer must fix their DNS servers to resolve required FQDNs

### NSG Issues
- Ensure Gateway Manager inbound rule exists (GatewayManager service tag)

### UDR Issues
- Route 0.0.0.0/0 with Next Hop NVA is blocked for new deployments
- Do NOT add AppGW subnet itself to UDR with Next Hop NVA → breaks internal connectivity

### Storage/KeyVault Errors
- `ResourceNotFound (404)` → check blob/secret existence
- `SecretNotFound` → certificate deleted from KeyVault, may need recovery

## Getting Effective Routes (TA Only)
- Use Jarvis: [NRP > Gateway > Execute Application Gateway Operation](https://portal.microsoftgeneva.com/D8E2D4E5)
- Returns effective routes and NSG rules when Test Traffic is not working

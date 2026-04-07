---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Log Sources For Application Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Log%20Sources%20For%20Application%20Gateway"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Log Sources For Application Gateway

## Overview
Various log sources for Azure Application Gateway SR troubleshooting.

---

## General Logs

### Get Application Gateway (Jarvis)
- **Path:** Jarvis Actions > Brooklyn > Application Gateways > Get Application Gateway
- **Sample Query:** https://portal.microsoftgeneva.com/682FCE71
- **Use:** Pull raw JSON config for any v1/v2/WAF gateway. Used when ASC is unavailable; review traffic flow configuration.

### Request Response Logs
- **V1:** Jarvis Logs > AppGWT > ReqRespLogs — [Query](https://portal.microsoftgeneva.com/ABBCDEAC). Filter by deployment ID in tenant.
- **V2:** Jarvis Logs > AppGWT > ReqRespLogs — [Query](https://portal.microsoftgeneva.com/s/457F313F). Additional fields vs v1.
- **Error log:** Jarvis Logs > AppGWT > ReqRespErrorLog — [Query](https://portal.microsoftgeneva.com/3E25EEB2)

### Backend Health Check
- **Backend health status (probe failures):** Jarvis Logs > AppGWT > BackendServerDiagnosticHistory — [Query](https://portal.microsoftgeneva.com/976FE850)
- **Note:** Log frequency ≠ configured probe interval.

### Health Probe Failure Reason Codes
- **AppGW < 10.5:** Jarvis Logs > AppGWT > InformationLogEvent — [Query](https://portal.microsoftgeneva.com/F7181783)
  - For v1: filter `where it.any("ARR")`; for v2: filter `where it.any("backend")`
- **AppGW ≥ 10.5:** Jarvis Logs > AppGWT > ApplicationGatewayTenant — [Query](https://portal.microsoftgeneva.com/4FD40271)
- Reason code descriptions: [Information Log Reason Codes wiki](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/312769/Information-Log-Reason-Codes)

### LinuxAsmSyslog
- **Path:** Jarvis Logs > AppGWT > LinuxAsmSyslog — [Query](https://portal.microsoftgeneva.com/s/10A98705)

---

## WAF Firewall Logs
- **Path:** Jarvis Logs > AppGWT > ApplicationGatewayFirewallLog — [Query](https://portal.microsoftgeneva.com/s/C5AB1D75)
- Filter by WAF deployment ID in Tenant.

**KQL to columnize WAF firewall logs:**
```kusto
source
| extend json=parse_json(properties)
| extend instanceId = trim('"',json.instanceId)
| extend clientIp = trim('"',json.clientIp)
| extend requestUri = trim('"',json.requestUri)
| extend ruleId = trim('"',json.ruleId)
| extend ruleGroup = trim('"',json.ruleGroup)
| extend message = trim('"',json.message)
| extend action = trim('"',json.action)
| extend detailsmessage = trim('"',tostring(json.details.message))
| extend detailsdata = trim(@'[\{\}"]',tostring(json.details.data))
| extend details = strcat("Message: ", detailsmessage, "\r\nData: ", detailsdata)
| extend hostname = trim('"',json.hostname)
| extend transactionId = trim('"',json.transactionId)
| extend policyId = trim('"',json.policyId)
| extend policyScope = trim('"',json.policyScope)
| extend policyScopeName = trim('"',json.policyScopeName)
| extend engine = trim('"',json.engine)
| project-away detailsdata, detailsmessage, json
```

---

## Application Gateway CRUD Logs

### Control Plane Dashboards
- **Control Plane Dashboard:** https://portal.microsoftgeneva.com/s/4C202BEF — Filter by Resource URI
- **Control Plane Detailed Dashboard:** https://portal.microsoftgeneva.com/dashboard/share/AF85701A — Filter by GatewayManagerActivityId

### AppGwOperationHistoryLogsTable (Kusto)
Shows exactly what was added/removed on an AppGW for each PUT operation.

**Azure Public:**
```kusto
cluster("Hybridnetworking").database("aznwmds").AppGwOperationHistoryLogsTable
| where PreciseTimeStamp > ago(1d)
| where GatewayId =~ "00000000-0000-0000-0000-000000000000"
| where isnotempty(ConfigDiff)
| extend OrderNr = toint(substring(SequenceNumber,0,indexof(SequenceNumber,"/")))
| order by StartTimeUtc asc, OrderNr asc
| project StartTimeUtc, OrderNr, ConfigDiff, CorrelationRequestId, ActivityId, NewConfig, OldConfig, Status
```

**Azure Government/Fairfax:**
```kusto
cluster("Aznwff").database("aznwmds").AppGwOperationHistoryLogsTable
| where PreciseTimeStamp > ago(1d)
| where GatewayId =~ "00000000-0000-0000-0000-000000000000"
| where isnotempty(ConfigDiff)
| order by StartTimeUtc asc, OrderNr asc
| project StartTimeUtc, OrderNr, ConfigDiff, CorrelationRequestId, ActivityId, NewConfig, OldConfig, Status
```

**Use case:** Customer reports 502s after making changes. Check AppGW operations tab in ASC for PUT timing, then use this query to see exactly what changed (ConfigDiff shows +/- format).

### GatewayManagerLogsTable
```kusto
cluster('HybridNetworking').database('aznwmds').GatewayManagerLogsTable
| where * contains "operationId" // OperationID from NRP
| where PreciseTimeStamp >= datetime("2019-11-01 00:00") and PreciseTimeStamp <= datetime("2019-11-02 00:00")
| project PreciseTimeStamp, Message, ActivityId, CustomerSubscriptionId
```

### AsyncWorkerLogsTable
```kusto
cluster('HybridNetworking').database('aznwmds').AsyncWorkerLogsTable
| where OperationId == "operationId from NRP"
| where PreciseTimeStamp >= datetime("2019-11-01 00:00") and PreciseTimeStamp <= datetime("2019-11-02 00:00")
| project PreciseTimeStamp, Message, OperationId, OperationName, CustomerSubscriptionId
```

### QosEtwEvent (NRP)
```kusto
cluster('Nrp').database("mdsnrp").QosEtwEvent
| where SubscriptionId == "sub guid"
| where ResourceName == "resource name string"
| where HttpMethod != "GET"
| where PreciseTimeStamp >= datetime("2019-11-01 00:00") and PreciseTimeStamp <= datetime("2019-11-02 00:00")
| project PreciseTimeStamp, OperationName, UserError, Success, ErrorDetails, OperationId, CorrelationRequestId
```

### HTTP Incoming/Outgoing Requests (ARM)
```kusto
// Run under armprodgbl.eastus.kusto.windows.net
macro-expand isfuzzy=true ARMProdEG as X
(
    X.database('Requests').HttpIncomingRequests
    | union (X.database('Requests').HttpOutgoingRequests)
    | where subscriptionId == "00000000-0000-0000-0000-000000000000"
    | where PreciseTimeStamp >= datetime(2020-06-01)
    | where httpMethod != "GET"
    | order by PreciseTimeStamp asc
    | project PreciseTimeStamp, TaskName, correlationId, operationName, httpMethod, httpStatusCode, targetUri
)
```
**Use:** First stop for any CRUD issue. Filter by subscription + time range → get correlation IDs.

### Azure Key Vault Logs (AZKMS)
- **Path:** Jarvis Logs > AZKMS > ServiceOperation/ServiceOperationAggregated/ServiceTraces — [Query](https://portal.microsoftgeneva.com/s/437FC2E0)
- **Note:** Must be accessed from SAW with GME or AME credentials. Requires membership in `GME\AZKV-LOGACCESS-GME` or `AME\AZKV-LOGACCESS-AME`.

---

## Application Gateway Ingress Controller (AGIC) Queries

### List all AppGWs managed by AGIC
```kusto
cluster('Aznw').database('aznwcosmos').ApplicationGatewaysExtendedLatest
| where UserTags contains "managed-by-k8s-ingress"
| where CustomerSubscriptionId == "sub id"
| project CustomerSubscriptionId, CloudCustomerName, TenantCountryCode, GatewayName, UserTags
```

### Count AppGWs managed by AGIC
```kusto
cluster('Aznw').database('aznwcosmos').ApplicationGatewaysExtendedLatest
| where UserTags contains "managed-by-k8s-ingress" or Config contains "k8s-fp" or Config contains "k8s-ag-ingress-fp"
| where CustomerSubscriptionId == "sub id"
| summarize sum(InstanceCount), count(), make_list(GatewayName), make_list(GroupName), make_list(UserTags)
```

### Find when a listener was added/removed (Kusto)
```kusto
let AutoscaleInstanceRefreshOp=toscalar(AsyncWorkerLogsTable
| where PreciseTimeStamp between (todatetime("2025-05-01 18:28:00") .. todatetime("2025-08-02 20:28:21"))
| where OperationName == "PutVMSSApplicationGatewayWorkItem"
| where Message contains "Updating Instance List"
| where Message contains "whatever.com-https"
| project "AutoscaleRefreshInstanceDetails"
);
AppGwOperationHistoryLogsTable
| where PreciseTimeStamp between (todatetime("2025-05-01 18:28:00") .. todatetime("2025-08-02 18:28:21"))
    and GatewayName == "APPGWNAME"
| where OperationName == "PutVMSSApplicationGatewayWorkItem"
| where ResourceDiff contains "whatever.com-https"
| summarize ConfigDiff=make_list(ConfigDiff), ResourceDiff=make_list(ResourceDiff)
    by StartTimeUtc, Tenant, OperationType, UpdateOperationType, ActivityId, GatewayName, Status
```

---

## DNS Verification
Follow the [DNS Verification wiki](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/602044/DNS-verification) for AppGW v2 DNS resolution testing.

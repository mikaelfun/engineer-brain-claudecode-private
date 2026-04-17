---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/How To/Deployment Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FDeployment%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# First Checks
---
- Verify that there is subnet named "AzureBastionSubnet"
- Verify the size of the subnet is /27 or larger 
- In ASC the "DNS name" has a GUID that is the Tenant ID / ARM Resource ID / Resource GUID
- Can you repro the issue yourself?
- Get the specific time in UTC of the attempted action
- Do you have the CorrelationRequestID from the customer error?
- Get the time of the failed attempt and use that to find a failed Operation in ASC from that you can get the CorrelationRequestID

# 4 Methods to find a bastion host's information:
---
- **ASC** → Microsoft.Networks.bastionHosts → (Bastion Name) → Properties
- **By SubscriptionID:**
```kusto
// Run under Aznw cluster
cluster('Aznw').database('aznwcosmos').['GatewayManager.BastionHostTable']
| where Lens_IngestionTime > ago(1d)
| where RowKey contains "bh_"
| where ResourceGroupName == "dev-totalrewards-rg" and CustomerSubscriptionId contains "00000000-0000-0000-0000-000000000000"
| project ResourceArmId, CustomerSubscriptionId, ResourceGroupName, CreationTime, TenantVersion
```
- **By Tenant:**
```kusto
cluster('Aznw').database('aznwcosmos').['GatewayManager.BastionHostTable'] 
| where Lens_IngestionTime > ago(1d)
| where RowKey contains "bh_"
| where TenantVersion == "0.0.0.0"
| project ResourceArmId, CustomerSubscriptionId, ResourceGroupName, Region, TenantVersion
```
- **By VNetID:**
```kusto
cluster('Aznw').database('aznwcosmos').['GatewayManager.BastionHostTable'] 
| where Lens_IngestionTime > ago(1d)
| where RowKey contains "bh_"
| where VnetId == "00000000-0000-0000-0000-000000000000"
| project ResourceArmId, CustomerSubscriptionId, ResourceGroupName, VnetId, TenantVersion
```

# Specific Errors

## Public IP Quota error
---
**Error:** `Public IP Allocation failed. Please increase Public IP quota and try again. (Code: GatewayAllocationFailedDueToInsuffcientPublicIPs)`

**Mitigation:** Check multiple quota types via Jarvis → NRP Quota Operation → Get NRP Subscription Quota Details:
- `maxPublicIpsPerSubscription`
- `maxStaticPublicIpsPerSubscription`
- `maxStandardSkuPublicIpsPerSubscription`

Verify that `"Usage"` does not exceed those quotas. If exceeded, open a collaboration with the Subscription team to increase quotas.

# Manually tracking an Operation — ARM → NRP → GWM

## ARM
---
There are 3 basic outcomes: Success, 400 Bad Request, Timeout.

### HttpIncomingRequests
```kusto
// Run under armprodgbl.eastus.kusto.windows.net
macro-expand isfuzzy=true ARMProdEG as X
(
    X.database('Requests').HttpIncomingRequests
    | extend $cluster = X.$current_cluster_endpoint
    | where TIMESTAMP >= datetime(2020-03-03 18:00) and TIMESTAMP <=datetime(2020-03-03 19:00)
    | where subscriptionId == "00000000-0000-0000-0000-000000000000"
    | where * has "bastiontest-host" //Bastion Hostname
    | where Deployment == "f84f0469feed4316bb8266d03ea86ca5" //ARM ResourceID
    | where httpMethod != "GET"
    //| where httpStatusCode == long(400)
    //| where correlationId contains "00000000-0000-0000-0000-000000000000"
    | order by PreciseTimeStamp asc
)
```

### HttpOutgoingRequests
```kusto
macro-expand isfuzzy=true ARMProdEG as X
(
    X.database('Requests').HttpOutgoingRequests
    | extend $cluster = X.$current_cluster_endpoint
    | where TIMESTAMP >= datetime(2020-03-03 18:00) and TIMESTAMP <=datetime(2020-03-03 19:00)
    | where subscriptionId == "00000000-0000-0000-0000-000000000000"
    | where * has "bastiontest-host"
    | where Deployment == "f84f0469feed4316bb8266d03ea86ca5"
    | where httpMethod != "GET"
    | where httpStatusCode == long(400)
    | order by PreciseTimeStamp asc
)
```

### EventServiceEntries (only if error happened in ARM)
```kusto
macro-expand isfuzzy=true ARMProdEG as X
(
    X.database('Requests').EventServiceEntries
    | extend $cluster = X.$current_cluster_endpoint
    | where TIMESTAMP >= datetime(2020-03-03 18:00) and TIMESTAMP <=datetime(2020-03-03 19:00)
    | where subscriptionId == "00000000-0000-0000-0000-000000000000"
    | project TIMESTAMP, operationName, resourceUri, eventName, status, subStatus, properties
)
```

## NRP
---
```kusto
cluster('Nrp').database('mdsnrp').FrontendOperationEtwEvent 
| where TIMESTAMP >= datetime(2020-03-03 18:00) and TIMESTAMP <=datetime(2020-03-03 19:00)
| where SubscriptionId == "00000000-0000-0000-0000-000000000000"
| where ResourceGroup == "BastionTest-RG"
| where httpMethod != "GET"
| where Message contains("error")
| where correlationId contains "00000000-0000-0000-0000-000000000000"
| order by PreciseTimeStamp asc
```

### QOS ETW Events
```kusto
cluster('Nrp').database('mdsnrp').QosEtwEvent 
| where TIMESTAMP >= datetime(2024-04-01 20:00:00) and TIMESTAMP <= datetime(2024-04-02 20:04:00)
| where SubscriptionId == "aa20f69b-db26-42b9-bfd6-352dfa42382e"
| where ResourceName contains 'M1-ALZ-VNET-CLOUDOPS-S-1-HUB'
| where HttpMethod != 'GET'
| order by PreciseTimeStamp asc
```

## GWM
---

### AsyncWorkerLogsTable
```kusto
cluster("hybridnetworking").database("aznwmds").AsyncWorkerLogsTable 
| where TIMESTAMP >= datetime(2020-05-05 21:00) and TIMESTAMP <=datetime(2020-05-08 23:59)
| where OperationName contains "Bastion" and Message contains "gateway-deployment failed"
| where ServicePrefix contains "wavnet"
| where Message contains "00000000-0000-0000-0000-000000000000" //Bastion Arm Id
//| where VirtualNetworkId contains "00000000-0000-0000-0000-000000000000"
| where CorrelationRequestId contains "00000000-0000-0000-0000-000000000000"
| project ActivityId, CustomerSubscriptionId, DeploymentId, Message, ServicePrefix, VirtualNetworkId
```

### GatewayManagerLogsTable
```kusto
cluster("hybridnetworking").database("aznwmds").GatewayManagerLogsTable
| where TIMESTAMP >= datetime(2020-05-05 21:00) and TIMESTAMP <=datetime(2020-05-08 23:59)
| where CorrelationRequestId contains "00000000-0000-0000-0000-000000000000"
| project PreciseTimeStamp, Action, ClientOperationId, EventName, EventDescription, Message, operationId
```

### Timeouts in GWM
If a timeout is found, verify:
- NSGs are not blocking access to Gateway Manager
- UDRs are not preventing routing (Note: UDRs are not allowed on AzureBastionSubnet)
- BGP routes
If unresolved → file an IcM.

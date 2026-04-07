---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure Private DNS zones/Troubleshoting missing dns records"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FTroubleshoting%20missing%20dns%20records"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Missing DNS records

[[_TOC_]]

## Description
---
This document outlines steps that CSS can use to identify the cause for unexpectedly missing records, either internal virtual network records or Private DNS zone records.

## Scenario  
---
Both virtual Network DNS records and records for Private DNS zones linked with auto-registration enabled can dynamically update records via DHCP calls. This wiki outlines steps to confirm if the reason for records update in Private DNS. 

## For Private DNS zones with auto-registration enabled
---
Since customer do not have direct write access or any control over iDNS record management we should not check for control plane operations specific to iDNS. Rather this should be check though internal DHCP calls made from the specific Virtual machines affected.
In order to understand this process, and follow along with the specific log sources relevant to it, please refer to the following wiki article:    
 
[How iDNS records get registered in Azure](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/137927/How-iDNS-records-get-registered-in-Azure?anchor=check-when-the-vm-has-been-stopped/started%2C-since-dns-records-are-deleted-and-registered-again-for-these-operations)

## Records are deleted for a Private DNS zone:

### ***Troubleshooting steps***:

In case customer refers to a record n "not resolving", but record deletion is not clear yet:   

### 1. Confirm DNS is correctly reaching Azure Resolver with the correct VNET scope
---
When resolving internal DNS records for a given virtual Network or Private DNS zone, we need to confirm that the DNS request is originated from the correspondent VNET, since only DNS clients from the same VNET are expected to resolve these records, either for Azure Internal DNS or Private DNS zones.   

In order to confirm this, make sure to review the **EDNSScopeName** field in the DNS in ***[PrivateDnsRr](https://portal.microsoftgeneva.com/s/807B5165)*** Jarvis logs. This field should match the VnetID for the correspondent virtual network.

PrivateDnsRr: https://portal.microsoftgeneva.com/s/807B5165

In case we see the response returns an RCODE3 (NXDOMAIN) we can confirm that the record we are looking for does not exist in the correspondent zone.

**Clarification note:** QTYPE=28 requests AAAA records which don't exist in VNet internal records by default.   
For additional details see "[QTYPES and RCODES](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/471483/QTYPES-and-RCODES)"

### 2. Look for record changes
Check for customer triggered changes using Kusto (privatedns.westus/gcp):

```kusto
QosEtwEvent
| where TIMESTAMP between (datetime("2021-08-12 15:30:00")..datetime("2021-08-12 15:45:00Z"))
| where RequestUrl has @"00000000-0000-0000-0000-000000000000"  // SubscriptionID
| where RequestUrl has "privatelink.database.windows.net"       // Private DNS zone
| where OperationName == "Microsoft.WindowsAzure.Dns.FrontendDns.Operations.PrivateDNS.PutZoneResourceRecordsOperation"
// or for removal:
| where OperationName == "Microsoft.WindowsAzure.Dns.FrontendDns.Operations.PrivateDNS.DeleteZoneResourceRecordsOperation"
| where RequestUrl has "test"  // Recordname
| where OperationName !contains "Get"
| project TIMESTAMP, OperationName, RequestUrl 
```

Alternatively via Jarvis Logs: [PrivateDnsControlPlane/QosEtwEvent](https://portal.microsoftgeneva.com/s/F13766F0)  
Filter by **ResourceURL** for specific zone/record. Look for `PutZoneResourceRecordsOperation` and `DeleteZoneResourceRecordsOperation`.

---
### 3. Confirm the Identity of the user or application that triggered the change
 
Use the `PrincipalOId` field in ARMProd/HTTPIncoming to get the unique identifier:

```kusto
// Run under armprodgbl.eastus.kusto.windows.net
macro-expand isfuzzy=true ARMProdEG as X
(
    X.database('Requests').HttpIncomingRequests
    | extend $cluster = X.$current_cluster_endpoint
    | where (TIMESTAMP >= datetime("2022-04-29 10:00") and TIMESTAMP < datetime("2022-04-29 14:30"))
    | where subscriptionId == "00000000-0000-0000-0000-000000000000"
    | where correlationId == "00000000-0000-0000-0000-000000000000"
    | where operationName contains "DELETE" and httpMethod contains "PRIVATEDNSZONES"
    | where targetUri contains "<PrivateDnsZoneName>" and targetUri contains "<RecordsetName>" 
    | project PreciseTimeStamp, httpMethod, operationName, targetUri, correlationId, principalOid
)
```

Then look up the user/app in "Azure AD Explorer" in Azure Support Center.

### Confirm the reason for a change performed by "Azure Traffic Manager and DNS"

---
If `principalOid` maps to the internal app "Azure Traffic Manager and DNS" (used by NRP to reach private DNS zones), correlate with NRP operation. Typically a `DeletePrivateEndpoint` or resource group deletion.

Use NRP/FrontentOperationEtwEvents: https://portal.microsoftgeneva.com/s/C3838244

Look for messages like:
```
Deleted A records in parallel. Records: [<subscriptionId>,
{"RequestId":"...",
"PrivateDnsZoneArmId":"<PrivateDnsZoneResourceId>",
...
"RecordSetName":"<recordSetName>",
```

The NRP operation's `principalOId` can then be looked up to identify the action that triggered the record deletion.

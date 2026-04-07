---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/WCX Specific Content/OCE APIs/CloudPC Redeploying"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FWCX%20Specific%20Content%2FOCE%20APIs%2FCloudPC%20Redeploying"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CloudPC Redeploying via OCE API

When facing RDP connection difficulties or application access issues on a Cloud PC, redeploying may help. Azure shuts down the VM, moves it to a new node, and powers it back on retaining all configuration.

## JIT Access Preparation

Same as other OCE APIs - JIT elevate to CMDCPCSupport-JIT-PE-PlatformServiceOperator via Torus.

## Redeploying Steps

### 1. Get Device Data (Kusto)

```kql
let GetDataFrom = (clusterName:string)
{
cluster(clusterName).database('WVD').RDAgentMetadata
| join kind=leftouter (
cluster('cpcdeedprptprodgbl.eastus2.kusto.windows.net').database('Reporting').DeviceEntity_MV
) on $right.DeviceResourceId == $left.AzureResourceId
| where HostInstance contains "<Managed Device Name>"
| top 1 by Timestamp desc
| project UniqueId, TenantId, HostInstance
};
GetDataFrom('rdsprodus.eastus2') | union GetDataFrom('rdsprodeu.westeurope') | union GetDataFrom('rdsprodgb.uksouth')
```

### 2. Call OCE API

CloudPC OCE > ResourceMgmt Actions > Trigger Device Action:
- TenantId, Device Id from Kusto
- Device Action Type = 16 (Redeploy)
- Batch mode available

### 3. Check Progress

Monitor redeploy status in ASC.

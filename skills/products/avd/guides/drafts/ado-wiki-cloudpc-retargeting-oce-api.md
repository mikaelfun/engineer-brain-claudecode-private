---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/WCX Specific Content/OCE APIs/CloudPC Retargeting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FWCX%20Specific%20Content%2FOCE%20APIs%2FCloudPC%20Retargeting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CloudPC Retargeting OCE API

Retargeting is the combination of unassign session host + reinstall RD agent + reassign session host. Use this OCE API for session host or RD agent related issues.

## JIT Access Preparation

1. Enroll in SaaF Tours if not Torus enrolled
2. Join **CMDCPCSupport** eligibility in OSP Identity (8 hour provisioning)
3. JIT elevate (4 hour access): `Request-AzureAdGroupRoleElevation -GroupName 'CMDCPCSupport-JIT-PE-PlatformServiceOperator' -Reason "<reason>"`
4. **[SAW Enforced]** Navigate to Geneva Action portal > CloudPC OCE > Provision Actions > Trigger generic action by SaaF

## Retargeting Steps

### 1. Prepare OCE API parameters

- **Device ID** + **Tenant ID**: from Kusto query below
- **Request ID**: randomly generated GUID
- **Action Type**: `1`

```kql
let GetDataFrom = (clusterName:string) {
  cluster(clusterName).database('WVD').RDAgentMetadata
  | join kind=leftouter (cluster('cpcdeedprptprodgbl.eastus2.kusto.windows.net').database('Reporting').DeviceEntity_MV)
    on $right.DeviceResourceId == $left.AzureResourceId
  | where HostInstance contains "<Managed Device Name>"
  | top 1 by Timestamp desc
  | project UniqueId, TenantId, HostInstance
};
GetDataFrom('rdsprodus.eastus2') | union GetDataFrom('rdsprodeu.westeurope') | union GetDataFrom('rdsprodgb.uksouth')
```

### 2. Customer Lockbox approval

```powershell
Request-ElevatedAccess_V2.ps1 -Role AccessToCustomerData -Reason "CloudPC Retargeting - ICM number" -Tenant [TenantId] -RequestNumber [CaseNumber] -DurationHours 4
```

If customer has lockbox enabled, they must also approve. Approvals tracked via email.

### 3. Call OCE API

Fill all 4 parameters and run Geneva action.

---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/WCX Specific Content/OCE APIs/W365 Front Line OCE API"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FWCX%20Specific%20Content%2FOCE%20APIs%2FW365%20Front%20Line%20OCE%20API"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows 365 Frontline OCE API (Concurrent Access Service)

## Available OCE APIs

- **[CloudPC] Update Concurrent Access CPC Status** by CPC Id
- **[Config] Update Concurrent Access Configuration** by CloudPCSizeId
- **[Config][ConsistencyCheck] Run Configuration Consistency Check** for tenant
- **[Config] Delete Concurrent Access Configuration** by Tenant and CloudPCSizeId

## JIT Access Preparation

1. If not Torus enrolled, follow SaaF Tours
2. Join **CMDCPCSupport** eligibility at OSP Identity (8 hours provisioning)
3. JIT elevate:
   ```
   Request-AzureAdGroupRoleElevation -GroupName 'CMDCPCSupport-JIT-PE-PlatformServiceOperator' -Reason "<reason>"
   ```
4. **[SAW Enforced]** Navigate to Geneva Action portal, login with Torus account

## Update CAS using CPC Id

Path: CloudPC OCE > Concurrent Access Service Actions > [CloudPC] Update CPC Status

- **Concurrent Access CloudPC Id** = Workspace Id (from CPC Diagnostic Tool)
- **Tenant ID** = TenantId
- **Endpoint** = ScaleUnit

## Update CAS using CloudPCSizeId

Path: CloudPC OCE > Concurrent Access Service Actions > [Config] Update Configuration

- **CloudPCSizeId** = ServicePlanId

### Get ServicePlanId via Kusto

```kql
DailyTenantEntity_Snapshot
| distinct TenantId, Name, ServicePlanName, ServicePlanId, CapabilityStatus, PrepaidEnabledUnit, PrepaidWarningUnit
| where ServicePlanId in (
    "51855c77-4d2e-4736-be67-6dca605f2b57",
    "aa8fbe7b-695c-4c05-8d45-d1dddf6f7616",
    "64981bdb-a5a6-4a22-869f-a9455366d5bc",
    "50ef7026-6174-40ba-bff7-f0e4fcddbf65",
    "dd3801e2-4aa1-4b16-a44b-243e55497584",
    "2d1d344e-d10c-41bb-953b-b3a47521dca0",
    "48b82071-99a5-4214-b493-406a637bd68d",
    "e4dee41f-a5c5-457d-b7d3-c309986fdbb2",
    "1e2321a0-f81c-4d43-a0d5-9895125706b8",
    "fa0b4021-0f60-4d95-bf68-95036285282a",
    "057efbfe-a95d-4263-acb0-12b4a31fed8d"
)
| where CapabilityStatus == "Enabled"
| summarize TotalLicenses = sum(PrepaidEnabledUnit) + sum(PrepaidWarningUnit) by Name, TenantId, ServicePlanName, ServicePlanId
```

## Run Consistency Check

Path: CloudPC OCE > Concurrent Access Service Actions > [Config][ConsistencyCheck]

## Delete CAS Configuration

Path: CloudPC OCE > Concurrent Access Service Actions > [Config] Delete Configuration

- **CloudPCSizeId** = ServicePlanId

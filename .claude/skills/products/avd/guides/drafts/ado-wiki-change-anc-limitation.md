---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/WCX Specific Content/OCE APIs/Change ANC (OnPremConnection) Limitation for Customer"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FWCX%20Specific%20Content%2FOCE%20APIs%2FChange%20ANC%20(OnPremConnection)%20Limitation%20for%20Customer"
importDate: "2026-04-05"
type: troubleshooting-guide
---

> **Stop**: This information should only be followed by WCX PMs and SaaF teams. These steps do not apply to CSS.

## JIT Access Preparation

1. Open M365 Identity & Access Management (https://m365pulse.microsoft.com/idm/identity/access/Overview), join **CMDCPCSupport** Eligibility
2. Open Torus Client, run command to JIT Elevate:
   ```
   Request-AzureAdGroupRoleElevation -GroupName <JIT GROUP> -Reason "your reason"
   ```

### DataAccessLevels

The `<JIT GROUP>` depends on the access required:
- ReadOnly: **CMDCPCSupport-JIT-CustomerServiceViewer**
- ReadWrite: **CMDCPCSupport-JIT-PE-PlatformServiceOperator**

## Steps

1. **[SAW Enforced]** Navigate to Geneva Action portal (Actions | Jarvis) in SAW machine
2. Select Environment (Public = PE), click "GO to Geneva Action"
3. Filter 'CloudPC', find extension and operations

## APIs

### Create or update OnPremConnectionLimitation

Sets or modifies OPNC limitation for a tenant.

**IMPORTANT**: The TenantId field does not check for trailing spaces — ensure none are present.

Parameters:
- **Endpoint**: Scale unit of the tenant. Find via Kusto:
  ```kql
  CloudPCEvent
  | project env_cloud_environment, env_cloud_name, ApplicationName, ContextId
  | where ApplicationName in ("conn", "connFunction")
  | where ContextId == "<TenantId>"
  | distinct env_cloud_name
  ```
- **Tenant ID**: Target tenant
- **Partner ID**: Use appropriate GUID:
  - CPC: `b1a897df-01c4-41ad-ae06-8278bdc18e7d`
  - Fidalgo: `e3171dd9-9a5f-e5be-b36c-cc7c4f3f3bcf`
  - FirstPartyTest: `1b9b1c85-bc84-4b5e-ab7e-8a60d260775e`
  - PowerAutomate: `ff708b28-89df-4f82-9b1e-b403b36a9896`
  - Citrix: `198d71c0-80bb-4843-8cc4-811377a49a92`
- **Integer Value**: OPNC limit (e.g., 50 = up to 50 OPNCs)

### Get OnPremConnectionLimitation

Query limit values for tenants. Separate multiple tenant IDs with commas.
Default limit is 10 if not explicitly set.

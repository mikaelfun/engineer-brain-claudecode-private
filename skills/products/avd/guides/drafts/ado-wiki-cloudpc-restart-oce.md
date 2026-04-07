---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/WCX Specific Content/OCE APIs/CloudPC - Restart"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FWCX%20Specific%20Content%2FOCE%20APIs%2FCloudPC%20-%20Restart"
importDate: "2026-04-05"
type: troubleshooting-guide
---

> **Stop**: This information should only be followed by WCX PMs and SaaF teams. These steps do not apply to CSS.

Full Action Type List: https://dev.azure.com/microsoft/CMD/_git/CMD-Svc-ResourceMgmt?path=/src/ResourceMgmt.Data/Enums/ActionType.cs

## JIT Access Preparation

1. If not Torus enrolled, follow SaaF Tours
2. In OSP Identity (https://osp.office.net/login) join **CMDCPCSupport** eligibility (may take 8 hours for provisioning)
3. Open Torus Client or PROD DMS in SAW, JIT elevate:
   ```
   Request-AzureAdGroupRoleElevation -GroupName 'CMDCPCSupport-JIT-PE-PlatformServiceOperator' -Reason "<your reason>"
   ```
   JIT access revoked after 4 hours.
4. **[SAW Enforced]** Navigate to Geneva Action portal and login with Torus account
5. In CloudPC OCE > ResourceMgmt Actions > Trigger Device Action
6. Fill in TenantId, Device Id, and Device Action Type = **1** (Restart)
   - Batch mode available via Input Mode toggle in upper right corner

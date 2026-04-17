# Purview 权限与 RBAC -- Comprehensive Troubleshooting Guide

**Entries**: 22 | **Drafts fused**: 3 | **Kusto queries fused**: 1
**Source drafts**: [ado-wiki-local-test-role-permission-issue.md](..\guides/drafts/ado-wiki-local-test-role-permission-issue.md), [ado-wiki-purview-roles-permissions.md](..\guides/drafts/ado-wiki-purview-roles-permissions.md), [ado-wiki-roles-update-request-permission-issue.md](..\guides/drafts/ado-wiki-roles-update-request-permission-issue.md)
**Kusto references**: [scc-rbac-logs.md](../../kusto/purview/references/queries/scc-rbac-logs.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-local-test-role-permission-issue.md, ado-wiki-purview-roles-permissions.md

1. Find **Microsoft Entra ID** in Azure Portal `[source: ado-wiki-local-test-role-permission-issue.md]`
2. Create a new user in this tenant: `[source: ado-wiki-local-test-role-permission-issue.md]`
3. Purview Roles and Permissions Reference `[source: ado-wiki-purview-roles-permissions.md]`
4. Data Plane RBAC Roles `[source: ado-wiki-purview-roles-permissions.md]`
5. External Connections (ADF & Data Share) `[source: ado-wiki-purview-roles-permissions.md]`
6. Triaging steps / Root cause `[source: ado-wiki-roles-update-request-permission-issue.md]`
7. Click on "DGrep: Tip results" to see logs in Jarvis portal. `[source: ado-wiki-roles-update-request-permission-issue.md]`
8. Get the correlation ID or account ID from the logs. `[source: ado-wiki-roles-update-request-permission-issue.md]`
9. Use the Correlation ID and search: `[source: ado-wiki-roles-update-request-permission-issue.md]`
10. Search across namespaces: BabylonProd, GatewayProd, PolicyStoreProd `[source: ado-wiki-roles-update-request-permission-issue.md]`

### Phase 2: Data Collection (KQL)

```kusto
ProjectBabylonLogEvent
   | where CorrelationId == "<correlation id>"
```
`[tool: ado-wiki-roles-update-request-permission-issue.md]`

```kusto
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let sessionid = "{sessionId}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let scc_rbac_logs = iff(isempty(tenantid), "Need Tenant ID to fullfil geneva link",
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=ProtectionCenterPROD&en=ServerEventLog,TraceEventLog&conditions=[["TenantId","%3D%3D","', tenantid,
           '"],["SessionId","contains","', sessionid,
           '"]]&aggregates=["Count%20by%20domainStatus","Count%20by%20domainName","Count%20by%20resultType"]'));
print scc_rbac_logs
```
`[tool: Kusto skill -- scc-rbac-logs.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| User navigates to new Data Catalog > Roles and permissions and sees 'You need pe... | When upgrading from classic Azure Purview, only the AAD iden... | Three options: 1) Use self-service option to add users to Data Governance role (... |
| Error You need permission to access this on Role groups and app permissions page... | User not part of the Data Governance role group. Being Purvi... | Add user to Data Governance role group via Purview settings. Data Governance rol... |
| Purview metrics (Data Map Capacity Units, Storage Size) not visible on main page... | User lacks Azure Monitor Monitoring Reader permissions (Micr... | Assign Monitoring Reader role on Purview resource. Ref: learn.microsoft.com/en-u... |
| Unable to access Purview Governance Portal or manage account: missing roles, Col... | Missing role assignments (Owner, Data Curator, Data Source A... | 1) Check IAM role assignments at correct scope. 2) If creator left, use REST API... |
| Customer cannot create or publish a policy in Purview Data Governance | Data governance flag not enabled on data source, or user lac... | 1) Enable data governance flag on the data source. 2) Assign Policy Author role ... |
| 401 Error from policystore API in collection/role permissions. Caller not author... | Caller does not have the required Microsoft.Purview/accounts... | 1) Get correlation ID from DGrep/Jarvis logs. 2) Query ProjectBabylonLogEvent wi... |
| Purview scan of Synapse Workspace fails; serverless database enumeration works b... | Missing permissions: MSI needs Reader on resource group/subs... | Ensure all permissions: (1) MSI Reader on RG/subscription, (2) Storage Blob Data... |
| Users with Data Catalog Reader or Governance Domain Reader role can see unpublis... | Role permission gap: documentation states these roles should... | Confirmed by-design gap. Feature request FR 2722/2753 logged to restrict draft v... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | User navigates to new Data Catalog > Roles and permissions and sees 'You need permission to access t... | When upgrading from classic Azure Purview, only the AAD identity of the original... | Three options: 1) Use self-service option to add users to Data Governance role (docs: https://learn.... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps%20-%20Data%20Governance%2FTroubleshooting%20Guides%2FCuration%20(Biz%20Domains%2C%20Data%20Products%20%26%20Permissions)%2FReprovision%20a%20user%20to%20Data%20Governance%20admin%20role) |
| 2 | Error You need permission to access this on Role groups and app permissions page in Data Governance,... | User not part of the Data Governance role group. Being Purview Administrator alo... | Add user to Data Governance role group via Purview settings. Data Governance role group grants Data ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps+-+Data+Governance%2FTroubleshooting+Guides%2FRoles+and+permissions%2FGetting+error) |
| 3 | Purview metrics (Data Map Capacity Units, Storage Size) not visible on main page or metrics page in ... | User lacks Azure Monitor Monitoring Reader permissions (Microsoft.Insights/Metri... | Assign Monitoring Reader role on Purview resource. Ref: learn.microsoft.com/en-us/azure/azure-monito... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FArchives+(Deleted+or+outdated+TSGs)%2FMetrics%2FUnable+to+see+metrics) |
| 4 | Unable to access Purview Governance Portal or manage account: missing roles, Collection Admin unavai... | Missing role assignments (Owner, Data Curator, Data Source Admin, Reader, Collec... | 1) Check IAM role assignments at correct scope. 2) If creator left, use REST API to assign Collectio... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FEEEs+Section%2FCoPilot+Troubleshooting+Guides+(AI+generated+TSGs)+-+Need+further+review%2FAccess+issues+with+Purview+account) |
| 5 | Customer cannot create or publish a policy in Purview Data Governance | Data governance flag not enabled on data source, or user lacks Policy Author rol... | 1) Enable data governance flag on the data source. 2) Assign Policy Author role to the user for crea... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20-%20Customer%20Issues/Customer%20is%20not%20able%20to%20create%20and%20publish%20a%20policy) |
| 6 | 401 Error from policystore API in collection/role permissions. Caller not authorized with missing Mi... | Caller does not have the required Microsoft.Purview/accounts/policy/write permis... | 1) Get correlation ID from DGrep/Jarvis logs. 2) Query ProjectBabylonLogEvent with CorrelationId to ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20-%20Customer%20Issues/Roles%20update%20request%20and%20permission%20issue) |
| 7 | Purview scan of Synapse Workspace fails; serverless database enumeration works but scan does not com... | Missing permissions: MSI needs Reader on resource group/subscription, Storage Bl... | Ensure all permissions: (1) MSI Reader on RG/subscription, (2) Storage Blob Data Reader on Synapse s... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Scanning/Scan%20fails%20with%20an%20error/Synapse%20Workspace) |
| 8 | Users with Data Catalog Reader or Governance Domain Reader role can see unpublished/draft governance... | Role permission gap: documentation states these roles should only see published ... | Confirmed by-design gap. Feature request FR 2722/2753 logged to restrict draft visibility from reade... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Jan%20FR%20Known%20Issues) |
| 9 | ADS auth failure on storage - MI missing Storage Blob Data Reader/Contributor | ADS MI needs data-plane RBAC roles on storage. | Provider MI: Storage Blob Data Reader. Consumer MI: Storage Blob Data Contributor. | 🔵 7.0 | ado-wiki |
| 10 | ADS: Failed to synchronize because permission is missing - Owner role insufficient | Owner/Contributor roles do NOT grant blob data access. | Use Storage Blob Data Contributor (receive) or Reader (share) instead of Owner. | 🔵 7.0 | ado-wiki |
| 11 | Purview Share: View shares shows error message | User missing Reader permissions at the storage account level. | Grant Reader role on the storage account. Check prerequisites in How to share data documentation. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Share%2FPurview%20Share%2FIssue%20with%20view%2C%20create%2C%20edit%20or%20delete%20a%20sent%20share%2FView%20shares%20shows%20error%20message) |
| 12 | Purview scan completes with metadata read errors: System Error ReadData (invalid datetime Ticks) or ... | DataScan agent fails to read metadata from specific files. Common causes: (1) Pa... | Review scan logs for specific error codes. Verify access permissions. Test data source connectivity ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Sources%2FHandling%20Metadata%20Read%20Issues%20in%20Microsoft%20Purview%20Scans) |
| 13 | Purview scan fails with System Error or Operation Failed ReadData on Parquet files — invalid datetim... | Parquet files contain datetime values outside valid range (Ticks) or complex dat... | Review scan logs; verify data source permissions; check supported file types at MS docs; for complex... | 🔵 7.0 | ado-wiki |
| 14 | DLP rule encryption template dropdown is empty; user cannot select RMS template when creating or edi... | The user does not have permissions to execute Get-RMSTemplate and Get-IRMConfigu... | Assign the 'Information Protection Administrator' role group to the user — and ensure it is assigned... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20User%20cannot%20configure%20encryption%20via%20DLP%20Rule) |
| 15 | Users unable to access Purview Governance Portal despite having Owner, Data Curator, Data Source Adm... | Purview accounts created before 18 August 2021 use Azure RBAC for access managem... | Configure roles from Microsoft Purview data plane using collection access management. Use InPrivate ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FSecurity%20and%20Access%20Control%2FOpening%20Microsoft%20Purview%20Governance%20Portal%2FUnable%20to%20access%20Purview%20Governance%20Portal%20through%20the%20Portal%20or%20URL) |
| 16 | Only Collection Admin has left the organization. Remaining users cannot access Purview Governance Po... | In Microsoft Purview, Collection Admin role is required to assign roles to other... | Use Service Principal (SPN) with REST API to add new Root Collection Admin: 1) Create SPN in AAD App... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FSecurity%20and%20Access%20Control%2FOpening%20Microsoft%20Purview%20Governance%20Portal%2FUnable%20to%20access%20Purview%20Governance%20Portal%20through%20the%20Portal%20or%20URL) |
| 17 | Customer unable to see Data Factory or Data Share under External Connections in Purview Governance P... | User does not have both Owner role at the Subscription level and Purview Data Cu... | 1) Under Subscriptions, verify customer has Owner or Account Admin role. If not, assign Owner role. ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FSecurity%20and%20Access%20Control%2FRoles%20and%20Permissions%20in%20Microsoft%20Purview%2FRoles%20to%20View%20External%20Connectors%20(ADF%20%26%20OnPrem)) |
| 18 | After April 2025 role change rollout, users previously assigned Data Catalog Reader role can no long... | Data Catalog Reader role renamed to Local Catalog Reader (domain-level scope onl... | Re-add affected users: assign Local Catalog Reader for domain-specific access, or new Global Catalog... | 🔵 7.0 | ado-wiki |
| 19 | Edit share options are disabled in Purview Data Sharing; cannot modify existing share settings or sh... | User does not have Owner permissions at the storage account level. | Assign the user Owner role on the storage account. Check the prerequisites section of How to share d... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20%28TSGs%29%2FData%20Share%2FPurview%20Share%2FIssue%20with%20view%2C%20create%2C%20edit%20or%20delete%20a%20sent%20share%2FEdit%20share%20options%20are%20disabled) |
| 20 | 401 RBAC check failed when managing disposition reviews | User lacks RBAC permissions for disposition reviews | Add to: Content Explorer Content/List Viewer, Records Management with Disposition Management role | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/cannot-manage-disposition-reviews) |
| 21 | Admin cannot see sensitivity label or label policy in Purview portal; label or policy appears missin... | User either lacks required Purview RBAC role for label management, or the label ... | 1) Verify user has required RBAC role per docs. 2) Check if label policy has Admin Units: edit polic... | 🔵 5.5 | ado-wiki |
| 22 | Purview Data Sharing: 'Failed to attach share' when receiving shared data | Permission issue on target storage, unsupported storage config (wrong region/per... | Check prerequisites: 1) Storage account must be in same Azure region as source. 2) Need Contributor/... | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/purview/legacy/how-to-receive-share) |
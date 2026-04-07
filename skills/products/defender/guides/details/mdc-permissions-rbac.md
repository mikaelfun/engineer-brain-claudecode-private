# DEFENDER MDC 权限与 RBAC — Comprehensive Troubleshooting Guide

**Entries**: 49 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-support-data-access.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Devops Security
> Sources: ado-wiki, mslearn

**1. MSDO CLI: unable to create Integration for Defender for Cloud CLI scanning**

- **Root Cause**: User lacks Security Admin permission on the subscription, which is required for write actions in Microsoft.Security RP
- **Solution**: Assign Security Admin role at the subscription level to the user creating the integration
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Defender for Cloud CLI binary not executing in pipeline**

- **Root Cause**: Binary lacks execute permission (chmod +x not run after download) or wrong OS binary downloaded
- **Solution**: Run chmod +x defender after download and ensure the correct OS-specific binary is being used. Verify with ls -l
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. No repositories populating on DevOps Security page after creating Azure DevOps connector**

- **Root Cause**: User who created connector has Stakeholder access level instead of Basic; or lacks Project Collection Administrator permission on the ADO organization
- **Solution**: Ensure connector creator has BOTH Basic access level (minimum) AND Project Collection Administrator permission for all Azure DevOps organizations to onboard; check via ADO Organization Settings > Users
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Defender for Cloud CLI: user cannot generate Client ID and Secret in Azure Portal for CI/CD integration**

- **Root Cause**: User lacks Security Admin RBAC role at the subscription level, or Defender CSPM plan is not enabled
- **Solution**: Assign Security Admin role via Azure Portal Access Control (IAM). Verify Defender CSPM plan is enabled for the subscription
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**5. GHAzDO (GitHub Advanced Security for Azure DevOps) results not visible in Defender for Cloud recommendations**

- **Root Cause**: ADO connector created before June scope update lacks new required scopes; or user permissions for Microsoft Defender for DevOps have Advanced Security view alerts and Read not set to Allow
- **Solution**: Create new ADO connector with updated scopes; ensure Subscription ID matches between GHAzDO and Defender for Cloud; manually set Advanced Security view alerts and Read permissions to Allow
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**6. Cannot configure Pull Request Annotations in Defender for Cloud DevOps security**

- **Root Cause**: User lacks write (Owner or Contributor) access to the Azure subscription
- **Solution**: Grant Owner or Contributor access to subscription; can obtain via activating Microsoft Entra role in PIM
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 2: Sentinel Data Lake
> Sources: ado-wiki

**1. Microsoft Sentinel data lake onboarding setup panel shows permissions error or does not appear**

- **Root Cause**: The user lacks required roles for data lake setup. Onboarding requires: Azure Subscription Owner or Billing Administrator (for billing), Microsoft Entra Global Administrator or Security Admin (for data ingestion authorization), and read access to all Microsoft Sentinel workspaces.
- **Solution**: Ensure the user has all required roles: 1) Azure Subscription Owner or Billing Administrator, 2) Microsoft Entra Global Administrator or Security Admin, 3) Read access to primary and other Sentinel workspaces. If the user cannot get these roles, request an administrator to perform the setup.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Workspace not visible in Lake Explorer or ADX browse experience for Microsoft Sentinel data lake**

- **Root Cause**: If a workspace has no tables in it, it will not appear in Lake Explorer, ADX, or the scheduled job dropdown. At least one table must exist within the workspace for it to be discoverable. Additionally, the user must have appropriate permissions on the workspace.
- **Solution**: Ensure the workspace has at least one table created within it. Verify the user has appropriate permissions: for default workspace use URBAC with security data basics (read) over Microsoft Sentinel data collection; for other workspaces use Azure RBAC (Log Analytics Reader/Contributor, Sentinel Reader/Contributor, etc.).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. URBAC Advanced Analytics permission in Microsoft Defender XDR does not grant expected access to Sentinel data lake scheduled jobs**

- **Root Cause**: During public preview, the Advanced Analytics permission under Data Operations in URBAC is not yet effective for job management. More democratized job access is planned for future releases.
- **Solution**: For public preview, users must hold one of the following Entra ID roles to schedule or manage jobs: Global Administrator, Security Administrator, or Security Operator. The URBAC Advanced Analytics permission will be functional in a future release.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. User with Microsoft Defender for Endpoint URBAC access cannot read data in Sentinel data lake via Lake Explorer, ADX, Notebook, or SQL**

- **Root Cause**: Access to the Defender for Endpoint data source in URBAC does not automatically grant access to the Sentinel data lake. The data lake requires separate access to the Microsoft Sentinel data collection within URBAC.
- **Solution**: Grant the user access to the Microsoft Sentinel data collection within Microsoft Defender XDR URBAC (security.microsoft.com/mtp_roles). When creating/editing the custom role, select the Microsoft Sentinel data collection (usually near the bottom of the assignment step). Alternatively, assign Microsoft Entra ID roles (Global Reader, Security Reader, Security Operator, Security Administrator, Global Administrator) for broad access across all workspaces.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 3: Case Management
> Sources: ado-wiki

**1. Cannot see the Cases item in the sidebar of Microsoft Defender XDR portal or encounter error To view this page, you need read permissions for security data when navigating to Cases grid**

- **Root Cause**: User does not have the mtprbac:MTP:UserViewPermissions permission enabled in URBAC settings
- **Solution**: Enable the mtprbac:MTP:UserViewPermissions permission for the user in the Defender portal URBAC settings. If the issue persists, create a sev3 CRI to Case Management on-call engineer with title Case Grid issue including screenshot, steps to reproduce, tenant ID, location, and local time
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Cannot edit case details in Microsoft Defender XDR portal - the Manage case editing form is disabled and user cannot modify case fields**

- **Root Cause**: User does not have Security Data Management permissions in the Defender portal URBAC
- **Solution**: Assign Security Data Management permissions to the user in the Defender portal (Settings > Permissions > Roles). Once the user has the correct role, the case editing functionality will be enabled
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Cannot edit or customize case statuses in Microsoft Defender XDR Cases page - the editing controls for custom statuses are disabled/greyed out**

- **Root Cause**: User does not have Security Configuration Management permissions on at least one Security workload in the Defender portal URBAC
- **Solution**: Assign Security Configuration Management (SecurityConfig_Manage) permissions to the user on at least one active Security workload. The user must also have Security Configuration Reader permissions to see the Customize status option
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 4: Defender Cli
> Sources: ado-wiki

**1. User cannot generate Client ID and Secret in Azure Portal for Defender for Cloud CLI integration**

- **Root Cause**: Insufficient RBAC permissions: Security Admin role required at subscription level; or Defender CSPM plan not enabled
- **Solution**: Assign Security Admin role via Azure Portal IAM; verify Defender CSPM plan is enabled for the subscription
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Defender for Cloud CLI binary not executing in CI/CD pipeline**

- **Root Cause**: Binary lacks execute permission or wrong OS binary downloaded for the pipeline agent
- **Solution**: Run chmod +x defender after downloading; ensure correct OS binary (Linux/Windows) matches pipeline agent; verify with ls -l
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 5: Mdc
> Sources: mslearn

**1. Defender for Cloud workload protection dashboard fails to load or shows incomplete data**

- **Root Cause**: User who enabled Defender for Cloud or wants to turn on data collection doesn't have Owner or Contributor role on the subscription
- **Solution**: Ensure the user has Owner or Contributor role on the subscription; Reader role users can view dashboard but cannot enable data collection
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

**2. Defender for Containers sensor pods not running on AKS cluster**

- **Root Cause**: Insufficient node resources, network policies blocking egress to Azure endpoints, or RBAC permission issues on the cluster
- **Solution**: Check pod events: kubectl get ds microsoft-defender-collector-ds -n kube-system; verify resources: kubectl top nodes; ensure egress allowed; verify RBAC
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 6: Sql Va
> Sources: mslearn

**1. SQL Vulnerability Assessment scan results not visible in Azure portal - no findings shown after scan**

- **Root Cause**: Missing viewer role. The user does not have Security Admin or Security Reader role assigned, preventing access to scan results.
- **Solution**: Ensure the user has Security Admin or Security Reader role assigned in RBAC. Navigate to Azure portal > Defender for Cloud > Recommendations to verify access.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

**2. SQL Vulnerability Assessment - cannot change vulnerability assessment settings, permission denied error**

- **Root Cause**: Insufficient configuration role. User needs SQL Security Manager role. For classic configuration, additionally requires Owner and Storage Blob Data Reader on the storage account.
- **Solution**: Assign SQL Security Manager role. For classic configuration: also assign Owner role on the SQL resource and Storage Blob Data Reader on the storage account used for scan results.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

### Phase 7: Governance
> Sources: ado-wiki

**1. MDC Governance rule creation fails**

- **Root Cause**: Insufficient permissions or backend failure. Required: Security Admin/Owner/Contributor RBAC at subscription level (for subscriptions) or at security connector level (for AWS/GCP)
- **Solution**: Verify user has Security Admin/Owner/Contributor role at appropriate scope. Query Kusto (romecore.kusto.windows.net Prod ServiceFabricDynamicOE) with operationName CreateOrUpdateGovernanceRuleSingle filtered by subscription to check for failures. Ensure CSPM plan is enabled
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. MDC governance rule creation fails with permission error**

- **Root Cause**: Insufficient RBAC permissions to create governance rules
- **Solution**: For Azure subscription: assign Security Admin/Owner/Contributor role at subscription level; for AWS/GCP: assign same roles at security connector level; governance requires Defender CSPM plan enabled
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 8: Mcas
> Sources: mslearn

**1. Defender for Cloud Apps tenant locked down - all access blocked after enabling BYOK data encryption with Azure Key Vault**

- **Root Cause**: Azure Key Vault key is inaccessible due to missing permissions (List, Wrap Key, Unwrap Key), expired/disabled/deleted key, or Key Vault firewall blocking access. Tenant lockdown occurs within 1 hour of key becoming inaccessible
- **Solution**: Check Key Vault access policy has List (Key Management), Wrap Key and Unwrap Key (Cryptographic Operations) permissions. Verify key is RSA, enabled, activation date is in the past, not expired. If key was deleted, recover and re-enable it. For firewall issues, allow required IPs and enable Allow trusted Microsoft services to bypass this firewall
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Defender for Cloud Apps BYOK data encryption fails despite correct key permissions - Key Vault has firewall enabled**

- **Root Cause**: Azure Key Vault firewall is blocking access from Defender for Cloud Apps service IPs
- **Solution**: In Key Vault firewall settings, add IPs: 13.66.200.132, 23.100.71.251, 40.78.82.214, 51.105.4.145, 52.166.166.111, 13.72.32.204, 52.244.79.38, 52.227.8.45. Enable Allow trusted Microsoft services to bypass this firewall
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 9: Databricks
> Sources: ado-wiki

**1. Error when upgrading Defender for Storage plan on a Databricks managed storage account**

- **Root Cause**: Databricks workspace restricts access to Microsoft.Security permissions (advancedThreatProtectionSettings/*, DefenderForStorageSettings/*) on managed storage accounts
- **Solution**: Collaborate with Databricks team via SAP Azure/Databricks/Storage/Workspace managed storage. Provide: SubscriptionId, Storage account resourceID, Workspace URI (/subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.Databricks/workspaces/{wsname}), Business justification. Ask them to open a CRI to Azure Databricks RP team to grant access to the required Security permissions. Note: sensitive data discovery and malware scanning are not yet supported on Databricks managed storage.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 10: Rbac
> Sources: ado-wiki

**1. Customer with 'Security Administrator' (Azure Active Directory role) cannot change Microsoft Defender for Cloud pricing tier despite believing they have sufficient permissions**

- **Root Cause**: Confusion between 'Security Administrator' (AAD role - manages M365/AAD security features) and 'Security Admin' (Azure RBAC role - manages MDC pricing tier, security policy, and can dismiss alerts/recommendations). These are two distinct roles with entirely different scopes.
- **Solution**: Assign 'Security Admin' Azure RBAC role to the user to allow changes to MDC pricing tier. Security Admin includes Security Reader permissions plus the ability to update security policy and pricing tier. Reference: https://learn.microsoft.com/azure/defender-for-cloud/permissions#roles-and-allowed-actions
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 11: Cloud Security Explorer
> Sources: ado-wiki

**1. Cloud Security Explorer query execution fails — scope errors or permission denied; execution fails even if only one scope is invalid**

- **Root Cause**: (1) User lacks microsoft.security/assessments/read or microsoft.security/alerts/read permissions [Explorer issue]; OR (2) User has permissions but CloudMap data issue exists [CloudMap issue]; OR (3) Scope was recently created or deleted
- **Solution**: Check user permissions for microsoft.security/assessments/read and microsoft.security/alerts/read. If missing → Explorer issue, fix RBAC. If permissions OK → CloudMap issue, copy query link to CRI. Also check via ARG if scope (subscription/security connector) was recently created or deleted.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 12: Data Sensitivity Discovery
> Sources: ado-wiki

**1. Data Sensitivity Discovery fails with 'access is denied because of the deny assignment' error during data scanner role assignment (OperationName: AzureCspmDiscover or AzureCspmOnboard)**

- **Root Cause**: A deny assignment policy is blocking the data scanner from assigning the required role during CSPM onboarding/discovery
- **Solution**: 1) Confirm via Kusto: cluster(mauigenevalogs.eastus.kusto.windows.net)/MAUI-Dev — `MdfcIpServiceLogs | where TIMESTAMP > ago(6d) | where Env == 'PROD' | where OperationName == 'AzureCspmDiscover' or OperationName == 'AzureCspmOnboard' | where TenantId == '{TenantId}' | where Exception contains 'the access is denied because of the deny assignment with name' | project TIMESTAMP, TenantId, Message, Exception`. Requires TM-MDC-Protectors-Deprecated entitlement. 2) Ask customer to update/remove the deny assignment policy: https://learn.microsoft.com/en-us/azure/role-based-access-control/deny-assignments
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 13: Aks
> Sources: ado-wiki

**1. 用户无法查看 AKS Security Insights (AKS Attach Blade) 中的 MDC 安全数据**

- **Root Cause**: 用户缺少所需的访问权限
- **Solution**: 为用户分配以下任一角色：Subscription owner / contributor / security admin / security reader，或资源级别 Resource owner
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 14: Mdc Copilot
> Sources: ado-wiki

**1. MDC Copilot nudge button not showing in Azure Portal Defender for Cloud blade**

- **Root Cause**: Azure Copilot is disabled, or Security Copilot is disabled, or user lacks permissions to use Copilot for Security
- **Solution**: Verify Azure Copilot is enabled for the tenant. Verify Security Copilot (Medeina) is enabled and user has necessary permissions. MDC skills run through Copilot for Security platform invoked by Azure Copilot handlers.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 15: Azure Policy
> Sources: ado-wiki

**1. Organization needs to prevent privileged users (Security Admins, Contributors, Owners) from enabling or disabling Microsoft Defender for Cloud plans; no built-in RBAC restriction available**

- **Solution**: Create a custom Azure Policy with deny effect on Microsoft.Security/pricings resources. The policy denies creation/update of pricingTier and subPlan properties. Example policy rule: if type equals Microsoft.Security/pricings AND pricingTier or subPlan exists, then deny. Note: to make changes, must disable policy first and wait 5-15 minutes. Custom policy may stop working after future MDC updates.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 16: Response Action
> Sources: ado-wiki

**1. MDC Cloud-Native Response Action on K8s pod fails during submission with URBAC permission error (MtpActionController.CreateMtpActionAsync or MtpActionBL.GetActionStatusAsync failure)**

- **Root Cause**: Customer does not have the required MDC workload Response(Manage) URBAC permission assigned to perform response actions on Kubernetes pods.
- **Solution**: Ask customer to verify they have the MDC workload Response(Manage) permission assigned. Check Kusto Span table in mdcprd.centralus TeamX database for OperationResult=Failure with name=MtpActionBL.GetActionStatusAsync or MtpActionBL.CreateMtpActionAsync.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 17: Automation Rules
> Sources: ado-wiki

**1. Automation rule actions fail with 401 Unauthorized or 403 Forbidden permission errors in Microsoft Sentinel**

- **Root Cause**: Missing RBAC permissions on the automation managed identity for the target resources/workspaces. Required roles: Microsoft Sentinel Contributor for alert updates, Logic App Contributor for playbook runs.
- **Solution**: 1) Check failed actions via Action Execution Details Kusto query (UnifiedActionsClient spans). 2) Verify managed identity RBAC assignments using 'az role assignment list'. 3) Check workspace-level IAM for managed identity assignment. 4) Validate action target exists and parameters are valid. Add required RBAC role to the automation managed identity.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 18: Scoping
> Sources: ado-wiki

**1. User cannot assign scope in Sentinel role assignments in M365 Defender portal; scope option unavailable or greyed out**

- **Root Cause**: Sentinel Scoping requires two prerequisites: (1) Sentinel workspaces must be connected to the Defender portal, (2) Sentinel must be activated in Unified RBAC (URBAC). Missing either prerequisite prevents scope assignment.
- **Solution**: Complete prerequisites: 1) Connect Sentinel workspaces to the Defender portal. 2) Enable Sentinel in URBAC (preview). Instructions at Roadmap Hub Unified RBAC page. After enabling, user also needs Security Authorization (Manage) permission for creating scope and Data Operations (Manage) permission for Table Management.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 19: Correlation Engine
> Sources: ado-wiki

**1. Customer cannot update the tenant-level Incident Correlation default setting in Defender portal - receives 403 Forbidden error or the toggle does not persist after saving**

- **Root Cause**: The PATCH api/settings/mtpAdvancedFeaturesSetting endpoint requires SecurityConfig_Manage permission on ALL active MTP workloads. If user lacks this on even one workload the request is rejected with 403
- **Solution**: Verify user role assignments in Defender portal (Settings > Permissions > Roles). User needs SecurityConfig_Manage on all active workloads (Sentinel, MDE, MDO). Check 403 errors in Kusto wcdprod Geneva InEHttpRequestLog filtering by mtpAdvancedFeaturesSetting
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 20: Mto
> Sources: ado-wiki

**1. Some tenants not visible in Microsoft Defender multitenant management (MTO) portal at mto.security.microsoft.com - cannot see alerts from certain tenants**

- **Root Cause**: Sentinel alerts require workspace-level permissions. Security admin or global admin roles do NOT provide access to Sentinel workspace alerts. Users need explicit workspace read permissions. B2B permissions required for shared tenant setup, GDAP not supported for Sentinel data
- **Solution**: Have customer access STO portal (security.microsoft.com) first to verify alert access per tenant. Ensure workspace read permissions on workspace level. For shared tenants configure B2B permissions (not GDAP). Verify prerequisites per docs: https://learn.microsoft.com/en-us/unified-secops/mto-requirements
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 21: Multi Workspace
> Sources: ado-wiki

**1. User permissions issues on USX onboarded workspace - Microsoft Threat Protection or WindowsDefenderATP app role assignments missing from workspace IAM causing USX features to fail**

- **Root Cause**: During USX onboarding system assigns Sentinel Contributor to MTP (8ee8fdad-f234-4243-8f3b-15c294843740) and WDATP (fc780465-2017-40d4-a0c5-307022471b92) apps. If deleted USX features break
- **Solution**: Check Azure Portal > LA workspace > IAM > Role Assignments for MTP and WDATP Sentinel Contributor assignments. If missing ask Subscription owner to reassign at Subscription level. For onboarding need Subscription Owner or Sentinel Contributor + User Access Administrator
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 22: Mepm
> Sources: ado-wiki

**1. AWS Security Connector creation fails at UI when creating third-party app registration mciem-aws-oidc-connector**

- **Root Cause**: Customer does not have required AAD permissions to create new app registrations. The onboarding wizard creates the app on behalf of the logged-in user.
- **Solution**: Customer needs someone with sufficient AAD permissions (Application Administrator or Global Admin) to complete the security connector setup, or pre-create the app registration manually with: az ad app create --display-name mciem-aws-oidc-connector --identifier-uris api://mciem-aws-oidc-app --sign-in-audience AzureADMyOrg
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 23: Direct Onboarding
> Sources: ado-wiki

**1. Direct Onboarding UI toggle disabled/greyed out, or error: "AAD Administrator directory role or AAD Security Administrator directory and Subscription Owner Azure role are required"**

- **Root Cause**: User lacks required permissions. Direct Onboarding requires both an Entra ID directory role (Security Administrator or higher) at tenant level AND Subscription Owner on the target subscription.
- **Solution**: Ensure user has one of the required Entra ID directory roles (AAD Administrator or Security Administrator) AND Subscription Owner on the designated subscription.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 24: Agentless Scanning
> Sources: ado-wiki

**1. Agentless Scanning DiskScan fails with NoPermissionForCustomerKeyVaultRBAC for VMs using Customer-Managed Key (CMK) disk encryption**

- **Root Cause**: The agentless scanner lacks RBAC permissions to access the customer Key Vault used for CMK encryption. The scanner cannot read CMK-encrypted disks without explicit Key Vault access.
- **Solution**: Grant the agentless scanner appropriate RBAC permissions on the customer Key Vault. Verify the failure category using ASC Tenant Explorer > Defender for Cloud > DiskScan failures tab (enter Subscription ID + Resource ID and click Run).
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 25: Aws S3
> Sources: ado-wiki

**1. AWS S3 connector health messages show errors with specific StatusCode (e.g., S3B40022), SQS messages received but not deleted by Sentinel**

- **Root Cause**: Missing AWS permissions preventing Sentinel from processing S3 data (e.g., missing KMS permissions when S3 data is KMS-encrypted, missing IAM role permissions for the ARN rule)
- **Solution**: Query SentinelHealth: SentinelHealth | where SentinelResourceName contains 'Amazon'. Cross-reference StatusCode with Connector Health Errors wiki. Verify all required IAM permissions per AWS S3 connector permissions policies. If KMS is used, add KMS decrypt permissions for the relevant ARN.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 26: Mde Integration
> Sources: ado-wiki

**1. MDE.Windows extension install fails with error: Copy settings to extension failed with error: Failed to generate crypt key or Failed to set crypt provider context while trying to create self-signed ce**

- **Root Cause**: Incorrect folder permissions on C:\ProgramData\Microsoft\Crypto\RSA\MachineKeys preventing certificate creation. Extra permissions like Authenticated Users with Read access block extension installation.
- **Solution**: Restore default permissions on MachineKeys folder per https://docs.microsoft.com/troubleshoot/windows-server/windows-security/default-permissions-machinekeys-folders. Remove unauthorized user accounts with non-standard permissions.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 6.5/10 — ADO Wiki]`

### Phase 27: Defender For Sql
> Sources: mslearn

**1. Defender for SQL on Machines: Protection status shows 'Lack of permissions' - SQL Server instance unprotected**

- **Root Cause**: SQL Server service account is not a member of the sysadmin fixed server role
- **Solution**: Add SQL Server service account to sysadmin fixed server role on each instance (default setting). Also ensure managed identity is assigned to the VM/Arc server.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 28: Sql
> Sources: mslearn

**1. Cannot open email link for VA scan results or view results in browser - access error or blank page**

- **Root Cause**: User lacks SQL Security Manager + Storage Blob Data Reader roles, or using Firefox browser (not supported for VA results view)
- **Solution**: Assign SQL Security Manager and Storage Blob Data Reader roles on the storage account. Use Edge or Chrome (Firefox not supported). For new role assignment, owner/user admin access + Storage Blob Data Owner needed.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 29: Data Lake
> Sources: mslearn

**1. Sentinel data lake KQL query fails with Table could not be found or is empty error**

- **Root Cause**: Referenced table does not exist in the database, the table is empty, or the user does not have required permissions to access it
- **Solution**: 1) Verify the table name is correct; 2) Confirm data availability in the table; 3) Ensure the user has appropriate access roles per Sentinel data lake RBAC requirements
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 30: Storage Blob
> Sources: mslearn

**1. Sentinel Storage Blob connector fails with permissions or networking errors in SentinelHealth**

- **Root Cause**: Incorrect RBAC roles on storage accounts or Network Security Perimeter (NSP) and firewall blocking connector traffic. IPv4 CIDR-based storage firewall rules do not work due to region affinity limitations
- **Solution**: 1) Verify service principal has Storage Blob Data Reader on blob account plus Storage Queue Data Contributor on queue account; 2) If using NSP, ensure Scuba service tag is in inbound rules; 3) Do NOT use selected IPv4 CIDR network limits; use NSP or enable public access; 4) Check NSP diagnostic logs in Enforced mode
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 31: Dashboard
> Sources: mslearn

**1. Defender for Cloud workload protection dashboard fails to load**

- **Root Cause**: First enabler or data collection enabler lacks Owner/Contributor role on subscription
- **Solution**: Ensure Owner or Contributor role for enablers; Reader role can then view dashboard
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 32: Repositories
> Sources: ado-wiki

**1. Creating Sentinel repository connection fails with error: The client does not have authorization to perform action Microsoft.Authorization/roleAssignments/write**

- **Root Cause**: User does not have Owner role on the resource group containing the Azure Sentinel workspace. Owner role is required to create repository connections.
- **Solution**: Grant the user Owner role on the resource group containing the Sentinel workspace before creating the repository connection.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 33: Unified Rbac
> Sources: ado-wiki

**1. Warning notification 'workspace is out of sync' displayed on the Unified RBAC (URBAC) Permissions page in the Defender portal**

- **Root Cause**: Changes were made in Azure RBAC after onboarding to Unified RBAC, creating sync issues between the two RBAC systems
- **Solution**: Open the warning, disable the affected workspaces in URBAC, then re-activate them. Going forward, manage roles exclusively in URBAC and do not edit in Azure RBAC after onboarding
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 34: Attack Path
> Sources: mslearn

**1. Attack path analysis shows incomplete details - some nodes or paths missing information when user has limited cross-subscription permissions**

- **Root Cause**: If a user has limited permissions across subscriptions, they might not see full attack path details. This is expected RBAC behavior designed to protect sensitive data.
- **Solution**: Ensure the user has necessary permissions (Security Reader, Security Admin, Reader, Contributor, or Owner) across all relevant subscriptions containing resources in the attack path.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Error when upgrading Defender for Storage plan on a Databricks managed storage account | Databricks workspace restricts access to Microsoft.Security permissions (advancedThreatProtection... | Collaborate with Databricks team via SAP Azure/Databricks/Storage/Workspace managed storage. Prov... | 🟢 8.5 | ADO Wiki |
| 2 | Customer with 'Security Administrator' (Azure Active Directory role) cannot change Microsoft Defe... | Confusion between 'Security Administrator' (AAD role - manages M365/AAD security features) and 'S... | Assign 'Security Admin' Azure RBAC role to the user to allow changes to MDC pricing tier. Securit... | 🟢 8.5 | ADO Wiki |
| 3 | Cloud Security Explorer query execution fails — scope errors or permission denied; execution fail... | (1) User lacks microsoft.security/assessments/read or microsoft.security/alerts/read permissions ... | Check user permissions for microsoft.security/assessments/read and microsoft.security/alerts/read... | 🟢 8.5 | ADO Wiki |
| 4 | Data Sensitivity Discovery fails with 'access is denied because of the deny assignment' error dur... | A deny assignment policy is blocking the data scanner from assigning the required role during CSP... | 1) Confirm via Kusto: cluster(mauigenevalogs.eastus.kusto.windows.net)/MAUI-Dev — `MdfcIpServiceL... | 🟢 8.5 | ADO Wiki |
| 5 | 用户无法查看 AKS Security Insights (AKS Attach Blade) 中的 MDC 安全数据 | 用户缺少所需的访问权限 | 为用户分配以下任一角色：Subscription owner / contributor / security admin / security reader，或资源级别 Resource owner | 🟢 8.5 | ADO Wiki |
| 6 | MSDO CLI: unable to create Integration for Defender for Cloud CLI scanning | User lacks Security Admin permission on the subscription, which is required for write actions in ... | Assign Security Admin role at the subscription level to the user creating the integration | 🟢 8.5 | ADO Wiki |
| 7 | Defender for Cloud CLI binary not executing in pipeline | Binary lacks execute permission (chmod +x not run after download) or wrong OS binary downloaded | Run chmod +x defender after download and ensure the correct OS-specific binary is being used. Ver... | 🟢 8.5 | ADO Wiki |
| 8 | No repositories populating on DevOps Security page after creating Azure DevOps connector | User who created connector has Stakeholder access level instead of Basic; or lacks Project Collec... | Ensure connector creator has BOTH Basic access level (minimum) AND Project Collection Administrat... | 🟢 8.5 | ADO Wiki |
| 9 | User cannot generate Client ID and Secret in Azure Portal for Defender for Cloud CLI integration | Insufficient RBAC permissions: Security Admin role required at subscription level; or Defender CS... | Assign Security Admin role via Azure Portal IAM; verify Defender CSPM plan is enabled for the sub... | 🟢 8.5 | ADO Wiki |
| 10 | Defender for Cloud CLI binary not executing in CI/CD pipeline | Binary lacks execute permission or wrong OS binary downloaded for the pipeline agent | Run chmod +x defender after downloading; ensure correct OS binary (Linux/Windows) matches pipelin... | 🟢 8.5 | ADO Wiki |
| 11 | MDC Copilot nudge button not showing in Azure Portal Defender for Cloud blade | Azure Copilot is disabled, or Security Copilot is disabled, or user lacks permissions to use Copi... | Verify Azure Copilot is enabled for the tenant. Verify Security Copilot (Medeina) is enabled and ... | 🟢 8.5 | ADO Wiki |
| 12 | Organization needs to prevent privileged users (Security Admins, Contributors, Owners) from enabl... |  | Create a custom Azure Policy with deny effect on Microsoft.Security/pricings resources. The polic... | 🟢 8.5 | ADO Wiki |
| 13 | MDC Cloud-Native Response Action on K8s pod fails during submission with URBAC permission error (... | Customer does not have the required MDC workload Response(Manage) URBAC permission assigned to pe... | Ask customer to verify they have the MDC workload Response(Manage) permission assigned. Check Kus... | 🟢 8.5 | ADO Wiki |
| 14 | Automation rule actions fail with 401 Unauthorized or 403 Forbidden permission errors in Microsof... | Missing RBAC permissions on the automation managed identity for the target resources/workspaces. ... | 1) Check failed actions via Action Execution Details Kusto query (UnifiedActionsClient spans). 2)... | 🟢 8.5 | ADO Wiki |
| 15 | Microsoft Sentinel data lake onboarding setup panel shows permissions error or does not appear | The user lacks required roles for data lake setup. Onboarding requires: Azure Subscription Owner ... | Ensure the user has all required roles: 1) Azure Subscription Owner or Billing Administrator, 2) ... | 🟢 8.5 | ADO Wiki |
| 16 | Workspace not visible in Lake Explorer or ADX browse experience for Microsoft Sentinel data lake | If a workspace has no tables in it, it will not appear in Lake Explorer, ADX, or the scheduled jo... | Ensure the workspace has at least one table created within it. Verify the user has appropriate pe... | 🟢 8.5 | ADO Wiki |
| 17 | URBAC Advanced Analytics permission in Microsoft Defender XDR does not grant expected access to S... | During public preview, the Advanced Analytics permission under Data Operations in URBAC is not ye... | For public preview, users must hold one of the following Entra ID roles to schedule or manage job... | 🟢 8.5 | ADO Wiki |
| 18 | User with Microsoft Defender for Endpoint URBAC access cannot read data in Sentinel data lake via... | Access to the Defender for Endpoint data source in URBAC does not automatically grant access to t... | Grant the user access to the Microsoft Sentinel data collection within Microsoft Defender XDR URB... | 🟢 8.5 | ADO Wiki |
| 19 | User cannot assign scope in Sentinel role assignments in M365 Defender portal; scope option unava... | Sentinel Scoping requires two prerequisites: (1) Sentinel workspaces must be connected to the Def... | Complete prerequisites: 1) Connect Sentinel workspaces to the Defender portal. 2) Enable Sentinel... | 🟢 8.5 | ADO Wiki |
| 20 | Cannot see the Cases item in the sidebar of Microsoft Defender XDR portal or encounter error To v... | User does not have the mtprbac:MTP:UserViewPermissions permission enabled in URBAC settings | Enable the mtprbac:MTP:UserViewPermissions permission for the user in the Defender portal URBAC s... | 🟢 8.5 | ADO Wiki |
| 21 | Cannot edit case details in Microsoft Defender XDR portal - the Manage case editing form is disab... | User does not have Security Data Management permissions in the Defender portal URBAC | Assign Security Data Management permissions to the user in the Defender portal (Settings > Permis... | 🟢 8.5 | ADO Wiki |
| 22 | Cannot edit or customize case statuses in Microsoft Defender XDR Cases page - the editing control... | User does not have Security Configuration Management permissions on at least one Security workloa... | Assign Security Configuration Management (SecurityConfig_Manage) permissions to the user on at le... | 🟢 8.5 | ADO Wiki |
| 23 | Customer cannot update the tenant-level Incident Correlation default setting in Defender portal -... | The PATCH api/settings/mtpAdvancedFeaturesSetting endpoint requires SecurityConfig_Manage permiss... | Verify user role assignments in Defender portal (Settings > Permissions > Roles). User needs Secu... | 🟢 8.5 | ADO Wiki |
| 24 | Some tenants not visible in Microsoft Defender multitenant management (MTO) portal at mto.securit... | Sentinel alerts require workspace-level permissions. Security admin or global admin roles do NOT ... | Have customer access STO portal (security.microsoft.com) first to verify alert access per tenant.... | 🟢 8.5 | ADO Wiki |
| 25 | User permissions issues on USX onboarded workspace - Microsoft Threat Protection or WindowsDefend... | During USX onboarding system assigns Sentinel Contributor to MTP (8ee8fdad-f234-4243-8f3b-15c2948... | Check Azure Portal > LA workspace > IAM > Role Assignments for MTP and WDATP Sentinel Contributor... | 🟢 8.5 | ADO Wiki |
| 26 | Defender for Cloud workload protection dashboard fails to load or shows incomplete data | User who enabled Defender for Cloud or wants to turn on data collection doesn't have Owner or Con... | Ensure the user has Owner or Contributor role on the subscription; Reader role users can view das... | 🔵 7.5 | MS Learn |
| 27 | SQL Vulnerability Assessment scan results not visible in Azure portal - no findings shown after scan | Missing viewer role. The user does not have Security Admin or Security Reader role assigned, prev... | Ensure the user has Security Admin or Security Reader role assigned in RBAC. Navigate to Azure po... | 🔵 7.5 | MS Learn |
| 28 | SQL Vulnerability Assessment - cannot change vulnerability assessment settings, permission denied... | Insufficient configuration role. User needs SQL Security Manager role. For classic configuration,... | Assign SQL Security Manager role. For classic configuration: also assign Owner role on the SQL re... | 🔵 7.5 | MS Learn |
| 29 ⚠️ | AWS Security Connector creation fails at UI when creating third-party app registration mciem-aws-... | Customer does not have required AAD permissions to create new app registrations. The onboarding w... | Customer needs someone with sufficient AAD permissions (Application Administrator or Global Admin... | 🔵 7.0 | ADO Wiki |
| 30 ⚠️ | Defender for Cloud CLI: user cannot generate Client ID and Secret in Azure Portal for CI/CD integ... | User lacks Security Admin RBAC role at the subscription level, or Defender CSPM plan is not enabled | Assign Security Admin role via Azure Portal Access Control (IAM). Verify Defender CSPM plan is en... | 🔵 7.0 | ADO Wiki |
| 31 ⚠️ | MDC Governance rule creation fails | Insufficient permissions or backend failure. Required: Security Admin/Owner/Contributor RBAC at s... | Verify user has Security Admin/Owner/Contributor role at appropriate scope. Query Kusto (romecore... | 🔵 7.0 | ADO Wiki |
| 32 ⚠️ | MDC governance rule creation fails with permission error | Insufficient RBAC permissions to create governance rules | For Azure subscription: assign Security Admin/Owner/Contributor role at subscription level; for A... | 🔵 7.0 | ADO Wiki |
| 33 ⚠️ | Direct Onboarding UI toggle disabled/greyed out, or error: "AAD Administrator directory role or A... | User lacks required permissions. Direct Onboarding requires both an Entra ID directory role (Secu... | Ensure user has one of the required Entra ID directory roles (AAD Administrator or Security Admin... | 🔵 7.0 | ADO Wiki |
| 34 ⚠️ | Agentless Scanning DiskScan fails with NoPermissionForCustomerKeyVaultRBAC for VMs using Customer... | The agentless scanner lacks RBAC permissions to access the customer Key Vault used for CMK encryp... | Grant the agentless scanner appropriate RBAC permissions on the customer Key Vault. Verify the fa... | 🔵 7.0 | ADO Wiki |
| 35 ⚠️ | AWS S3 connector health messages show errors with specific StatusCode (e.g., S3B40022), SQS messa... | Missing AWS permissions preventing Sentinel from processing S3 data (e.g., missing KMS permission... | Query SentinelHealth: SentinelHealth / where SentinelResourceName contains 'Amazon'. Cross-refere... | 🔵 7.0 | ADO Wiki |
| 36 | MDE.Windows extension install fails with error: Copy settings to extension failed with error: Fai... | Incorrect folder permissions on C:\ProgramData\Microsoft\Crypto\RSA\MachineKeys preventing certif... | Restore default permissions on MachineKeys folder per https://docs.microsoft.com/troubleshoot/win... | 🔵 6.5 | ADO Wiki |
| 37 ⚠️ | Defender for SQL on Machines: Protection status shows 'Lack of permissions' - SQL Server instance... | SQL Server service account is not a member of the sysadmin fixed server role | Add SQL Server service account to sysadmin fixed server role on each instance (default setting). ... | 🔵 6.0 | MS Learn |
| 38 ⚠️ | Cannot open email link for VA scan results or view results in browser - access error or blank page | User lacks SQL Security Manager + Storage Blob Data Reader roles, or using Firefox browser (not s... | Assign SQL Security Manager and Storage Blob Data Reader roles on the storage account. Use Edge o... | 🔵 6.0 | MS Learn |
| 39 ⚠️ | Defender for Cloud Apps tenant locked down - all access blocked after enabling BYOK data encrypti... | Azure Key Vault key is inaccessible due to missing permissions (List, Wrap Key, Unwrap Key), expi... | Check Key Vault access policy has List (Key Management), Wrap Key and Unwrap Key (Cryptographic O... | 🔵 6.0 | MS Learn |
| 40 ⚠️ | Defender for Cloud Apps BYOK data encryption fails despite correct key permissions - Key Vault ha... | Azure Key Vault firewall is blocking access from Defender for Cloud Apps service IPs | In Key Vault firewall settings, add IPs: 13.66.200.132, 23.100.71.251, 40.78.82.214, 51.105.4.145... | 🔵 6.0 | MS Learn |
| 41 ⚠️ | Sentinel data lake KQL query fails with Table could not be found or is empty error | Referenced table does not exist in the database, the table is empty, or the user does not have re... | 1) Verify the table name is correct; 2) Confirm data availability in the table; 3) Ensure the use... | 🔵 6.0 | MS Learn |
| 42 ⚠️ | Sentinel Storage Blob connector fails with permissions or networking errors in SentinelHealth | Incorrect RBAC roles on storage accounts or Network Security Perimeter (NSP) and firewall blockin... | 1) Verify service principal has Storage Blob Data Reader on blob account plus Storage Queue Data ... | 🔵 6.0 | MS Learn |
| 43 ⚠️ | Defender for Cloud workload protection dashboard fails to load | First enabler or data collection enabler lacks Owner/Contributor role on subscription | Ensure Owner or Contributor role for enablers; Reader role can then view dashboard | 🔵 6.0 | MS Learn |
| 44 ⚠️ | GHAzDO (GitHub Advanced Security for Azure DevOps) results not visible in Defender for Cloud reco... | ADO connector created before June scope update lacks new required scopes; or user permissions for... | Create new ADO connector with updated scopes; ensure Subscription ID matches between GHAzDO and D... | 🔵 6.0 | MS Learn |
| 45 ⚠️ | Cannot configure Pull Request Annotations in Defender for Cloud DevOps security | User lacks write (Owner or Contributor) access to the Azure subscription | Grant Owner or Contributor access to subscription; can obtain via activating Microsoft Entra role... | 🔵 6.0 | MS Learn |
| 46 | Creating Sentinel repository connection fails with error: The client does not have authorization ... | User does not have Owner role on the resource group containing the Azure Sentinel workspace. Owne... | Grant the user Owner role on the resource group containing the Sentinel workspace before creating... | 🔵 5.5 | ADO Wiki |
| 47 | Warning notification 'workspace is out of sync' displayed on the Unified RBAC (URBAC) Permissions... | Changes were made in Azure RBAC after onboarding to Unified RBAC, creating sync issues between th... | Open the warning, disable the affected workspaces in URBAC, then re-activate them. Going forward,... | 🔵 5.5 | ADO Wiki |
| 48 ⚠️ | Defender for Containers sensor pods not running on AKS cluster | Insufficient node resources, network policies blocking egress to Azure endpoints, or RBAC permiss... | Check pod events: kubectl get ds microsoft-defender-collector-ds -n kube-system; verify resources... | 🔵 5.0 | MS Learn |
| 49 ⚠️ | Attack path analysis shows incomplete details - some nodes or paths missing information when user... | If a user has limited permissions across subscriptions, they might not see full attack path detai... | Ensure the user has necessary permissions (Security Reader, Security Admin, Reader, Contributor, ... | 🔵 5.0 | MS Learn |

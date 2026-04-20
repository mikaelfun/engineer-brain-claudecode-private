# Entra ID RBAC/Roles/Groups Management — 排查工作流

**来源草稿**: ado-wiki-a-aad-roles-groups-css-test-environment.md, ado-wiki-a-azure-rbac-roles-entitlement-management.md, ado-wiki-a-bulk-actions-users-groups.md, ado-wiki-b-export-rbac-roles-csv-script.md, ado-wiki-b-group-name-claims-synced-groups.md, ado-wiki-b-pim-azure-lighthouse.md, ado-wiki-b-pim-azure-resources-rbac.md, ado-wiki-b-troubleshooting-msi-rbac-roles.md, ado-wiki-b-tsg-troubleshooting-rbac-permissions.md, ado-wiki-b-unified-rbac-api-tsg.md... (+30 more)
**Kusto 引用**: authorization-manager.md
**场景数**: 26
**生成日期**: 2026-04-07

---

## Scenario 1: Azure AD Bulk Actions for Users and Groups - TSG
> 来源: ado-wiki-a-bulk-actions-users-groups.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

---

## Scenario 2: ado-wiki-b-export-rbac-roles-csv-script
> 来源: ado-wiki-b-export-rbac-roles-csv-script.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 3: ado-wiki-b-troubleshooting-msi-rbac-roles
> 来源: ado-wiki-b-troubleshooting-msi-rbac-roles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  The correct Subscription was selected
- 2.  the correct resource group was selected
- 3.  the ManagedIdentity extension is installed on the VM
- 4.  the VM has a SystemAssigned 'identity' property on it
- 5.  the 'principalID' of the SystemAssigned 'identity property' is populated with the ObjectID of the MSI service principal
- 6.  the MSI service principal is present in MSODS.
- 1.  The person adding the VM to the RBAC role is a role Owner.
- 2.  the VM can be added to the role using PowerShell or Azure CLI 2.0 instead
- 1.  the ObjectID is populated on the principalId attribute of the SystemAssigned identity property on the VM object in Azure.
- 2.  the VM is added to the 'Access control (IAM)' blade of the desired resource in Azure.

---

## Scenario 4: Prerequisites
> 来源: ado-wiki-b-tsg-troubleshooting-rbac-permissions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1. Locate resource with ASC Resource Explorer**
   - 1. Using the scope of the resource found in the prerequisites, add the subscriptionID to [ASC Resource Explorer](https://azuresupportcenter.msftcloudes.com/resourceexplorerv2) using the + Add subscrip
   - 2. Switch the view mode to '''Resource group''' mode to list all the resource groups of the subscription
2. **Step 2. Identify what roles principal has at resource scope**
   - 1. From the resource's properties, choose the **Access Control** tab
   - 2. From the Access Control tab, locate the **Check access** function
   - 3. Paste the user or principal's AAD **objectID** from the Prerequisites
3. **Step 3. Identify what Actions and NotActions are granted via the Role name**
   - 1. From the Access Control tab, locate the **Roles** listing
   - 2. Use the column filter for **Name** and paste the Role name to filter the list of Roles and locate the assigned Role definition.  NOTE: If you try to filter by roleDefinitionID you need to remove th
   - 3. From the results, expand the Role definition to locate the **Permissions** definition
4. **Step 4. Identify what role is needed to resolve the issue**
   - 1. Once the issue is confirmed to be that the principal doesnt have the proper Role assigned to them that grants the needed RBAC Action at the scope requested, the next step is to identify what role s
   - 1. Search (CTRL+F) our [Azure built-in role definition list](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/587271/TSG-Troubleshooting-RBAC-Permissions-for-Azure-Resources) for a 
   - 2. [Create a new Custom RBAC role](https://docs.microsoft.com/en-us/azure/role-based-access-control/custom-roles) and include the missing Action (ex. `Microsoft.Network/virtualNetworks/write` or `Micr

---

## Scenario 5: Unified RBAC API Troubleshooting Guide
> 来源: ado-wiki-b-unified-rbac-api-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Client sends request to MS Graph RBAC API
- 2. Graph routes to the appropriate RBAC provider (Azure AD, Intune, Exchange, etc.)
- 3. Provider processes the request and returns results

---

## Scenario 6: ABAC Conditions on Azure RBAC Role Assignments
> 来源: ado-wiki-c-abac-conditions-rbac.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 7: Compliance note
> 来源: ado-wiki-c-group-writeback-settings-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Start the configuration wizard and go through all sections without making any changes, until the Optional Features wizard page.
- 2. Check the Group writeback checkbox and click Next
- 3. Select the writeback forest and then the group writeback container
- 4. Check the Writeback Group Distinguished Name with cloud Display Name to use the group display name in Active Directory.
- 1. Is not being able to get rid of undesired unified groups written back to on-premises AD. Customer deletes the groups in AD, but they are written back again on the next sync cycle.
- 2. Newly created unified groups are getting written back to AD on the AADConnect sync cycle that runs after the group is created in AAD, even though, in the Azure portal, the writeback enabled option 
- 3. The desired outcome is to remove all groups written back from on-premises AD, and then writeback only selected groups.
- 1. What is the desired end behavior regarding group writeback?
- 2. Is group writeback V2 enabled?
- 3. Is unified group writeback (Group writeback V1) enabled in AADConnect?

---

## Scenario 8: CSS Troubleshooting Workflow
> 来源: ado-wiki-c-pim-azure-resources-troubleshooting-workflow.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 9: Issue: PIM Role Activation Delays
> 来源: ado-wiki-c-pim-role-activation-delays.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting conclusion + Escalation Guidance**
   - With the above analysis you can verify
   - 1. The id_token issued by Entra\AAD was issued AFTER the role was activated in PIM.  Compare the timestamp of Step 7, with the timestamp found in previous section in ASC Audit Log.  Was token issued a
   - 2. The id_token issued by Entra\AAD contains the Entra built in role the user activated in PIM.  Compare the roles found in wids claim of step 8, with the role activated via PIM in ASC audit log.

---

## Scenario 10: Microsoft Entra ID RBAC Custom Roles - Support Guide
> 来源: ado-wiki-c-rbac-custom-roles-guide.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 11: Summary
> 来源: ado-wiki-d-ca-admin-portals-app-group.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Have user click OK on the error (possibly twice due to retry bug) - user will then be prompted for MFA
- 2. Exclude user from the Microsoft Admin Portals CA policy until compliance portal deployment completes

### 相关错误码: AADSTS50076

---

## Scenario 12: ado-wiki-d-group-membership-updates-troubleshooting
> 来源: ado-wiki-d-group-membership-updates-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Find object identifiers**
   - Query to locate group or user object attributes:
   - GlobalIfxAuditEvent
2. **Step 2: Query membership activity**
   - let GroupRepID = "Group Name";
   - let GroupSA = "Group ObjectID";

### 关键 KQL 查询
```kql
GlobalIfxAuditEvent
| where runProfileIdentifier == "RunProfileId"
| where env_time > ago(7d)
| where reportableIdentifier contains "XYZ" // group or user name/UPN/mail
| project env_time, sourceAnchor, targetAnchor, reportableIdentifier, eventName, description, ['details']
```
`[来源: ado-wiki-d-group-membership-updates-troubleshooting.md]`

```kql
let GroupRepID = "Group Name";
let GroupSA = "Group ObjectID";
let GroupTA = "Group targetAnchor";
let UserSA = "User ObjectID";
let UserTA = "User targetAnchor";
GlobalIfxAuditEvent
| where runProfileIdentifier == "RunProfileId"
| where env_time > ago(7d)
| where reportableIdentifier == GroupRepID or sourceAnchor == GroupSA or targetAnchor == GroupTA
| where ['details'] contains UserSA or ['details'] contains UserTA
| project env_time, correlationId, sourceAnchor, targetAnchor, reportableIdentifier, eventName, description, ['details']
```
`[来源: ado-wiki-d-group-membership-updates-troubleshooting.md]`

---

## Scenario 13: ado-wiki-d-sync-fabric-group-membership-tsg
> 来源: ado-wiki-d-sync-fabric-group-membership-tsg.md | 适用: Mooncake ✅ / Global ✅

### 关键 KQL 查询
```kql
GlobalIfxAuditEvent
| where runProfileIdentifier == "<runProfileIdentifier>"
| where env_time > ago(7d)
| where reportableIdentifier contains "<group or user displayname/UPN/mail>"
| project env_time, sourceAnchor, targetAnchor, reportableIdentifier, eventName, description, ['details']
```
`[来源: ado-wiki-d-sync-fabric-group-membership-tsg.md]`

```kql
let GroupRepID = "Group Name";
let GroupSA = "Group ObjectID";
let GroupTA = "Group targetAnchor";
let UserSA = "User ObjectID";
let UserTA = "User targetAnchor";
GlobalIfxAuditEvent
| where runProfileIdentifier == "<runProfileIdentifier>"
| where env_time > ago(7d)
| where reportableIdentifier == GroupRepID or sourceAnchor == GroupSA or targetAnchor == GroupTA
| where ['details'] contains UserSA or ['details'] contains UserTA
| project env_time, correlationId, sourceAnchor, targetAnchor, reportableIdentifier, eventName, description, ['details']
```
`[来源: ado-wiki-d-sync-fabric-group-membership-tsg.md]`

---

## Scenario 14: Cross-Tenant Group Synchronization
> 来源: ado-wiki-e-cross-tenant-group-sync.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

### 关键 KQL 查询
```kql
let correlationIdentifier = "";
GlobalIfxUsageEvent
| where runProfileTag == "Azure2Azure"
| where correlationId == correlationIdentifier
| where usageType == "Schema"
| project internalCorrelationId, message, env_seqNum
| extend is_pii_split = message startswith "%%pii_## SPLIT"
| parse message with "%%pii_" pii_message "%%"
| extend message = iff(is_pii_split, pii_message, message)
| parse message with "## SPLIT " split_num " #" split_index " of" * "##\\n " split_text " ###"
| extend split_num = iff(split_num == "", tostring(new_guid()),split_num)
| order by env_seqNum
| summarize make_set(split_text),take_any(internalCorrelationId) by split_num
| extend schema = strcat_array(set_split_text, "")
| project internalCorrelationId, schema
```
`[来源: ado-wiki-e-cross-tenant-group-sync.md]`

---

## Scenario 15: Dynamic Group Creation and Deletion TSG
> 来源: ado-wiki-e-dynamic-group-creation-deletion.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Ensure tenant has Azure AD P1/P2 Premium license
- 2. Ensure the user has appropriate admin permissions:
- 1. User attributes: check the [list of supported properties](https://docs.microsoft.com/azure/active-directory/active-directory-groups-dynamic-membership-azure-portal#supported-properties)
- 2. Device attributes: check the [list of device attributes](https://docs.microsoft.com/azure/active-directory/active-directory-groups-dynamic-membership-azure-portal#using-attributes-to-create-rules-f
- 3. If not in Simple Rule dropdown, use **Advanced Rule** with correct object prefix (e.g., `user.country`, `device.deviceOSType`)
- 4. [Extension Attributes](https://docs.microsoft.com/azure/active-directory/active-directory-groups-dynamic-membership-azure-portal#extension-attributes-and-custom-attributes) can be used for custom a
- 5. Simple rule builder supports up to 5 expressions; use text box for more
- 1. Ensure correct license (P1 Premium)
- 2. Ensure attribute is in supported properties list
- 3. For Advanced Rules, use correct syntax with appropriate object prefix

---

## Scenario 16: Scoping questions
> 来源: ado-wiki-e-dynamic-groups-scoping-questions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  **Is it a Dynamic Group?** To verify visit, [How to evaluate a group is dynamic group](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1126272/Dynamic-membership-rule-validatio
- 1.  If yes, proceed to the next troubleshooting steps in this Wiki.
- 2.  If no, visit this Microsoft docs [link](https://learn.microsoft.com/entra/fundamentals/how-to-manage-groups?context=azure%2Factive-directory%2Fusers-groups-roles%2Fcontext%2Fugr-context&view=azure
- 2.  **Dynamic Group Creation Issues?** Customers encountered these common issues in creating dynamic group or rule:
- 1.  **Can not create a dynamic group?** Do not see option to create a dynamic group in azure portal Or Error in creating a dynamic group in PowerShell? If yes, follow [this](https://supportability.vis
- 2.  **Can not find the attribute to create a rule?** If yes, follow [this](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1126270/Dynamic-group-Creation-and-Deletion?anchor=how-to
- 3.  **Receive max groups allowed error when trying to create a Dynamic Group in PowerShell?** This means you have reached the max limit for Dynamic groups in your tenant. The max number of Dynamic gro
- 3.  **Dynamic Membership Processing Issues?** Customers have created a dynamic group and configured a rule, but encountered these common issues:
- 1.  **No members shown up in the group?** or **Some user(s) or device(s) do NOT show up in the group?** or **Wrong user(s) or device(s) shown up in the group?**
- 1.  If yes, follow [Dynamic group has incorrect membership](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1126392/Dynamic-group-has-incorrect-membership).

---

## Scenario 17: Compliance note
> 来源: ado-wiki-e-group-provisioning-to-ad-cloud-sync.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 18: Overview
> 来源: ado-wiki-e-o365-groups-expiration-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**
   - 1. Double check the configuration, ensure group expiry policy is indeed turned off.
   - 2. With tenantId and GroupId, confirm in ASC whether the group still has GroupExpirationDate value.
   - If there's a value in the field (may include "#"), it indicates that the GroupExpirationDate has not be cleared.
2. **Troubleshooting / Confirming and updating renewedDateTime and ExpirationDateTime / renew using graph powershell**
   - ##Sharepoint Activity not updating Entra renewedDatetime/expirationDateTime
   - If this is an issue with Sharepoint Online activity not updating Entra : Please get output from sharepoint and entra using the powershell commands below
3. **Troubleshooting Guides (TSGs):**
   - Updated (11 October 2019) Group Expiration TSG is located [here](https://microsoft.sharepoint-df.com/:b:/s/AccountManagement-SupportEngineeringconnection/EVHxs9oWW-tDj6Wm6T36DqIBjt-ZXP0ki1l15JMB2iNkCQ
   - Updated (9 Aug 2019) Group Creation and Troubleshooting TSG is located [here](https://microsoft.sharepoint-df.com/:b:/s/AccountManagement-SupportEngineeringconnection/EdxKhMkjEp9MlD4rWkH4uE0BPJgmaL93N

---

## Scenario 19: Troubleshooting MemberOf Groups
> 来源: ado-wiki-e-tsg-dynamic-group-incorrect-membership.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. In the Entra Portal you can manually trigger the reprocessing by updating the membership rule to add a whitespace somewhere in the middle. Adding the space at the end will not work.
- 2. In the Entra Portal find the group and enable *Pause processing*. Wait 5 minutes and then turn this switch off.

---

## Scenario 20: TSG: Group Expiration and Auto-Renewal
> 来源: ado-wiki-e-tsg-group-expiration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

---

## Scenario 21: Compliance note
> 来源: ado-wiki-f-copilot-rbac.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Suggest relevant permissions**
- 2. **Offer guided options**
- 3. **Complete the role assignment**
- 1. **Select permissions**
- 2. **I need to add more permissions**
- 1. In Copilot, click the ellipses (...) and select **New chat**.
- 2. Press **F12** in the browser to open **Developer tools**.
- 3. Check the box for **Preserve log**.
- 4. Re-enter the same prompt that caused the issue.
- 5. Once the error occurs again, download the **HAR file**.

---

## Scenario 22: Azure AD RBAC Custom Roles for Enterprise Apps
> 来源: ado-wiki-f-rbac-custom-roles-enterprise-apps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

### 关键 KQL 查询
```kql
let delta = 2m;
let t = datetime("2019-01-17 22:31:52");
GlobalIfxUlsEvents
| where env_time > t - delta and env_time < t + delta
| where message contains "<resource_objectId>"
| project env_time, env_cloud_role, correlationId, contextId, internalCorrelationId, tagId, message
```
`[来源: ado-wiki-f-rbac-custom-roles-enterprise-apps.md]`

```kql
let delta = 2m;
let t = datetime("2019-01-17 22:31:52");
GlobalIfxUlsEvents
| where env_time > t - delta and env_time < t + delta
| where internalCorrelationId == "<id_from_step1>"
| project env_time, env_cloud_role, correlationId, contextId, internalCorrelationId, tagId, message
```
`[来源: ado-wiki-f-rbac-custom-roles-enterprise-apps.md]`

```kql
let delta = 2m;
let t = datetime("2019-01-17 22:31:52");
Global("IfxBECAuthorizationManager")
| where env_time > t - delta and env_time < t + delta
| where internalCorrelationId == "<id>"
| where tagId == "9xy6"  // Access Denied (use "0azf" for Granted)
| project env_time, env_cloud_role, correlationId, contextId, internalCorrelationId, tagId, task, result
```
`[来源: ado-wiki-f-rbac-custom-roles-enterprise-apps.md]`

---

## Scenario 23: ado-wiki-f-rbac-data-plane
> 来源: ado-wiki-f-rbac-data-plane.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting/Tools**
   - Jarvis queries can be used to dump all role memberships for all Scopes within a subscription. This will dump

---

## Scenario 24: Summary
> 来源: ado-wiki-f-transfer-groups-soa.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **No reconciliation support for local AD groups:** An AD admin (or other application with sufficient permissions) can directly modify an AD group. If SOA had been applied to the object and/or if cl
- 2. **No Dual write allowed:** Once you start managing a group?s memberships from Entra ID for the transferred group (say cloud group A) and you provision this group to AD using Group Provision to AD a
- 3. **SOA transfer of nested groups:** If you have nested groups in AD and want to transfer the SOA of the parent or top group from AD to Entra ID, only the parent group?s SOA will be switched. All the
- 4. **Extension Attributes (1-**1**5):** Extension attributes 1 ? 15 are not supported on cloud security groups and will not be supported once SOA is converted.
- 1. **Roles**:
- 2. **Permissions:** For apps calling into the OnPremisesSyncBehavior Graph API, Group-OnPremisesSyncBehavior.ReadWrite.All permission scope needs to be granted.
- 3. **License needed:** Microsoft Entra Free or Basic license.
- 4. Confirm that the minimum version of Entra Cloud Sync (TBD) is installed.
- 5. **On-Premises Exchange clean up:**  Please make sure that the data for your on-prem Exchange related groups is up to date and in sync with the data in EXO. This is just needed for Private Preview. 
- 1. An Entra ID tenant with on-premises sync enabled at the tenant level.

### 相关错误码: AADSTS9002325

---

## Scenario 25: Dynamic Group Processing — Pause & Resume Guide
> 来源: mslearn-dynamic-group-processing-pause-resume.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Wait at least 12 hours** before resuming (allow service recovery)
- 2. Resume critical groups first (`unPauseSpecificCritical.ps1`)
- 3. Then resume remaining groups in batches (`UnPauseNonCritical` — 100 groups at a time)
- 4. Microsoft Support can only help resume after 12-hour wait

---

## Scenario 26: Dynamic Groups Troubleshooting Guide
> 来源: mslearn-dynamic-groups-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **License**: Requires Entra ID P1 or P2 Premium
- 2. **Permissions**: Global admin, User admin; group creation may be restricted
- 3. **15,000 limit**: Max dynamic groups per tenant; no way to increase
- 1. Check processing status in portal (Overview page)
- 2. If "processing error" / "update paused" → contact admin/PG to resume
- 3. Validate user/device attributes match rule (manual validation or Validate Rules tab)
- 4. Guest user issue: Office 365 groups may block guest additions if `AllowToAddGuests=false`
- 5. Wait minimum 24 hours for large tenants

---

## 附录: Kusto 查询参考

### authorization-manager
> MSODS 授权管理查询

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxBECAuthorizationManager
| where env_time > ago(1d)
| where internalCorrelationId == "{correlationId}"
| project env_time, task, result, contextId, userObjectId, scopeClaim, isAppGrantedAccess
| order by env_time asc
```

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxBECAuthorizationManager
| where env_time between(datetime({startTime})..datetime({endTime}))
| where userObjectId == "{userId}"
| where result == "DENIED"
| project env_time, task, result, scopeClaim, applicationId, isAppGrantedAccess
```

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxBECAuthorizationManager
| where env_time > ago(1h)
| where contextId == "{tenantId}"
| summarize 
    AllowedCount = countif(result == "ALLOWED"),
    DeniedCount = countif(result == "DENIED")
    by task
| order by DeniedCount desc
```

---

---

## Incremental Scenarios (2026-04-18)

## Scenario 27: Global admin/Owner of Subscription Unable to access Azure Resources under PIM Unable to access Azure Resources under PIM...
> Source: contentidea-kb (entra-id-3651) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: Global admin/Owner of Subscription Unable to access Azure Resources under PIM Unable to access Azure Resources under PIM even though the user is a Global admin and the owner of the subscription, Getti...
2. **Root cause**: For PIM service to be able to access Azure resources, MS-PIM SPN should always have a User Access Administrator role assigned on a subscription.In this case the User Access Administrator role for PIM ...
3. **Solution**: Assign a User Access Administrator RBAC role to PIM SPN (MS � PIM) at a subscription level and that should allow PIM service to access the Azure resources.Note: The role can be assigned on a managemen...

---

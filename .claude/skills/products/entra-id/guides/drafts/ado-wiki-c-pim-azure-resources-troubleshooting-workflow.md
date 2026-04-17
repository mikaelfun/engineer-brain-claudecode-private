---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Privilege Identity Management (PIM)/Azure RBAC PIM for Azure Resources Troubleshooting Workflow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FPrivilege%20Identity%20Management%20(PIM)%2FAzure%20RBAC%20PIM%20for%20Azure%20Resources%20Troubleshooting%20Workflow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.AAD-PIM
- Azure RBAC PIM for Azure Resources Troubleshooting
-  cw.comm-secaccmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]

<table style="margin-left:.34in">
  <tr style="background:lightyellow;color:black">
    <td>
      <small>&#128276; <b>Note</b> &#128276
      <p style="margin-left:.27in">As of 2023-08 the below logs that utilize Jarvis queries for PIM service logs will no longer work as CSS must use ASC Kusto Web UX to query PIM service logs.  This wiki needs to be revised.  In meantime, please review <a href="https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184003/Privilege-Identity-Management-(PIM)?anchor=asc-kusto-web-explorer">Query PIM Service Logs with ASC Kusto Web UX</a></small>
    </td>    
  </tr>
</table>

# CSS Troubleshooting Workflow

For information on how this feature works, its architecture and other information like Service-Side roles, see the [Azure RBAC PIM for Azure Resources](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184160) wiki page.

### Issues with Activation

#### Issue: Attempting to Activate role membership fails

Determine if Activation fails from one or both management views (Main left navigation and/or the Role Management left navigation blades).

  - Browse to [Azure Privileged Identity Management](https://aka.ms/pimcanary) and click "**My Roles**" on the left navigation menu, and click the desired role to activate.

\-OR-

  - Click "**Azure Resources**" on the left navigation menu. Set the "**Resource filter**" to the desired scope and then click on the resource where activation is needed. Click "**My Roles**" on the left navigation menu of the resource and try to activate.

<!-- end list -->

  - If Activation failed from either blade, check the ApiRole WebRole logs in [Jarvis](https://jarvis-west.dc.ad.msft.net/#/logs) to understand why.

<https://jarvis-west.dc.ad.msft.net/F68A628C>

| Server Query             | Setting                                    |
| ------------------------ | ------------------------------------------ |
| **Endpoint**             | DiagnosticPROD                             |
| **Namespace**            | PIMAzureRbac                               |
| **Events to search**     | ServiceEvents                              |
| **Time range**           | UTC checked and -10 minutes                |
| **Scoping conditions**   | Role \> == \> ApiRole                      |
| **Filtering conditions** | eventType \> contains \> request           |
|                          | tenantID \> contains \> GUID               |
|                          | userID \> contains \> ObjectID             |
|                          | argument0 \> contains \> RoleAssignmentsV1 |
|                          | argument1 \> contains \> UserAdd           |

  - Copy the **CorrelationID** from the above query and modify the filter to examine the Detail logs:

<https://jarvis-west.dc.ad.msft.net/3058385C>

| Server Query             | Setting                           |
| ------------------------ | --------------------------------- |
| **Filtering conditions** | correlationID \> contains \> GUID |

  - All of the **Add** calls are asynchronous. It first hits the API service, then hands it over to worker role (**policyEvaluatorRole**) to apply the change. If there are no errors in ApiRole logs, the issue occurred in the PolicyEvaluatorRole. Modify the filter to search the logs by tenant and user:

<https://jarvis-west.dc.ad.msft.net/CBC8CA81>

| Server Query             | Setting                           |
| ------------------------ | --------------------------------- |
| **Scoping conditions**   | Role \> == \> PolicyEvaluatorRole |
| **Filtering conditions** | tenantID \> contains \> GUID      |
|                          | userID \> contains \> ObjectID    |

  - Copy the **CorrelationID** from the above query and modify the filter to examine the policyEvaluatorRole Detail logs:

<https://jarvis-west.dc.ad.msft.net/19389FA0>

| Server Query             | Setting                           |
| ------------------------ | --------------------------------- |
| **Filtering conditions** | correlationID \> contains \> GUID |

#### Issue: Activate button is greyed out

The Activate button in Ibiza UX is enabled or disabled by an active assignment check

  - **By design**: A user who already has a direct assignment to the role does not need to activate their role membership. (User will see the banner: role assignment exists)
  - **By design**: A user who already has JIT (eligible assignment) and has activated their role, does not need to perform another activation. (User will see the banner: role assignment exists)
  - **By design**: A user who has scheduled their role to activate at a later date will not be able to activate while there is a scheduled activation pending. The user will observe a notification on the activation blade stating, "**There is already an existing pending Role assignment request.**" When they click **My Roles** they will observe an indicator at the top stating "**There are \# pending requests**". Clicking the notification shows details about the pending request and allows the user to click **Cancel**.
      - Canceling the pending request will allow the user to immediately activate.
  - If user has no existing active assignments, then we need to look for service-side api returns querying the ApiRole WebRole.

| Server Query             | Setting                                    |
| ------------------------ | ------------------------------------------ |
| **Endpoint**             | DiagnosticPROD                             |
| **Namespace**            | PIMAzureRbac                               |
| **Events to search**     | ServiceEvents                              |
| **Time range**           | UTC checked and -10 minutes                |
| **Scoping conditions**   | Role \> == \> ApiRole                      |
| **Filtering conditions** | eventType \> contains \> request           |
|                          | tenantID \> contains \> GUID               |
|                          | userID \> contains \> ObjectID             |
|                          | argument0 \> contains \> RoleAssignmentsV1 |
|                          | argument1 \> contains \> Get               |

  - Copy the **CorrelationID** from the above query and search the Detail logs using this filter:

| Server Query             | Setting                           |
| ------------------------ | --------------------------------- |
| **Filtering conditions** | correlationID \> contains \> GUID |

#### Issue Require MFA is selected for a role but not being enforced when a user Activates their membership.

Role Settings defined at the Subscription or Resource Group levels do not inherit to that same role at the Resource Group or Resource level. For example, if the user is a member of the same role at multiple levels, the user will see the same role listed more than once nder **Eligible role assignments** when they click on **My Roles** tab as is shown in the example below.

[![RoleDuplication.jpg](/.attachments/38adc23e-6c8b-9584-7d8a-40f44ba540cf802px-RoleDuplication.jpg)](https://www.csssupportwiki.com/index.php/File:RoleDuplication.jpg)

Assume the Role Settings defined for Backup Contributors has "**Require Multi-Factor Authentication on activation**" checked at the Subscription level, but Role Settings for the same role at the Resource Group level does not have "**Require Multi-Factor Authentication on activation**" checked. If the user selects the Backup Contributors role assignment for the resource group, and not subscription, the user will not be prompted for MFA Proof-up upon activation.

  - The Subscription, Resource Group or Resource Owner may want to correct the duplication of roles

\-OR-

  - In this case, the role owner for the resource group, could set the "**Resource filter**" on the primary left navigation pane to "**Resource group**", select the resource group where this role membership exists, select the "**Role Settings**" tab and enable "**Require Multi-Factor Authentication on activation**" for that role.

#### Issue: MFA banner shows prior to activating

Customers can enable "MFA required for role activation" on a per role/per resource basis.

  - **By design**: The role member will see the banner if the customer modified the Role Settings for the role being activated at the scope (Subscription, Resource Group, Resource) where the resource exists.

#### Issue: User does not see their eligible role assignment in the list.

  - Check the ApiRole logs in [Jarvis](https://jarvis-west.dc.ad.msft.net/#/logs) to see if there is any issue while merging the role assignments:

<https://jarvis-west.dc.ad.msft.net/590FF8BC>

| Server Query             | Setting                                    |
| ------------------------ | ------------------------------------------ |
| **Endpoint**             | DiagnosticPROD                             |
| **Namespace**            | PIMAzureRbac                               |
| **Events to search**     | ServiceEvents                              |
| **Time range**           | UTC checked and -10 minutes                |
| **Scoping conditions**   | Role \> == \> ApiRole                      |
| **Filtering conditions** | eventType \> contains \> request           |
|                          | tenantID \> contains \> GUID               |
|                          | userID \> contains \> ObjectID             |
|                          | argument0 \> contains \> RoleAssignmentsV1 |
|                          | argument1 \> contains \> Get               |

  - Copy the **CorrelationID** from the above query and search the Detail logs using this filter:

<https://jarvis-west.dc.ad.msft.net/FC7B736E>

| Server Query             | Setting                           |
| ------------------------ | --------------------------------- |
| **Filtering conditions** | correlationID \> contains \> GUID |

### Issues with Add Role Assignment

  - Browse to [Azure Privileged Identity Management](https://aka.ms/pimcanary)
  - Click **Azure Resource** on the left Navigation menu and click the resource desired to manage.
  - Click **Roles** on the left Navigation menu and click the role (i.e. owner) desired to manage
  - Click **Add** in the role blade, select role, select a user or group, select settings.

#### Issue: The+Add button greyed out:

Add Button in Ibiza UX is enabled or disabled by permission check. Users who have write permission (i.e. owner, user access admin) for the selected resource, will see the button enabled.

  - Check with customer to determine whether the user has a role assignment that grants the user write permission
  - If yes, ask customer to refresh browser (there could be delay for permission to updated after assignment/activation)
  - If the role member has an eligible role assignment for roles that have write permission. Ask the user to activate through **My Roles**. After activation, if the button is still not enabled, refresh the browser.
  - If no, it is by design, the role member cant **Add**.

### Issues with "Change Settings" for Membership

**Issue** Unable to programmatically change Directly assigned role members that are "**Permanently assigned**" to have a direct assignment that expires, or to convert them to "**Just In Time**" members.

**Cause** The AzureRM PowerShell cmdlets are not PIM for Azure Resources aware.

**Solution** For now, customers must use the PIM for Azure Resources blade and manually convert all role memberships.

#### Issue "Permanently assigned" shows a red exclamation mark "" for Direct Assignments

Clicking **Change Settings** for a user that is assigned to an RBAC role from the IAM blade or from PowerShell will show their membership as "**Permanently assigned**" and a red exclamation mark "****" will appear to the right of the check box.

  - **By design**: The "**Direct Assignment**" role setting for the role that this user is a member of at this level (subscription, resource group, or resource) does not have "**Allow permanent assignment**" checked by default. The role setting acts as a security template showing how the current role membership at this level does not align with the setting that PIM would offer/enforce if a Direct assignment were made from PIM.
      - **Edit** the Role Setting for the desired role at the scope where the user is being added as a member. Place a check next to "**Allow permanent assignment**" under "**Direct Assignment Settings**"

<!-- end list -->

  - \-OR-
      - Changing a "**Direct Assignment**" to "**Just In Time Assignment**" cases the "**Permanently assigned**" membership to be removed and defines an expiration date/time when the user will be removed from the role and the user will be required to activate their role membership.

### Issues with Audit history for PIM

### Issues performing tasks after activating in PIM

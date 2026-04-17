---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Jarvis/How to get user role, permissions and role assignment scope in Jarvis"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/Jarvis/How%20to%20get%20user%20role%2C%20permissions%20and%20role%20assignment%20scope%20in%20Jarvis"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

# Quick Link
---
For convenience, if you are already familiar with this process, the following link can be used to take you directly to the Jarvis action:

* https://jarvis-west.dc.ad.msft.net/E7E4B81B?genevatraceguid=b1bbe6ed-4260-4be3-99f1-d4a84d91c8c7

# Instructions
---
<table style="border:0px;" width="100%">
    <tr>
        <td style="border=0px;background-color:#efd9fd">
            <b>Note:</b> This process only works for users who have roles assigned.  Users who have inherited role membership such as the Service Administrator will not produce any results because there is no specific role assigned yet the user has Owner permissions.
        </td>
    </tr>
</table>

1. Collect the following information to retrieve the role assignments (permissions) for a user.

   | Property | Description |
   |----------|-------------|
   | Subscription Id | The Azure Subscription Id. |
   | Tenant Id | The Tenant Id for the Azure Active Directory (AAD).<br><br>[How to get Azure Active Directory Tenant Id from Azure Subscription Id in Jarvis](/Azure-Monitor/How%2DTo/Jarvis/How-to-get-Azure-Active-Directory-Tenant-Id-from-Azure-Subscription-Id-in-Jarvis) |
   | Principal Id | The Azure Active Directory Object Id of the user.<br><br>[How to get user information for Azure Active Directory (AAD) user in Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-get-user-information-for-Azure-Active-Directory-\(AAD\)-user-in-Azure-Support-Center) |  

1. Open a browser and navigate to [Jarvis Actions](https://jarvis-west.dc.ad.msft.net/actions).
1. Set **Environment** to match the Azure environment you want to work against (usually Public).

    ![image.png](/.attachments/image-5617a203-44a0-4fe2-8499-c3651b1c1876.png)

1. In **Filter**, type **Get User Permissions** to filter down the action results then click on **Get User Permissions**.

   ![image.png](/.attachments/image-302c1146-23d8-409e-8831-c6d4ec48b163.png)

1. Populate the form values as per the table below:

   | Property | Value |
   |----------|-------|
   | Endpoint | PAS in Production |
   | Select Service | PAS |
   | Tenant Id | The Azure Active Directory (AAD) Tenant Id. |
   | Principal Id | The Azure Active Directory (AAD) Object Id of the user. |
   | Scope | The scope where the permission check should be applied.  Usually /subscriptions/<subscriptionid> but this can be any resource id to check permissions against that specific resource. |
   | Scope Search Direction | The direction of the search.  Usually when searching from the subscription you will want to choose ScopeAndBelow. |
   | Exclude Management Group Parents | (Unchecked) |

1. Click **Run**.

   ![image.png](/.attachments/image-2efd05d9-4db4-41c0-a044-8c2fec6802cd.png)

# Results
---
If everything works as expected, you should see a status of Success and a file named **getuserpermissions\*.zip** will be generated and downloaded by your browser.

![image.png](/.attachments/image-91c317fc-466d-4c4b-bba5-6061500b8a1c.png)

Save and open the zip file, then open the **permissions.txt** file contained inside the zip package.

![image.png](/.attachments/image-523dcc10-4651-47c3-8dab-a4d12f94f78f.png)

![image.png](/.attachments/image-2b3b6149-2dca-4893-9f04-4ac9c443a1d7.png)

Review the results making note of the role, the specific Actions and NotActions, the Role Scopes and the Type of assignment (for example Direct or Group).

In the example below, the user has been granted the Contributor role directly at the subscription scope as well as directly at a particular automation account.

```
Principal ID  : 3fc5d3c4-bf7e-4e68-91e2-448a66f2c676
Principal Type: User

Role Assignments:

	Application: ARM
	Role       : Contributor (b24988ac618042a0ab8820f7382dd24c)
	Permissions:
		Actions       :
			*
		NotActions    :
			Microsoft.Authorization/*/Delete
			Microsoft.Authorization/*/Write
			Microsoft.Authorization/elevateAccess/Action
			Microsoft.Blueprint/blueprintAssignments/write
			Microsoft.Blueprint/blueprintAssignments/delete
		DataActions   :
		NotDataActions:
		Condition  : 
	Role Scopes:
			/
	Assignment 6197554ceac249229a01b72a6eafb06b
		Scope    : /subscriptions/00000000-0000-0000-0000-000000000000
		Condition: 
		Type     : Direct
	Assignment a262f612d1314ab6b23b7b224a5dd4cc
		Scope    : /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/SubscriptionManagement/providers/Microsoft.Automation/automationAccounts/SubscriptionManagement
		Condition: 
		Type     : Direct
```

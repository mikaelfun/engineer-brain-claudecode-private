---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Azure Files Identity/Azure_Active_Directory_Authentication_over_REST/TSGs/AAD Files OAuth REST ASC role assignment check_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FAzure%20Files%20Identity%2FAzure_Active_Directory_Authentication_over_REST%2FTSGs%2FAAD%20Files%20OAuth%20REST%20ASC%20role%20assignment%20check_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to use ASC to view the role assignments for a particular user

**Step 1: Check Group memberships**

If the User is part of an AAD group and that group has RBAC permissions set up on it, the User will get the appropriate RBAC permissions through that group membership. Please first check User's group memberships using **ASC -> Tenant Explorer -> User** lookup capability.

**Step 2: Check Storage Account RBAC Role assignments**

Navigate to **ASC -> Resource Explorer** view for a particular storage account. Then navigate to "**RBAC Roles(Storage)**" tab to view role assignments on that specific storage account.

The **"Storage Roles"** view will show the role assignments at the storage account level. It does not show the role assignments set up at the File Share level. In the list, you can look up a particular user's role assignments by filtering using their Principal ID or AAD Object ID. If the User is part of a specific group, please also look up the role assignments for the groups.

**Step 3: Check Role assignments at the File Share Level**

You can set up role assignments at the share level as well, and to view those, you will have to look at them using "**Storage Sub Resources Roles**" capability.

A File Share Sub Resource should be in the following format: **/subscriptions/subscriptionname/resourceGroups/RGName/providers/Microsoft.Storage/storageAccounts/AccountName/fileServices/default/shares/sharename**

If you don't find a role assignment for the User or the group it is part of in either of these lists, please ask the customer to set up an appropriate role assignment for the User to resolve the issue.

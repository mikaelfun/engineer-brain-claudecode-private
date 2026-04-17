---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Group Management/Dynamic Groups/Scoping questions to start troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGroup%20Management%2FDynamic%20Groups%2FScoping%20questions%20to%20start%20troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-objprinmgt
- SCIM Identity
- cw.Group-Management
- Group Management
- Dynamic Groups
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [Entra](/Tags/Entra) [EntraID](/Tags/EntraID) [comm-objprinmgt](/Tags/comm%2Dobjprinmgt) [Group-Management](/Tags/Group%2DManagement) 


[[_TOC_]]

# Scoping questions

1.  **Is it a Dynamic Group?** To verify visit, [How to evaluate a group is dynamic group](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1126272/Dynamic-membership-rule-validation).
    1.  If yes, proceed to the next troubleshooting steps in this Wiki.
    2.  If no, visit this Microsoft docs [link](https://learn.microsoft.com/entra/fundamentals/how-to-manage-groups?context=azure%2Factive-directory%2Fusers-groups-roles%2Fcontext%2Fugr-context&view=azureadps-2.0) or other applicable groups TSG for additional troubleshooting info.
2.  **Dynamic Group Creation Issues?** Customers encountered these common issues in creating dynamic group or rule:
    1.  **Can not create a dynamic group?** Do not see option to create a dynamic group in azure portal Or Error in creating a dynamic group in PowerShell? If yes, follow [this](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1126270/Dynamic-group-Creation-and-Deletion).
    2.  **Can not find the attribute to create a rule?** If yes, follow [this](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1126270/Dynamic-group-Creation-and-Deletion?anchor=how-to-create-a-dynamic-membership-rule).
    3.  **Receive max groups allowed error when trying to create a Dynamic Group in PowerShell?** This means you have reached the max limit for Dynamic groups in your tenant. The max number of Dynamic groups per tenant is 5,000. To create any new Dynamic groups, you'll first need to delete some existing Dynamic groups. There's no way to increase the limit.
3.  **Dynamic Membership Processing Issues?** Customers have created a dynamic group and configured a rule, but encountered these common issues:
    1.  **No members shown up in the group?** or **Some user(s) or device(s) do NOT show up in the group?** or **Wrong user(s) or device(s) shown up in the group?**
        1.  If yes, follow [Dynamic group has incorrect membership](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1126392/Dynamic-group-has-incorrect-membership).
    2.  **Existing members of the rule are removed?**  This is expected behavior. Existing members of the group are removed when a rule is enabled or changed or attributes are changed. The users returned from evaluation of the rule are added as members to the group.
    3.  **Don’t see membership changes instantly after adding or changing a rule?**  Membership evaluation is done periodically in an background process. How long the process takes is determined by the number of users in your directory and the size of the group created as a result of the rule. Typically, directories with small numbers of users will see the group membership changes in less than a few minutes. Directories with a large number of users can take 24 hours or longer to populate.
        1.  Check the [membership processing status](https://learn.microsoft.com/entra/identity/users/groups-create-rule#check-processing-status-for-a-rule) to confirm if it is complete and the last updated date on the group **Overview** page in Azure portal to confirm it is up-to-date.
    4.  **How can I force the group to be processed now?** follow [this](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1126279/Dynamic-membership-Processing-issues?anchor=force-the-group-to-be-processed-now).
    5.  **Rule processing error?** follow [this](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1126272/Dynamic-membership-rule-validation?anchor=rule-processing-error).
4.  **Dynamic Group Deletion or Restoration Issues?**
    1.  **Error in deleting a group**? Before attempting to delete a group in Azure Active Directory, ensure you have [deleted all assigned licenses](https://learn.microsoft.com/entra/identity/users/licensing-group-advanced#deleting-a-group-with-an-assigned-license) to avoid errors (For more info about group deletion in general, please follow How to delete a group), don't forget License Management now is exclusive from Office Identity Admin Portal.
    2.  **Restored a deleted group but did not see any update?**  When a dynamic group is deleted and restored, it is seen as a new group and re-populated according to the rule. This process might take up to 24 hours.
5.  **Get help with case.** Ask question in [Group management Teams channel](https://teams.microsoft.com/l/channel/19%3ac6e22a9b887d4f77b177cd074d345616%40thread.skype/Group%2520management?groupId=56c43627-9135-4509-bfe0-50ebd0e47960&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)  to get further help from aztabot, SMEs, TAs, and PG members. Or file IcM incident accordingly.
6.  **Communicate with customer.**  Follow these example emails to communicate with customer for root cause and solution.


----------------------
# How to evaluate a group is a dynamic group

Two options to check whether a group is dynamic group:

1.  Customers can check on *Azure portal*: Select the group, in the “Overview” tab, check whether the “membership type” is “***Dynamic***”.



    ![DynamicGroup1](/.attachments/AAD-Account-Management/184006/DynamicGroup1.png)



2\. CSS can check on **Azure Support Center**:

  - Go to [https://azuresupportcenter.msftcloudes.com/](https://azuresupportcenter.msftcloudes.com/tenantexplorer/)
  - Log in with your Microsoft account
  - Enter the support request ID
  - Go to “Azure AD explorer” Tab on top, navigate to “Groups” in the left panel, as shown below:
  - Select search by Object ID, then provide group\_id in the search bar to run the query to get group properties. If “groupType” property equals to “DynamicMembership”, it is a dynamic group.

    ![ASC grouptype.png](/.attachments/AAD-Account-Management/184006/ASC_grouptype.png)



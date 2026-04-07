---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Group Management/Dynamic Groups/TSG - Dynamic group has incorrect membership"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGroup%20Management%2FDynamic%20Groups%2FTSG%20-%20Dynamic%20group%20has%20incorrect%20membership"
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

This wiki article covers troubleshooting of dynamic groups that are either in a failed processing state, or which have unexpected membership (ex. objects in a dynamic group which should not be, or objects which should be in a dynamic group but which are not). MemberOf dynamic groups have some unique problems, and so this page has been divided into troubleshooting MemberOf dynamic groups, and troubleshooting non-MemberOf dynamic groups. Remember to also check out the [Known Issues - Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/997252/Known-Issues) page

**Public documentation**
- [Troubleshooting Groups with dynamic membership processing in Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/dir-dmns-obj/troubleshoot-dynamic-group-processing)
- [Troubleshoot dynamic groups | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/dir-dmns-obj/troubleshoot-dynamic-groups) 


# Troubleshooting MemberOf Groups
##Important information regarding MemberOf Groups
As of November 2025, MemberOf groups are not recommended to be used in production tenants. This is called out publicly on [Configure dynamic membership groups with the memberOf attribute in the Azure portal (preview) - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-rule-member-of).

>  Warning
> This is a preview feature and isn't intended for production use. The use of this feature comes with limitations that can affect dynamic group processing in the tenant. We recommend you review the [Preview limitations](https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-rule-member-of#preview-limitations) section before using this feature.

Support will be limited for escalations raised regarding issues with MemberOf groups that are in production tenants. For most escalations that report incorrect membership on a MemberOf group, adding a space to the middle of the membership rule will resolve the issue once the group goes through a reprocess.

- Public Documentation: https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-rule-member-of

## MemberOf Group is in a failed processing state
Most of the time this is because the group has exceeded the allowed nesting level of 1. A MemberOf dynamic group cannot define the membership of another MemberOf dynamic group. For example, Dynamic Group A, with members of group B and C in it, can't be a member of Dynamic Group D), as mentioned [here](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/997252/Known-Issues?anchor=**issue-1**%3A--memberof-rule-preview-limitations). This is also noted publicly on [Group membership in a dynamic group (preview) in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-rule-member-of). 

*You can't use one memberOf dynamic group to define the membership of another memberOf dynamic group.*

If this is the case, the Membership Processing Status will show as **Failed**.

![image.png](/.attachments/image-cc0d6240-89f5-4a01-98fc-60232731181e.png)

If the Failed status is due to exceeding a nesting depth of 1, the issue will fall into one or both of the following situations. Consider Group A which has a `user.memberof -any (group.objectId -in['<GroupID>','<GroupID>',....` MembershipRule and that has a Membership Processing Status of Failed:

- The MembershipRule of Group A contains the GUID of a dynamic group that has a `user.memberof` membership rule
- There is a Group B that contains a `user.memberof -any (group.objectId....` Membership rule that contains Group A

To troubleshoot, look up all of the Group ObjectIDs in the MemberOf Membership rule and check if any of them are also MemberOf dynamic groups. If they are, the customer will need to remove them from the membership rule of the failing group. If you don't find any MemberOf groups, then there is most likley another MemberOf dynamic group in the tenant that contains the ObjectID of the MemberOf group that is in a failed state. If the tenant has less than 999 groups, you can use ASC to pull a list of all dynamic groups in the tenant. Once obtained, search all membershipo rules for the ObjectID of the MemberOf group that is in a failed state.

If you are unable to determine if MemberOf group is in a failed state due to exceeding the nesting level of 1, please create an escalation to the product engineering team. [Creating incidents for or transferring incidents to the Groups team](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/546368/Creating-incidents-for-or-transferring-incidents-to-the-Groups-team-AAD-Groups-).

## MemberOf Group has incorrect membership
If the group is not in a failed processing state, but has incorrect membership, this can often be resolved by having the group go through a full re-process. See [Reprocess the group](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&_a=edit&pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Group%20Management/Dynamic%20Groups/Dynamic%20group%20has%20incorrect%20membership&pageId=1126392&anchor=reprocess-the-group).

Remember that the Membership Rule Evaluation tool does not support MemberOf groups, and so cannot be used to verify if an object either should, or should not be in a MemberOf group. To determine this, you will need to manually check the objectID against the membership rule. This restriction is noted publicly on https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-rule-member-of.

*The dynamic group rule builder and validate feature can't be used for memberOf at this time.*



# General Troubleshooting of Dynamic Groups

## The Dynamic Group is in a failed processing state
In ASC, search for a group, and then select the Dynamic Membership Rules tab. The Membership Processing Status property will show if the group is in a failed state. Verify that the Membership Rule does not start with MemberOf, and if it is see the section above for MemberOf groups. If the group does show that it is in a failed processing state check the following.

- Does the syntax of the membership rule look correct? You can copy the membership rule and try it in a dynamic group in a test tenant to see if the UX will allow the rule to be saved
- Check audit logs for the when the membership rule was last updated. Does the timestamp of the last membership rule update correspond to when the group last succeeded in processing? If so, the issue may be with the syntax of the membership rule
- [Reprocess the group](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&_a=edit&pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Group%20Management/Dynamic%20Groups/Dynamic%20group%20has%20incorrect%20membership&pageId=1126392&anchor=reprocess-the-group)


## The Dynamic Group has incorrect membership
In ASC, look up the group with the incorrect membership and select the Dynamic Membership Rules tab. 
- Verify that the Membership Processing Status does not show failed. If it does, troubleshoot that first.
- Use the Membership Rule Evaluation tool to check the reported ObjectID that either should be in the group, or should not be in the group. Does this tool agree with what the customer is reporting? Does the tool show that the ObjectID does or does not match the Membership rule of the group? If the tool shows the ObjectID matches the Membership Rule but is not in the group, or it does not match the Membership rule but is in the group, move to the next point
    - ![Membership rule evaluation check.png](/.attachments/Membership%20rule%20evaluation%20check-45f17b85-d6a6-4edb-bb49-d426afae26b0.png)
- Has it been at least 24 hours since the ObjectID matches, or stopped matching the Membership Rule of the group? Changes to dynamic groups can take 24 hours or longer to take effect. This is noted on https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/dir-dmns-obj/troubleshoot-dynamic-groups. *Dynamic membership groups changes are usually processed within a few hours. However, processing can take more than 24 hours depending on factors such as the number of groups, the number of changes, and the complexity of the rules.*
- Is the member that should be added to the group, but which is not, a Guest? If so, check the property AllowToAddGuests on the group to see if this is set to false. Also check the tenant level for this setting. 
    - https://learn.microsoft.com/en-us/entra/identity/users/groups-settings-cmdlets#read-settings-at-the-directory-level
    - https://docs.microsoft.com/en-us/azure/active-directory/users-groups-roles/groups-settings-cmdlets#update-settings-for-a-specific-group
- [Reprocess the group](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&_a=edit&pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Group%20Management/Dynamic%20Groups/Dynamic%20group%20has%20incorrect%20membership&pageId=1126392&anchor=reprocess-the-group)

## The Dynamic Group is processing very slowly
Our target for dynamic group updates is 24 hours, but it can take longer. This is noted on https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/dir-dmns-obj/troubleshoot-dynamic-groups. 
 
 *Dynamic membership groups changes are usually processed within a few hours. However, processing can take more than 24 hours depending on factors such as the number of groups, the number of changes, and the complexity of the rules.*

Ask the customer if they have made a large number of changes to objects in the tenant. If so, there may be a backlog that dynamic groups is working through. The Product Engineering team can verify if this is the case. If it is, the customer can either wait for the backlog to finish, or they can pause every dynamic group in their tenant, and then one by one unpause the most critical groups first. This should be done slowly, and as each group finishes processing the next group can be unpaused. This is noted on https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/dir-dmns-obj/troubleshoot-dynamic-group-processing.

## Reprocess the group
This will force a group to reprocess and can help with groups that seem to be stuck, or that have incorrect membership. This can be done with either of the following:

1. In the Entra Portal you can manually trigger the reprocessing by updating the membership rule to add a whitespace somewhere in the middle. Adding the space at the end will not work.
2. In the Entra Portal find the group and enable *Pause processing*. Wait 5 minutes and then turn this switch off.

**Warning**
> This should not be done to all groups in a tenant in a short amount of time. Doing so can cause a processing backlog in the tenant which could lead to delays in dynamic groups being processed. If you suspect that there is a tenant wide backlog (ie. there are a large amount of dynamic groups that are taking a long time to finish processing), please have the customer pause all of their dynamic groups. Once all are paused, the customer can then unpause the most critical groups that need to be processed. Once processing on those has finished, the customer can continue slowly unpausing the dynamic groups in their tenant. This is noted on https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/dir-dmns-obj/troubleshoot-dynamic-group-processing.


# Escalating to the product engineering team
See [Creating incidents for or transferring incidents to the Groups team](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/546368/Creating-incidents-for-or-transferring-incidents-to-the-Groups-team-AAD-Groups-).
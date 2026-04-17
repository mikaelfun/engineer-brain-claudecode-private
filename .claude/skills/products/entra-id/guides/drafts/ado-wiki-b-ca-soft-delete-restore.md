---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Entra ID Conditional Access and Named Location Soft Delete and Restore"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FEntra%20ID%20Conditional%20Access%20and%20Named%20Location%20Soft%20Delete%20and%20Restore"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- cw.CATemplates
- SCIM Identity
- Conditional Access
- Conditional Access Templates
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD Workflow](/Tags/AAD-Workflow) [Conditional-Access](/Tags/Conditional%2DAccess)                                
 

[[_TOC_]]

# Summary:

Conditional Access Policies assist administrators with handling access to resources in complex environments. As such, some CA policies can be complex to configure. When one of these policies is accidentally deleted, recreating them can be difficult. To assist administrators with recovering accidentally deleted CA polices we are introducing a soft delete functionality for both CA Policies and Named Location Policies. This new functionality will allow administrators to:

- Restore deleted CA policies and Named Locations to their previously configured state within 30 days of the policy being deleted. 
- View and select deleted items before restoring
- Permanently deleted these polices when it is necessary. 

# Pre-requisites: 
- Permissions: The account must have a minimum of Conditional Access Manager role  have equivalent permissions (Security Administrator, Global Administrator, “microsoft.directory/conditionalAccessPolicies/delete”)
- Licensing: As this feature applies to Conditional Access Policies and Named Locations, an Entra P1 or P2 is required. 

# GUI Updates:

To support the ability to soft delete and restore these polices the Entra Admin Center Conditional Access blade has been updated to reflect the changes.

When deleting a policy the administrator will now be notified that they will have 30 days to restore the policy.

**Note:** Administrators will see the same dialog whether they try to delete the from the Policy List or from inside the properties of the policy.

![CA Delete Policy Dialog](/.attachments/AAD-Authentication/2185774/New-Delete-CA-Policy-Dialog.jpg)

Recovering a deleted Policy can be done from the new Deleted Policies (Preview) blade under Conditional Access.

![Deleted Policies Menu Item](/.attachments/AAD-Authentication/2185774/Deleted-Policies-Menu-Item.jpg)

From the list of policies an administrator can see the following: 
- Who deleted the policy
- When it was deleted
- When it will be permanently deleted

For actions, the administrator can choose to restore or permanently delete any policies from the list.

![Deleted Policies Menu Item](/.attachments/AAD-Authentication/2185774/Deleted-Policies-Actions.jpg)

If the administrator chooses to permanently delete a policy, they will be notified that this will be a permanent action.

![Permanently Delete Dialog](/.attachments/AAD-Authentication/2185774/Permanent-Delete-Dialog.jpg)

If the administrator chooses to restore a policy, they will be notified that the policy will be restored to its original state, but administrators can choose to restore the policy to “Report Only Mode”

![Restore Conditional Access Policy Dialog](/.attachments/AAD-Authentication/2185774/Restore-Policy-Dialog.jpg)

If other components of the policy have changed since it was deleted (user object deleted for example), the policy will restore (**Only in Private Preview. This will change at release and we will not restore the policy**) but may fail to change to “Report Only” mode. The administrator will need to correct the missing conditions/objects from the restored policy. 

![Restore Failure Dialog](/.attachments/AAD-Authentication/2185774/Restore-Failure.jpg)

# Named Locations

The Named Locations blade has been updated to include the Creation Date and Modified Date for named locations.

![Deleted Named Location Blade](/.attachments/AAD-Authentication/2185774/Delete-Named-Location-Blade.jpg)

To recover or permanently delete a Named Location click the “Deleted Named Locations (Preview)” tab on the Named Location blade.

![Deleted Named Locations Preview Tab](/.attachments/AAD-Authentication/2185774/Deleted-Named-Locations-Preview-Tab.jpg)

From here the administrator can permanently delete the named location or restore it. 

![Deleted Policies Menu Item](/.attachments/AAD-Authentication/2185774/Named-Location-Delete-Restore-Menu.jpg)

# Important Notes:

- **Policy Restoration Behavior:** Deleted policies will be restored regardless of the status of their dependent objects (e.g., named locations, authentication strengths). During private preview we did allow the policies to be restored, but at release we will not allow a policy that has a deleted object/condition to be restored. We will log what is missing and the administrator will need to make corrections to allow the policy to be restored.
- **Restore Timing and Visibility:** Please allow up to 5 minutes for restored policies and their associated objects (such as named locations) to appear under their respective blades in the portal. This delay also applies to metadata such as the “Deleted by (actor)” field. 

![Deletion Actor Not Available Banner](/.attachments/AAD-Authentication/2185774/Deletion-Actor-Not-Available-Banner.jpg)

- **Policy State on Restore:** Policies will be restored in the same state they were in at deletion—whether On, Off, or Report-only, but only if all linked objects/conditions are available. 
- **Changing Policy State During Restore:** You can choose to set the policy to Report-only during the restore process. However, if any dependent objects are missing or cannot be restored, the state change will fail and the policy will not be restored. After a successful restoration, the administrator should be sure to verify the policy’s integrity and configuration after restoration.

# Escalations

ICM Path: 

Owning Service: Conditional Access UX

Owning Team: Triage


# Deep Dive: 

**Title:** Deep Dive: 232859 - Conditional Access soft delete & restore preview

**Format:** Self-paced eLearning

**Duration:**  35 Minutes

**Audience:** Azure Identity

**Region:** All regions 

**Course Location:** [Deep Dive - 232859 - Conditional Access soft delete & restore preview](https://aka.ms/AAwz8xz)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.
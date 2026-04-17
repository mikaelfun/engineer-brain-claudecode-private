---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/Entra ID User OnPremise Attributes Now Writable"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20User%20Management/Entra%20ID%20User%20OnPremise%20Attributes%20Now%20Writable"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-objprinmgt
- SCIM Identity
- cw.User-Management
- User Management
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [Entra](/Tags/Entra) [EntraID](/Tags/EntraID) [comm-objprinmgt](/Tags/comm%2Dobjprinmgt) [User-Management](/Tags/User%2DManagement)  


[[_TOC_]]

# Compliance note

This wiki contains test and/or lab data only.

___

# Summary

We have released an update to Entra that will allow Administrators to update the �onPremise###� attributes for user objects. Currently these attributes are set to read only. This change will allow Administrators to update these attributes using Microsoft Graph. Start of Authority V1 will be the initial change and we plan to expand this functionality at a later date.  

Note: This is not intended to allow an administrator to change a user object to Cloud Only without disabling dirsync. That is still unsupported. **Dirsync will need to be disabled for this to work.** 

The attributes that can be updated are:

| Attribute                    | Scenarios                                                    |
| ---------------------------- | ------------------------------------------------------------ |
| OnPremisesSamAccountName     | On-prem  SSO, CBA                                            |
| OnPremisesDomainName         | On-prem  SSO, WHfB                                           |
| OnPremisesDistinguishedName  | Dynamic  AUs and groups. PTA and Exchange Hybrid configuration |
| OnPremisesSecurityIdentifier | On-prem  SSO, WHfB                                           |
| OnPremisesUserPrincipalName  | App  proxy                                                   |

# Permissions Needed

The following Admin Roles are needed to update these attributes: 

- Global Admin

- User Admin

- Hybrid Identity Admin

Any delegated rights or Apps with the User.ReadWrite.All permissions will also be able to update these attributes. 

# How to update

All changes will need to be made through Microsoft Graph:

```
PATCH https://graph.microsoft.com/v1.0/users/userObjectID 

{

   "onPremisesSamAccountName": �SamAccountX�

}
```

**Deep Dive 223252 � Enable Update for User On-Prem Attributes**

In this deep dive, Identity PM, Yuan Karppanen will review the a change we are making to the OnPremiseUser### attributes in Entra. Yuan discusses how we are changing these attributes to be writable to allow Admins to update them after Dirsync has been disabled for the tenant. 

**Title**: Deep Dive 223252 � Enable Update for User On-Prem Attributes

**Course ID:** TBD

**Format:** Self-paced Learning

**Duration:** 

**Audience:** Cloud Identity Support Communities **Object and Principal Management**

**Microsoft Confidential:** Items not in Public Preview or released to the General Audience should be considered confidential. All Dates are subject to change.

**Tool Availability:** Late November

**Region:** All Regions

**Course Location:** [Cloud Academy](https://microsoft.sharepoint.com/:v:/t/SCIMLearningImprovement/ETC3uvIzU_tNkT33r1uwkb0B2d1rBCMfU33TBaCzO2ePgA?e=FhEibQ)

 

 

 



---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/GDAP Scenarios Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20User%20Management%2FGDAP%20Scenarios%20Troubleshooting"
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
- Roles and Administrators
- GDAP
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [Entra](/Tags/Entra) [EntraID](/Tags/EntraID) [comm-objprinmgt](/Tags/comm%2Dobjprinmgt) [User-Management](/Tags/User%2DManagement) 

 
[[_TOC_]]


#<p style="color:blue">Overview

## 1. Requirements for a CSP technician to sign in to an application 

### For a CSP user to sign in to an application in a customer tenant, the following must be true:_ 

1. There must be a DAP or GDAP relationship between the customer and the CSP 

1. There must be role assignments in the customer tenant for which the “member” is a security group in the partner tenant 

1. The CSP technician must be assigned to one or more groups that have such role assignment 

1. The CSP technician must not be blocked by a conditional access policy in the customer tenant.   **Update 3 November 2022**: An update to Azure AD Conditional Access Policies should correct this problem. Please see [Azure AD Conditional Access Fine Grained Policies for Guests and External Users](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/755946/Azure-AD-Conditional-Access-Fine-Grained-Policies-for-Guests-and-External-Users) for more information. There is an example of using inbound CA policies with GDAP in the [Typical Customer Scenarios](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/755946/Azure-AD-Conditional-Access-Fine-Grained-Policies-for-Guests-and-External-Users?anchor=typical-customer-scenarios) section. 

1. The application must know how to accept a DAP/GDAP token [Where to find data for GDAP access issues ]()



2. Requirements for a CSP technician to complete a task in an application: 

### In order to perform a task within an application that the CSP technician has signed in to: 

1. One or more roles to which the CSP technician is assigned must have permission to complete the task 

1. The application must correctly authorize the request using wids claim in the CSP technician’s token. 

1. A user who only has DAP role assignments (but no GDAP role assignments) must not be a B2B guest in the customer tenant 


# <p style="color:blue">Troubleshooting scenarios
<p style="color:red">Note: If you dont have a support case or the right tenant associated with the case. In  that case perform the following troubleshooting steps with the help of Partnercenter admins. </p>

##Scenario1: No CSP technician can sign in to any app in the customer tenant 
1. Confirm that a DAP or GDAP relationship exists between the tenants ?
   
    [Check DAP relationship](#Does-a-DAP-relationship-exist-between-customer-&-CSP-tenant?)
    
    [Check GDAP relationship](#Does-a-GDAP-relationship-exist-between-customer-&-CSP-tenant?)

 If you dont see the relation 

1. Confirm that no conditional access policy in the customer tenant blocks the CSP technicians from signing in 

1. Create IcM for PG investigation 


### Scenario2: A particular CSP technician can’t sign in to any apps in the customer tenant (but other technicians can) 
1. Confirm that the CSP technician is in a group that has a role assignment in the customer tenant 

1. Confirm that no conditional access policy in the customer blocks this user from signing in to the customer tenant 

1. Create IcM for PG investigation 

### Scenario3: A particular CSP technician can’t sign in to a particular app in the customer tenant (but technician can sign in to other apps) 

### Scenario4: A CSP technician can sign in to a particular app, but cannot complete a task that they expect to complete 

1. Identify if the task the CSP technician is trying to perform, is not currently supported for GDAP users 

1. If the CSP technician only has a DAP role assignment, confirm that they are not a B2B guest in the customer tenant 

1. Identify the roles that the CSP technician is expected to have in the customer tenant 

1. Confirm that the user’s token has each of those roles in the wids claim 

1. Confirm that one or more of the roles the user has, has permission to complete the task 

1. Confirm that a local user with that role is able to complete the task 

1. Create IcM for PG investigation 
 (potentially file bug with the feature crew responsible for the task) 

### Scenario5: CSP Unable to Access Azure Subscriptions or Resources

For this scenario, please reference [TSG: Troubleshooting CSP Partner Access](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/736515/TSG-Troubleshooting-CSP-Partner-Access)



# <p style="color:blue">Where to find data for GDAP access issues 

#### Does a DAP relationship exist between customer & CSP tenant? 
1. Once the tenant is loaded in ASC. Click on the Dap tab as shown below to see whether is relationship exists between the customer tenant and partner tenant. In the image below tenantId b53d9c23-####-####-####-############ belongs to a customer tenant. ![image-5ff](/.attachments/AAD-Developer/628221/image-5ff.png)

2. Once you click on the Dap tab you will see the following info. Check if tenantId exists under the list. If its not present then there is no DAP relationship between the customertenant and partner tenant.
![image-dba](/.attachments/AAD-Developer/628221/image-dba.png)


#### Does a GDAP relationship exist between customer & CSP tenant? 

1. Once the tenant is loaded in ASC. Click on the Gap tab as shown below to see whether is relationship exists between the customer tenant and partner tenant. In the image below tenantId b53d9c23-dbe5-41cc-b5bb-f17fa9ea47b2 belongs to a customer tenant.![image-3fc](/.attachments/AAD-Developer/628221/image-3fcc80ff-d768-4862-a3c7-7d28b9ebd7b0.png)

2. Once you click on the Dap tab you will see the following info. Check if tenantId exists under the list. If its not present then there is no DAP relationship between the customer tenant and partner tenant.
![image-5e7](/.attachments/AAD-Developer/628221/image-5e7.png)

###### What DAP role assignments, if any, exist in the customer tenant? 

###### What GDAP role assignments, if any, exist in the customer tenant? 

###### Is the CSP technician assigned to a group with a role assignment in customer tenant? 

###### Is the CSP technician’s sign in blocked by a conditional access policy in the customer tenant? 

###### Does the application know how to accept a DAP/GDAP token? 

###### Do the role(s) to which the CSP technician is assigned in the customer tenant, have permission to complete the task? 

###### Does the application correctly authorize the request using wids claims in the CSP technician’s token? 

# GDAP Audit Logs in End Customer Tenant

When customer global admin approves a GDAP relationship, the customer's Microsoft Entra ID Audit Logs will indicate that a external Group object ID was added to an AAD role in their tenant by the service principal **Partner Customer Delegated Admin Offline Processor** .  If this is the initial setup of GDAP relationship in customer tenant, the **Partner Customer Delegated Administration** service principal will be shown in Microsoft Entra ID Audit Logs as updating the CrossTenantAccessPolicy.  

Additionally during the [Microsoft-Led DAP to GDAP migration](https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition) these logs will appear in customer Microsoft Entra ID Audit logs.  This is discussed in the following articles:

   - [GDAP FAQ What are the two AAD Service Principals that are created in the customer's tenant | Microsoft Docs](https://learn.microsoft.com/partner-center/gdap-migration-faq#what-are-the-two-azure-active-directory-gdap-service-principals-that-are-created-in-the-customers-tenant). 
   - [Microsoft led DAP to GDAP Transition Customer Audit Logs](https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition#audit-logs-in-the-customer-tenant)

   ![image.png](/.attachments/image-a7101fa2-9d25-45b3-b9ea-2e9f91c573b7.png)

If there are customer questions about how\why this principal was used to assign roles \ change XTAP policy in their tenant they should be referred to their CSP partner to review and discuss.  If the customer does not recognize the partner associated to the activity they should [terminate the relationship](https://learn.microsoft.com/partner-center/gdap-customer-terminate) and follow up with their partner to re-establish the appropriate access. Their partner will need to [request a new GDAP relationship and obtain the customer's approval](https://learn.microsoft.com/partner-center/gdap-obtain-admin-permissions-to-manage-customer).

## GDAP Microsoft Entra ID Audit Logs FAQ

#### Why is the “Partner customer delegated admin offline processor” making unauthorized role assignment changes in my tenant?
As part of the Microsoft-led DAP to GDAP transition, any existing DAP relationships with a CSP partner will be transitioned to GDAP relationships.  During this transition this service principal will be shown as the actor converting existing DAP relationships to GDAP relationships as explained in [GDAP Microsoft-Led Transition](https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition)

#### Who is being assigned these roles?  The Microsoft Entra ID Audit logs do not indicate who is being assigned the role. Neither the Partner Name or Tenant seem to be referenced in the log. 

Partner users who are part of the Admin Agent or Help desk Agent SG will have access, the individual partner user information is not exposed to customers by design. You can find the details of which AAD roles are added to which SGs here [Microsoft-led transition from DAP to GDAP - Partner Center | Microsoft Learn](https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition#which-azure-ad-roles-are-automatically-assigned-to-which-predefined-csp-security-groups-as-part-of-microsoft-led-transition) 

#### Who authorized these role assignments?

As part of MS Led DAP to GDAP migration as long as there is an active DAP relationship between a partner and a customer, MS will automatically create new least privileged GDAP relations (For the scope of MS Led migration, since there is an existing DAP it is assumed that the customer has already given a consent) and then remove high privileged DAP. Going ahead [customer will need to consent](https://learn.microsoft.com/partner-center/gdap-customer-approval) the GDAP relationship creation post the migration outside of the default GDAP.

#### Will the Microsoft Entra ID Audit Logs for Microsoft-Led DAP to GDAP transition be improved?
Today the customers can see the partner information, Reseller relationship, GDAP relationship, list of roles in their MAC portal and can also terminate relationships there itself. For AAD logs, since this migration was a one-time activity and as we have already completed the MS Led GDAP creation part, it feature not part of our backlog.  We will look at incorporating in the audit log information for future GDAPs post the MS led migration


## GDAP Audit Question Suggested Verbiage

```
The activity you have noticed (Partner Customer Delegated Admin Offline Processor adding RBAC roles in Microsoft Entra ID Audit logs) is expected and consistent with a partner that your organization has an active relationship with being added to roles in your AAD via acceptance of a GDAP (granular delegated admin privileges).  Please review Microsoft led transition from DAP to GDAP documentation (https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition) and what the Microsoft Entra ID Audit logs for end customer will look like (https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition#audit-logs-in-the-customer-tenant) during this transition.
 
The GDAP relationship has to be initiated from the partner end and accepted via confirmation from a global admin in your tenant, or automatically from the partner side if they already have Delegated Admin Privileges granted for your tenant.  The roles that you have seen in the audit logs are the roles that the partner has set for the GDAP relationship with your tenant. 
	
For more information and if you wish to further discuss the assigned roles, I suggest reaching out directly to your partner and if they require additional support from our end they can raise a new support request for our team.  To review your current DAP or GDAP CSP partner relationships and their contact info visit https://admin.microsoft.com -> Settings -> Partner Relationships

If you do not recognize this partner relationship, you should terminate it (https://learn.microsoft.com/partner-center/gdap-customer-terminate) and follow up with your partner to re-establish the appropriate access where needed.
	
For more information on what the Partner Customer Delegated Admin Offline Processor principal is please reference the following link:
	• https://learn.microsoft.com/partner-center/gdap-migration-faq#what-are-the-two-azure-active-directory-gdap-service-principals-that-are-created-in-the-customers-tenant
	
For more information on GDAP relationships with CSP Partners please reference the following links:
	• https://learn.microsoft.com/partner-center/gdap-introduction
    • https://learn.microsoft.com/partner-center/gdap-faq
    • https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition
```

If there are still questions related to this service principal making changes in customer tenant, locate the Microsoft Entra ID Audit Log in question from ASC and work with TA to raise ICM to the (SPS-MECh-Motivate and Enable the channel / SPS-MECh- Eventing and Audit Service) team.

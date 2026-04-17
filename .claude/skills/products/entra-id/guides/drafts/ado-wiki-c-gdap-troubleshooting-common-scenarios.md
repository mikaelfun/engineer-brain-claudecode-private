---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/GDAP Troubleshooting guide for common scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20User%20Management%2FGDAP%20Troubleshooting%20guide%20for%20common%20scenarios"
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
   

[[_TOC_]]

# **Compliance note**
This wiki contains test and/or lab data only.

# **Introduction** #  

This article contains information on how to troubleshoot common GDAP scenarios.

# **Prerequisite Reading** #
Please watch this quick demo to understand how GDAP works [Demo Link](https:/aka.ms/gdapdemo1)


# GDAP Terminology

Partner/Provider tenant: Tenant where the group is originally created. This is user home tenant.

Customer tenant: Tenant where user is trying to sign-in. Failure/Problem will most likely happen in this tenant.


#Troubeshooting of GDAP SignIn:

This TSG is divided in 4 sections.

1. Error Type most likely user will see.
2. Scoping Questions
3. Identify Tenant-Type (Partner or Customer) associated with the case.
3. Troubleshooting - This is split into 2 sections based on the Tenant type associated with the case.

      - Troubleshooting in case of Partner Cases without consent
      - Troubleshooting in case of Customer Cases with consent. 

        

# [Step1: Error most likely user will receive](#step1)

1. _Sample Snapshot of Error User will see:_

![image.png](/.attachments/image-ea32fe1e-5ac1-40bf-9034-bccfb448f9df.png =80%x)

2. _Sample Error Text you will recieve in ticket_: <p style="color:red"> _The request failed with the following exception: AADSTS50020: User account '{EmailHidden}' from identity provider 'https://sts.windows.net/{tenantId}/' does not exist in tenant 'Self' and cannot access the application '{application guid}'(ADIbizaUX) in that tenant. The account needs to be added as an external user in the tenant first. Sign out and sign in again with a different Azure Active Directory user account._</p>


# [Step2: Scoping questions](#step2)

Before proceeding to troubleshoot step, gather answer to question given below.

- Q1. Upn of user who failed to SignIn
- Q2. Expected role of the user trying to signin?
- Q3. Task he was trying to perform?
- Q4. Optional if you have CID/Timestamp of the failure? 

# [Step3: Determine Tenant-Type associated with Case](#step3)

If consent is present that the case was opened from Customer tenant.

If consent is not present that it can be from either Partner tenant or Customer tenant. Follow the steps below to figure out the Tenant-Type.
1. Go to [ASC](https://azuresupportcenter.msftcloudes.com/)
2. Load the case, once the associated tenant is loaded
3. Click on Domains tab and navigate to "_Domain Details_".
4. If the user upn domain matches the one of the listed Domains result set. Then the case is from the Partner tenant else its from Customer tenant.
<p style="color:darkred">Note: For Customer tenant cases please request for consent before proceeding to troubleshooting. For Partner cases currently you can't request consent. However, the work is in progress and will be out soon.</p>

![image.png](/.attachments/image-1ec85ede-8c5b-4eb5-8385-153df607ee23.png =80%x)


# [Step4: Troubleshooting for Partner Cases](#step4)

Please note: since you dont have consent for Partner cases. You will have limited functionality access to ASC. AS a result, in this case you have to work with CSP Admins to troubleshoot the case.

### [Symptom1: User is not able to sign-in (_Most likely scenario to happen_)](#PartnerTenantSymptom1)

#### **Check1: Check if GDAP relationship is setup** 

1. Ask CSP admin to go to [partner center](https://partner.microsoft.com/commerce/granularadminaccess/list)
2. Click on the Administer tab and filter by tenant name and select the tenant
   ![image.png](/.attachments/image-0e0c032d-e7cb-4aa8-914f-5da0a1edf0c1.png =80%x)
3. Check if Gdap relationship is present and active as shown in the picture. If no relationship is present or relationship is expired or inactive and request for a new Gdap realtionship. Else proceed to Check2.
<p style="color:darkred">Note: Its possible to have multiple Gdap relationships. However, the probability of having multiple relationships is pretty low.</P>

  ![image.png](/.attachments/image-4e25c59a-5c13-471a-adf9-738f5bcfa1f4.png =80%x)


#### **Check2: Group is provisioned and has the right role**

1. Click on the GDAP relationship identified in Check1->Step3.
2. Please check if the expected role user was trying to sign-in is part of Azure AD roles list allowed for this relationship (marked in red in the image below).
3. Finally expand each group and identify the group the matches the role with user was trying to sign-in (highlighted in yellow in the image below). 
4. If no group is found matching the role than CSP admin should add the group to this relationship and add member to the group by logging in to partner tenant. If group with the expected role is present then copy the group Name and proceed to Check3. 
<p style="color:darkred">Note: If multiple Gdap relationships are present you have to go to repat the process for each Gdap relationship and copy the name of each group that matches the expected role. However, the probability of having multiple relationships is pretty low.</p>

   ![image.png](/.attachments/image-b633cfad-8b88-42fc-b3bd-83f571cea88c.png =80%x)

#### **Check3: Check if user is assigned to group**

1. Ask CSP Admin to login into the Partner tenant via Azure portal [AzurePortal](https://portal.azure.com/)
2. Click on _"Active Directory"_ and then go to _"Groups"_ tab
3.  Filter the groups by the name identified in Check2->Step4.
4. Click on the _"Members"_ tab from the left pane and see if the user is part of the group. If user is not part of the group, please add the user to the group else check if user in the right role for the action he is trying to perform.



### [Symptom2: User was able to sign-in but after couple of time he lost access](#PartnerTenantSymptom2)

#### **Check 1: Sign-in blocked from accessing the tenant due to activity was identified as Suspicious or Risky.**

1. Ask CSP admin to login to customer tenant.
2. Go to _"Security"_ tab and then to _"Risky"_ user tab
3. De-risk the user by selecting the user form the list and selecting "Dismiss user(s) risk" (shown in the image below). To further read about how to Identify and Remediate the risk please go to [Remediate risks and unblock users](https://learn.microsoft.com/azure/active-directory/identity-protection/howto-identity-protection-remediate-unblock).

![image.png](/.attachments/image-c7d653e5-c707-4126-a8f8-3663805b04d3.png =80%x)


### [Symptom3: User receiving 403 while making request](#PartnerTenantSymptom3)

_Common Error Scenarios: _
1. Some functionality in azure portal is not accessible user receiving 403 while making request 
2. Control panel vendor is writing an app for CSP's and the application hasn't subscribed to the AAI claim.



# [Step4.1 Troubleshooting for Customer Cases](#step4.1)


## [Step4.1.1: Identify the SignIn](#step4.1.1)

### **If you already have CID and timestamp** 
 
1. Go to [ASC](https://azuresupportcenter.msftcloudes.com/)
2. Load the case, once the associated tenant is loaded
3. Go to ASC, load the case go to "_Sign-Ins_" tab and then click on the "_Diagnostics_" tab 
4. Click on the link "_Go to the new sign-in troubleshooting experience for this tenant_". This will open up another tab with the AuthTroubleshooter.
5. Select "_Search by Correlation ID or Request ID_" symptom.
6. Enter the CID and Timestamp provided in the ticket.
7. Once the request is loaded. Expand the expert view 

![image.png](/.attachments/image-ad29c486-5755-43e4-b088-066021457569.png)


### **If you don't have CID and timestamp**

1. Go to [ASC](https://azuresupportcenter.msftcloudes.com/)
2. Load the case, once the associated tenant is loaded
3. Go to sign-in tab and click on the Sing-In logs tab
4. Enter the upn or Status Error code or update the datetime range to get the list of sign-ins.
5. Click on "_Interactive user_" tab as shown below in the picture.
6. Once the sign-in is selected, click on the "_Troubleshoot this sign-in_"  link


## [Step4.1.2: Gather the roleIdTemplateId corresponding to role](#step4.1.2)

**You can do this via two ways:**

### **Via ASC:**
a. Click on "_Directory Roles_" and click on the "_Role Definitions_" tab
b. Select the role from the dropdown for which you want to see the details. In the example below I have selected Global Administrator for which the RoleTempalteId is 62e90394-69f5-4237-9190-012177145e10,

![image.png](/.attachments/image-902e6c2a-6734-49ca-9318-f4ce22a7297d.png)

### **Via this link (Note: this doesnt list customer roles):**

a. [List of all Azure Roles with their Id's](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles)


## [Step4.1.3: Select a symptom and troubleshoot](#step4.1.3)

### [Symptom1: User is not able to sign-in (_Most likely scenario to happen_)](#CustomerTenantSymptom1)

#### **Check1: Group is provisioned and has the right role**

1. You should already have the roleTempalteId from Step3.
2. Go to AuthTroubleshooter, once the request is loaded. Expand the expert view and select the _"ResourceApp"_ tab (shown below in the image)
2. Filter values by "Group Proxies"
3. You will see a list of Group proxies as shown in Sample group policy section.
4. Each row starts with a * and lists ObjectId, OriginalGroupId, OriginalTenantId, Roles. Within Roles object it will have CloudSid,ObjectID,RoleTemplateId. 
5. If you dont see the roleTemplateId the user is looking to be part of then that mean the group hasnt been provisioned properly. Please reach out to CSP admin???
6. However if you see the RoletempalteId. Copy the corresponding OriginalGroupId associated with the RoleTempalteId. For example in the example below this OriginalGroupId 13f18b24-f854-45ea-ab26-45b8a8d0be1f is associated with the RoleTemplateId:{62e90394-69f5-4237-9190-012177145e10} which is Global Administrator role.
Finally proceed to Check2.

``` 
How to read the group policy:
Each row starts with a * and lists ObjectId, OriginalGroupId, OriginalTenantId, Roles. Within Roles object it will have CloudSid,ObjectID,RoleTemplateId. 
CFL: 48; SFL: 48; CurFL: 48; GroupProxyQuery: 

GROUP PROXIES:  * ObjectId:{4337fbeb-62ad-47c5-8d1e-4093eeba1e5e}   OriginalGroupId:{13f18b24-f854-45ea-ab26-45b8a8d0be1f}   OriginalTenantId:{251ccce3-5937-48e4-a933-5f655be4bc40}   Roles:[{CloudSid:"S-1-12-1-3588345035-1206207554-1965894302-358060078"   ObjectID:{d5e1cccb-4442-47e5-9e2a-2d752e905715}   RoleTemplateId:{62e90394-69f5-4237-9190-012177145e10}   }]   
 * ObjectId:{b3d96cab-1d69-4f9a-9097-8b3e8416b848}   OriginalGroupId:{c689bbb9-0b9f-4147-9292-ded27700ad48}   OriginalTenantId:{251ccce3-5937-48e4-a933-5f655be4bc40}   Roles:[{CloudSid:"S-1-12-1-691374583-1239251763-473302686-3706655945"   ObjectID:{293589f7-7b33-49dd-9e06-361cc914efdc}   RoleTemplateId:{f2ef992c-3afb-46b9-b7cf-a126ee74c451}   }]   
 * ObjectId:{c1d243c5-6248-4a07-9ad4-bd47738ab7f9}   OriginalGroupId:{e81b4891-671a-43c1-8611-403bcced33c3}   OriginalTenantId:{251ccce3-5937-48e4-a933-5f655be4bc40}   Roles:[{CloudSid:"S-1-12-1-3367642141-1280845088-3224126642-2225860127"   ObjectID:{c8ba241d-2520-4c58-b244-2cc01feeab84}   RoleTemplateId:{194ae4cb-b126-40b2-bd5b-6091b380977d}   }]   
 * ObjectId:{b7720db4-29cb-4e11-8d04-1b59f3bb33da}   OriginalGroupId:{ced984c9-d378-44ed-891d-a358ef4ec752}   OriginalTenantId:{251ccce3-5937-48e4-a933-5f655be4bc40}   Roles:[{CloudSid:"S-1-12-1-2016303372-1155475214-4020351372-2704927335"   ObjectID:{782e590c-270e-44df-8cb1-a1ef67ea39a1}   RoleTemplateId:{fe930be7-5e62-47db-91af-98c3a49a38b1}   }]   
 * ObjectId:{8a08ee05-f463-4725-9171-5ce0de8abd1a}   OriginalGroupId:{60854432-356b-40fb-a5f5-729945588e9a}   OriginalTenantId:{251ccce3-5937-48e4-a933-5f655be4bc40}   Roles:[{CloudSid:"S-1-12-1-1465665245-1300486496-1415534252-1317113093"   ObjectID:{575c46dd-d960-4d83-ac56-5f54058d814e}   RoleTemplateId:{dd4db9a0-cc4a-4213-9f9f-70242232d97e}   }]   

```
![image.png](/.attachments/image-7968f0c8-cadb-4250-ab51-18847abd2a96.png)



#### **Check2: Check if user is assigned to group**

1. You should already have the RoleTempalteId from Step3 and OriginalGroupId from the the above Check1->Step6.
2. Ask the CSP admin or the user to check if he is part of the group with OriginalGroupId.If user is not part of the group, please add the user to the group else check if user in the right role for the action he is trying to perform.


#### **Check3: Check if GDAP relationship is setup** 

1. Go to AuthTroublehsooter, Once the request is loaded. Expand the expert view and click on the XTAP tab shown below in the picture
5. Check if cross tenant policy is present. 
<p style="color:darkred"> _Note: If Xtap tab or Resource tenant XTAP policy is not present then the GDAP relationship is not present. </p>

##### Sample Cross-tenant Xtap policy: The value "a73f9cbc-2d27-4f3e-b20a-edc434e644ff" in the policy below is the Id of the Provider tenant.
``` 


{
    "CrossTenantAccessPolicy": {
        "Version": 1,
        "TenantGroup": [
            {
                "id": "0e0da83f-e305-405e-8153-6fc221f08cf2",
                "Tenants": [
                    "a73f9cbc-2d27-4f3e-b20a-edc434e644ff"   
                ],
                "FromMyTenancy": [
                    {
                        "AllowAccess": false
                    }
                ],
                "ToMyTenancy": [
                    {
                        "AcceptMFA": true,
                        "AllowServiceProvider": true
                    }
                ]
            }
}
```
![image.png](/.attachments/image-32a6d3a6-73cc-467a-9f78-1dbd09466849.png)

<br/>
<br/>

### [Symtpom2: User was able to sign-in but after couple of time he lost access](#CustomerTenantSymptom2)

#### **Check 1: Sign-in blocked from accessing the tenant due to activity was identified as Suspicious or Risky.**

1. Ask CSP admin to login to customer tenant.
2. Go to _"Security"_ tab and then to _"Risky"_ user tab
3. De-risk the user by selecting the user form the list and selecting "Dismiss user(s) risk" (shown in the image below). To further read about how to Identify and Remediate the risk please go to [Remediate risks and unblock users](https://learn.microsoft.com/azure/active-directory/identity-protection/howto-identity-protection-remediate-unblock). 

### [Symptom3: User receiving 403 while making request](#CustomerTenantSymptom3)

_**Common Error Scenarios:**_
1. Some functionality in azure portal is not accessible user receiving 403 while making request 
2. Control panel vendor is writing an app for CSP's and the application hasn't subscribed to the AAI claim.


#### **Check1: Service hasn't subscribed to AAI claim**

1. Go to ASC, go to sign-ins tab and filter down the request you are interested in either by using upn or correlation/Timestamp.
2. Select "Troubleshoot this signin" link.
3. This will open up the Auth-Troubleshooter.
4. Once the request is loaded. Expand the expert view and select the _"ResourceApp"_ tab (shown below in the image)
5. Filter values by "aai"

<p style="color:darkred">Please note: IdTokenOptionalClaims will be present only in the case if user is trying to login via Azure Portal else it will be empty.</p>

![image.png](/.attachments/image-8e7aeae1-1be6-490a-a6e5-cef267e9c52f.png)

# GDAP Audit Logs in End Customer Tenant

When customer global admin approves a GDAP relationship, the customer's AAD Audit Logs will indicate that a external Group object ID was added to an AAD role in their tenant by the service principal **Partner Customer Delegated Admin Offline Processor** .  If this is the initial setup of GDAP relationship in customer tenant, the **Partner Customer Delegated Administration** service principal will be shown in AAD Audit Logs as updating the CrossTenantAccessPolicy.  

Additionally during the [Microsoft-Led DAP to GDAP migration](https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition) these logs will appear in customer AAD audit logs.  This is discussed in the following articles:

   - [GDAP FAQ What are the two AAD Service Principals that are created in the customer's tenant](https://learn.microsoft.com/partner-center/gdap-migration-faq#what-are-the-two-azure-active-directory-gdap-service-principals-that-are-created-in-the-customers-tenant). 
   - [Microsoft led DAP to GDAP Transition Customer Audit Logs](https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition#audit-logs-in-the-customer-tenant)

   ![image.png](/.attachments/image-a7101fa2-9d25-45b3-b9ea-2e9f91c573b7.png)

If there are customer questions about how\why this principal was used to assign roles \ change XTAP policy in their tenant they should be referred to their CSP partner to review and discuss.  If the customer does not recognize the partner associated to the activity they should [terminate the relationship](https://learn.microsoft.com/partner-center/gdap-customer-terminate) and follow up with their partner to re-establish the appropriate access. Their partner will need to [request a new GDAP relationship and obtain the customer's approval](https://learn.microsoft.com/partner-center/gdap-obtain-admin-permissions-to-manage-customer).

## GDAP AAD Audit Logs FAQ

#### Why is the “Partner customer delegated admin offline processor” making unauthorized role assignment changes in my tenant?
As part of the Microsoft-led DAP to GDAP transition, any existing DAP relationships with a CSP partner will be transitioned to GDAP relationships.  During this transition this service principal will be shown as the actor converting existing DAP relationships to GDAP relationships as explained in [Microsoft-led transition from DAP to GDAP - Partner Center | Microsoft Learn](https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition)

#### Who is being assigned these roles?  The AAD audit logs do not indicate who is being assigned the role. Neither the Partner Name or Tenant seem to be referenced in the log. 

Partner users who are part of the Admin Agent or Help desk Agent SG will have access, the individual partner user information is not exposed to customers by design. You can find the details of which AAD roles are added to which SGs here [Microsoft-led transition from DAP to GDAP - Partner Center | Microsoft Learn](https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition#which-azure-ad-roles-are-automatically-assigned-to-which-predefined-csp-security-groups-as-part-of-microsoft-led-transition) 

#### Who authorized these role assignments?

As part of MS Led DAP to GDAP migration as long as there is an active DAP relationship between a partner and a customer, MS will automatically create new least privileged GDAP relations (For the scope of MS Led migration, since there is an existing DAP it is assumed that the customer has already given a consent) and then remove high privileged DAP. Going ahead [customer will need to consent](https://learn.microsoft.com/partner-center/gdap-customer-approval) the GDAP relationship creation post the migration outside of the default GDAP.

#### Will the AAD Audit Logs for Microsoft-Led DAP to GDAP transition be improved?
Today the customers can see the partner information, Reseller relationship, GDAP relationship, list of roles in their MAC portal and can also terminate relationships there itself. For AAD logs, since this migration was a one-time activity and as we have already completed the MS Led GDAP creation part, it feature not part of our backlog.  We will look at incorporating in the audit log information for future GDAPs post the MS led migration


## GDAP Audit Question Suggested Verbiage

```
The activity you have noticed (Partner Customer Delegated Admin Offline Processor adding RBAC roles in AAD audit logs) is expected and consistent with a partner that your organization has an active relationship with being added to roles in your AAD via acceptance of a GDAP (granular delegated admin privileges).  Please review Microsoft led transition from DAP to GDAP documentation (https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition) and what the AAD audit logs for end customer will look like (https://learn.microsoft.com/partner-center/gdap-microsoft-led-transition#audit-logs-in-the-customer-tenant) during this transition.
 
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

If there are still questions related to this service principal making changes in customer tenant, locate the AAD Audit Log in question from ASC and work with TA to raise ICM to the (SPS-MECh-Motivate and Enable the channel / SPS-MECh- Eventing and Audit Service) team.

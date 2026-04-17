---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure RBAC for Resources/TSG: Troubleshooting CSP Partner Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20RBAC%20for%20Resources%2FTSG%3A%20Troubleshooting%20CSP%20Partner%20Access"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.AAD-RBAC
- cw.comm-secaccmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
# Introduction

A [Cloud Solution Providers (CSP Partner)](https://learn.microsoft.com/en-us/partner-center/csp-overview) can establish a relationship to their Customer's Microsoft Entra ID tenants using the Microsoft Partner Center - See [What is the Partner Center](https://learn.microsoft.com/en-us/partner-center/overview).

These relationships are configured in Microsoft Entra ID as either [Delegated administration privileges (DAP) model](https://learn.microsoft.com/en-us/partner-center/dap-faq), or the newer [Granular Delegated Admin Privileges (GDAP) model](https://learn.microsoft.com/en-us/partner-center/gdap-introduction).

Once this relationship is established, the CSP Partner can authenticate to Customer's Microsoft Entra ID tenant using [Passthrough Authentication](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/43142/Passthrough) as a Passthrough user.  A passthrough user is much like a B2B guest in resource tenant, but does not have a user object in resource tenant at all.

[[_TOC_]]


# Prerequisites

Troubleshooting CSP Partner Access requires that you have ASC Consent to the end customer's Microsoft Entra ID tenant.  If you do not have ASC Consent to the end customer's tenant please review [ASC Consent for Partner/CSP scenarios](https://azsupportdocs.azurewebsites.net/asc/articles/AddTenants.html#partnercsp)

# 1. Verifying DAP or GDAP Relationship

The first step to confirm in the customer tenant, is that the DAP or GDAP Relationship exists in Azure Support Center's Tenant Explorer

1. Browse to ASC -> Tenant Explorer for the Customer tenant
2. Choose the Tenant ID node, and browse to Details -> **Partners(DAP)** section and **Partners(GDAP)** sections.

3. Verify that the CSP's Tenant ID is listed either under one of these two sections:

4. Once the relationship type is verified to exist, you can continue to troubleshooting signin access or permissions sections below
5. If the relationship cannot be verified, the customer and CSP will need to work with the Partner Center support team to establish one of these two types of relationships, otherwise no Passthrough Auth will work.


# 2. Verifying Authentication

Once the CSP DAP or GDAP relationship has been verified.  Generally, a CSP's next issue is successfully authenticating to the customer tenant.  Troubleshooting this aspect, is the same as any authentication problem.

1. Request the Correlation ID \ Timestamp of the sign in failure or obtain by repro of failure while capturing a https://aka.ms/hartrace
2. Consult the ASC -> Tenant Explorer -> Sign In Logs -> Auth Troubleshooter experience to diagnose this Correlation ID

   NOTE: In order to see Troubleshoot this sign-in link for Auth Troubleshooter, you must be a member of https://aka.ms/myaccess group "Azure Identity - 20630"

3. If you do not have the correlation ID, you can also filter the ASC -> Tenant Explorer -> Sign In logs using the **filter ( Cross Tenant Access Type = serviceProvider )** , then use the Troubleshoot this sign-in link to open Auth Troubleshooter for this failure

   Example below is from CSP Customer (not partner) ASC context:

   ![image-d26](/.attachments/AAD-Account-Management/736515/image-d26.png)

4. If you do not have ASC Consent to the CSP Customer (not partner) tenant, you will need to either request the CSP Partner admin provide a https://aka.ms/hartrace to locate the login.microsoftonline.com timestamp \ correlation ID \ request ID.  Or have the CSP partner admin provide this to you manually by clicking the 3 dots "..." in bottom right of sign in failure screen and providing you the Troubleshooting details including timestamp \ correlation ID \ request ID.

   Example:

   ![image-851](/.attachments/AAD-Account-Management/736515/image-851.png)

5. With these details collected, you can use ASC Auth Troubleshooter link from CSP ASC context  (ASC -> Tenant Explorer -> Sign-Ins -> Diagnostics tab -> Go to the new sign-in troubleshooting experience for this tenant) and input the provided Correlation ID \ Request ID \ Timestamp to determine the source of the failure

6. A few important notes on DAP\GDAP Passthrough User authentication:

   - Passthrough User authentication does not support certain types of Conditional Access policies.  This includes [Terms of Use policies](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/terms-of-use) see [FAQ](https://learn.microsoft.com/en-us/partner-center/gdap-faq#can-gdap-or-dap-access-a-customer-account-with-a-conditional-access-policy) and ICM example [237932379](https://portal.microsofticm.com/imp/v3/incidents/details/237932379/home) and [Session Controls](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/concept-conditional-access-session) and ICM example [311806301](https://portal.microsofticm.com/imp/v3/incidents/details/311806301/home)

      - If a Terms of Use policy is blocking CSP admin from logging in the customer facing error may indicate an error such as `AADSTS50177: User account cspadmin@cspdomain.com from identity provider X does not exist in tenant Y and cannot access application Z in that tenant. The account needs to be added as n external user in the tenant first.` If you grab correlation ID and run through ASC Auth Troubleshooter, the expert diagnostic logs will mention the true error which is `ExternalChallengeNotSupportedForPassthroughUsers` .  The end customer must exclude this application from Terms of Use policy as Terms of Use policies are not supported for CSP authentication.

      - If a Session Control policy is blocking is blocking CSP admin from logging in the customer facing error may indicate an error such as `AADSTS50178: User account {EmailHidden} from identity provider X does not exist in tenant Y and cannot access the application Z (Azure Portal) in that tenant. The account needs to be added as an external user in the tenant first. Sign out and sign in again with a different Azure Active Directory user account.`  If you grab correlation ID and run through ASC Auth Troubleshooter, the expert diagnostic logs will mention the true error which is `SessionControlNotSupportedForPassthroughUsers` .  The end customer must exclude this user or application from the conditional access policy enforcing Session Control.

   - Authenticating to the customer tenant as both a CSP admin, and a B2B Guest user is NOT supported and the CSP admin having a B2B guest account in the customer tenant will break the ability to see Azure subscriptions granted CSP RBAC permissions.  See next section for troubleshooting\identifying this scenario.

# 3. Verifying Azure Subscription RBAC Access

Once the CSP DAP\GDAP relationship has been verified, and the Passthrough user authentication has been verified, the next step is verifying the customer has properly granted the CSP the Azure Subscription RBAC permissions required to see their subscriptions.

1. Verify the following pieces of information

   - Azure Subscription ID
   - CSP Partner Tenant ID
   - CSP Partner Admin Email Address which can't access the Azure Subscription

2. Browse to Azure Support Center -> Resource Explorer -> Add or verify the Azure Subscription ID has been added to list
3. Browse to the Azure Subscription ID -> Access Control blade
4. Find the CSP Access tool and enter the above information into this tool
5. From the output, verify  that the JSON output returned under Subscription state, shows that **CanUserAccessCspSubscription : true** , if this value shows false instead, you will need to review the rest of the output to determine which issue caused the problem.

   Example: In this example, all the pre-requisites are met EXCEPT that the tool found a B2B Guest User matching the CSP Admin's email address in the customer tenant and this is not supported and will break access

   ![image-54b](/.attachments/AAD-Account-Management/736515/image-54b.png)

5. If the tool shows **DoesCspRoleAssignmentExist: false** , the customer will need to follow [Reinstate admin privileges for Azure CSP subscriptions](https://learn.microsoft.com/en-us/partner-center/reinstate-csp)

# GDAP Audit Logs in End Customer Tenant

When customer global admin approves a GDAP relationship, the customer's Microsoft Entra ID Audit Logs will indicate that a external Group object ID was added to an Microsoft Entra ID role in their tenant by the service principal **Partner Customer Delegated Admin Offline Processor** .  If this is the initial setup of GDAP relationship in customer tenant, the **Partner Customer Delegated Administration** service principal will be shown in Microsoft Entra ID Audit Logs as updating the CrossTenantAccessPolicy.  

Additionally during the [Microsoft-Led DAP to GDAP migration](https://learn.microsoft.com/en-us/partner-center/gdap-microsoft-led-transition) these logs will appear in customer Microsoft Entra ID audit logs.  This is discussed in the following articles:

   - [GDAP FAQ What are the two Microsoft Entra ID Service Principals that are created in the customer's tenant](https://learn.microsoft.com/en-us/partner-center/gdap-migration-faq#what-are-the-two-azure-active-directory-gdap-service-principals-that-are-created-in-the-customers-tenant). 
   - [Microsoft led DAP to GDAP Transition Customer Audit Logs](https://learn.microsoft.com/en-us/partner-center/gdap-microsoft-led-transition#audit-logs-in-the-customer-tenant)

   ![image.png](/.attachments/image-a7101fa2-9d25-45b3-b9ea-2e9f91c573b7.png)

If there are customer questions about how\why this principal was used to assign roles \ change XTAP policy in their tenant they should be referred to their CSP partner to review and discuss.  If the customer does not recognize the partner associated to the activity they should [terminate the relationship](https://learn.microsoft.com/en-us/partner-center/gdap-customer-terminate) and follow up with their partner to re-establish the appropriate access. Their partner will need to [request a new GDAP relationship and obtain the customer's approval](https://learn.microsoft.com/en-us/partner-center/gdap-obtain-admin-permissions-to-manage-customer).

## GDAP Microsoft Entra ID Audit Logs FAQ

#### Why is the �Partner customer delegated admin offline processor� making unauthorized role assignment changes in my tenant?
As part of the Microsoft-led DAP to GDAP transition, any existing DAP relationships with a CSP partner will be transitioned to GDAP relationships.  During this transition this service principal will be shown as the actor converting existing DAP relationships to GDAP relationships as explained in [GDAP Microsoft-Led Transition](https://learn.microsoft.com/en-us/partner-center/gdap-microsoft-led-transition)

#### Who is being assigned these roles?  The Microsoft Entra ID audit logs do not indicate who is being assigned the role. Neither the Partner Name or Tenant seem to be referenced in the log. 

Partner users who are part of the Admin Agent or Help desk Agent SG will have access, the individual partner user information is not exposed to customers by design. You can find the details of which Microsoft Entra ID roles are added to which SGs here [Microsoft-led transition from DAP to GDAP - Partner Center | Microsoft Learn](https://learn.microsoft.com/en-us/partner-center/gdap-microsoft-led-transition#which-azure-ad-roles-are-automatically-assigned-to-which-predefined-csp-security-groups-as-part-of-microsoft-led-transition) 

#### Who authorized these role assignments?

As part of MS Led DAP to GDAP migration as long as there is an active DAP relationship between a partner and a customer, MS will automatically create new least privileged GDAP relations (For the scope of MS Led migration, since there is an existing DAP it is assumed that the customer has already given a consent) and then remove high privileged DAP. Going ahead [customer will need to consent](https://learn.microsoft.com/en-us/partner-center/gdap-customer-approval) the GDAP relationship creation post the migration outside of the default GDAP.

#### Will the Microsoft Entra ID Audit Logs for Microsoft-Led DAP to GDAP transition be improved?
Today the customers can see the partner information, Reseller relationship, GDAP relationship, list of roles in their MAC portal and can also terminate relationships there itself. For Microsoft Entra ID logs, since this migration was a one-time activity and as we have already completed the MS Led GDAP creation part, it feature not part of our backlog.  We will look at incorporating in the audit log information for future GDAPs post the MS led migration


## GDAP Audit Question Suggested Verbiage

```
The activity you have noticed (Partner Customer Delegated Admin Offline Processor adding RBAC roles in Microsoft Entra ID audit logs) is expected and consistent with a partner that your organization has an active relationship with being added to roles in your Microsoft Entra ID via acceptance of a GDAP (granular delegated admin privileges).  Please review Microsoft led transition from DAP to GDAP documentation (https://learn.microsoft.com/en-us/partner-center/gdap-microsoft-led-transition) and what the Microsoft Entra ID audit logs for end customer will look like (https://learn.microsoft.com/en-us/partner-center/gdap-microsoft-led-transition#audit-logs-in-the-customer-tenant) during this transition.
 
The GDAP relationship has to be initiated from the partner end and accepted via confirmation from a global admin in your tenant, or automatically from the partner side if they already have Delegated Admin Privileges granted for your tenant.  The roles that you have seen in the audit logs are the roles that the partner has set for the GDAP relationship with your tenant. 
	
For more information and if you wish to further discuss the assigned roles, I suggest reaching out directly to your partner and if they require additional support from our end they can raise a new support request for our team.  To review your current DAP or GDAP CSP partner relationships and their contact info visit https://admin.microsoft.com -> Settings -> Partner Relationships

If you do not recognize this partner relationship, you should terminate it (https://learn.microsoft.com/en-us/partner-center/gdap-customer-terminate) and follow up with your partner to re-establish the appropriate access where needed.
	
For more information on what the Partner Customer Delegated Admin Offline Processor principal is please reference the following link:
	� https://learn.microsoft.com/en-us/partner-center/gdap-migration-faq#what-are-the-two-azure-active-directory-gdap-service-principals-that-are-created-in-the-customers-tenant
	
For more information on GDAP relationships with CSP Partners please reference the following links:
	� https://learn.microsoft.com/en-us/partner-center/gdap-introduction
    � https://learn.microsoft.com/en-us/partner-center/gdap-faq
    � https://learn.microsoft.com/en-us/partner-center/gdap-microsoft-led-transition
```

If there are still questions related to this service principal making changes in customer tenant, locate the Microsoft Entra ID Audit Log in question from ASC and work with TA to raise ICM to the (SPS-MECh-Motivate and Enable the channel / SPS-MECh- Eventing and Audit Service) team.

# GDAP Partner FAQ \ Frequently Asked Questions

Reference public docs (https://learn.microsoft.com/en-us/partner-center/gdap-faq) for most FAQs .  Here are a few very frequently asked questions however...

## Why is my username replaced with "user_somenumber" in portal.azure.com when a GDAP relationship exists?

When a CSP logs into their customer's Azure portal (portal.azure.come) using their CSP credentials and a GDAP relationship exists, the CSP notices that their username is "user_" followed by some number. It doesn't display their actual username as in DAP. This is by design.  A GDAP user has no local user object in the customer tenant.
 
 ![image.png](/.attachments/image-c2eb7f7d-0cbc-4fa9-8ea5-bca2f32478ce.png =350x)

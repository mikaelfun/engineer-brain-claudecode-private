---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Lifecycle Based Authentication Blocks"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FLifecycle%20Based%20Authentication%20Blocks"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Authentication
- cw.AAD-Workflow
- cw.Conditional-Access
- comm-idsp
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Conditional-Access](/Tags/Conditional%2DAccess) 

[[_TOC_]]

### Compliance note  

This wiki contains test/lab data only.

# Feature overview  

Microsoft is undertaking an effort to remove inactive tenants.  When we detect a tenant that has had over **200 days of inactivity** past their billing cycle the following steps will take place

## Day 0 Activity - Send Customer Notification
An email notification will be sent to tenant contacts informing them that their tenant has been inactive, and will be deauth and subsequently deleted if they do not complete a purchase under the tenant listed in the next 30 days.

   ### Example Email:
   
   ```
   Subject: Complete a purchase by June 16, 2025 to keep your account active
   Message: You are receiving this email because your associated Microsoft Entra ID tenant (tenantID: <tenant guid>) has been inactive for more than 200 days.
            Required action: To continue using your tenant, make a purchase before June 16, 2025. If you don't make a purchase before this date, 
            your next purchase will require a new Microsoft Entra ID tenant to continue using Microsoft services.

            Make a purchase

            Account information
            Tenant ID: <Tenant GUID>

   ```

   ![image.png](/.attachments/image-b05ff62e-c538-4cc3-a157-6926d1b071a1.png)


## Day 30 Activity - De-Authentication
30 days after email notification, OMS commerce will apply a login block (AADSTS5000225).  30 days after the login block is established the tenant will be permanently deleted.

Tenants who receive this login block will see this error on authentication attempts:

- **Error Code: AADSTS5000225**

- **Error message: AADSTS5000225: This tenant has been blocked due to inactivity. To learn more about tenant lifecycle policies, see <https://aka.ms/TenantLifecycle>**
  - Trace ID: c23a8aa7-xxxx-xxxx-xxxx-c8d253401f00
  - Correlation ID: dd0ac46c-xxxx-xxxx-xxxx-3bfb9c5b3da9
  - Timestamp: 2023-11-30 00:40:53Z

    ![AADSTS5000225](../../../../.attachments/AAD-Authentication/1345264/AuthBlock-AADSTS5000225.png)

**Note**: ASC may fail to load the tenant or show a 5000225 message (Error code  67: TenantAuthBlockReasonLifecycle ). Note that Sign-in Activity, and Sign-in (Authentication Diagnostics) via ASC will not be possible on these tenants.

When this block is in place authentication methods and paths for tenant admins are blocked as follows:

- All resources, users, applications (including both first party and 3rd party services), through both user, and API/PowerShell experiences.
- The ability to file a support case against the blocked tenant

**Support Case Origination:** Since the tenant is blocked, this means support cases will come from either a different Tenant, or via phone call or other alternate means.

It is important to engage with the customer in case this block has happened in error and follow the process for “Case Handling” steps below for unblocking the tenants. The tenant remains blocked for 30 days. Once the **30 days** have elapsed the tenant is **permanently deleted** and cannot be recovered.

## Day 60 Activity - Tenant Deletion
 Once the **30 days** have elapsed the tenant is **permanently deleted** and cannot be recovered.   

## Post Day 60 - Microsoft may manually perform tenant deletion upon request
  <table style="margin-left:.34in">
        <tr style="background:lightyellow;color:black">
          <td>
            <small>&#128276; <b>NOTICE</b> &#128276
            <p style="margin-left:.27in">If customer's tenant has NOT been deleted after 30 days of being in a AADSTS5000225 state, Microsoft can delete the customer's tenant manually by request and following the decision matrix in TSG <a href="https://eng.ms/docs/office-of-coo/commerce-ecosystems/commerce-platform-experiences/azure-subscription-lifecycle/cab-provisioning/cab-provisioning-tsgs/tsgs/support-playbook-auth-blocked-tenant-domain-release">Support playbook for auth blocked tenant domain release request</a> and standard deletion process in <a href="https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2495994/Tenant-Deletion-Instructions-for-Azure-Identity-TAs-and-PTAs">Tenant Deletion Instructions for Azure Identity TAs and PTAs</a> as tenant has already been auth blocked for 30+ days and pending scheduled deletion.</small>
          </td>    
        </tr>
      </table>



<hr>

# Case Handling

Issues related to this auth block (AADSTS5000225) are supported by the **Account Management** community.  The SAP for this issue is **Azure/Microsoft Entra Directories, Domains, and Objects/Directory Management/Blocked Tenant (AADSTS5000225)**.

This TSG addresses scenarios where:

- A tenant is blocked with error code "AADSTS5000225" due to inactivity.
- Customer received lifecycle notification emails with subjects like:
	- "Make a purchase to continue with billing account"
	- "Make a purchase by [date] to continue using your tenant"

# Process Overview

1. SE: Collect relevant data.
	   - Tenant ID, Error code, correlation ID, timestamp of recent failure (AADSTS5000225).
	   - If customer is calling about the email and tenant is still live, obtain a copy of the email.
2. SE: [Open escalation request](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1345264/Lifecycle-Based-Authentication-Blocks?anchor=icm-filing-and-severity-guidelines) and assigns ICM to TA.
3. TA: Perform steps from [TSG](https://eng.ms/docs/office-of-coo/commerce-ecosystems/commerce-platform-experiences/azure-subscription-lifecycle/cab-provisioning/cab-provisioning-tsgs/tsgs/productslifecycle-dormancytenantreactivation).
4. TA: Report results to SE.
5. SE: Report results to customer.
	  - If customer receives a new error (lockout, etc.) a new case must be opened.
6. SE: Close case.

# Data Collection

If the customer is calling in with the **"AADSTS5000225: This tenant has been locked due to inactivity..."** error please collect the following information:

1. Tenant ID.
2. Correlation ID and Timestamp from a recent sign-in failure.

   If you do not have a correlation ID and timestamp from customer you can obtain one yourself + confirm the tenant is lifecycle blocked via copying and pasting one of the following URL formats into your incognito browser and updating the tenant id or MOERA to match customer's reported tenant:

   ```
   https://entra.microsoft.com/<tenant id>

   https://entra.microsoft.com/contoso.onmicrosoft.com

   https://login.microsoftonline.com/<tenant id>/oauth2/v2.0/authorize?client_id=00000000-0000-0000-c000-000000000000&response_type=code&redirect_uri=https://jwt.ms&scope=openid&prompt=login

   https://login.microsoftonline.com/contoso.onmicrosoft.com/oauth2/v2.0/authorize?client_id=00000000-0000-0000-c000-000000000000&response_type=code&redirect_uri=https://jwt.ms&scope=openid&prompt=login

3. Only if the above URL tests return the error code `AADSTS5000225: This tenant has been blocked due to inactivity. To learn more about tenant lifecycle policies, see https://aka.ms/TenantLifecycle` should you proceed with this TSG

3. Screenshot of the entire error displaying both the CorrelationID and Timestamp

As the customer may have opened case from a different tenant, or be experiencing the error in a tenant external to their home tenant. You can follow the steps by going to ASC of any case that has a tenant added to tenant explorer.

**Confirm tenant** ID experiencing the AADSTS5000225 error:

1. Request customer provide AADSTS5000225 error's correlation ID + timestamp.
2. From an ASC of any case with tenant explorer access, [open ASC Auth Troubleshooter](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/757718/TSG-General-ASC-Auth-Troubleshooter-Steps).
3. Query the correlation ID + timestamp in ASC auth troubleshooter.
4. From Authentication Summary table, add the "TenantID" column.

  ![Confirming Tenant ID via ASC](../../../../.attachments/AAD-Authentication/1345264/ASC-Tenant-ID.png)

If the customer is calling in due to the "make a purchase" or "complete a purchase" email please collect a copy of the email. This email can be used to confirm the tenant ID.  

**Important:** If the customer is asking questions on what they should purchase please redirect the customer to commerce or sales.

# ICM Filing and Severity Guidelines

Use the ASC ICM Escalation process and choose the template **[ID][IDM] AADSTS5000225 Tenant Lifecycle Reauth Request.**

You can use this template as a fallback if there are ASC issues: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=i3M3U2

**Note:** Please attach a screenshot of the entire error displaying both the CorrelationID and time stamp to the IcM.

# Weekend Requests
The IcM requests will be processed Monday - Friday only.

# TA/PTA Permission Prerequisites

In order to execute the Commerce Azure Lifecycle Geneva actions mentioned in process section, you need to be a TA and a member of the following security groups

1. From SAW , use your AME account to access [https://aka.ms/oneidentity](https://aka.ms/oneidentity "https://aka.ms/oneidentity")  
2. Add yourself to geneva action execution group **AME\TM-SCIMID-CMRC-OPS**   (requires approval from owner)  
2. Add yourself to geneva action approvers group **AME\AP-SCIMID-CMRC-OPS**   (requires approval from owner)
4. [DS Explorer Access](https://dev.azure.com/IdentityCommunities/SCIM%20ID%20Technical%20Advisors/_wiki/wikis/Azure-ID-Technical-Advisors.wiki/202/SAW-Tools?anchor=ds-explorer---https%3A//aka.ms/dsexplorer)

# TA/PTA Process

## Step 1. Confirm Tenant ID
First confirm the tenant ID the customer is experiencing `AADSTS5000225` error on via **one** of the following methods

1. Customer provides tenant ID or `onmicrosoft.com` and you confirm via repro of loading `https://entra.microsoft.com/<tenantid>` or `https://entra.microsoft.com/domain.onmicrosoft.com` in **your** browser that the `AADSTS5000225` error is returned as expected.

2. Customer provides correlation ID \ timestamp of `AADSTS5000225` error, and you load this correlation ID and timestamp in [ASC Auth Troubleshooter](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/757718/TSG-General-ASC-Auth-Troubleshooter-Steps) to check the tenant ID in question via Auth Troubleshooter's PerRequestLogs tab and finding the `TenantId` parameter of the request.  See  example

   ![image.png](/.attachments/image-a39e9f28-2866-46e0-b7c9-11e22bc7c847.png)

## Step 2. Confirm Tenant Cloud Location 
1. In your browser Confirm if tenant is a USGov\GCCH tenant via checking the `tenant_region_scope` response via OpenID metadata URL `https://login.microsoftonline.com/<tenantid>/.well-known/openid-configuration` if this returns `USGov` then the support case should be escalated to the Fairfax Support GSX Identity team via DFM Transfer Queue Override to `Azure GSX Identity Gov` \ (Fairfax Support (GSX) Lead: Renata Sergent) as the SCIM Identity team cannot reactivate USGov tenants today.

## Step 3. Confirm Tenant Status In DS Explorer
Once tenant is identified, confirm in DS Explorer that the tenant is in an active (not-deleted) state and that the DirectoryFeatures property shows `TenantAuthBlockReasonLifecycle[67]`

1. From your SAW and AME.GBL account load https://aka.ms/dsexplorer
2. Look up the Tenant ID or onmicrosoft.com domain from Step 1
3. Under Context Details confirm the following properties:

    a. `_IsDeleted` = `False` <br>
    b. `DirectoryFeatures` contains `TenantAuthBlockReasonLifecycle[67]`

4. If the tenant is not returned by DS Explorer, it may be a USGov tenant.  In your browser Confirm if tenant is a USGov\GCCH tenant via checking the `tenant_region_scope` response via OpenID metadata URL `https://login.microsoftonline.com/<tenantid>/.well-known/openid-configuration` if this returns `USGov` then the support case should be escalated to the Fairfax Support GSX Identity team via DFM Transfer Queue Override to `Azure GSX Identity Gov` \ (Fairfax Support (GSX) Lead: Renata Sergent) as the SCIM Identity team cannot reactivate USGov tenants today.

5. If tenant doesnt return in DS Explorer OR OpenID Metadata URL, it may already be soft deleted (you can confirm by enabling soft-deleted query flag in DS Explorer) in which case customer will need create a new tenant.  

5. If the tenant's `DirectoryFeatures` doesn't contain `TenantAuthBlockReasonLifecycle[67]` then you may have the wrong tenant and should review Step 1 again as only tenant's with this DirectoryFeature should be experiencing `AADSTS5000225`

## Step 3. Re-Authenticate the Tenant
Once you have confirmed the tenant in question is active and contains `TenantAuthBlockReasonLifecycle[67]` flag you can re-authenticate the customer using the following steps

1. From SAW with AME.GBL account [meeting prerequisite permissions section](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1345264/Lifecycle-Based-Authentication-Blocks?anchor=ta/pta-permission-prerequisites) open the Geneva LSM action [Billing > Provisioning Management > LifeCycle - Extend Tenant Lifecycle For Dormancy](https://portal.microsoftgeneva.com/?page=actions&acisEndpoint=Public&managementOpen=false&automatedTestsReportOpen=false&automatedTestSuitesOpen=false&bakingDetailsOpen=false&telemetryCoverageReportOpen=false&tab=Extensions&acisRolloutEndpoint=Public&selectedNodeType=3&extension=Billing&group=Provisioning%20Management&operationId=extendtenantlifecyclefordormancyoperation&operationName=LifeCycle%20-%20Extend%20Tenant%20Lifecycle%20For%20Dormancy&inputMode=single&params=%7B%22smelifecyclelocationparameter%22:%22Public%22,%22smescopedtenantidparameter%22:%22%22,%22smeistenantreactivateforeverparameter%22:false,%22smedeauthdateparameter%22:%22%22,%22smeforcererunparameter%22:false%7D&actionEndpoint=Billing%20API%20-%20Public%20Azure&genevatraceguid=8a2576a4-5757-4389-a31d-4bb8f2a773ae)

2. Choose the **Get Access** button and fill out JIT Request with a valid ICM number and following details:

   * Work Item ID = **Active + Valid ICM Number** (Ensure ICM is not resolved and the ID is valid or request will be auto-rejected)
   * Resource Type = **ACIS**
   * Scope = **TenantSupport**
   * Role = **PlatformServiceAdministrator** (Ensure correct scope and role, or request will be auto-rejected)

   * <u>Example:</u>

>>>>   ![image.png](/.attachments/image-114a094c-a71d-4b33-b9e3-6968218e2e74.png =350x)

3. Once submitted, your JIT request should be auto-approved and you will be forced to re-authenticate to Geneva portal.  Otherwise, choose the **Refresh Token** button at top right. <br><br> **NOTE**:  If you receive an email indicating your request was rejected, you can access the JIT Approval URL included in the email on SAW\AME account and click "Debug/Analyze Request" link to understand why it was not auto-approved.  However the reason is usually that either you are not in our AME groups **AME\AP-SCIMID-CMRC-OPS** and **AME\TM-SCIMID-CMRC-OPS** , or your ICM is invalid, or you did not request the right resource\scope\role in JIT request so please check all of these and resubmit JIT.

4. Once reauthenticated, you should find the **Run** button enabled and you can fill out the **Tenant Id** parameter and check **Is Reactivate Forever** check box as shown in below example:

   ![image.png](/.attachments/image-67d8e928-22c6-4d55-a7f5-65a40c83a9a2.png =700x)

5. Once you hit the **Run** button if the operation is successful you should find the follow response:

   ![image.png](/.attachments/image-f660b1c9-8a27-40fb-94c6-78e55dda6b38.png)

6. You can also verify in DS Explorer, that refreshing the tenant ID now shows that `DirectoryFeatures` doesn't contain `TenantAuthBlockReasonLifecycle[67]`

7. Customer (or you) can now confirm via an authentication request that loading `https://entra.microsoft.com/<tenantid>` or `https://entra.microsoft.com/domain.onmicrosoft.com` in **your** browser no longer returns `AADSTS5000225` error.

8. If there are issues blocking TA from following this TSG, clearly document them in the ICM and escalate to **Azure Commercial Experiences, Signup and Provisioning\Tier2 - Subscription Lifecycle**

<!--

1. Use DS Explorer to check DirectoryFeatures property contents, if TenantAuthBlockReasonLifecycle[67] feature is not present on the tenant, it is not a lifecycle auth block. If it is TenantAuthBlockReasonFraud [66] (AADSTS5000224) or ManagedExpiration (AADSTS5000229), review- [Fraud or Security based Authentication Blocks for Tenants](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2297494/Fraud-or-Security-based-Authentication-Blocks-for-Tenants) 

2. If **TenantAuthBlockReasonLifecycle[67]** feature is present in DirectoryFeatures property, regardless of whether an **OrgIdPropagationTask** (OrgIdCompanyDeletion PRS task) exists on the tenant


   The Entra TA will attempt the re-authentication process provided by Commerce Azure Lifecycle team : https://eng.ms/docs/office-of-coo/commerce-ecosystems/commerce-platform-experiences/azure-subscription-lifecycle/cab-provisioning/cab-provisioning-tsgs/tsgs/productslifecycle-dormancytenantreactivation, and report the results back to the support engineer who opened the IcM.  To execute these geneva actions you must be a member of [appropriate AME security groups](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1345264/Lifecycle-Based-Authentication-Blocks?anchor=ta/pta-permission-prerequisites) and as of 2026-02-19 your JIT request will be auto-approved \ granted.

   If there are issues blocking TA from following this TSG, clearly document them in the ICM and escalate to **Azure Commercial Experiences, Signup and Provisioning\Tier2 - Subscription Lifecycle**

   Clarification on **OrgIdPropagationTask** (OrgIdCompanyDeletion PRS task): 
   *   The presence of `TenantAuthBlockReasonLifecycle` for 30d is what triggers the `OrgIdCompanyDeletion` PRS task.  But there is a backlog of tenant deletions to schedule so this may not occur for over 30d currently.  If tenant has been in `TenantAuthBlockReasonLifecycle` state for > 30 days.  Microsoft can manually delete tenant by following the decision matrix in TSG [Support playbook for auth blocked tenant domain release request](https://eng.ms/docs/office-of-coo/commerce-ecosystems/commerce-platform-experiences/azure-subscription-lifecycle/cab-provisioning/cab-provisioning-tsgs/tsgs/support-playbook-auth-blocked-tenant-domain-release "https://eng.ms/docs/office-of-coo/commerce-ecosystems/commerce-platform-experiences/azure-subscription-lifecycle/cab-provisioning/cab-provisioning-tsgs/tsgs/support-playbook-auth-blocked-tenant-domain-release") and [Tenant Deletion Instructions for Azure Identity TAs and PTAs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/544792/Tenant-Deletion-Instructions-for-Azure-Identity-TAs-and-PTAs)
   *   If the tenant no longer has `TenantAuthBlockReasonLifecycle`, the PRS task will be automatically removed.
   *   Therefore, all re-auth requests should be handled by TAs, regardless of whether a PRS task exists or not.
   * If the request of the customer is to delete \ release an MOERA onmicrosoft domain and that tenant is currently pending deletion due to `TenantAuthBlockReasonLifecycle` but has not yet been deleted we can perform immediate deletion of tenant using CMAT Validate+Delete after following the decision matrix in TSG [Support playbook for auth blocked tenant domain release request](https://eng.ms/docs/office-of-coo/commerce-ecosystems/commerce-platform-experiences/azure-subscription-lifecycle/cab-provisioning/cab-provisioning-tsgs/tsgs/support-playbook-auth-blocked-tenant-domain-release "https://eng.ms/docs/office-of-coo/commerce-ecosystems/commerce-platform-experiences/azure-subscription-lifecycle/cab-provisioning/cab-provisioning-tsgs/tsgs/support-playbook-auth-blocked-tenant-domain-release") and [Tenant Deletion Instructions for Azure Identity TAs and PTAs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/544792/Tenant-Deletion-Instructions-for-Azure-Identity-TAs-and-PTAs)

-->



# Final customer communication

Once the TA has reported the results, the support engineer will contact the customer to close out the case.

**Note:** The re-authentication process can take up to 15 minutes. Be sure to allow for this delay before contacting the customer.

If the tenant cannot be reauthenticated please send the customer an email using the following template:

**We regret to inform you that we are unable to reactivate your tenant. Unfortunately, this necessitates that we cannot proceed with the recovery of your tenant. To move forward, we recommend creating a new tenant.**

Once the customer has been appraised of the results proceed with closing the case. If the customer encounters further issues accessing the tenant (such as a lockout) please work with the customer to get a new case created.


## Prevention

Customers can prevent this lockout from occurring by maintaining an active billing account.

For more information, see [Keep your Microsoft business billing account active](https://learn.microsoft.com/en-us/microsoft-365/commerce/keep-billing-accounts-active?view=o365-worldwide)

## Public Documentation

- https://aka.ms/tenantlifecycle

# Internal References
- [Commerce TSG for Tenant reauth](https://eng.ms/docs/office-of-coo/commerce-ecosystems/commerce-platform-experiences/azure-subscription-lifecycle/cab-provisioning/cab-provisioning-tsgs/tsgs/productslifecycle-dormancytenantreactivation)
- [Support playbook for auth blocked tenant domain release request](https://eng.ms/docs/office-of-coo/commerce-ecosystems/commerce-platform-experiences/azure-subscription-lifecycle/cab-provisioning/cab-provisioning-tsgs/tsgs/support-playbook-auth-blocked-tenant-domain-release "https://eng.ms/docs/office-of-coo/commerce-ecosystems/commerce-platform-experiences/azure-subscription-lifecycle/cab-provisioning/cab-provisioning-tsgs/tsgs/support-playbook-auth-blocked-tenant-domain-release") 


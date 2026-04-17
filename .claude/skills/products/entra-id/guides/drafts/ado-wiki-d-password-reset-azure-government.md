---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/AAD Government Troubleshooting/TSG: Password Reset Requests for Azure Government Tenants"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.Azure-AD-SSPR
- cw.AAD-Password
- cw.comm-secaccmgt
- SSPR
- 
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]

# Summary #
The O365 Data Protection team cannot help with Azure Government tenant password reset requests in the same manner that commercial tenant password resets are performed.  For these requests, we can only help customer identify Global Administrators who should be able to perform SSPR themselves from https://passwordreset.activedirectory.windowsazure.us/.  

If no Global Administrators can be located that can perform SSPR, we can file an ICM to have SSPR contact info updated on an existing Global Admin by following the below procedure.

  <table style="margin-left">
    <tr style="background:#efffff;color:black">
    <td>
      <small>&#128210; <b>Read me</b>: This process is only for <b>Azure Government</b> customers. If customer is not in government cloud, password reset requests should be escalated to <a href="https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/370619/Office-365-Data-Protection-Escalations">Data Protection team</a></small>
    </td>    
    </tr>
  </table>

# Prerequisites
1. When there are multiple admins, the customer must work with a listed admin to restore access. 
2. Microsoft cannot share any information about the Global Administrators.  
3. If there is a partner on the tenant, the customer should try working with the partner to restore access
4. The below process must be performed by an Azure AD SE who has [ASC GOV access](https://personnel.microsoft.com/groups/b6922fce-9e89-4a7f-bf77-6cd8454ec55e)

# Procedure # 
   **NOTE:** To use ASC Tenant Explorer for USGov tenants verify\request access to security group [ASC USGov](https://personnel.microsoft.com/groups/b6922fce-9e89-4a7f-bf77-6cd8454ec55e)  which will be auto-approved if you are already cleared for Background Check and Citizenship. 
1. Ask the customer to first visit https://passwordreset.activedirectory.windowsazure.us and try to reset their own password.  If this is not possible get screenshots\timestamps etc. for evidence and data gathering when escalating this request.

2. If customer doesnt know who the other Global Administrators are in the tenant, ask them if ANY user in the tenant can sign in and validate Global Administrators via below steps

   1. Sign into https://portal.azure.us with any user in the tenant
   2. Select Azure Active Directory in the left side. 
   3. Select Roles and administrators. 
   4. Click Global administrator and you will find all Global Administrators.

2. If you have ASC access to tenant, open the Customer's tenant in ASC USGov Tenant Explorer and browse to Root Node -> Administrators tab.

3. Review list of Global Administrators and confirm if ANY of the listed Global Administrators has enough data to qualify for One-Gate Password Reset Policy  (a registered email or phone number on the account):

   Example of email registered:

   ![image.png](/.attachments/image-3be066cf-8136-4606-9d86-342c1e8b91a3.png =1515x)

   Example of phone registered on account:

   ![image.png](/.attachments/image-0e6de312-3f4b-4572-9e85-82f7a228e349.png)


   <span style="color:red;font-weight:bold">NOTE</span> If you cannot open the customer's tenant in ASC Tenant Explorer due to customer being unable to consent customer will need to confirm who Global Admins are via any user who has sign in access and below steps

   1. Sign into https://portal.azure.us with any user in the tenant
   2. Select Azure Active Directory in the left side. 
   3. Select Roles and administrators. 
   4. Click Global administrator and you will find all Global Administrators.

4. You can also verify manually yourself by visiting https://passwordreset.activedirectory.windowsazure.us/ yourself and typing the UPN of each registered tenant Global Admin to confirm what options they have available

   Example of options available:

   ![image.png](/.attachments/image-d51392cc-09d2-4c2c-b8fd-594555fde9e3.png)
   
    If the customer has ANY available SSPR registred information on a Global Administrator account in the tenant,  the customer should be requested to use ALL avenues to utilize this SSPR info to perform password reset themselves.  This includes re-creating any mailboxes etc. so SSPR email can be completed.

5. BEFORE CONTINUING TO STEP 6. WE MUST WORK WITH O365 DATA PROTECTION TEAM NOAM TA (M-F Business Hours only) to assist in [entitling the customer](https://internal.evergreen.microsoft.com/en-us/help/3023334) and verify they are approved to make changes.  

   To Engage Data Protection for collaboration, please use the following links to submit a VSO to our team:
   
     1. How to request access to submit [VSO - VSO Access Requests Walkthrough - Overview (visualstudio.com)](https://supportability.visualstudio.com/ModernStack/_wiki/wikis/ModernKB/370608/VSO-Access-Requests-Walkthrough)
     2. [How to submit a VSO - VSO Ticket Submission Instructions - Overview (visualstudio.com)](https://supportability.visualstudio.com/ModernStack/_wiki/wikis/ModernKB/370606/VSO-Ticket-Submission-Instructions)
     3. VSO Templates - [VSO Template Choices - Overview (visualstudio.com)](https://supportability.visualstudio.com/ModernStack/_wiki/wikis/ModernKB/370610/VSO-Template-Choices?anchor=general-templates) (in this case the Government Tenant Support template in the General section)
<br><br>
6. If there are NO Global Administrators who can perform a password reset request, and the customer cannot perform SSPR themselves then you will need to request the customer or Global Administrator provide an alternate email address and mobile phone # which we can use for setting up SSPR on their behalf via ICM
6. File an ICM using ICM Template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=H2P1bY  
       
         a. Title the ICM "AzGov: Add SSPR registration info to existing admin account"
         b. Include all evidence gathered during your ASC investigation including screenshots of the tenant's global admins and their properties. 
         c. Include business justification from customer on why none of the Global admins could be reached or used during SSPR.  
         d. In request provide the following details:

            Summary:
            Need the following SSPR registration details added to existing UPN so customer can perform SSPR.  Attached is O365 Data Protection team entitlement approval.

            Details:
            Existing UPN: example@domain.onmicrosoft.us
            SSPR email to add: email@domain.com
            SSPR mobile # to add: +1 555-555-5555

            Please run the workflow "UpdateAdminUserContactInfoWorkflow" to update the last admin's contact details so they may perform SSPR succesfully.

         e. Attach approval from O365 Data Protection team request
         f. Reach out to your TA to review the request
   NOTE: Ensure that the ICM is a request SSPR contact info be added to an existing UPN on the tenant.  Microsoft cannot perform password resets on behalf of customers or create new accounts in customer's tenants.  The ICM is for adding SSPR info to existing account so the customer can perform SSPR themselves on the account from https://passwordreset.activedirectory.windowsazure.us/ .  ICMs filed for any other reason will be misunderstood\denied.

7. If approved your TA will send ICM to the **Owning Service: Credentials Management Service UX** and  **Owning Team: Credentials Management UX** and you can reach out to azidentity-eee@microsoft.com for help with escalating the ICM where appropriate.  Example ICM 417382488 .  The workflow needed to be run by EEE team is called "UpdateAdminUserContactInfoWorkflow" .  Not there is a [workitem 2597501](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/2597501) for designing better option for customer in this situation.  For now the ICM will need Sev 2 \ Sev A status and EEE leadership approval.

8. Once ICM has been resolved and EEE team has run workflow UpdateAdminUserContactInfoWorkflow to add SSPR registration details to the existing UPN, ask customer to visit https://passwordreset.activedirectory.windowsazure.us/ and perform SSPR for this UPN using the added contact methods.  
<br><br>

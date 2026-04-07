---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure RBAC for Resources/Deploying Azure Lighthouse Resource Delegation to your AIRS Subscription"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20RBAC%20for%20Resources%2FDeploying%20Azure%20Lighthouse%20Resource%20Delegation%20to%20your%20AIRS%20Subscription"
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
   
<table style="margin-left">
    <tr style="background:#efffff;color:black">
    <td>
      <small>&#128210; <b>Compliance Note</b>: All data in this wiki including videos, screenshots, logs, GUIDs, email addresses, usernames and troubleshooting steps have been obtained from lab test environments and should not be considered confidential or personal data during compliance reviews.</small>
    </td>    
    </tr>
  </table>

Our Azure Internal Repro Subscriptions (AIRS) are tied to the corporate Microsoft.onmicrosoft.com AAD tenant and cannot be moved to any other tenant due to corporate policy.  You are not a Global admin of the Microsoft.onmicrosoft.com AAD tenant so cannot deploy any resources from your lab AAD tenant such as myreprolab.onmicrosoft.com

As such, the following procedure will explain how to use Azure Lighthouse delegated subscription management so that you can deploy resources to your AIRS subscription FROM your own personal repro lab AAD tenant (where you are a Global Admin) instead of from Microsoft.onmicrosoft.com (where you aren’t a Global Admin)


[[_TOC_]]

<span
style="color:black;font-weight:bold;background-color:yellow">Please follow along while watching [this Demo Video](https://microsoft.sharepoint.com/:v:/t/CloudIdentityPOD/EajYNn0-9g1NoFmOshJosTsBUF9YgWtawCOD65XInVkCqg?e=9scota) if you are unsure about any step below.

# Prerequisites:
1. An [Azure Internal Subscription](https://microsoft.sharepoint.com/teams/azureinternal/CSSMgmt/SitePages/Home.aspx) associated to your Microsoft alias with owner role assigned. If you don’t have any, follow up with your manager/TA to assist in following [AIRS Subscription Registration&Signup process](https://microsoft.sharepoint.com/teams/azureinternal/CSSMgmt/SitePages/Home.aspx)
2. Make sure to enable any missing Subscription Resource Providers on your AIRS subscripton, because operations will fail if those resource providers are not enabled.  Here is a list of Resource Providers you should probably activate: [How to register a Azure Resource Provider in Azure Portal](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/resource-providers-and-types#azure-portal)
   - Microsoft.AAD 
   - Microsoft.aadiam 
   - Microsoft.Authorization 
   - Microsoft.AzureActiveDirectory 
   - Microsoft.ManagedServices 
<br><br>
3. Azure AD repro tenant with GA permissions.  Follow [AAD Lab Tenant Deployment steps](https://microsoft.sharepoint.com/:w:/t/CloudIdentityPOD/EXB05GxXy9xIhNr3pIi6uQQBXqHHOLcfO01bTdnMRE5BjQ?e=9UzqR3) and watch [AAD Lab Tenant Creation wE5 Developer demo](https://microsoft.sharepoint.com/:v:/t/CloudIdentityPOD/Eeo5PHV6vjtKs7UFeabpkeYBI3-o_D42ikHJ6BK4YsQ_4A?e=yiImqO) if you do not already have your own AAD Lab Tenant.
   - Note your `Tenant ID` from https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview for later steps
4. A new Azure AD security group created on your repro lab tenant w/name such as "Azure Lighthouse Contributors"
   - Add your AAD repro tenant's Global Admin and/or the user you will later deploy resources with to the membership of this security group.
   - Note the `Azure AD security group object ID` for later steps.
 

# Deploying Azure Lighthouse Delegated Management to AIRS Subscription

Azure Lighthouse is what enables your ability to deploy resources to your AIRS subscription via your own personal AAD repro tenant.  It enables management of your AIRS subscription via the specified AAD repro tenant security group principal you created in Prerequisites step 4.

1. Login to https://portal.azure.com with your @Microsoft.com account and verify via your user information in top right of the portal that you are signed in with @Microsoft.com and the tenant field shows Microsoft (Microsoft.onmicrosoft.com).  If not, click your user information and switch tenants to Microsoft.onmicrosoft.com

   ![image.png](/.attachments/image-895530b8-ba4a-4961-8a56-d812e6b63e40.png)

2. Copy and Paste this URL into your browser window :

   `https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FAzure%2FAzure-Lighthouse-samples%2Fmaster%2Ftemplates%2Fdelegated-resource-management%2Fsubscription%2Fsubscription.json`

3. From the Custom Deployment blade,  use the Subscription dropdown to select your own AIRS subscription.  (NOTE you may have read access to a number of other subscriptions here, but you should be able to use drop down to find your own AIRS subscription by name or subscription ID).

4. Update the remaining fields like this:


   |**Field**|**Content**  |
   |--|--|
   |Region| This can be whatever your closest Azure Region is  |
   |Msp Offer Name| This should be a unique name such as "AIRS Lighthouse to Lab Tenant"  |
   |Msp Offer Description|This should be a brief description such as "AIRS Lighthouse to Lab Tenant"  |
   |Managed By Tenant Id | This **must** be your lab tenant's AAD tenant ID that you noted in Pre-requisites section step 3 |
   | Authorizations | 1. For this field, you will need to copy and paste the below information to notepad: <br><br> `[{"principalId":"e52e4463-####-####-####-############","roleDefinitionId":"b24988ac-6180-42a0-ab88-20f7382dd24c"}] ` <br><br> 2. Now update the principalId GUID example `e52e4463-####-####-####-############` to be your lab tenant's `Azure AD secrutiy group object ID` created in Pre-requisites section step 4. and Leave the roleDefinition ID as is as b24988ac-6180-42a0-ab88-20f7382dd24c is for the Azure Contributor Role.<br><br> 3. Finally, copy and paste your updated Authorizations content to the Authorizations field in the Custom Deployment wizard.

   Once updated, your final result should look something like this:

   ![image.png](/.attachments/image-f1d51706-90e1-4d0a-842a-26336a9fbfd7.png)

   
5. Select **Review and Create** and if there are no Validation errors, continue to creation by selecting **Create**

6. The deployment may take 5 minutes to complete, once complete you proceed to the next section to Verify Azure Lighthouse Resource Delegation


# Verify Azure Lightthouse Resource Delegation Service Provider

Once the Azure Lighthouse deployment is complete, you can verify the resource projection delegation by the following steps.

1. Sign into https://portal.azure.com with your @Microsoft.com account and verify the portal shows you signed in to Microsoft.onmicrosoft.com in top right of portal.  Otherwise switch tenants to Microsoft.onmicrosoft.com
2. From Azure portal search box search for "Service Providers" blade and select it.

   ![image.png](/.attachments/image-6afb782f-57c4-44f0-b840-f5ddc8096c23.png)

3. From the Service Providers blade, select **Delegations**
4. From Delegations blade, you should be able to confirm the delegation of your AIRS subscription to your lab AAD tenant and the role assignment for Contributor role exists.

   ![image.png](/.attachments/image-3f7bd9a0-bf9b-4068-826a-85b73f739507.png)

# Verify Azure Lighthouse Resource Delegation from Lab Tenant
Now you can verifyt he resource projection is visible from your AAD Lab Tenant via the following steps.

1. Login to https://portal.azure.com with your AAD Lab Tenant Global Admin that is a member of the "Azure Lighthouse Contributors" security group.
2. Verify the Azure Portal user profile blade in top right shows you are now signed in with your AAD Lab Tenant Global Admin and the Tenant is labtenant.onmicrosoft.com otherwise switch directories to your labtenant.onmicrosoft.com
3. From the Azure portal search box search for "My Customers" and select it.

   ![image.png](/.attachments/image-cbcd6064-5f82-444a-a345-ba94f6d6e6b0.png)

4. From My Customers blade, select **Delegations** and verify you see a listing for your AIRS subscription listed with the Contributor role assignment:

   ![image.png](/.attachments/image-4d078f8c-c36e-482f-ae9e-43b24a2f8add.png)

5. From the Azure portal search box search for "Subscriptions" and select it.

   ![image.png](/.attachments/image-4e8cc6de-45a5-497a-a556-ef61204c0387.png)

6. From the **Subscriptions** blade , verify you see your AIRS subscription listed.  If you DO NOT see it listed you will want to verify the Azure Portal's Global Subscription Filter by clicking the "cog wheel" Portal settings icon in the top right of the portal:

   ![image.png](/.attachments/image-159c97b0-f5b2-47f4-8dfb-9933a84140b8.png)

7. From **Portal settings** blade, turn on the **Advanced filters** option which may require the portal to reload.  Once reloaded, verify that the Advanced Filter option is enabled and the Advanced Filter drop down has the **"Default" filter** selected which will included Subscriptions from ALL Directories.

   ![image.png](/.attachments/image-914121c3-bcc3-4c3d-8728-44efeac7cb3e.png)

8. Now proceed back to the **Subscriptions** blade from Step 6 and you should see your AIRS subscription listed

   ![image.png](/.attachments/image-af0f88b1-92ca-4263-a6b2-c2603888afc3.png)

9. Open your AIRS subscription by selecting it from the list
10. From your subscripton overview blade, select the **Access control (IAM)** blade and then click the **Check access** blade and the **View my access** button.  You should be able to verify that your Contributor permission on this subscription is listed succesfully.  If not, try waiting 15 minutes after the Lighthouse deployment has completed and sign out and sign back in to the portal and verify again.


      ![image.png](/.attachments/image-3832126c-993b-4559-960c-e92570330533.png)

11. Once contributor permissions have been verified, you should be all done. You can now deploy Azure Resources from your AAD lab tenant to your AIRS subscription.

# Getting owner role on the projected subscription. 

By default, your account should have Contributor access to the subscription as that is the RBAC role specified during the deployment.  The Owner role is not permitted with the initial deployment. To get owner permissions on your repro tenant:

1. Add your @microsoft alias to your repro tenant as a guest, assign GA role. 
2. Add your @microsoft alias as a member of the AAD group that is inheriting the RBAC permissions. 
3. Make sure that your MS alias account is listed as a Co-Administrator (or another legacy administrator type) on the subscription in the projected tenant (it should in the MS tenant). If you do not see the assignment and are unable to make any change, add your MS alias as co-admin of the subscription in the MS tenant. [How to add a co-admin: Azure classic subscription administrators](https://docs.microsoft.com/en-us/azure/role-based-access-control/classic-administrators#add-a-co-administrator)
4. Switch to you repro tenant using your MS account and elevate permissions, (AAD -> Properties -> Access management for Azure resources).

   ![image.png](/.attachments/image-7e0249ac-4726-42e0-bb4a-e39402e50dc4.png)

# More Resources
- [Onboard a customer to Azure Lighthouse public docs](https://docs.microsoft.com/en-us/azure/lighthouse/how-to/onboard-customer#azure-portal)
- [Azure Lighthouse Deployment ARM Template Github Samples](https://github.com/Azure/Azure-Lighthouse-samples/)
- [Troubleshooting Azure Lighthouse Delegation](https://docs.microsoft.com/en-us/azure/lighthouse/how-to/onboard-customer#troubleshooting)

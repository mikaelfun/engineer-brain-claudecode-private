---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/General Guidance/GME Account and SAW"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGeneral%20Guidance%2FGME%20Account%20and%20SAW"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
# Summary
Due to recent security changes documented at https://aka.ms/CSSIdentityIsolationDocs CSS engineers will require an alias@gme.gbl account, a physical yubikey and a SAW physical workstation to access resources such as:

1. Geneva\Jarvis Portal logs (Key Vault, Entra Domain Services etc.)
2. ASC US Government ( https://azuresupportcenter.usgovcloudapi.net/ )
3. OMS BOSG Console Access (for Azure Identity TAs)

The below sections are intended to explain how to request access to GME and SAW workstation for CSS Azure Identity team.

[[_TOC_]]


# GME Account

1. ##**Order the YubiKey**

   NOTE: If you already have a Yubikey, you do not need to request a new one for GME only, you can use your existing Yubikey

   a) Action: Fill out the form https://aka.ms/msftsk. You will also receive an email notification with IcM number and shipping details once your request is processed

   b) Context: YubiKey is a hardware authentication device that via certificate will allow to use other domain accounts. Contrary to our corporate account (@microsoft), the domain accounts are passwordless and use the certificate installed in the YubiKey. Await the device before continuing with these steps! 

2. ##**GME Domain Account** 
   a) The GME.GBL domain accounts were created automatically, you and your M1 should have received an email during the timeframe of March - April 2024 with details on your GME account provisioning

   b) The email sender will be identityisolationsvc@microsoft.com . Sample:  
![image.png](/.attachments/image-5b35be3d-4568-4950-ba8f-29e0b180c488.png =900x)
  
   c) Action: Confirm you have received this e-mail and the manager has approved your domain account.

   d) If you did not have a GME account automatically provisioned for you, reach out to your TA (or anyone with SAW) and your M1 to submit\approve a request for a new GME account for you from their SAW on https://aka.ms/oneidentity portal, User Accounts -> Create Manage -> Domain=GME -> Your alias and then choosing your manager M1 to approve the request.  M1 will then need to approve from  SAW or https://aka.ms/oneidentityapprovals (must be on VPN)

   e) For any other issues with setting up GME account refer to [CSS Identity Isolation wiki \ GME account FAQ](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/870/CSS-Identity-Isolation?anchor=*me-accounts) and submit a support request to https://aka.ms/CloudMFARequest if needed.

3. ##**Configuring GME Account in the YubiKey**

   
   1. Verify the pre-requisites listed under [Azure Security Key Setup Guide](https://microsoft.sharepoint.com/teams/CDOCIDM/SitePages/SecurityKeySetupGuide.aspx) have been completed
   
   1. Connect the YubiKey to your laptop
   
   2. Install and open the "Atlas Certificate Manager" tool => https://aka.ms/OneYubi   
   _(link opens OneYubiClient.application in a new tab. If nothing occurs, try with a private window)_

   3. "Reset Security Key" in order to Setup a PIN (only needed as first time)   
![image.png](/.attachments/image-734978ed-7d8d-4aa6-baaa-a7b2e7915f3e.png =450x)

      * If you get an error at this step "Error: Security key Reset Failed" , per [FAQ](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/870/CSS-Identity-Isolation?anchor=yubikey-and-smartcard) you should make sure your Yubikey has been assigned to you via support ticket https://aka.ms/assignsecuritykey
   
   4. Go back to "Create Certificate" menu   
![image.png](/.attachments/image-54ede840-ea84-40a4-937b-77d1bfe7c38a.png =500x)


   
   5. Select the box for "Request Certificate" for the line "**gme.gbl**" enter your PIN and click "GET Certificates"

      - No records listed for "gme.gbl" domain may due to missing Manager final approval for the domain account._
      - You may get an error of "The YubiKey is not registered for use".   
![image.png](/.attachments/image-040166d6-8eb6-490e-9e0c-657a19533a4c.png =250x)
Please raise a ticket here: https://aka.ms/assignsecuritykey (IcM is auto-created and when resolved it will associate the Key ID to your @microsoft account)_
  
   6. All done. You're able to confirm certificate was imported with success on "Current Certificate".   
![image.png](/.attachments/image-b1924c43-cc88-410b-887c-dfb88d88903f.png =450x)

   7. For any other issues with using Yubikey check these two FAQs to see if your issue is listed
      * [Cloud MFA Security Key Troubleshooting](https://microsoft.sharepoint.com/teams/CDOCIDM/SitePages/Security-Key-FAQ.aspx) 
      * [CSS Identity Isolation Wiki \ Yubikey FAQ](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/870/CSS-Identity-Isolation?anchor=yubikey-and-smartcard) 

   8. If issue is not found in FAQ, submit support request to https://aka.ms/SecurityKeyTS for assistance from Cloud MFA team.

# CORP Yubikey Registration

To sign into a SAW as a support engineer you need to use passwordless \ yubikey authentication using your CORP microsoft account.  So you need to configure your yubikey as a passwordless auth method for your alias@microsoft.com

1. From your primary workstation (not SAW), visit https://aka.ms/mysecurityinfo and verify sign in with alias@microsoft.com
2. Choose "Security Info" tab
3. Plug in your yubikey to your workstation
4. Choose "Add sign-in method"
5. Choose "Security key" option
6. Complete the registration steps to add your Yubikey and choose a PIN for your account.  Suggest giving the key a name like "YubikeyCORP" to distinguish it from other keys on your yubikey

# SAW

<table style="margin-left:.34in">
  <tr style="background:lightyellow;color:black">
    <td>
      <small>&#128276; <b>Note</b> &#128276
      <p style="margin-left:.27in">SAW VMs will be deprecated on September 30th, 2024. <a href="https://microsoft.sharepoint.com/sites/CentralizedSAWProgramTeam/SitePages/SAVM-Deprecation-Rollout.aspx?xsdata=MDV8MDJ8SmFzb24uRnJpdHRzQG1pY3Jvc29mdC5jb218YTliYWIwOTMzOGU5NDgyOGE0MWMwOGRjODFjMGRmMjl8NzJmOTg4YmY4NmYxNDFhZjkxYWIyZDdjZDAxMWRiNDd8MXwwfDYzODUyNzkxMjU4MDE4MzcwN3xVbmtub3dufFRXRnBiR1pzYjNkOGV5SldJam9pTUM0d0xqQXdNREFpTENKUUlqb2lWMmx1TXpJaUxDSkJUaUk2SWsxaGFXd2lMQ0pYVkNJNk1uMD18MHx8fA%3d%3d&sdata=RjRpKzZNTmhEbXM5OFpuM1VsakQzVGV1TU0wZ3U4RFBXSFJxRk5ibExUYz0%3d&clickparams=eyAiWC1BcHBOYW1lIiA6ICJNaWNyb3NvZnQgT3V0bG9vayIsICJYLUFwcFZlcnNpb24iIDogIjE2LjAuMTc3MjYuMjAwNzgiLCAiT1MiIDogIldpbmRvd3MiIH0%3D"> Read More </a>  <br><br> SCIM engineers with a need for a physical SAW can request one following <a href="https://microsoft.sharepoint.com/teams/SCIMCentral/SitePages/New-SAW.aspx">SCIM Central - New SAW</a></small>
    </td>    
  </tr>
</table>

If you have a business requirement for a physical SAW you may request one via steps found at [SCIM Central - New SAW](https://microsoft.sharepoint.com/sites/CentralizedSAWProgramTeam/SitePages/SAVM-Deprecation-Rollout.aspx?xsdata=MDV8MDJ8SmFzb24uRnJpdHRzQG1pY3Jvc29mdC5jb218YTliYWIwOTMzOGU5NDgyOGE0MWMwOGRjODFjMGRmMjl8NzJmOTg4YmY4NmYxNDFhZjkxYWIyZDdjZDAxMWRiNDd8MXwwfDYzODUyNzkxMjU4MDE4MzcwN3xVbmtub3dufFRXRnBiR1pzYjNkOGV5SldJam9pTUM0d0xqQXdNREFpTENKUUlqb2lWMmx1TXpJaUxDSkJUaUk2SWsxaGFXd2lMQ0pYVkNJNk1uMD18MHx8fA%3d%3d&sdata=RjRpKzZNTmhEbXM5OFpuM1VsakQzVGV1TU0wZ3U4RFBXSFJxRk5ibExUYz0%3d&clickparams=eyAiWC1BcHBOYW1lIiA6ICJNaWNyb3NvZnQgT3V0bG9vayIsICJYLUFwcFZlcnNpb24iIDogIjE2LjAuMTc3MjYuMjAwNzgiLCAiT1MiIDogIldpbmRvd3MiIH0%3D).  As of 2024-08 the only buisness use cases for SAW are one of the following:

- Azure Identity TA or PTA
- Azure FTE SE supporting Azure US Government Customers (ASC US Gov requires SAW)
- Azure FTE SE supporting Azure Key Vault as SME with frequent access need to [AKV service logs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1285258/Azure-Key-Vault-Jarvis-Logs?anchor=access-instructions)
## Sign in to your SAW
3. Once you have acquired a physical SAW laptop, you should follow below steps

   1. Review [CSS SAW Rollout Preparation Steps](https://microsoft.sharepoint.com/sites/CentralizedSAWProgramTeam/SitePages/CSS-SAW-Rollout-Preparation-Checklist.aspx)
   2. Verify from https://portal.sas.msft.net/sas/portal/saws that your SAW serial number (found MS Asset sticker of SAW) has been assigned to you.  If not follow [Assign/Reassign SAW](https://microsoft.sharepoint.com/sites/CentralizedSAWProgramTeam/SitePages/Assign-Reassign-a-SAW.aspx)
   2. Verify from https://portal.sas.msft.net/sas/portal/silos that your CORP credentials are a member of the CloudEnterprise silo (for TA+PTA you should also see your AME\alias listed and it should also be part of CloudEnterpriseAME silo)
   3. Ensure you have followed previous steps and registered both your *ME account (either GME.GBL or AME.GBL) from OneYubi client in previous steps and also your CORP microsoft account on your yubikey.
   4. Plug your Yubikey into your SAW laptop
   5. You should be prompted to provide your Yubikey PIN for signing into with your CORP identity registered on Yubikey.  If not choose Sign in options and select ![image.png](/.attachments/image-c8adad64-d754-46a5-9dad-8a57803d965f.png =40x) icon to be prompted for Yubikey sign in options.  If there are issues signing in review [SAW Login Guide](https://microsoft.sharepoint.com/sites/Security_Tools_Services/SitePages/SAS/SAW%20KB/SAWLoginGuide.aspx) for troubbleshooting options.  

      <font color="red">**NOTE:**</font> For Support Engineeers, sign into SAW using CORP microsoft yubikey registeration, then once signed in follow remaining instructions to use GME account to access resources.   TA\PTAs you would use your AME.gbl certificate to login to SAW, and then use either AME or GME credentials to access resources.

   6. Once signed into Windows on your SAW, in web browser from SAW open incognito mode and visit resource such as https://aka.ms/jarvis-dsts or https://azuresupportcenter.usgovcloudapi.net/
   7. Select GME as account type:

      ![image.png](/.attachments/image-e71fe5c0-4d4e-46d9-b35e-61c08e09f88e.png =300x)

   8. Choose to sign in via certificate option

      ![image.png](/.attachments/image-4843c9d0-1f0c-4b28-adcb-d74dc26aecd2.png =300x)

   9. Verify your yubikey is activated by touching biometric if required and then choose the GME certificate option from available certificates listed. For the GME certificate, please choose the **�Microsoft Online Services GFS Internal CA2�** option.

      ![image.png](/.attachments/image-f7f5cb09-41ea-406d-9d79-d393eb7dab15.png =300x)

   10. When prompted type in your GME yubikey PIN code and confirm successful authentication.

   11. If you are not seeing your GME certificate, you may need to
 
       1. Remove and Re-Add your Yubikey from host workstation USB
       2. Re-activate Yubikey biometric by touching it
       3. Verify cert in SAVM Personal Cert Store

          1. From SAVM -> Start Menu -> Run "certmgr.msc"
          2. Browse to Certificates - Current user -> Personal\Certificates.  You should see your GME cert listed  if it's on your Yubikey with the title `Microsoft Online Services GFS Internal CA2`
          
             ![image.png](/.attachments/image-eae0e1a3-801c-4096-83b1-1d04f75b3d59.png)

# Security Group Membership Table

For access to various resources, make sure your GME account is in the following security groups.  If it is not, you can request membership via SAW-> Web Browser -> https://aka.ms/oneidentity portal -> Security Groups


|**Group Name**|**Resource**  |**Notes**  |
|--|--|--|
|GME\tm-azcts  |ASC Gov Portal  |For Delivery Partners use GME\tm-azcts-dp  |
|GME\azkv-logaccess-gme  |Azure Key Vault Jarvis Logs  |Review [key vault log instructions](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1285258/Azure-Key-Vault-Jarvis-Logs?anchor=access-instructions)  |

To validate your membership use https://aka.ms/tokendiag



# Additional Resources

* [Cloud MFA & Identity Support Sharepoint Home](https://microsoft.sharepoint.com/teams/cdocidm)

* [Atlas OneIdentity Wiki](https://aka.ms/OneIdentityWiki)

* [SAW The Basics](https://microsoft.sharepoint.com/sites/CentralizedSAWProgramTeam/SitePages/The-Basics.aspx)

* [SAW Login Guide](https://microsoft.sharepoint.com/sites/Security_Tools_Services/SitePages/SAS/SAW%20KB/SAWLoginGuide.aspx)
* [New SAW Device Setup](https://microsoft.sharepoint.com/sites/CentralizedSAWProgramTeam/SitePages/First%20Time%20User%20Login.aspx)
* [Prerequisites to use your SAW with AME](https://microsoft.sharepoint.com/sites/CentralizedSAWProgramTeam/SitePages/Prerequisites-to-Use-Your-SAW-with-AME.aspx?xsdata=MDV8MDJ8fDUwNGQ1M2Y5ZjZiMDRmNTgyYzQ5MDhkY2E4MWU3YWU0fDcyZjk4OGJmODZmMTQxYWY5MWFiMmQ3Y2QwMTFkYjQ3fDB8MHw2Mzg1NzAwOTYwNDQwMjY5NTN8VW5rbm93bnxWR1ZoYlhOVFpXTjFjbWwwZVZObGNuWnBZMlY4ZXlKV0lqb2lNQzR3TGpBd01EQWlMQ0pRSWpvaVYybHVNeklpTENKQlRpSTZJazkwYUdWeUlpd2lWMVFpT2pFeGZRPT18MXxMMk5vWVhSekx6RTVPak5qWXpNNFpXRXdMVFJrWW1VdE5HWXlPQzFpTURVNExXUTVaREV6TmpZNU9UZGlZMTgwT0RJNU1UTm1NaTFrTnpBM0xUUTBNR0l0WW1abFppMDNObU5tWWpnNFlqRXdORE5BZFc1eExtZGliQzV6Y0dGalpYTXZiV1Z6YzJGblpYTXZNVGN5TVRReE1qY3hNemMzTnc9PXwzZDMwMDM1YjJiOWU0Y2FkMmM0OTA4ZGNhODFlN2FlNHw5MTQ1NmE1ZGNiYTI0MzY5YmY4ZGRkMjQ3Yjc1NmIxZA%3D%3D&sdata=Smg0bkF6Y2tWbEFHcUQ1ZTJSSFB0aVREUWwwWEhTV1k1RTgxaVF5VDJTTT0%3D&ovuser=72f988bf-86f1-41af-91ab-2d7cd011db47%2Cjafritts%40microsoft.com&OR=Teams-HL&CT=1722889025837&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI0OS8yNDA3MTEyODgxOSIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D)

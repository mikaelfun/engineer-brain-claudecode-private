---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Seamless Single Sign On (SSO)/Azure AD Seamless Single Sign-On (SSO)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Seamless%20Single%20Sign%20On%20(SSO)%2FAzure%20AD%20Seamless%20Single%20Sign-On%20(SSO)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-hybauth
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   


[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-User-Sign-in](/Tags/AAD%2DUser%2DSign%2Din) [AAD-Workflow](/Tags/AAD%2DWorkflow) 

 

  
 


[[_TOC_]]

## Summary

Seamless Single Sign-On is an option that can be enabled in Entra Connect with either Password Hash Synchronization (PHS) or Pass-Through Authentication�(PTA).�When Seamless Single Sign-On is enabled, users need not type their password to login in to Entra or other cloud services when their corporate machines are connected on the corporate network.�

With Seamless Single Sign-On is enabled and users access resources connected to Entra services (such as Office 365, Microsoft Intune, CRM Online, and SaaS services) the users don�t need to type their password, but instead use a Kerberos ticket is automatically acquired from their on-premises Active Directory.

**Benefits**

  - True Single Sign-On (SSO) without ADFS
  - No additional servers or infrastructure required on premises
  - Accelerated deployment
  - Utilizes existing AD infrastructure
  - Inherit support for multiple regions
  - Inherit support for finding the closest Domain Controller (DC)
  - Based on Kerberos
  - No Disaster Recovery plan required outside of AD Disaster recovery

**Support for both PTA and PHS customers**

SSO is provided for all domain joined corporate machines with line of sight to a DC

## Architecture and Dependencies

### Architecture

[![Sso arch1.png](/.attachments/20df9f16-0f1e-b99c-e74b-075cb01ea79e800px-Sso_arch1.png)](/.attachments/20df9f16-0f1e-b99c-e74b-075cb01ea79e800px-Sso_arch1.png)

1.  User Enters username into the login box.� Optionally domain or User can be populated via accelerators
2.  User gets a 401 Challenge
3.  User contacts the DC for a Kerberos ticket for the SPN
4.  DC returns Kerberos ticket
5.  Client sends the Kerberos ticket to Entra STS
6.  Entra Validates the Kerberos ticket and returns a token

### Requirements

  - Entra Connect 1.1.368.0 and up

For end users to use single sign on in their environment, they need to ensure that users are:

  - On a domain joined machine
  - Have direct connection to a domain controller, for example on the corporate wired, wireless network or via a VPN type connection.
  - Define the Kerberos end-points in the cloud as part of the Intranet zone.

### MSODS Policy showing SSO enablement

The MSODS Policy is set when the Entra Connect wizard is ran and SSO is selected. In the PolicyDetail you can determine whether DesktopSSO is enabled.

<div class="thumb tnone">

<div class="thumbinner" style="width:615px;">

[![Sso msods.png](/.attachments/e8f26e51-1654-03ef-ccd5-ba7eeba42c6d613px-Sso_msods.png)](/.attachments/e8f26e51-1654-03ef-ccd5-ba7eeba42c6d613px-Sso_msods.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

## Deployment

### Client-side

  - Seamless SSO can be enabled for both Pass-Through Authentication and Password Hash Sync during the AD Connect Wizard experience.
      - Domain Administrator credentials are required to create the necessary On-premises Machine account (AZUREADSSOACC) in the Computers container.
  - The Domain Administrator must set two Group Policy Objects (GPO):
      - For the eligibility check to work, the "**Allow updates to status bar via script**" policy setting under "**User Configuration\\Administrative Templates\\Windows Components\\Internet Explorer\\Internet Control Panel\\Security Page\\Intranet Zone**" must be **Enabled**.
      - Placing the URLs below into the Intranet Zone causes authentication requests sent to <https://autologon.microsoftazuread-sso.com> to be sent as Kerberos requests. This in turn triggers the Kerberos ticket request process.
          - It is recommended these be enabled on the "**Default Domain Policy**":

<!-- end list -->

``` 
 Value: https://autologon.microsoftazuread-sso.com
 Data: 1
```

**Note**: (the Data value of 1 indicates these are to be placed in the Intranet zone)

### Service-Side

[![SSO Setup.png](/.attachments/a4428591-fa71-1024-0119-040a69cfff54800px-SSO_Setup.png)](/.attachments/a4428591-fa71-1024-0119-040a69cfff54800px-SSO_Setup.png)

1\. The AZUREADSSOACC computer account is created in the on-premises on CN=Computers container and the two Service Principal Names (SPNs) are registered on this account:

  - HOST/autologon.microsoftazuread-sso.com

**Note** These HOST SPN entries leverage the sPNMappings attribute in the configuration partition which allows a HTTP ticket to be issued as seen in the Troubleshooting example below.

2\. The Kerberos Key for the AZUREADSSOACC computer account is stored Securely in Entra (MSODS Policy)

## Manual Reset Seamless SSO

This process outlines how to remove a domain from Seamless SSO policy. It also explains how to enable it again if desired.

### Remove an AD Forest from Seamless SSO

This process works for forests/domains that have not been decommissioned and are still accessible. If your customer has a domain that no longer exists, see the '[Remove a Decommissioned AD Domain/Forest from Seamless SSO](https://www.csssupportwiki.com/index.php/curated:Azure_AD_Seamless_Single_Sign-On_\(SSO\)#Remove_a_Decommissioned_AD_Domain.2FForest_from_Seamless_SSO)' section of this wiki.

#### Step 1: Import the Seamless SSO PowerShell module

1.  On the Entra Connect server, run PowerShell as Administrator and navigate to the "**%programfiles%\\Microsoft Azure Active Directory Connect**" folder.
2.  Import the Seamless SSO PowerShell module using this command:

<!-- end list -->

```
    PS C:\Program Files\Microsoft Azure Active Directory Connect> Import-Module .\AzureADSSO.psd1
```

#### Step 2: Get the list of AD forests on which Seamless SSO has been enabled

1.  From the elevated PowerShell prompt, run **New-AzureADSSOAuthenticationContext**. When prompted, enter your tenant's Global Administrator credentials.
2.  Call **Get-AzureADSSOStatus**. This command provides you the list of AD forests (examine the "**Domains**" list) on which this feature has been enabled.

#### Step 3: Disable Seamless SSO for each AD forest that it was set it upon

  - If the forest still exists:

<!-- end list -->

1.  Call **$creds = Get-Credential**. When prompted, enter the Domain Administrator credentials for the intended AD forest.
2.  Call **Disable-AzureADSSOForest -OnPremCredentials $creds**. This command removes the AZUREADSSOACCT computer account from the on-premises domain for this specific AD forest, and it removes the domain from the policy in Entra.

### Add an AD Forests to Seamless SSO

This process can be used to Enable Seamless SSO on newly added forest trusts:

#### Step 1: Import the Seamless SSO PowerShell module

1.  On the Entra Connect server, run PowerShell as Administrator and navigate to the "**%programfiles%\\Microsoft Azure Active Directory Connect**" folder.
2.  Import the Seamless SSO PowerShell module using this command:

<!-- end list -->

```
    PS C:\Program Files\Microsoft Azure Active Directory Connect> Import-Module .\AzureADSSO.psd1
```

#### Step 2: Enable Seamless SSO for each AD forest

1.  Call **Enable-AzureADSSOForest**. When prompted, enter the Domain Administrator credentials for the intended AD forest.
2.  Repeat the preceding steps for each AD forest that you want to set up the feature on.

#### Step 3. Enable the feature on your tenant

1.  Call **Enable-AzureADSSO** and type in "**true**" at the Enable: prompt to turn on the feature in your tenant.

### Remove a Decommissioned AD Domain/Forest from Seamless SSO

It might be necessary to remove a domain when the on-premises domain has been decommissioned. When the on-premises domain no longer exists and it needs to be removed from the policy in Entra, the 'Disable-AzureADSSOForest -DomainFQDN 'contoso.com'�can be used. Providing the FQDN of the domain, without on-premises credentials, will only remove the domain from the policy in Azure AD. It will not make any on-premises changes.

#### Step 1: Import the Seamless SSO PowerShell module

1.  On the Entra Connect server, run PowerShell as Administrator and navigate to the "**%programfiles%\\Microsoft Azure Active Directory Connect**" folder.
2.  Import the Seamless SSO PowerShell module using this command:

<!-- end list -->

```
    PS C:\Program Files\Microsoft Azure Active Directory Connect> Import-Module .\AzureADSSO.psd1
```

#### Step 2: Get the list of AD forests on which Seamless SSO has been enabled

1.  From the elevated PowerShell prompt, run **New-AzureADSSOAuthenticationContext**. When prompted, enter your tenant's Global Administrator credentials.
2.  Call **Get-AzureADSSOStatus**. This command provides you the list of AD forests (examine the "**Domains**" list) on which this feature has been enabled.

#### Step 3: Disable Seamless SSO for each AD forest that it was set it upon

  - If the domain/forest no longer exists:

<!-- end list -->

1.  Call **Disable-AzureADSSOForest -DomainFQDN "contoso.com"**. The -DomainFqdn parameter will just update the policy within in Entra and does not require the domain to active.

## Troubleshooting

### Azure Support Center (ASC)

[ASC�for�Cloud�Authentication:�PTA,�
Seamless�SSO�and�Staged�Rollout�Migration](https://microsoft.sharepoint.com/:b:/t/IdentitySupportabilityCSSPG-Authentication/EarkmAW_1DFAkG4Fe75U8tYBm-ju1B-Z2LdojHvYuoOEhw?e=LnGUvP)

### Error enabling Seamless single sign on

1. If there is more than one forest with forest trust, enabling SSO in one forest, will enable SSO in all trusted forests. 
If you enable SSO in a forest where SSO is already enabled, you'll get following error

  - AADC (>=1.4.38.0)
```
�An existing computer account was detected, which uses either the reserved SPNs (...) 
or display name (AZUREADSSOACC) that SSO also uses. 
This can happen if you have previously enabled SSO for this forest�
```

- AADC(<1.4.38.0)
 ```
 The command Enable-AzureADSSOForest or Update-AzureADSSOForest returns a constraint violation error.
 ```
   You can either delete AZUREADSSOACC computer account from AD and enable SSO again or skip enabling sso for that particular forest since its already enabled. 

2. Enabling / disabling Seamless SSO might fail, when there is a network communication issue between the computer you start the operation and Entra. In rare situations a problem might happen in Entra.

For troubleshooting data like network trace and Fiddler trace must be collected.

During the process the following endpoint gets contacted:

https://_TENANTID_.registration.msappproxy.net/

### On Client machine

#### Review Klist

*This step might be helpful when you see customer having "403 forbidden" from the fiddler trace. This is a good indicator that the Kerberos ticket is not being passed through.*

Ensure that you see the SPNs for the Online Service:

[![Sso klist.png](/.attachments/9b278e98-64a1-9d06-0484-d5cc44b5e29cSso_klist.png)](/.attachments/9b278e98-64a1-9d06-0484-d5cc44b5e29cSso_klist.png)

To test the scenario where the user enters only the username, but not the password:

  - Sign into <https://myapps.microsoft.com/> in a new private browser session.

To test the scenario where the user doesn't have to enter the username or the password:

  - Sign into <https://myapps.microsoft.com/contoso.onmicrosoft.com> in a new private browser session. Replace "contoso" with your tenant's name.

\-OR-

  - Sign into <https://myapps.microsoft.com/contoso.com> in a new private browser session. Replace "contoso.com" with a verified domain (not a federated domain) in your tenant.

#### Manually Initiate Seamless SSO Using Kerberos

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>Actions Taken</th>
<th>Windows 10 Login Experience</th>
<th><strong>Pre-Windows 10 Login Experience</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="vertical-align:top">A user who has not connect to Office.com finds they have no Kerberos ticket for     HTTP/autologon.microsoftazuread-sso.com
<p>(purged for demonstration purposes)</p></td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/963b97f5-2709-d8a6-08eb-a4459d027067WinXklistPurged.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/963b97f5-2709-d8a6-08eb-a4459d027067WinXklistPurged.jpg" alt="WinXklistPurged.jpg" class="thumbborder" width="241" height="167" /></a></td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/2b9359ec-77b4-b6ae-3aa2-e0be810001cbPre-WinXklistPurged.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/2b9359ec-77b4-b6ae-3aa2-e0be810001cbPre-WinXklistPurged.jpg" alt="Pre-WinXklistPurged.jpg" class="thumbborder" width="264" height="135" /></a></td>
</tr>
<tr class="even">
<td style="vertical-align:top">On Windows 10, if the user account is synced to Azure AD they should see the user has a Primary Refresh Token (PRT) when they run Dsregcmd.exe /status.</td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/c96f7869-8490-6a48-19e8-f73c866057d1552px-WinXPRT.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/c96f7869-8490-6a48-19e8-f73c866057d1552px-WinXPRT.jpg" alt="WinXPRT.jpg" class="thumbborder" srcset="/images/thumb/3/34/WinXPRT.jpg/828px-WinXPRT.jpg 1.5x, /images/3/34/WinXPRT.jpg 2x" width="552" height="503" /></a></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top">In this example, the user connects to <a href="https://portal.office.com" class="external free">https://portal.office.com</a> which redirects to <a href="https://login.microsoft.com" class="external free">https://login.microsoft.com</a>.
<p><strong>IMPORTANT</strong>: On Windows 10, the user might get no prompt for credentials and are taken straight to the service. Examination of klist shows no Kerberos ticket. The user connected without having to type anything because they had a Primary Refresh Token (PRT) and Pass-Through Authentication (PTA) verified the user's credentials.</p>
<p>To verify Seamless SSO will work on Windows 10, you might need to sign the user out, as has been done here.� Clicking the cached user will only trigger another PTA login.� To force Seamless SSO instead, click "<strong>Use another account</strong>".</p></td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/5da93a7e-4735-3f6e-b0d0-c7f224add8fb552px-WinXAnotherAccount.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/5da93a7e-4735-3f6e-b0d0-c7f224add8fb552px-WinXAnotherAccount.jpg" alt="WinXAnotherAccount.jpg" class="thumbborder" srcset="/images/2/26/WinXAnotherAccount.jpg 1.5x" width="552" height="520" /></a></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top">The user enters their UPN for Sign-in and then clicks <strong>Next</strong>.</td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/d4be34f5-b59b-6e4c-5296-8b1dbec547ed552px-WinXUPN.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/d4be34f5-b59b-6e4c-5296-8b1dbec547ed552px-WinXUPN.jpg" alt="WinXUPN.jpg" class="thumbborder" srcset="/images/6/6b/WinXUPN.jpg 1.5x" width="552" height="522" /></a></td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/d4a4cb60-6a93-71c0-36ff-de05a15c63f5552px-Pre-WinXUPN.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/d4a4cb60-6a93-71c0-36ff-de05a15c63f5552px-Pre-WinXUPN.jpg" alt="Pre-WinXUPN.jpg" class="thumbborder" srcset="/images/0/0b/Pre-WinXUPN.jpg 1.5x" width="552" height="522" /></a></td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Upon clicking <strong>Next</strong>, the user is very briefly taken to the password login screen. When Seamless SSO is working as expected, the page automatically advances to sign the user into Office (without the user having to type their password).
<p><strong>NOTE</strong>: If the password prompt does not automatically advance at this point then Seamless SSO is failing.</p></td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/08ceda70-892f-1eeb-d3f1-cc13d954b3fc552px-WinXOffice.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/08ceda70-892f-1eeb-d3f1-cc13d954b3fc552px-WinXOffice.jpg" alt="WinXOffice.jpg" class="thumbborder" srcset="/images/a/af/WinXOffice.jpg 1.5x" width="552" height="520" /></a></td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/b31b12b9-4a07-2f56-bc34-d71b842784a8552px-Pre-WinXOffice.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/b31b12b9-4a07-2f56-bc34-d71b842784a8552px-Pre-WinXOffice.jpg" alt="Pre-WinXOffice.jpg" class="thumbborder" srcset="/images/thumb/d/d7/Pre-WinXOffice.jpg/828px-Pre-WinXOffice.jpg 1.5x, /images/d/d7/Pre-WinXOffice.jpg 2x" width="552" height="438" /></a></td>
</tr>
<tr class="even">
<td style="vertical-align:top">When Seamless SSO works as expected, the user will now have a Kerberos token for     HTTP/autologon.microsoftazuread-sso.com.�</td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/07843d1f-6880-3530-3ce0-d319517da93a552px-WinXTicket.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/07843d1f-6880-3530-3ce0-d319517da93a552px-WinXTicket.jpg" alt="WinXTicket.jpg" class="thumbborder" srcset="/images/b/b5/WinXTicket.jpg 1.5x" width="552" height="369" /></a></td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/27f39e18-13a5-2959-d078-c913698c3b2c552px-Pre-WinXTicket.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/27f39e18-13a5-2959-d078-c913698c3b2c552px-Pre-WinXTicket.jpg" alt="Pre-WinXTicket.jpg" class="thumbborder" srcset="/images/a/a4/Pre-WinXTicket.jpg 1.5x" width="552" height="269" /></a></td>
</tr>
</tbody>
</table>

#### Verify the KDC can Issue a ticket for AZUREADSSOACC

If the user is not seeing a klist ticket for **Server:     HTTP/autologon.microsoftazuread-sso.com**, they can manually verify that the KDC is able to issue a Kerberos ticket for Seamless Single-Sign-On by running either of these commands on Windows 8.1 or later:

```
    klist get HTTP/autologon.microsoftazuread-sso.com
    
    -OR-
    
    klist get AZUREADSSOACC
```

If you do not see the command return any result, it is possible that the AZUREDSSOACC computer account is not added to the domain. Please flow the step here: [SeamlessSso troubleshoot](https://docs.microsoft.com/azure/active-directory/connect/active-directory-aadconnect-troubleshoot-sso) under section "**Manual reset of the feature**".

If you already have SeamlessSso enabled, you can skip step 3 and step 5.

#### Browser Console Logs

Press **F12** in browser (varies by Browser)

In 'Console' log, attempt will be logged (example below)

#### Network trace of Kerberos Traffic

Netmon/Message Analyzer can be used on the client to review the kerberos authentication. below is a successful attempt.

#### Fiddler

1\) First direction to https://login.microsoftonline.com/common/userrealm/

Request shows the "User"

The Response will show the JSON response containing useful information about the user

<div class="thumb tnone">

<div class="thumbinner" style="width:302px;">

[![Sso fiddler 1.png](/.attachments/80f7237a-00a1-cf8a-2491-81abfabf1024300px-Sso_fiddler_1.png)](/.attachments/80f7237a-00a1-cf8a-2491-81abfabf1024300px-Sso_fiddler_1.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

2\) Redirect to https://autologon.microsoftazuread-sso.com/\*tenant\*/winauth/sso?

Request contains Client-Request-ID, this corresponds to the CorrelationID in eSTS

3\) redirect to Login.microsoftonline.com

Contains credential and dssoToken

### On Entra Connect Server

#### Get list of AD forests where Seamless SSO has been enabled

1.  Run PowerSjhell as an Administrator and navigate to the **%programfiles%\\Microsoft Azure Active Directory Connect** folder

2.  Import the Seamless SSO PowerShell module using this command:
    
    ```
        Import-Module .\AzureADSSO.psd1
    ```

3.  In PowerShell, run **New-AzureADSSOAuthenticationContext**. This command should give you a popup to enter your tenant's Global Administrator credentials.

4.  Turn **Get-AzureADSSOStatus** and look at the '**Domains**' section for a list of AD forests on which this feature has been enabled.

<!-- end list -->

```
    CD:\> Get-AzureADSSOStatus
    {"Enable":true,"Exists":true,"Domains":["contoso.com"],"IsSuccessful":true,"ErrorMessage":""}
```

#### Collect Entra Connect Trace Logs

The Entra Connect Trace logs can be used to troubleshoot deployment of the sso feature

ex.�%localappdata%\\AADCONNECT\\trace-20161130-155905.log

### On Domain Controllers

Every time a user logs in with seamless single sign-on, an entry is recorded in the event log of the domain controller, if Success auditing is enabled.� To find these events, you can review the Event logs for the security Event ID: 4769 associated with computer account AzureADSSOAcc$.� The filter below finds all security events associated with the computer account:

```
    <QueryList>
    <Query Id="0" Path="Security">
    <Select Path="Security">*[EventData[Data[@Name='ServiceName'] and (Data='AZUREADSSOACC$')]]</Select>
    </Query>
    </QueryList>
```

### Seamless SSO - Troubleshooting Workflows

\[[Seamless SSO - Troubleshooting Workflow](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184195)\]

## DGREP / Jarvis / Kusto Logs

**!! Support cannot access ESTS tables directly anymore. The Sign-In Diagnostics integrated in ASC must be used. If it does not work ICM must be raised. !!**


|                          |                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Namespace**            | AadEvoSTSPROD                                                                             |
| **Events to Search**     | PerRequestTableIfx                                                                        |
| **Filtering Conditions** | CorrelationID==client-request-id from Fiddler trace to autologon.microsoftazuread-sso.com |

  - Capture a Fiddler trace of Seamless SSO failing where the user is browsing to <https://portal.office.com> and the user ends up sitting at the Password prompt.
  - In the fiddler trace, examine the final frame from [https://autologon.microsoftazuread-sso.com/](https://autologon.microsoftazuread-sso.com/contoso01.onmicrosoft.com/winauth/sso?desktopsso=true&isAdalRequest=False&client-request-id=00c00cae-f2ba-438a-b8cb-4db4c8d36555&_=1503679014242)
  - The WebView respons should show the AADSTS error code returned and the CorrelationID.
  - Copy the correlationID info from the RAW view and change the query below to the correct datee/time and CorrelationID.
  - Perform a Kusto query against the PerRequestTableIfx table in ESTS to get a summary view.

<!-- end list -->

```
    //Get all PerRequestTableIfx events associated with the CorrelationId cited in the client-side error to get a Summary view
    let start = datetime(2017-08-25 16:35:00Z);
    let end = datetime(2017-08-25 16:37:00Z);
    find in (
    cluster("estsam2").database("ESTS").PerRequestTableIfx,
    cluster("estsbl2").database("ESTS").PerRequestTableIfx,
    cluster("estsby1").database("ESTS").PerRequestTableIfx,
    cluster("estsch1").database("ESTS").PerRequestTableIfx,
    cluster("estsdb3").database("ESTS").PerRequestTableIfx,
    cluster("estshkn").database("ESTS").PerRequestTableIfx,
    cluster("estssin").database("ESTS").PerRequestTableIfx,
    cluster("estsdm1").database("ESTS").PerRequestTableIfx,
    cluster("estssn1").database("ESTS").PerRequestTableIfx) where CorrelationId == "00c00cae-f2ba-438a-b8cb-4db4c8d36555"
    //| project env_time, CorrelationId, RequestId, Result, ApplicationId, ErrorCode, MdmAppId, IsDeviceCompliantAndManaged, DeviceTrustType, MfaStatus, ClientIp, ClientIpSubnet, DeviceId, ApplicationDisplayName, ConditionalAccessAppIdentifier1, ConditionalAccessAppId1Decision, ConditionalAccessAppIdentifier2, ConditionalAccessAppId2Decision, MultiCAEvaluationLog, ConditionalAccessVerboseData, ClientInfo, Client //Remove for more detail
    | sort by env_time asc
```

Copy the RequestId and then run a query against the detailed DiagnosticTracesIfx table in ESTS and examine the Messages that perceeded the Error in the Exception column.

```
    //95cda9d3-7f9e-440f-b237-8f39ea5069d7
    //Query DiagnosticTracesIfx using the RequestID to get detail of the error
    let start = datetime(2017-08-25 16:35:00Z);
    let end = datetime(2017-08-25 16:37:00Z);
    find in (
    cluster("estsam2").database("ESTS").DiagnosticTracesIfx,
    cluster("estsbl2").database("ESTS").DiagnosticTracesIfx,
    cluster("estsby1").database("ESTS").DiagnosticTracesIfx,
    cluster("estsch1").database("ESTS").DiagnosticTracesIfx,
    cluster("estsdb3").database("ESTS").DiagnosticTracesIfx,
    cluster("estshkn").database("ESTS").DiagnosticTracesIfx,
    cluster("estssin").database("ESTS").DiagnosticTracesIfx,
    cluster("estsdm1").database("ESTS").DiagnosticTracesIfx,
    cluster("estssn1").database("ESTS").DiagnosticTracesIfx) where env_time >= start and env_time <= end and RequestId == "bc060cc2-d29b-4161-9349-2d3341f00e00"  // Locate the Message with the STS Error.
    //| project env_time, CorrelationId, RequestId, Result, EventId, Message, Exception //Remove for more detail
    | sort by env_time asc
```

## Known Issues

The following are known issues, as the product matures these items may be modified, they are preceded with the date of entry.

  - 06/14/2017 Entra Connect Configuration fails with "**Object reference not set to an instance of an object.**" when Seamless Single Sign-On is enabled in tenant where it was previously enabled and one of the domains no longer exists.
      - Resolution: Remove domain/domains in the policy, please do the following:
          - Open powershell
          - Navigate to "%programfiles%\\Microsoft Azure Active Directory Connect"
          - Import AzureADSSO.psd1 by calling: Import-Module .\\AzureADSSO.psd1
          - Call New-AzureADSSOAuthenticationContext . This should give you a popup to enter your tenant cred.
          - Call Disable-AzureADSSOForest and pass in either a domain admin credential to remove the computer account and in the policy or pass in a domain name to only remove the domain in the policy.
  - 8/24/2017 Seamless SSO fails for clients that have the '**Network security: Configure encryption types allowed for Kerberos**" Security Option Enabled in GPO, and set to only allow '**AES256\_HMAC\_SHA1**' and '**Future encryption types**'. The user sits at the password prompt and must type in their password to get authenticated using either PTA or PHS.
      - Running "klist get AZUREADSSOACC" from a Windows 8.1 or later computer fails to retrieve a kerberos ticket from the KDC with:

<!-- end list -->

```
    Error calling API LsaCallAuthenticationPackage (GetTicket substatus): 0x80090342                                                                                                                                                                klist failed with 0xc00002fd/-1073741059: The encryption type requested is not supported by the KDC.
```

  -   - Setting the '**msDS-SupportedEncryptionTypes**' attribute on the AZUREADSSOACC account to 2147483647 allows the client to request a ticket where the 'Session Key Type' is AES-256-CTS-HMAC-SHA1-96. However, Seamless SSO fails and the user sits at the password prompt.
      - Taking a Fiddler and looking at the attempt in ESTS shows '**KRB\_AP\_ERR\_MODIFIED**' and '**WindowsIdentity is null.**' in the **Messages**.
      - The PG is investigating this issue.

<!-- end list -->

  - 03/14/2019 Using Entra To Configure SSO, they get the following error: "An error occurred while locating computer account"
      - Resolution: Remove the user from the AD Group "Protected Users Group" Users in this group cannot perform NTLM, which is used by Entra Connect for this process

## FAQ

**Q: Do I need an Entra Premium or Basic license to use SSO?**

A: No. �SSO is included in Entra free edition.

**Q: Is Alternate UPN supported?**

A: Yes.

**Q: Can I use SSO authentication in a multi forest environment?**

A: Yes. You will need to supply domain administrator credential for each forest during setup in Entra Connect.

**Q: What applications work and what applications do not work with SSO?**

A: SSO authentication works with web browsers and rich clients that support modern authentication on domain join machines that are able to get a Kerberos ticket from a domain controller.

A detailed table of the Office clients that support modern auth can be found [here](https://blogs.office.com/2015/03/23/office-2013-modern-authentication-public-preview-announced/)

## Supportability Documentation

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>Scenario</th>
<th>Supported by</th>
<th>PG Escalation</th>
<th>Notes</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="vertical-align:top">Issue installing sso capability</td>
<td style="vertical-align:top">Cloud Identity Pod</td>
<td style="vertical-align:top"><a href="https://portal.microsofticm.com/imp/v3/oncall/current?serviceId=26133&teamIds=61404&scheduleType=current&shiftType=current&viewType=1&gridViewStartDate=2019-12-24T06:00:00.000Z&gridViewEndDate=2019-12-30T06:00:00.000Z&gridViewSelectedDateRangeType=9">Hybrid Authentication</a></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Failure Signing into Service utilizing SSO</td>
<td style="vertical-align:top">Cloud Identity Pod</td>
<td style="vertical-align:top"><a href="https://portal.microsofticm.com/imp/v3/oncall/current?serviceId=26133&teamIds=61404&scheduleType=current&shiftType=current&viewType=1&gridViewStartDate=2019-12-24T06:00:00.000Z&gridViewEndDate=2019-12-30T06:00:00.000Z&gridViewSelectedDateRangeType=9">Hybrid Authentication</a></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Issue with Azure AD SSO Service</td>
<td style="vertical-align:top">Cloud Identity Pod</td>
<td style="vertical-align:top">&lt;VKB Article pending update&gt;</td>
<td style="vertical-align:top">Back-end ICM Path is
<p>Service:AAD Application Proxy</p>
<p>Team: Hyrbid Scenarios (PTA/DSSO)</p></td>
</tr>
</tbody>
</table>

## IcM/DCR

(Starting from 1st February 2025)

| **Severity**                 |  **ICM queue**                                                |
| ------------------------ | ------------------------------------------------ |
|        Lower than Sev2 (Sev3, Sev4, etc.)                |        ESTS\Incident Triage                                    |
|        Sev2 and higher (Sev1, Sev0)     |        ESTS\eSTS                               |

### External Documentation:

[Entra Documentation Library Content](https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta)

### Training

1. [This must be updated]

**Note**: This training can also be found on [SuccessFactors](https://hcm41.sapsf.com/sf/learning?destUrl=https%3a%2f%2fmicrosoftlmsap2%2elms%2esapsf%2ecom%2flearning%2fuser%2fdeeplink%5fredirect%2ejsp%3flinkId%3dITEM%5fDETAILS%26componentID%3d145001%26componentTypeID%3dONLINE-COURSE%26revisionDate%3d1516165200000%26fromSF%3dY&company=microsofAP2) while it still exists.

If you have any feedback on this article or you need assistance, please contact us over [the PTA and Seamless SSO, Staged Rollout Teams channel](https://teams.microsoft.com/l/channel/19%3a33d2ca295e334b869b43ad3fc8c6eb04%40thread.skype/PTA%2520and%2520Seamless%2520SSO%252C%2520Staged%2520Rollout?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) or send  a [request / feedback](https://forms.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR36COL1ZDnJAnLWpaiURTuNUOFBNNFcwNUJDU1hQNkVDQzNON0VSMzY1Ti4u) to the Hybrid Authentication Experiences Community.



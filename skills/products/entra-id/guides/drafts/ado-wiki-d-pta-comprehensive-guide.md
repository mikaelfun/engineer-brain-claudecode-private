---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Pass-Through Authentication/Azure AD Pass-Through Authentication (PTA)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Pass-Through%20Authentication%2FAzure%20AD%20Pass-Through%20Authentication%20(PTA)"
importDate: "2026-04-07"
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

## Trending issues

- No issues.

## Summary

Microsoft Entra Pass-through authentication provides a simple, secure and scalable model for validation of passwords against your on-premises Active directory via a simple connector deployed in the on-premises environment. This connector uses only secure outbound communications, so no DMZ is required nor are there any unauthenticated end points on the internet. We also automatically balance the load between the set of available connectors for both high availability and redundancy, without requiring additional infrastructure. We made the connector super light-weight so it can be easily incorporated into your existing infrastructure and even deployed on your Active Directory controllers if you want.

## Where it fits

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<tbody>
<tr class="odd">
<td style="vertical-align:top"><strong>I need to</strong></td>
<td style="vertical-align:top"><strong>Microsoft Entra Connect with PHS and Single Sign-On</strong></td>
<td style="vertical-align:top"><strong>Microsoft Entra Connect with</strong>
<p><strong>Pass through</strong></p>
<p><strong>Authentication (PTA)</strong></p>
<p><strong>and with SSO</strong></p></td>
<td style="vertical-align:top"><strong>Microsoft Entra Connect</strong>
<p><strong>With AD FS</strong></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Sync new user, contact, and group accounts created in my on-premises Active Directory to the cloud automatically</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Sync incremental updates made to existing accounts in my on-premises Active Directory to the cloud automatically</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Set up my tenant for Office 365 hybrid scenarios</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Enable my users to sign in and access cloud services using their on-premises password</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Reduce password administration costs</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Control password policies from my on-premises Active Directory</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Enable cloud-based multi-factor authentication solutions</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Implement single sign-on using corporate credentials</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Ensure no passwords are stored in the cloud</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Ensure all user authentications occurs against your on-premises Active Directory through a simple agent</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top">x</td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Ensure all user authentications occurs in your on-premises Active Directory</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Enable on-premises multi-factor authentication solutions</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Support smart card login for users</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">You require some specific feature of AD FS such as, limit access to cloud services based on the exchange protocol</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="even">
<td style="vertical-align:top">I already have AD FS running and want to provide a single experience for my users</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top">x</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Support for conditional access to both on-premises and cloud resources using device registration, Microsoft Entra Join, or Intune MDM polices</td>
<td style="vertical-align:top">-</td>
<td style="vertical-align:top">-</td>
<td style="vertical-align:top">x</td>
</tr>
</tbody>
</table>

## Architecture and Dependencies

[![PTA Architecture.png](/.attachments/1f3f6a2f-7d7a-ff57-11c3-acfdea6e460f800px-PTA_Architecture.png)](/.attachments/1f3f6a2f-7d7a-ff57-11c3-acfdea6e460f800px-PTA_Architecture.png)

1 During Auth request to some application, App is protected by Microsoft Entra and redirects the client EvoSTS for authentication

2a. A polling result is returned to the client

2b. ESTS queries MSODS for Authentication Policy via DPX

3\. Pass-through policy causes EvoSTS to delegate authentication to App Proxy Service using the queued connections established by Proxy Connector, App Proxy Service sends payload to Proxy Connector

4\. Proxy Connector validates credentials against AD

5\. DC returns result

6\. Proxy connector returns the result to the EvoSTS via the App Proxy Service

7\. Result returned back to EvoSTS

8\. EvoSTS issues a token for the App to the user, and the user presents the token to the App

### MSODS Policy for PTA

[![PTA MSODS.png](/.attachments/56c55e37-f53f-78b7-0aba-6b4295a1630f527px-PTA_MSODS.png)](/.attachments/56c55e37-f53f-78b7-0aba-6b4295a1630f527px-PTA_MSODS.png)

##[We must check, if it can be checked via ASC]

Search for the tenantid in the ContextId column:

### Microsoft Entra application proxy

The Microsoft Entra application proxy installed with Microsoft Entra Connect will only work with Microsoft Entra Connect, other Microsoft Entra application proxy connectors should be hosted on other servers.

[Troubleshooting related to Azure AD Application Proxy](https://azure.microsoft.com/documentation/articles/active-directory-application-proxy-troubleshoot/)

### Ports Required for Microsoft Entra Pass-through Authentication


|                   |             |                                                                                                    |      |    |                                                       |
| ----------------- | ----------- | -------------------------------------------------------------------------------------------------- | ---- | -- | ----------------------------------------------------- |
| Protocol          | Port        | Description                                                                                        | | | |
| HTTPS             | 443         | Handles all outbound communication with the service |      |    |                                                       |
| HTTP             | 80 | Downloads the certificate revocation lists (CRLs) while validating the TLS/SSL certificate|    |                                                       |
| HTTP | 8080 (Optional) | Authentication Agents report their status every ten minutes over port 8080, if port 443 is unavailable. This status is displayed on the Microsoft Entra admin center. Port 8080 is not used for user sign-ins.       |      |    |                                                       |
|      |    |                                                       |

Please find more network configuration related information here: [Microsoft Entra pass-through authentication - Quickstart - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta-quick-start#in-your-on-premises-environment)

#### Bootstrapping

The authentication agent requires ports TCP 443 to send bootstrap messages every 10 minutes to the Hybrid Identity Service where it pulls configuration updates, such as which Service Bus servers to use connect.

An initial bootstrap is the very first bootstrap that an agent does after starting up, i.e. it has no prior bootstrap in memory yet. If the agent, or the machine on which it is installed is restarted, an initial bootstrap is performed because there is no prior bootstrap in memory yet.

## Deployment

Pass-through Authentication is deployed via Microsoft Entra Connect 1.1.368.0 and up, during the Public Preview Password Hash Sync (PHS) is chosen as the default option to support clients not supported by PTA

It can also be deployed with SSO capabilities. See the [Microsoft Entra Seamless SSO Feature](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183982/Azure-AD-Seamless-Single-Sign-On-(SSO))) Wiki.

[![PTA1.png](/.attachments/097e4cd7-0924-9b03-39ed-9c5a633337dfPTA1.png)](/.attachments/097e4cd7-0924-9b03-39ed-9c5a633337dfPTA1.png)

### Switching between Authentication Methods

| Migration From: | Pwd Hash Sync                                                               | Federation                                                                              | PTA                                                                                                |
| --------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| PHS             |                                                                             | Done via the Microsoft Entra Connect Wizard, converts domain to federated and utilizes ADFS Servers | Enables Passthrough Authentication Policy in Microsoft Entra Id and installs private network connector On-premises |
| Federation      | Converts Accounts to managed authentication and syncs Passwords to Microsoft Entra Id |                                                                                         | Enables Passthrough Authentication Policy in Microsoft Entra Id and installs App Proxy Connector On-premises |
| PTA             | Disables Passthrough Authentication Policy in Microsoft Entra Id                      | Disables PTA Policy in AAD and converts domain to Federated                             |                                                                                                    |
| Not Configured  |                                                                             |                                                                                         |                                                                                                    |

### Verifying Authentication Methods

Run **Get-BetaMgDomain** and verify the domain of interest is not federated. PTA will not be used if the domain is federated.

Customers who installed AD FS outside of Microsoft Entra Connect that have federated their alternateUPNSuffix will find that the Microsoft Entra Connect Wizard does not convert their federated alternateUPNSuffix to managed when they enable PTA and/or DSSO when they run **Get-BetaMgDomain**. The customer must run **Remove-MgDomainFederationConfiguration** to change the federated domain(s) to managed. Once this is done, external clients will start using PTA.

### Verifying Configuration of the Microsoft Entra Connect server

Import-Module Microsoft.Graph.Beta.Identity.DirectoryManagement

Get-MgBetaDirectoryOnPremiseSynchronization -OnPremisesDirectorySynchronizationId $onPremisesDirectorySynchronizationId

Run the **Get-MgBetaDirectorySetting** cmdlet without specifying a feature to get a list of all features and whether they are enabled or disabled.


### Deployment of 2nd PTA Connector (Authentication agent)

Deployment of a 2nd PTA Connector via Microsoft Entra Connect is now possible during Public Preview, the Connector must be deployed using the following process.

**NOTE**: Customers running preview builds of PTA Connector from AAD Connect prior to build 1.1.561.0 must manually upgrade their connector. See "**Upgrading Preview Builds of PTA Connector Prior to AAD Connect version 1.1.561.0**" in this document.

#### Step 1: Install the Connector without registration

**Current:**

Install the Connector MSIs without registering the Connector sing these steps:

1\. Download the connector from here

2\. Open a command prompt.

3\. Run the following command in which the /q means quiet installation - the installation will not prompt you to accept the End User License Agreement.

```
    AADConnectAuthAgentSetup.exe REGISTERCONNECTOR="false" /q
```

#### Step 2: Register the Connector with Microsoft Entra Id for pass-through authentication

4\. Go to **C:\\Program Files\\Microsoft Azure AD Connect Authentication Agent** and run the script.

```
    .\RegisterConnector.ps1 -ModulePath "C:\Program Files\Microsoft Azure AD Connect Authentication Agent\Modules\" -ModuleName "PassthroughAuthPSModule" -Feature PassthroughAuthentication
```

5\. When prompted, enter the credentials of your Microsoft Entra Id tenant Admin account.

**Old:**

Install the Connector MSIs without registering the Connector sing these steps:

1\. Download the connector from here

2\. Open a command prompt.

3\. Run the following command in which the /q means quiet installation - the installation will not prompt you to accept the End User License Agreement.

```
    AADApplicationProxyConnectorInstaller.exe REGISTERCONNECTOR="false" /q
```

#### Step 2: Register the Connector with Microsoft Entra Id for pass-through authentication

4\. Go to **C:\\Program Files\\Microsoft Azure AD Connect Authentication Agent** and run the script.

```
    .\RegisterConnector.ps1 -modulePath "C:\Program Files\Microsoft Azure AD Connect Authentication Agent\Modules" -moduleName "AppProxyPSModule" -Feature PassthroughAuthentication
```

5\. When prompted, enter the credentials of your Microsoft Entra tenant Admin account.

## Upgrading Preview Builds of PTA Connector Prior to AAD Connect version 1.1.561.0

**Step 1**: Check where your Authentication Agents are installed.

1.  Sign in to the [Azure portal](https://portal.azure.com/) with the Global Administrator credentials for your tenant.
2.  Select **Microsoft Entra Id** on the left-hand navigation. Select **Microsoft Entra Connect** and then select **Pass-through Authentication**. This blade lists the servers where your Authentication Agents are installed.

**Step 2**: Check the versions of your Authentication Agents

1.  Open **Programs and Features** (appwiz.cpl) on the on-premises server.
    1.  If there is an entry for "**Microsoft Azure AD Connect Authentication Agent**", you don't need to take any action on this server.
    2.  If there is an entry for "**Microsoft Azure AD Application Proxy Connector**", versions 1.5.132.0 or earlier, you need to manually upgrade the connector on each server.

Best practices to follow before starting the upgrade

1.  Create cloud-only Global Administrator account:
    1.  Don't upgrade without having a cloud-only Global Administrator account to use in emergency situations where your Pass-through Authentication Agents are not working properly. Doing this step is critical and ensures that you don't get locked out of your tenant.
2.  Ensure high availability:
    1.  If you only have one PTA Connector, install a second to avoid an outage while the upgrade is in progress. Install a second standalone Authentication Agent to provide high availability for sign-in requests, using these [instructions](https://docs.microsoft.com/azure/active-directory/connect/active-directory-aadconnect-pass-through-authentication-quick-start#step-4-ensure-high-availability).

**Step 3**: Upgrading the Authentication Agent on your Microsoft Entra Connect server

You must upgrade Microsoft Entra Connect before upgrading the Authentication Agent on the same server. Follow these steps on both your primary and staging Microsoft Entra Connect servers:

1.  Upgrade Microsoft Entra Connect: An in-place upgrade to the latest Microsoft Entra Connect version will suffice for simple environments.

2.  Uninstall the preview version of the Authentication Agent: Download [this PowerShell script](https://aka.ms/rmpreviewagent) and run the RemovePassthroughAuthenticationPreviewAgent.ps1 script as an Administrator on the server using these commands:
    
    ```
        PS C:\ Set-ExecutionPolicy Unrestricted
        .\RemovePassthroughAuthenticationPreviewAgent.ps1
    ```

3.  Download the latest version of the Authentication Agent (versions 1.5.193.0 or later): Sign in to the Azure portal with your tenant's Global Administrator credentials. Select **Microsoft Entra Id** -\> **Microsoft Entra Connect** -\> **Pass-through Authentication** -\> and click **Download** to get the latest version of the Authentication Agent.

4.  Install the latest version of the Authentication Agent: Provide your tenant's Global Administrator credentials when prompted.

5.  Verify that the latest version has been installed from Programs and Features (appwiz.cpl). Verify that there is an entry for "**Microsoft Microsoft Entra Connect Authentication Agent**".

**Step 4**: Upgrading the Authentication Agent on other High Availability servers

1.  Uninstall the preview version of the Authentication Agent: Download [this PowerShell script](https://aka.ms/rmpreviewagent) and run the RemovePassthroughAuthenticationPreviewAgent.ps1 script as an Administrator on the server using these commands:
    
    ```
        PS C:\ Set-ExecutionPolicy Unrestricted
        .\RemovePassthroughAuthenticationPreviewAgent.ps1
    ```

2.  Download the latest version of the Authentication Agent (versions 1.5.193.0 or later): Sign in to the Azure portal with your tenant's Global Administrator credentials. Select **Azure Active Directory** -\> **Azure AD Connect** -\> **Pass-through Authentication** -\> and click **Download** to get the latest version of the Authentication Agent.

3.  Install the latest version of the Authentication Agent: Provide your tenant's Global Administrator credentials when prompted.

4.  Verify that the latest version has been installed from Programs and Features (appwiz.cpl). Verify that there is an entry for "**Microsoft Azure AD Connect Authentication Agent**".

## Supported Clients

Pass-through authentication is supported via web browser based clients and Office clients that support modern authentication. For clients that are not support such as legacy Office clients, Exchange active sync (i.e. native email clients on mobile devices), customers are encouraged to use the modern authentication equivalent. This not only allows pass-through authentication, but also allow for conditional access to be applied, such as multi-factor authentication.

Check all [supported scenarios](https://docs.microsoft.com/azure/active-directory/hybrid/how-to-connect-pta-current-limitations)

## Smart Lockout Protection

Microsoft Entra Id Provides protection against brute-force password attacks of user accounts, while preventing genuine users from being locked out of their Office 365 and SaaS applications. This capability, called **Smart Lockout**, is supported when you use Pass-through Authentication as your sign-in method. Smart Lockout is enabled by default for all tenants and are protects their accounts all the time.

Because Pass-through Authentication forwards password validation requests to the on-premises Active Directory (AD), customers need to take steps to prevent attackers from locking out their users on-premises AD accounts. Since customers have their own AD Account Lockout policies (specifically, **Account Lockout Threshold** and **Reset Account Lockout Counter After** policies), they need to configure Microsoft Entra Ids **Lockout Threshold** and **Lockout Duration** values appropriately to filter out attacks in the cloud before they reach your on-premises AD.

More information on Smart Lockout Protection is in the [Microsoft Entra Id and ADFS best practices: Defending against password spray attacks](https://cloudblogs.microsoft.com/enterprisemobility/2018/03/05/azure-ad-and-adfs-best-practices-defending-against-password-spray-attacks/) article.

### How it works

Smart Lockout keeps track of failed sign-in attempts in Azure AD. After a certain **Lockout Threshold** is achieved, the **Lockout Duration** is enforced. Any sign-in attempts from an attacker during the **Lockout Duration** are rejected and not passed to the on-premises DCs protecting the on-premises account from being locked out. If the attack persists after the **Lockout Duration** ends, the subsequent bad sign-in attemptswill result in longer Lockout Durations of the Azure AD account, while leaving the on-premises account unscathed. Smart Lockout also distinguishes between sign-ins from genuine users and from attackers and only locks out the attackers in most cases; this prevents attackers from maliciously locking out genuine users.

To ensure that on-premises AD user accounts are protected from attacks initiated via PTA set your policies like this:

  - Azure ADs **Lockout Threshold** is lower than ADs **Account Lockout Threshold** policy setting.
  - Azure ADs **Lockout Duration** (represented in seconds) is longer than ADs **Reset Account Lockout Counter After** policy setting.

### Default Azure AD Settings

  - **Lockout Threshold** = 10 bad attempts
  - **Lockout Duration** = 60 seconds

### Viewing the Smart Lockout Settings in MSODS

If the Smart Lockout settings have been modified, the **ObjectSettings** attribute on the domain head will contain the currently values.

[![ObjectSettingsAttribute.jpg](/.attachments/c5597576-e084-a771-45e1-bc2003c2befa535px-ObjectSettingsAttribute.jpg)](/.attachments/c5597576-e084-a771-45e1-bc2003c2befa535px-ObjectSettingsAttribute.jpg)

### Requirement

  - Modifying Azure ADs **Lockout Threshold** and **Lockout Duration** values is an Azure AD Premium P2 (AAD P2) feature
  - A Global Administrator will use Graph API calls to manage the lockout settings.

AAD P2 customers can set the **Lockout Threshold** to one less attempt than the on-premises **Account Lockout Threshold** policy setting, and the **Lockout Duration** can be as little as 15 seconds longer than the **Reset Account Lockout Counter After** policy setting.

Customers that do not have AAD P2 must use Group Policy Management Console (gpmc.msc) to change their on-premises AD Account Lockout policies on the **Default Domain Policy** by setting **Account Lockout Threshold** to 11 or higher, and **Reset Account Lockout Counter After** to 2 minutes or longer. These settings are located under **Computer Configuration\\Policies\\Windows Settings\\Security Settings\\Account Policies**

Setting the values this way will ensure the **Lockout Threshold** in Azure AD triggers before the **Account Lockout Threshold** on-premises. Once the bad password count in Azure AD is exceeded, further bad password attempts are not queued for the on-premises DCs to service, which prevents the on-premises user account from being locked out. Defining a longer **Lockout Duration** in Azure AD ensures the ObservationWindowdefined by the **Reset account lockout counter after** policy runs out and clears the badPwdCountof the on-premises user account.

More information about [Account Lockout Settings](https://technet.microsoft.com/library/cc775412\(v=ws.10\).aspx)

### Using Graph API to manage Azure ADs Smart Lockout values

  - Sign into [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer) as a Global Administrator of your tenant.
      - If prompted, grant access for the requested permissions.
  - Configure the read request as follows:
      - Set version to **BETA**.
      - Set request type to **GET**.
      - Set URL to [https://graph.microsoft.com/beta/*\<yourdomain\>*/settings](https://graph.microsoft.com/beta/%3Cyourdomain%3E/settings)

[![ConnectingToGraphSL.jpg](/.attachments/5cb97242-b898-1491-1804-ba66652019fa1054px-ConnectingToGraphSL.jpg)](/.attachments/5cb97242-b898-1491-1804-ba66652019fa1054px-ConnectingToGraphSL.jpg)

  - Click **Run Query**.
      - If prompted, grant access for the requested permissions by clicking the *modify your permissions* link and then select **Directory.ReadWrite.All**. If this permission does not grant all the access needed then add **IdentityRiskEvent.ReadAll** as well.
      - Reissue the **GET** command above once you get logged back in.
  - If you havent set the Smart Lockout values before, youll see an empty set as follows:

<!-- end list -->

```
    {
        "@odata.context": "https://graph.microsoft.com/beta/$metadata#settings",
        "value": []
    }
```

  - If Smart Lockout values have been modified in the past, the values will appear like this:

<!-- end list -->

```
    {
      "templateId": "5cf42378-d67d-4f36-ba46-e8b86229381d",
      "values": [
        {
          "name": "LockoutDurationInSeconds",
          "value": "30"
        },
        {
          "name": "LockoutThreshold",
          "value": "5"
        },
        {
          "name" : "BannedPasswordList",
          "value": ""
        },
        {
          "name" : "EnableBannedPasswordCheck",
          "value": "false"
        }
      ]
    }
```

#### Setting Values (First Time Only)

  - Sign into [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer) as a Global Administrator of your tenant.
      - If prompted, grant access for the requested permissions.
  - Configure the read request as follows:
      - Set version to **BETA**.
      - Set request type to **POST**.
      - Set URL to \[https://graph.microsoft.com/beta/\<yourdomain\>/settings\]
      - Copy and paste the following into the **Request Body** field
          - Change the Smart Lockout values as appropriate
          - Use a random GUID for templateId:

<!-- end list -->

```
    {
      "templateId": "5cf42378-d67d-4f36-ba46-e8b86229381d",
      "values": [
        {
          "name": "LockoutDurationInSeconds",
          "value": "30"
        },
        {
          "name": "LockoutThreshold",
          "value": "5"
        },
        {
          "name" : "BannedPasswordList",
          "value": ""
        },
        {
          "name" : "EnableBannedPasswordCheck",
          "value": "false"
        }
      ]
    }
```

[![FirstSettingsPOST.jpg](/.attachments/5c6afddf-7a85-b29a-c312-7b7204b46283588px-FirstSettingsPOST.jpg)](/.attachments/5c6afddf-7a85-b29a-c312-7b7204b46283588px-FirstSettingsPOST.jpg)

  - Click **Run Query**.

#### Updating Smart Lockout Values (if they have been set before)

  - Use the **GET** query from the preceding section to read the Smart Lockout values and verify that they have been set properly.
  - Look for the item with a **displayName** of **PasswordRuleSettings**, and copy its **id** (which is a GUID).

[![ModifyExistingSettings.jpg](/.attachments/5626e166-336f-73b1-b3c4-1fc9cb42321e396px-ModifyExistingSettings.jpg)](/.attachments/5626e166-336f-73b1-b3c4-1fc9cb42321e396px-ModifyExistingSettings.jpg)

  - Configure the update request as follows:
      - Set version to **BETA**.
      - Set request type to **PATCH**.
          - Set URL to \[to https://graph.microsoft.com/beta/\<yourdomain\>/settings/\<id\>\]
          - Copy and paste the following into the **Request Body** field.
              - Change the Smart Lockout values as appropriate
              - Use a random GUID for templateId in the URL:

<!-- end list -->

```
    {
      "values": [
        {
          "name": "LockoutDurationInSeconds",
          "value": "30"
        },
        {
          "name": "LockoutThreshold",
          "value": "4"
        },
        {
          "name" : "BannedPasswordList",
          "value": ""
        },
        {
          "name" : "EnableBannedPasswordCheck",
          "value": "false"
        }
      ]
    }
```

Click **Run Query**.

Use the **GET** query from the earlier section to read the Smart Lockout values and verify that they have been updated properly.

## Troubleshooting

### Azure Support Center (ASC)

[ASCforCloudAuthentication:PTA,
SeamlessSSOandStagedRolloutMigration](https://microsoft.sharepoint.com/:b:/t/IdentitySupportabilityCSSPG-Authentication/EarkmAW_1DFAkG4Fe75U8tYBm-ju1B-Z2LdojHvYuoOEhw?e=LnGUvP)

### Deployment

When running the Set-OrganizationConfig ExO PoSH command for ActiveSync we get the returned error "**A parameter cannot be found that matches parameter name 'PerTenantSwitchToESTSEnabled**", this can be corrected in ViewPoint. After looking up the tenant in Viewpoint, navigate to Troubleshooting -\> Diagnostics & Recovery -\> Upgrade RBAC -\> Start Recovery Action. Try a new ExO PS session once complete and see if the parameter is now available.

If the parameter is still not available, engage ExO for additional troubleshooting.

The AAD Connect Trace logs can be used to troubleshoot deployment of PTA

ex. C:\\ProgramData\\AADCONNECT\\trace-20161130-155905.log

```
    [16:02:11.753] [ 7] [VERB ] Executing task Configure Passthrough Authentication
    [16:02:11.805] [ 10] [INFO ] GetAADConnectAgentSecurityToken: Trying to get Azure Security Token for Passthrough Authentication.
    [16:02:11.805] [ 10] [INFO ] DiscoverAzureEndpoints [PassthruAuthentication]: ServiceEndpoint=https://{0}.register.msappproxy.net:9090/register, AdalAuthority=https://login.windows.net/contoso.onmicrosoft.com, AdalResource=https://proxy.cloudwebappproxy.net/registerapp.
    [16:02:11.805] [ 10] [INFO ] AcquireServiceToken [PassthruAuthentication]: acquiring additional service token.
    AzureADConnect.exe Information: 0 : 11/30/2016 21:02:11: 5d154851-8d94-4e9d-aecc-d17b79db9ad7 - AcquireTokenHandlerBase: === Token Acquisition started:
        Authority: https://login.windows.net/contoso.onmicrosoft.com/
        Resource: https://proxy.cloudwebappproxy.net/registerapp
        ClientId: cb1056e2-e479-49de-ae31-7812af012ed8
        CacheType: Microsoft.IdentityModel.Clients.ActiveDirectory.TokenCache (2 items)
        Authentication Target: User
        AzureADConnect.exe Information: 0 : 11/30/2016 21:02:11: 5d154851-8d94-4e9d-aecc-d17b79db9ad7 - TokenCache: Looking up cache for a token...
    AzureADConnect.exe Information: 0 : 11/30/2016 21:02:11: 5d154851-8d94-4e9d-aecc-d17b79db9ad7 - TokenCache: An item matching the requested resource was found in the cache
    AzureADConnect.exe Information: 0 : 11/30/2016 21:02:11: 5d154851-8d94-4e9d-aecc-d17b79db9ad7 - TokenCache: 57.381199655 minutes left until token in cache expires
    AzureADConnect.exe Information: 0 : 11/30/2016 21:02:11: 5d154851-8d94-4e9d-aecc-d17b79db9ad7 - TokenCache: A matching item (access token or refresh token or both) was found in the cache
    AzureADConnect.exe Information: 0 : 11/30/2016 21:02:11: 5d154851-8d94-4e9d-aecc-d17b79db9ad7 - AcquireTokenHandlerBase: === Token Acquisition finished successfully. An access token was retuned:
        Access Token Hash: UBhTVjLvV7j1AVAlDazj1FnO9GBXiGRZOmJ+JuoT/u8=
        Refresh Token Hash: Nmu4R4zHRa4FUxkYBT3xkcvU/odJcGMabrrz56BknDk=
        Expiration Time: 11/30/2016 21:59:34 +00:00
        User Hash: 1jEkXlj8L/NDUuglIB1vxdIxgMcMRCIXG/f54gumYno=
        AzureADConnect.exe Information: 0 : Received request to enable passthrough authentication feature
    AzureADConnect.exe Information: 0 : 'IPassthroughAuthenticationService' channel is not available for communication. Asking lock to recreate.
    AzureADConnect.exe Information: 0 : 'IPassthroughAuthenticationService' channel is still not available. Recreating.
    AzureADConnect.exe Information: 0 : 'ChannelFactory`1' is not available. Recreating factory.
    AzureADConnect.exe Information: 0 : 'ChannelFactory`1' recreated successfully.
    AzureADConnect.exe Information: 0 : Creating a new 'IPassthroughAuthenticationService' channel.
    AzureADConnect.exe Information: 0 : Opening the new 'IPassthroughAuthenticationService' channel.
    AzureADConnect.exe Information: 0 : 'IPassthroughAuthenticationService' channel recreated successfully.
    AzureADConnect.exe Information: 0 : Passthrough authentication enable - successful
```

To troubleshoot the App Proxy Installation, the Admin log for App Proxy Connector can be reviewed to ensure the App Proxy Connector successfully connected to the service.

[![AD AppProxyLog.png](/.attachments/c26a54dd-1ef0-1d8b-73d1-b22dbdc1dfc5AD_AppProxyLog.png)](/.attachments/c26a54dd-1ef0-1d8b-73d1-b22dbdc1dfc5AD_AppProxyLog.png)

### Operational Logging

#### Azure AD Logging

|                 |                                                       |                                                                                                          |
| --------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Error**       | **Description**                                       | **Resolution**                                                                                           |
| **AADSTS80001** | Unable to connect to Active Directory                 | Ensure that the connector machines are domain joined and are able to connect to Active Directory.        |
| **AADSTS80002**  | A timeout occurred connecting to Active Directory     | Check to ensure that Active Directory is available and responding to requests from the connector.        |
| **AADSTS80004** | The username passed to the connector was not valid    | Ensure the user is attempting to login with the right username.                                          |
| **AADSTS80007** | An error occurred communicating with Active Directory | Check the connector logs for more information and verify that Active Directory is operating as expected. |

#### Windows Security Logging

Event 4648 (Login Attempt) can be filtered to the App Proxy process using the following query in Event Viewer for version 1.1.561.0 and later:

```
    <QueryList> 
    <Query Id="0" Path="Security"> 
    <Select Path="Security">*[EventData[Data[@Name='ProcessName'] and (Data='C:\Program Files\Microsoft Azure AD Connect Authentication Agent\AzureADConnectAuthenticationAgentService.exe')]]</Select> 
    </Query> 
    </QueryList>
```

Versions of AAD Connect prior to 1.1.561.0.

```
    <QueryList> 
    <Query Id="0" Path="Security"> 
    <Select Path="Security">*[EventData[Data[@Name='ProcessName'] and (Data='C:\Program Files\Microsoft AAD App Proxy Connector\ApplicationProxyConnectorService.exe')]]</Select> 
    </Query> 
    </QueryList>
```

#### Logging Available for Azure AD Connect Authentication Agent

##### Event Viewer

Examine the **Microsoft Azure AD Connect Authentication Agent/Admin** logs under **Applications and Services Logs\\Microsoft\\AzureADConnect\\Authentication Agent**.

##### Azure AD Connect Authentication Agent trace logging

In the event of an Authentication Failure, events are logged in the Azure AD Connect Authentication Agent Trace log located @ **%ProgramData%\\Microsoft\\Azure AD Connect Authentication Agent\\Trace\\**

example of filename: AzureADConnectAuthenticationAgent\_747a4ac5-e126-47ea-9887-f05bc56cd676.log

**Example Output:**

```
    DateTime=2016-11-30T21:13:29.5003217Z
    ApplicationProxyConnectorService.exe Error: 0 : Passthrough Authentication request failed. RequestId: '0e7e8418-4ab4-40c6-82cc-4396e804deee'. Reason: '1331'.
    ThreadId=7
    DateTime=2016-11-30T21:55:49.6054337Z
```

**What this means...**

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>RequestID</th>
<th></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="vertical-align:top">Reason</td>
<td style="vertical-align:top">You can get the details of what the error is by running starting a cmd prompt and running
<p>Net helpmsg 1331</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top">RequestID</td>
<td style="vertical-align:top">RequestID correlates to the TransactionId in the PartnerTransactionSummaries table (see below)</td>
</tr>
</tbody>
</table>

[Sample Query](https://idsharedwus.kusto.windows.net/AADHIS?query=H4sIAAAAAAAEAE2OzWrCQBDH74G8w%2bCprV2yriZxbVMo4sGDEDQvMM1ONLLJ2smKlz68K0rxOPP7f1nyYKAAg55829GLkkoKmQs1ATlbyPkiTV8%2f4sjedGQ9Bq0y4VEi%2b564YuwHrH3r%2bt2565BbGqI%2fuByICar1ZrWrvjclfIUS8QjA3jyRz0DGd5Ik8b%2f1DYoCRln2kzdyooWaUiZm8xyFRj0VWmJaK93UGcoRJAls6fdMg4fWwIVgH8Y2juEU2qzbD7fYE7sj1R6eBq%2fNOywdM1m8n3EUR1fYOOQ0EQEAAA%3d%3d&web=0) to pull HIS data using RequestID in agent logs

let d = datetime(2020-07-21 04:08:55);<br/>
let delta = 2d;<br/>
PartnerTransactionSummaries<br/>
| where TIMESTAMP > d - delta and TIMESTAMP < d + delta <br/>
| where * == "66b7f019-23e6-487a-9a93-90a5c29fc6a0" // Request id we get for pta logs <br/>
| project TransactionId, CorrelationId //CorrelationId obtained here can be used to pull evo logs



  

#### Verbose Authentication Agent log

!! Instead of this please use the [PTA Data Collector script]([Azure AD Pass-Through Authentication - Action Plan Templates for Data Collection - Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/442294/Azure-AD-Pass-Through-Authentication-Action-Plan-Templates-for-Data-Collection?anchor=**pta-(pass-through-authentication-agent)---data-collector-script**)) !!

1) Extract [PTADebug.zip](/.attachments/PTADebug-28272538-c8a8-43e4-a31f-b028195159db.zip) log to a folder
2) Open PowerShell and select the previous folder path 
3) Run .\ConfigureAgentLogging.ps1 -On (To start verbose logging. Please note that Azure AD Connect Authentication Agent Service will be restarted) 
 
Note: Logs should be saved under C:\ProgramData\Microsoft\Azure AD Connect Authentication Agent\AzureADConnectAuthenticationAgent.log. Logs will not contain any time stamp so its important that you only enable it during the issue reproduction phase. 

4) Reproduce the issue 
5) Run .\ConfigureAgentLogging.ps1 -Off (To stop verbose logging. Please note that Azure AD Connect Authentication Agent Service will be restarted) 

#### PTA Agent Data Collector script

The purpose of the Data Collector Script is to collect all the data that might be required to troubleshoot the issue you reported to the Microsoft Support on an efficient way. Please find the details [here](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/442294/Azure-AD-Pass-Through-Authentication-Action-Plan-Templates-for-Data-Collection?anchor=**pta-(pass-through-authentication-agent)---data-collector-script**).

### Troubleshooting Authentication Attempts

Since PTA utilize Kerberos authentication between the App Proxy Connector and the Domain Controller, Netmon or other network capture tools can be utilized to troubleshoot authentication.

#### Using Message Analyzer

Run Message Analyzer on the Passthrough Authentication Connector machine, the below is a successful sign-in

[![PTA Success.png](/.attachments/b6bf0f2b-c7f0-f885-3b99-83ff9856318aPTA_Success.png)](/.attachments/b6bf0f2b-c7f0-f885-3b99-83ff9856318aPTA_Success.png)

#### Using Performance Monitor

Monitor PTA login activity by enabling the [Application Proxy performance counters](https://docs.microsoft.com/azure/active-directory/application-proxy-understand-connectors#under-the-hood) on the server where the PTA connector is installed.

Since PTA Connectors only provide High Availability and not load balancing, the "**\# transactions completions**" and "**\# transactions completions / sec**" counters may shows zero on some of the additional connector servers. If the customer wants to verify the additional connector servers can actually service login requests, they can simply stop the Microsoft AAD Application Proxy Connector service on the other connector servers, and observe authentication traffic move to the node of interest.

[![Perfmon.jpg](/.attachments/f9662d71-2518-d5e8-dd43-d38644e33e6e636px-Perfmon.jpg)](/.attachments/f9662d71-2518-d5e8-dd43-d38644e33e6e636px-Perfmon.jpg)

### Troubleshooting Workflow

\[[Pass Through Authentication - Troubleshooting Workflows](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184186)\]

## DGREP Logs

Right now the best way to track a request from EVO to the connector is by:

  - Take the CorrelationId from Sign-in logs or from ESTS Logs (Kusto cluster information below) Or use it in [LogsMiner](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183999/LogsMiner).

|                          |                                                  |
| ------------------------ | ------------------------------------------------ |
| Namespace                | AadEvoSTSPROD                                    |
| **Events to Search**     | PerRequestTableIfx                               |
| **Filtering Conditions** | CorrelationId==CorrelationId shown to user in UI |

  - Search PTA Agent Kusto logs  

|                          |                                                                                                                                                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cluster                  | https://idsharedwus.kusto.windows.net                                                                                                                                                                                                                                                                                           |
| **Database** | AADHIS |
| **Events to Search**     | PartnerTransactionSummaries                                                                                                                                                                                                                                                                       |
| **Filtering Conditions** | CorrelationId==CorrelationId shown to user in UI or from ESTS logs OR SubscriptionId==TenantID.                                                                                                                                                                                                                                 |
| **Permissions**          | You will need to be a member of **hissupport** AAD Group **Id:1f715ba6-26a5-4d89-a4c4-417d6e72e3a4**. If you are a member of the AAD - Authentication Vertical azureadauth@microsoft.com security group, access is automatic. In case you need access to this cluster from web Kusto you can browse without any special permissions. If you have issues with that - you can send a request in IDWEB to join the **HIS Partners** group and that would give you access. |

Example of Kusto query: 
> let searchTimeStamp = datetime(2019-09-27 15:09:00Z);  
> let startDateTime = searchTimeStamp - 60s;  
> let endDateTime = searchTimeStamp + 60s;  
> PartnerTransactionSummaries  
> | where TIMESTAMP >  startDateTime  
> | where TIMESTAMP <  endDateTime  
> | where SubscriptionId == "TenantID"  
  
## Known Issues

The following are known issues, as the product matures these items may be modified, they are preceded with the date of entry.

  - 11/30/2016 In Public Preview Milestone, Windows 10 Clients are unable to utilize PTA, users on these clients will fall back to the Password Hash Sync that was selected during set up.
  - 11/30/2016 PTA Only works with Web and Modern Authentication Enabled Clients
  - 11/30/2016 There is no remote installation of a 2nd connector via AAD Connect
  - ~~11/30/2016 PTA Does not support Alternate IDs.~~ This is no longer the case [starting with Azure AD Connect version 1.1.484.0 or higher](https://docs.microsoft.com/azure/active-directory/connect/active-directory-aadconnect-pass-through-authentication#ensuring-high-availability). The connector then validates the username and password against your Active Directory using standard Windows APIs (a similar mechanism to what is used by ADFS). Note that the username can be either the on-premises default username (usually, "userPrincipalName") or another attribute (known as "Alternate ID") configured in Azure AD Connect.
  - 11/30/2016 PTA will apply to all Non-Federated users in a tenant, there is no way of selecting which domains get PTA and which get Password Hash Sync or other method.
  - 06/14/2017 AAD Connect Configuration with PTA fails with error "**Showing a modal dialog box or form when the application is not running in UserInteractive mode is not a valid operation. Specify the ServiceNotification or DefaultDesktopOnly style to display a notification from a service application.**" Resolution: Temporarily turn off MFA for the cloud-only Global Administrator account before enabling the feature.

## FAQ

**Q: What licensing is required to utilize PTA?**

A: There is no special licensing required for this feature

**Q: Can I use the same connector for both pass-through authentication and Azure AD Application Proxy?**

A: No. Today the connectors can only be used for a single purpose and you cant install more than one on a single server.

**Q: What happens if user's password has expired?**

A: If the user is configured for password write-back they will be prompted to change their password and it will be written back to on-premises. If password write-back isnt enabled the user will be notified to change their password on-premises.

## Supportability Documentation

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<tbody>
<tr class="odd">
<td style="vertical-align:top"><strong>Scenario</strong></td>
<td style="vertical-align:top"><strong>Supported By</strong></td>
<td style="vertical-align:top"><strong>PG Escalation</strong></td>
<td style="vertical-align:top"><strong>More Information</strong></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Cant install the Pass Through Authentication connector from Azure AD Connect</td>
<td style="vertical-align:top">Cloud Identity Tier 2 <strong>(</strong> <a href="http://bemis.partners.extranet.microsoft.com/3124925/" class="external text">Transfer</a> <strong>)</strong></td>
<td style="vertical-align:top"><a href="https://vkbexternal.partners.extranet.microsoft.com/VKBWebService/ViewContent.aspx?scid=KB;EN-US;2967932" class="external text">Azure AD Connect</a></td>
<td style="vertical-align:top">Include the following logs
<ul>
<li>AADConnect Debug log</li>
</ul></td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Cant install the Pass Through Authentication connector manually</td>
<td style="vertical-align:top">Cloud Identity Tier 2 <strong>(</strong> <a href="http://bemis.partners.extranet.microsoft.com/3124925/" class="external text">Transfer</a> <strong>)</strong></td>
<td style="vertical-align:top"><a href="https://vkbexternal.partners.extranet.microsoft.com/VKBWebService/ViewContent.aspx?scid=KB;EN-US;3124588" class="external text">Pass Through Authentication</a></td>
<td style="vertical-align:top">Include the following logs
<ul>
<li>AAD App Proxy Debug Log</li>
</ul></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Pass Through Authentication connector fails to connect to service</td>
<td style="vertical-align:top">Cloud Identity Tier 2 <strong>(</strong> <a href="http://bemis.partners.extranet.microsoft.com/3124925/" class="external text">Transfer</a> <strong>)</strong></td>
<td style="vertical-align:top"><a href="https://vkbexternal.partners.extranet.microsoft.com/VKBWebService/ViewContent.aspx?scid=KB;EN-US;3124588" class="external text">Pass Through Authentication</a></td>
<td style="vertical-align:top">Include the following logs
<ul>
<li>AAD App Proxy Event log along with debug log (see above)</li>
</ul></td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Self Service Password Reset fails for users who use Pass Through Authentication</td>
<td style="vertical-align:top">Cloud Identity Tier 2 <strong>(</strong> <a href="http://bemis.partners.extranet.microsoft.com/3124925/" class="external text">Transfer</a> <strong>)</strong></td>
<td style="vertical-align:top"><a href="https://vkbexternal.partners.extranet.microsoft.com/VKBWebService/ViewContent.aspx?scid=KB;EN-US;3124878" class="external text">SSPR</a></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Authentication fails when using Pass Through Authentication</td>
<td style="vertical-align:top">Cloud Identity Tier 2 <strong>(</strong> <a href="http://bemis.partners.extranet.microsoft.com/3124925/" class="external text">Transfer</a> <strong>)</strong></td>
<td style="vertical-align:top"><a href="https://vkbexternal.partners.extranet.microsoft.com/VKBWebService/ViewContent.aspx?scid=KB;EN-US;3053992" class="external text">Evo STS</a></td>
<td style="vertical-align:top">Include the following logs
<ul>
<li>AAD App Proxy Event log along with debug log (see above)</li>
</ul></td>
</tr>
</tbody>
</table>

## CRI/DCR

| **Severity**                 |  **ICM queue**                                                |
| ------------------------ | ------------------------------------------------ |
|        Lower than Sev2 (Sev3, Sev4, etc.)                |        ESTS\Incident Triage                                    |
|        Sev2 and higher (Sev1, Sev0)     |        ESTS\eSTS                               |

### External Documentation:

[Microsoft Entra Connect: Pass-through Authentication - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta)

Forum: [Pass-through authentication vs. Federated SSO (with AD FS)](https://social.msdn.microsoft.com/Forums/fdf3b6cf-66c5-411b-83c0-f7927a845e32/passthrough-authentication-vs-federated-sso-with-ad-fs?forum=WindowsAzureAD)

### Training

Training material can be found [here](https://learn.microsoft.com/activity/145002/launch#/).

[CSS Brownbag](https://microsoft.sharepoint.com/sites/infopedia/media/details/AEVD-3-114652)

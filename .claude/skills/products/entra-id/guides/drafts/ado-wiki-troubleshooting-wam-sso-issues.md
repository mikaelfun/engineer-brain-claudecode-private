---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Troubleshooting WAM related SSO issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FTroubleshooting%20WAM%20related%20SSO%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[[_TOC_]]


# Compliance note
This wiki contains test/lab data only.

# What is WAM

Web Authentication Manager (WAM a.k.a TokenBroker) is a broker service on Windows 10/11 that provides [APIs](https://docs.microsoft.com/en-us/uwp/api/Windows.Security.Authentication.Web.Core?redirectedfrom=MSDN&view=winrt-22000) to request OAuth tokens from Identity providers like MSA, AAD, Xbox etc. WAM also provides web account management API for MSA, AAD and Xbox accounts added to the device. First party callers can get Single Sign On (SSO) through WAM APIs. Today WAM is adopted as the premier SSO solution by all first party Microsoft client apps like Office, Teams, Store, OneDrive etc.

# Architecture and background

[Web Account Manager - OSGWiki](https://www.osgwiki.com/wiki/Web_Account_Manager) **(Please read as prerequisite before moving ahead).**

There are two main aspects to the architecture  WAM Core and WAM plug ins.

WAM Core is mostly divided into two DLL's - Windows.Security.Authentication.Web.Core.dll and TokenBroker.dll. The former is loaded in-proc to the caller, and the latter runs as system service. When a caller calls one of the Token Acquisition API's, the [Windows.Security.Authentication.Web.Core](https://docs.microsoft.com/en-us/uwp/api/Windows.Security.Authentication.Web.Core?redirectedfrom=MSDN&view=winrt-22000.dll) is loaded in-proc and WAM tries to get the token from the cache first while running in-proc. If the cache is empty or the token has expired, then the request is sent to the WAM service which gets the token from the IDP (Identity Provider e.g. MSA/AAD) plugin, writes it to the cache, then passes it back to the caller. Note that WAM plug ins are Universal Windows Platform applications (https://docs.microsoft.com/en-us/windows/uwp/). However they are not shipped through Windows store but directly packaged in the OS build as a System application.

![WAMcore](.attachments/AAD-Authentication/614537/WAMcore.png)

 

**Note:** WAM core components and the WAM plug-ins (AAD and MSA) are shipped inbox along with Windows 10/11. Windows Server 2016 comes with WAM as well, but due to the limited scope of WAM features available for Windows 10 RS1 (Windows Server 2016), most of the applications are not using Windows Server 2016 WAM for SSO. Windows Server 2019 has more advanced WAM features and improvements coming with Windows 10 RS5. Most of the WAM features and improvements in RS5 were transferred from Windows 10 RS4. 

 
# Important Trainings

AAD Configs (any engineer at Microsoft need to review this): 

https://msit.microsoftstream.com/video/f6c7d534-b541-42b4-be7b-ca2d97b1851f 

AAD Configs deck: [AADClient.pptx](https://microsoft.sharepoint.com/:p:/t/AADThreshold/EVbMBwqdVtlFqG2htInZhhkBlcXWtcmbiPmJ_s1-FtmXMw?e=mGcvFY) 



WAM Deep dive: 

[TokenBroker downlevel support](https://msit.microsoftstream.com/video/8f13a1ff-0400-96f3-bf8b-f1eafdf2d009)

[Azure AD Active Client  Token Operations Deep Dive for Windows 10](https://msit.microsoftstream.com/video/dbb489c0-1423-403c-981b-0e6194396541) 

Deep dive deck: [OfficeSecondDemo.pptx (sharepoint.com)](https://microsoft.sharepoint.com/:p:/t/AADThreshold/EUFFk_ss2DBIqFBD7NOmWq4BMYJEKJ6c---xiNazJi4dFQ?e=Tc5ghw) 

#CSS ownership

The AAD WAM plug-in and associated flows come under the support boundary of the AAD Identity CSS as it is owned by the AAD client PG team in Identity. 

The WAM Core components are owned by Windows security PG team (ENS/CIA) and their CSS counterpart is the Directory Services CSS team.

![SupportabilityBoundaries](.attachments/AAD-Authentication/614537/SupportabilityFlow.jpg)

## Responsibility of CSS teams

-   The CSS/PG teams corresponding to the applications that integrate with WAM are **responsible for first level investigation of their authentication issues**. When contacting CSS Identity team, they need to provide the clear issue description, application ID of the application that has SSO issues, WAM error the application gets (can be obtained from the application logs).

-   If the application PG/CSS team sees an error code returned by [WAM APIs](https://docs.microsoft.com/en-us/uwp/api/Windows.Security.Authentication.Web.Core?redirectedfrom=MSDN&view=winrt-22000) that the application invokes, then they need to open a collaboration case with AAD Identity CSS (Azure AD Device Registration team) **providing details of the scenario and the error code encountered.** 

-   The application teams should ***never*** open an incident directly on the AAD auth client PG team. The first point of contact needs to be always the AAD Identity CSS team by opening a collaboration case.

-   When opening Collaboration case, the [following logs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=collecting-aad-client-logs) must be attached to the case. 

## Responsibility of AAD Identity CSS team

\-   Investigate the collaboration case as per the troubleshooting guide section below and use the following branching logic:

o  If the issue is a network or HTTP proxy related issue, Windows networking support team (MSaaS Windows Networking) needs to be engaged.

o  If the issue is WAM plug in activation/install issue, the Windows Performance support team needs to be engaged.

o  If the issue is due to TPM/Crypto stack, please engage Platforms Devices and Deployment support team (Windows\Windows 11\Windows 11 Enterprise and Education\Setup, Upgrades, and Drivers\Driver management). 

o  If the issue is in WAM Core layer, Directory Services Premier team needs to be engaged.

o  Anything else, AAD Identity CSS owns  device registration state, presence of AAD PRT. (Azure\Microsoft Entra Directories, Domains, and Objects\Devices\Access Issues on Joined or Registered devices)


This troubleshooting guide has details of disambiguating various issues, investigating and routing.

# Additional support for AAD WAM issues (for Cloud Identity CSS only)

The Identity CSS team uses a Teams team called Cloud Identity-Authentication - Device Registration that is monitored by CSS SMEs and PG. 

**NOTE:** This is not a swarming Teams and only Azure Identity engineers have access to it, that is why the collaboration needs to be created to the Azure Identity team for the question to be posted in Teams if needed. Any Identity CSS personnel that needs more help with a WAM/Auth issue needs to post there. If the issue cannot be solved in Teams channel or using existing guides and knowledge, the Identity CSS can open an IcM.

# Collecting AAD Client logs

1. Download  the [Auth.zip](https://aka.ms/authscripts) file. [Documentation](https://aka.ms/howto-authscripts)
2. Extract the files to a folder, such as c:\temp, and then go to the folder.
3. From an elevated PowerShell session, run ".\start-auth.ps1 -vauth -accepteula"
4. Reproduce the issue.
5. From the elevated PowerShell session, run ".\stop-auth.ps1"
6. Zip (compress) and send the folder Authlogs from the folder where the scripts were executed.
  
# WAM Troubleshooting guide

The most important thing in WAM troubleshooting is always to understand the scope of the issue and what exact steps the affected users are taking and what environment they are working with, including the device registration type (WPJ/AAJ/HAADJ). 

The first step is ensuring AAD client logs are available. These can be collected using [ICESDPtool or Auth script](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=collecting-aad-client-logs). 

Once the logs are available, please follow the steps outlined below for troubleshooting known issues. 

From ICESDP Logs look into the Issue steps logs folder (contains PSR) for screenshots of the flow and the error.

In AAD logs, look into the dsregcmd.txt file for join type/status, AAD PRT status. Make sure the device is in healthy device registration state and the signed in user has AAD PRT. Utilize ASC to collect more data about customer tenant, environment and effected device.  

Look into the error code reported by application _(most of the time provided by the application support team)_ and look into AAD operational logs for the error and additional description about the error. It is also useful to know how to read Teams and Office logs to confirm the WAM API call made and error code returned (but this information should be anyway provided by the application support team).

It is important to ask the Application team to ***clearly*** identify the error code returned by WAM API call that they see in their logs

#WAM errors and potential solutions

Below are the errors descriptions you might see in the AAD logs related to the application's WAM SSO issues and their potential root causes and resolutions.
___

## DMA Error: AADSTS9002341: User is required to permit SSO

**What you will see in the AAD Operational logs:** AADSTS9002341: User is required to permit SSO.
For more details on DMA related errors, please refer here: [DMA SSO Sign-in prompt](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1488718/Digital-Markets-Act-SSO-Sign-In-Prompt)

**Description**: As part of complying with the Digital Markets Act in Europe, some WAM requests will now fail and require the user to go to UI to give permission for auth to proceed. This is described at a high level for our customers here: [Upcoming changes to Windows single sign-on](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/upcoming-changes-to-windows-single-sign-on/ba-p/4008151).

**Recommendation**: It is important to recognize that **this block is by design** and **it is not a root cause on its own** of a customer issue. However, this block results in showing WAM UI, which may fail for reasons that hadn't been noted before. The fact that we now fail silent calls that were previously succeeding has the potential to uncover other customer issues that need to be debugged (for example if a customer is affected by problems launching the UI flow for WAM [caused by AV](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=antivirus/applocker-blocks-aad-wam-plugin), this may be exposed by the DMA block).

It also could be that a calling app is not integrated with WAM UI flow, i.e. do not call RequestTokenAsync directly or via MSAL. This considered to be a bug in the calling application and must be escalate to the app owner.

It is also crucial that we **never recommend disabling WAM** as a way of getting around this issue. Our compliance with the DMA law was designed around WAM and our other supported libraries. **Legacy libraries like ADAL are deprecated and were not built to be compliant with the DMA law. We cannot recommend them to our customers.**

___

## AAD WAM plugin (Microsoft.AAD.BrokerPlugin.exe) crash with exception code 0x88985004

**Issue Description:** WAM AAD is crashing and Application logs have messages about Microsoft.AAD.BrokerPlugin.exe process crashing with exception code 0x88985004.

**Recommendation:** 0x88985004 exception code maps to error DWRITE_E_FILEACCESS	(A font file exists but could not be opened due to access denied, sharing violation, or similar error). The crash occurs inside EdgeHTML component and is tracked by bug https://microsoft.visualstudio.com/DefaultCollection/OS/_workitems/edit/21507959/. It's believed to be caused by external factors (font files being locked by some software running on the device - e.g. AntiVirus or similar monitoring software capable of locking access to files on the device), so exempting font files in the monitoring software may help avoid the crash.

___
##AuthN issue Error: 2147023584 (0x80070520)
**Issue Description:** A specified logon session does not exist. It may already have been terminated. 

**Possible cause:** There are multiple scenarios that could result in user SID change, but user profile not changed, e.g. - changing domain. Data file in old profile has cached old SID. 

**What you will see in the AAD Operational logs:** 

RefreshTokenRequest::AcquireToken. Error: -2147023584 (0x80070520) 

**Description:** A specified logon session does not exist. It may already have been terminated. 

**Recommendation:** Update Windows. 

Windows RS5: https://support.microsoft.com/en-us/help/4541331/windows-10-update-kb4541331 

Windows 19H1: https://support.microsoft.com/en-us/help/4541335/windows-10-update-kb4541335 or later 

Additional steps for RS4 and below: 

Delete all files from: 

```%LOCALAPPDATA%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts``` 

```%LOCALAPPDATA%\Packages\Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy\AC\TokenBroker\Accounts``` 

Reboot device. 

**IMPORTANT:** follow the above action only for this case, because deletion of above files is partial deletion of the WAM accounts. 
___
## Looping sign in prompts - disabled device

**Issue Description:** Application may go into a prompt loop, because the device is disabled, by the user, the enterprise administrator, or a policy because of a security concern or by mistake.

**What you will see in the AAD Operational logs:**

**Description:** AADSTS70002: Error validating credentials. AADSTS135011: Device used during the authentication is disabled.

**Recommendation:** To resolve this issue, we recommend that the Enterprise administrator enable the device in Active Directory or Azure Active Directory (Azure AD). 

For information about how to manage devices in Azure AD, see [Manage device identities by using the Azure portal](https://docs.microsoft.com/en-us/azure/active-directory/devices/device-management-azure-portal#enable-or-disable-an-azure-ad-device).
___
##Looping sign in  prompts - device is not found in the directory

**Issue Description:** Application may go into a sign in prompt loop, because the device is deleted by the enterprise administrator, or a policy because of a security concern or by mistake.

**What you will see in the AAD Operational logs:**

**Description:** AADSTS70002: Error validating credentials. AADSTS50155: Device is not authenticated.

**Recommendation:** 
To resolve this issue, we recommend to verify the device registration state and perform the recovery of the device, see [Device recovery steps](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=device-recovery-steps) section in this document.
One of possible reasons for "device not found" observed previously is customer having multi-boot configuration on the device: when more than 1 Windows OS is installed on the device *and* joined to Entra ID, this may lead to overwriting information on the device object in Entra ID directory inevitably leading to device authentication problems in one of the Windows OS installs. A way to check if device registration state on the device matches to the one in Entra ID directory is to verify that device certificate 's public key/thumbprint on the device is the same that Entra ID directory has stored on device object.
___
##Looping sign in prompts -  incorrect parameter in JSON 

**Issue Description:** Application may go into a prompt loop, because JSON parsing issues. 

**What you will see in the AAD Operational logs:** 

Error: 0xCAA60003 The parameter is incorrect. Exception of type 'class JsonException' at json.h, line: 118, method: JsonValue::GetValue. 
 
**Next step:** 
Validate version of the Windows, only some RS2 or RS3 builds are impacted:

RS2: [10.0.15000.0, 10.0.15063.1112) not including 10.0.15063.1112 

RS3: [10.0.16000.0  10.0.16299.461) not including 10.0.16299.461 
 
RS2: 10.0.15063.1112 and higher, RS3 10.0.16299.461 and higher, RS4 and higher are not impacted. 

**Recommendation:** Update Windows. 

Windows update with fix for RS3 (1709) : https://support.microsoft.com/en-us/help/4103714

Windows update with fix for RS2 (1703) : https://support.microsoft.com/en-us/help/4103722

**Note:** if issue is impacting multiple customer, it could be a service side issue.
___

##Poisoned cache by expired token 

**Issue Description:** If a customer device wake up after sleep (and only in this case) the cache could be poisoned by expired access token. 

Issue is rare, but impact is huge since the user will be getting repeated sign in prompts. 

**What you will see in the logs:** 

There will be no token fetch errors in AAD logs, but when the client provides the token to relying party, the will be token rejected as expired. 

**Recommendation:** Update Windows. The issue was reported in Windows Bug 15152790.

RS4: fixed. 

RS3: May 2018 https://support.microsoft.com/en-us/help/4103714 

RS2: May 2018 https://support.microsoft.com/en-us/help/4103722 

RS1: May 2018 https://support.microsoft.com/en-us/help/4103720 
___
##DPAPI Failure to Decrypt Credential Information

**Issue Description:** Users are not able to auth with WAM because of an issue with DPAPI which causes their credentials to be unusable.

**What you will see in the AAD Operational logs:**

Error: 0x8009002C The specified data could not be decrypted.

The specified data could not be decrypted.

Exception of type 'class WinRTException' at authorizationclient.cpp, line: 127, method: ADALRT::AuthorizationClient::Deserialize.

Log: 0xcaa10083 Exception in WinRT wrapper.
Logged at authorizationclient.cpp, line: 127, method: ADALRT::AuthorizationClient::Deserialize.


**Recommendation:** Unfortunately, as the machine is already corrupted, the WAM state needs to be cleared using the instructions below to [Clear WAM State](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=clear-wam-state). If the user is WPJ, they will need to rejoin.



___
##Two work or school accounts for the same user on a single device

**Issue Description:** Users are not able to auth with WAM because of a corruption of the AAD WAM state, often leading to having two Work or school accounts for the same user on a single device.

**What you will see in the logs:** 

This issue can be verified from the Access Work or School section in Settings. 

![TwoWAMaccounts](.attachments/AAD-Authentication/614537/TwoWAMaccounts.png) 

**Recommendation:** Update Windows to Vibranium (20H1) or higher. Then follow the below instructions to [Clear WAM State](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=clear-wam-state).


___
##Corrupted WAM state


**Issue Description:** Users are not able to auth with WAM because of a corruption of the AAD WAM state. The issue can manifest in numerous ways (e.g. WAM prompt not being shown for MFA).

**What you will see in the logs:** 

In the AAD analytic logs, when token request is made to WAM, there would be an entry similar to the example below. Note in the below that we are mapping a universal id (starts with "u:") to a UPN-based ID (base32), which should never happen:

> Code: 0x4AA5011A Loading client from cache using webaccount.
Token request accountId: **u:68387db5-####-####-####-############.ddeefe0d-####-####-####-############**, Resolved accountId: g6hc9qbl6619hm79v51edfqq, PerUser accountId: **g6hc####################**
Logged at ClientCache.cpp, line: 138, method: ClientCache::Load.

This state can result from incorrectly clearing WAM state.

**Recommendation:** Follow the below instructions to [Clear WAM State](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=clear-wam-state).

Note that this similar event:

> Code: 0x4AA5011A Loading client from cache using webaccount.  
**AccountId value:** u:12exxxxx-xxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx, **Universal accountId:** u:12exxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx,**UPN based accountId:** qzxxxxxxxxxxxxxxxxxxxxxx  
Logged at ClientCache.cpp, line: 176, method: ClientCache::Load.

with different headings does not indicate a corrupted WAM state.
___
##Clear WAM State

**Important: Depending on configuration, these steps remove credential information and are disruptive for the customer. Only apply these steps in cases where they are necessary (see above)**


**Note:** If User's device has Antivirus running, make sure proper exclusion rule are set so it doesn't interfere with the cleanup. Folders to exclude documented here: https://learn.microsoft.com/en-us/microsoft-365/troubleshoot/authentication/cannot-sign-in-microsoft-365-desktop-apps

     Stop the tokenbroker service from an admin powershell:  
```Set-Service TokenBroker -StartupType Disabled```  
```Stop-Service TokenBroker -Force -PassThru``` 

     Stop any running AAD WAM instances:  

```taskkill /F /IM Microsoft.AAD.BrokerPlugin.exe``` 

     Delete the account files in the following folder: 

```%localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts``` 

     Take backup copy of the following file and then delete it: 

```%localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Settings\settings.dat``` 

     Rename (or delete) this registry key: 

```Computer\HKEY_CURRENT_USER\Software\Microsoft\IdentityCRL\TokenBroker\DefaultAccount ---> Computer\HKEY_CURRENT_USER\Software\Microsoft\IdentityCRL\TokenBroker\DefaultAccount_backup``` 

     Restart the tokenbroker service (from admin cmd)  
```Set-Service TokenBroker -StartupType Manual```  
```Start-Service TokenBroker -PassThru``` 

**In cases where a customer is affected by this issue on many machines (>100), the PG has a script that may be able to help out. File an ICM through aka.ms/wamhot to consult on if this is appropriate.**

___
##Cannot authenticate user because the DPAPI master key is missing 

**Issue Description:** User failed to sign in to apps (Office, Teams, etc.) through WAM. The blobs containing RTs and PRTs are encrypted using DPAPI. When DPAPI keys are missing from the device, WAM plugin wont be able to decrypt the blob. 

**What you will see in the logs:** 

In AAD operational and analytic logs, you can see an error event similar to this one: 

Error: 0x80070003 The system cannot find the path specified. 
Exception of type 'class NGCException' at ngchelper.cpp, line: 42, method: NgcHelper::SignWithSymmetricPopKey. 
 
Log: 0xcaa10083 Exception in WinRT wrapper. 
Logged at authorizationclient.cpp, line: 224, method: ADALRT::AuthorizationClient::AcquireToken. 
 
Request: authority: https://login.microsoftonline.com/common, client: 1fec8e78-####-####-####-############, redirect URI: ms-appx-web://Microsoft.AAD.BrokerPlugin/1fec8e78-####-####-####-############ 

**Recommendation:** This usually means the user profile were roamed across different devices. One common case is NP-VDI (Non-persistent VDI). 

When user logs off on an NP-VDI device, the user profile is not saved. The next time this user logs in, the user profile will be reset to the one from a base image. Or there is a profile migration tool, e.g., FsLogix, managing user profiles. If the base image or the roamed profile contains AAD data (cache, accounts, WPJ certificates), user would be very likely to see this error. The DPAPI master key and other secrets like TPM protected private keys cannot be captured in the base image, and this issue will occur. 

User would need to fix the base image or configure the profile migration tool to not containing any of the AAD account data. These data cannot be roamed to other devices. 

The user profile limitation is documented under Non-persistent VDI in this [document](https://docs.microsoft.com/en-us/azure/active-directory/devices/howto-device-identity-virtual-desktop-infrastructure#non-persistent-vdi). 

Follow the section [Non-Persisted VDI environment or profile migration tools](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=non-persisted-vdi-environment-or-profile-migration-tools) below.
___
## Unexpected prompting for password by the applications 

**Issue Description:** Office apps seeing incessant prompts for password on Hybrid AAD joined devices. 

**What you will see in the logs:** 

Error: 0xC000010B Unknown error code: 0xc000010b A logon request contained an invalid logon type value. 

**Recommendation:** 

This error is seen if the CX is running Windows 2003 or lower on the Domain controller. Please ask the customer to upgrade the Domain Controller to Window 2008 or higher. 

___
##Cannot authenticate the user, because Form Based Authentication disabled on ADFS 

**Issue Description:** Users cannot login to Office, because ADFS has disabled Form Based Authentication. AAD enforces Form Based Authentication while ADFS cannot perform it by settings. 

**What you will see in the logs:** 

In the [Fiddler traces](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=collecting-fiddler-traces) youll find that navigation to AAD happens with **prompt=login**. 

```
GET https://login.microsoftonline.com/common/oauth2/authorize?response_type=code
&client_id=d3590ed6-####-####-####-############
&redirect_uri=ms-appx-web%3a%2f%2fMicrosoft.AAD.BrokerPlugin%2fd3590ed6-####-####-####-############
&resource=https%3a%2f%2fofficeapps.live.com
&add_account=notjoined
&prompt=login
&login_hint=user%40contoso.com
&response_mode=form_post&msafed=0&windows_api_version=2.0.... HTTP/1.1 
```

However, when redirected to ADFS the request looks like this:
```
wauth=http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password 
```

**Recommendation:** Tenant federation configuration issue. 

Disabling WAM here is not a solution, as _prompt=login_ is a legitimate, well known parameter. Any application could use it, WAM just highlights that settings is incorrect. 

If a customer on ADFS 2008, recommendation should be to update to at least ADFS 2012 R2. ADFS 2012 R2 has native support prompt=login. 

If a customer is on ADFS 2012 R2, then the federation _PromptLoginBehavior_ settings on the tenant need to be updated to use NativeSupport value. 

```powershell
Update-MgDomainFederationConfiguration DomainName <your domain name> -PreferredAuthenticationProtocol <WsFed or whatever your current setting is> -PromptLoginBehavior NativeSupport
```

If customer not willing to go ADFS 2012 R2, then enabling Form Based Authentication is the only option here. 

___

## AuthN issue because of the network environment 

**Issue Description:** Office/client applications may have connection problems, because of the network environment. 

**What you will see in the AAD Operational logs:** 

Error messages that are coming from XMLHTTPWebRequest. For example: 
 
 _Error: 0x102 The wait operation timed out._ 
 
 _Exception of type 'class Win32Exception' at xmlhttpwebrequest.cpp, line: 163, method: XMLHTTPWebRequest::ReceiveResponse._ 

Or any error from following Facility AA3, AA7, AA8 (ex: 0xCAA70004, 0xCAA70007, 0xCAA3012C,
0xCAA80000) 

**Note:** on any device these errors are present in Operational logs, it is important to correlate these errors with incident time, otherwise it is just a temporary network issue. 

**Recommendation:** It is network environment configuration issue. 

Sometimes firewall, antivirus or incorrect routing or DNS in an enterprise. See more details in [Investigation of network issues](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=investigation-of-network-issues).

___
##AuthN issue because of TPM-related issues 

**Issue Description:** Office applications may go into a login prompt loop, because of fault in TPM. 

**What you will see in the AAD Operational logs:** 

Error messages containing  0xCAA5001C along with the errors in the following format:  
0x?028???? or 0x?029????, 0x?009???? or any other error mentioned in https://aka.ms/wamtpmerrors 

**Recommendation:** Hardware/firmware issues. 

One of the first recommended steps is TPM firmware upgrade. For additional details see [Investigation of TPM-related issues](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=investigation-of-tpm-related-issues) section in this document. 

___
##AuthN issue because of NGC key issues

**Issue Description:** Unable to sign into Teams and other Office apps

**What you will see in the AAD Operational logs:** 

Error messages containing 0xCAA5001C along with AADSTS1350101: "Key ID cannot be decoded".

Check STS logs to see if NGC keys are missing on the server side with error "KeyNotFoundFailToDecode".  If the NGC keys are missing, then this indicates a mismatch between server and client.

**Recommendation:** 
Reset the NGC key (destructive reset)

___
###Unexpected MFA prompts because of TPM-related error 0xC028008B (TPM 2.0: The Handle is not correct for the use.) 

**Issue Description:** Office applications may show unexpected MFA prompts often, because of TPM error 0xC028008B. 

**What you will see in the AAD Operational logs:** 

Messages with task category AadCloudAPPlugin with event ids 1093, 1084, 1155 (in this chronological order). In other words check that the following sequence of events from AadCloudAPPlugin is present in the AAD Operational log: 

- NGC call NgcSignWithSymmetricPopKey returned error: TPM 2.0: The Handle is not correct for the use. 

- Http transport error. Status: TPM 2.0: The Handle is not correct for the use. Correlation ID: XYZ 

- Logon with session key failure. Retrying with device auth. Status: 0xC028008B Correlation ID:XYZ 

 **Recommendation:** Hardware/firmware issues. 

Typically, device reboot helps clear the state and work around the problem. TPM firmware upgrade may be helpful in case the issue is caused by TPM firmware bugs. 

Update Windows - latest version of Windows 10  (20H2) contains improvements that address this condition.

___
##Unexpected MFA prompts after signing in into Windows with Windows Hello For Business. 

**Issue Description:** Office applications may show unexpected MFA prompt after user has unlocked existing Windows session with Windows Hello For Business.

**What you will see in the AAD Operational logs:** 

Error message(s) with task category AadTokenBrokerPlugin mentioning AADSTS error(s) indicating that MFA is required. ESTS traces from AAD CloudAP plugin (UserAgent is 'Windows-AzureAD-Authentication-Provider/1.0') on the device around the time of the Windows sing-in show another request with incoming PRT ("IT:" in EventData lists the incoming tokens). Example:
![image.png](/.attachments/image-9ada4ee8-20a9-4a23-be91-ea8afb5e2678.png)
More details can be found in https://portal.microsofticm.com/imp/v3/incidents/details/338403515/home

 **Recommendation:** This is a product bug (tracked as 40866644 for CloudTrsut NGC deployments; 42638608 for KeyTrust NGC deployments) caused by a race condition between Windows logon and app(s) calling WAM to get AAD token silently. To mitigate, user can lock and then unlock Windows session again.

___
##Antivirus/AppLocker blocks AAD WAM plugin 

**Issue Description:** The application fails to get a token because of 0x42b 

**What you will see in the logs of application or (WAM core logs):** 

In application logs you see error 0x42b or 1067 (ERROR_PROCESS_ABORTED), 0x80080300 or -2146958592 (BT_E_SPURIOUS_ACTIVATION), 0x80070020 or -2147024864 (E_SHARINGVIOLATION), 1630 or 0x65e (ERROR_UNSUPPORTED_TYPE) or 0x80270301 (during CachePartitioning::Apply).

**Recommendation:** Configuration/environment issue. 

The customer has antivirus/app locker that blocks _Microsoft.AAD.BrokerPlugin_ or _Microsoft.Windows.CloudExperienceHost_ from running. 

Please work with the customer to create an exception for the directories and binaries involved: 

**Binaries:**
1. %windir%\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Microsoft.AAD.BrokerPlugin.exe
1. %windir%\System32\backgroundTaskHost.exe for the following package families:
   * Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy
   * Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy

**Directories**
1. %windir%\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy
1. %localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy
1. %windir%\SystemApps\Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy
1. %localappdata%\Packages\Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy

 
If you not able to find the issue, investigate with ProcessMonitor logs or route the case to Windows Performance support.

Related public article: https://learn.microsoft.com/en-us/microsoft-365/troubleshoot/authentication/cannot-sign-in-microsoft-365-desktop-apps
___
##Wam plug in activity cancelled

**Issue Description:** User might see the unexpected UX sign in prompts.

**What you will see in the application side logs:**
WAM plug in is a Universal Windows platform application (https://docs.microsoft.com/en-us/windows/uwp/) that ships inbox as a system application with Windows OS build. The plug in is expected to be activated by the UWP app activation framework to service token request calls. This background task may be cancelled. In this case, you will see errors like 0xcaad000? in the application side logs when calling the WAM API. The final digit will indicate the cancellation reason, which can be looked up here: https://docs.microsoft.com/en-us/uwp/api/windows.applicationmodel.background.backgroundtaskcancellationreason?view=winrt-22621. AAD logs should be investigated to understand the root cause of the cancellation.
___
##Wam plug in activation issue

**Issue Description:** User might see the unexpected UX sign in prompts. 

**What you will see in the application side logs:** 
WAM plug in is a Universal Windows platform application (https://docs.microsoft.com/en-us/windows/uwp/) that ships inbox as a system application with Windows OS build. The plug in is expected to be activated by the UWP app activation framework to service token request calls. If there are failures in activation, then in the application side logs you will see errors like BT_E_SPURIOUS_ACTIVATION, 0x80080300 when calling WAM API.
 
**Recommendation:** Application should recover after retries if coded correctly. 

If the issue is persistent, then it could be result of a security software on the device or in the customer environment. You need to follow [these steps](#antivirus%2Fapplocker-blocks-aad-wam-plugin) to remove the security software suspicion from the picture.

If we see Application Crashing Events in application.evtx with crashes for BackgroundTaskHost.exe (for Microsoft.AAD.BrokerPlugin) or Microsoft.AAD.BrokerPlugin.exe, it will imply that AAD WAM is crashing. In this case, look for reportId/hashed bucket as a part of "Windows Error Reporting" in Watson and investigate the crash failure.

![image.png](/.attachments/image-2d8e999e-47d8-44ec-a136-1ae4f23eb958.png)

The crash itself good indicator of presence the security software, that inserted its code inside AAD broker plugin. So, it worth to investigate if AAD broker plugin has non-Microsoft dependencies inside its address space. The [process monitor](https://learn.microsoft.com/en-us/sysinternals/downloads/procmon) could be a good tool for this as it displays call stacks of different API.

If both the crash and the security software path was fruitless, please, instruct the application support team to collect during **repro** the following logs:

1. [Activation logs](https://osgwiki.com/wiki/CEM_Triage#Tracing_without_access_to_corpnet)
2. [Appx logs](https://www.osgwiki.com/wiki/How_to_Get_App_Logs)
3. Process monitor logs.

Application support team might want to consult the [following section](https://www.osgwiki.com/wiki/CEM_Triage#Self-Help) on the mentioned Wiki.  

Note that most cases encountered for this issue are recorded in this self-help wiki and have follow up steps or workarounds. 

Identity CSS engineer should engage Windows (UX or Performance team) CSS support engineer for the package activation issue.
 
If the recommended above steps are not giving you a progress with troubleshooting, work with your TA to escalate it to the following ICM queue (note,  [Activation logs](https://osgwiki.com/wiki/CEM_Triage#Tracing_without_access_to_corpnet), [Appx logs](https://www.osgwiki.com/wiki/How_to_Get_App_Logs) and process monitor log are required for this step): 

WSD CFE\DevPlat and Browser - APF

##Analyzing Process Monitor logs
After identifying unknown WAM crashes at application logs or activation issues, one might request process monitor (Procmon) logs to investigate it even more. Procmon logs can be opened using Procmon64 app.

Download procmon64, and open the procmon log file (.PML).

After opening the logs at Procmon64, we can filter out other processes. 
Click on the filter icon and add a filter to the process names so that it should contain "BackgroundTaskHost.exe" as below:

![backgprocmon.png](/.attachments/backgprocmon-f221dc08-fa8f-47c2-bf2e-cd034a3267d2.png)

If you are investigating a crash on "Microsoft.AAD.BrokerPlugin.exe", you can filter by Microsoft.AAD.BrokerPlugin.exe name.

Hit Add, select the right filter and hit OK. 

In this example, we will consider a "Microsoft.AAD.BrokerPlugin.exe" crash investigation. Now, try to cherry pick a few BrokerPlugin operations. 
The example below double clicks on a Registry Set operation which loads a third party dependency into "Microsoft.AAD.BrokerPlugin.exe" process. To see the dependencies loaded, one should click on "Process" tab.
The company name in general is the way to determine it.

![procmon3p.png](/.attachments/procmon3p-d9745048-aa30-4ecd-8941-9a8dc22714fc.png)

You can try to pick some logs from the middle and end of the file and see if 3rd party dependencies are there. By the middle and end timestamps all dependencies should be already loaded.

If third party dependencies are loaded into WAM, the investigation should be stopped, and we should ask the customer to remove these third party dependencies before proceeding.
___
 
##Authentication issues due incorrect WIP policy (aka EDP issue) 

**Issue Description:** Office application experience authentication prompts due incorrect EDP settings. 

**What you will see in the application logs** 

To verify that you are experiencing this issue, follow these steps: 

In client application logs, you should find: -2147024540 or 0x80070164 (ERROR_EDP_POLICY_DENIES_OPERATION) 

**Recommendation** Windows Information Protection configuration issue. General WIP Documentation can be found here: http://aka.ms/wiptechnet. Support for WIP needs to be engaged. 

In order to properly configure Office with WIP you must follow the instructions here: 

See Office 365 ProPlus section on [this page](https://docs.microsoft.com/en-us/windows/security/information-protection/windows-information-protection/enlightened-microsoft-apps-and-wip#adding-enlightened-microsoft-apps-to-the-allowed-apps-list)

To get these AppLocker rules into your policy using Azure Portal, you can either click Add Apps and select Office-365-ProPlus-1708 or Import Apps pointing to your own downloaded AppLocker files from the above link/section. App rules must be added to both the Allowed and Exempt paths. 

___
##Azure AD Conditional Access policies related WAM issues:

Any apps can leverage the silent renewal of PRT (non-interactive) through WAM. If that silent renewal fails, you will see toast notification and it will throw in AAD as well "Interaction Required". 

You can avoid this by having VPN at the lock screen since cached credential logon trigger PRT refresh/renewal. It is shown by the CDP/Roaming service that synced user settings/customizations in Windows. It can only do silent auth requests, so when it fails to get a token, it shows the toast notification. 
Clicking on the notification takes user to the Settings page in Windows, where they can click on a link "Fix now" and authenticate to fix the account. 

What we've noticed is that this seems to happen if a customer has AAD CA policy for "all apps" and this Connected Devices Platform User Service (CDP) application is covered under it. OR if they have any other app covered under AAD CA policy which uses our device related service app (i.e Microsoft Device Directory Service).

In ASC Sign in Diagnostics for this particular sign in event you will see similar message:

_Conditional Access Policy Was Applied Because The Microsoft Application Command Service App Calls Microsoft Device Directory Service And A Policy Has Been Applied To This Resource. The Policy Requires MFA._
 
Hence the issue is not with device registration or PRT but the limitation of CDP to correctly handle interactive auth when certain AAD CA policies are enforced. This is known limitation and here is the work item https://microsoft.visualstudio.com/OS/_workitems/edit/31693238. 

___
##ERROR_CLASS_DOES_NOT_EXIST or ERROR_NOT_ENOUGH_MEMORY with no plugin errors

There are cases where the WAM Core service (which runs in session 0) is suffering from resource exhaustion. In this case, the caller will receive either ERROR_CLASS_DOES_NOT_EXIST or ERROR_NOT_ENOUGH_MEMORY, but these errors will not be shown in the AAD WAM logs (because they come from WAM Core).

**Recommendation**: File a collab with Windows CSS to confirm the diagnosis and root cause what on the machine is causing the resource exhaustion:

**DFM SAP category**: Windows Security Technologies\TokenBroker (WAM) service performance and reliability

For a (long and non-official) discussion of this situation, see here: [TokenBroker and Session 0 Desktop Heap Woes - The Blog of Ryan Ries](https://ryanries.github.io/?title=tokenbroker_and_session_zero_desktop_heap_woes.html)


___


#Unsupported Modifications
Customers of course have the ability do many different modifications to their environment. Some of these may have even been provided by Microsoft in the past, but the following are **not supported** and it is important that we do not recommend them to customers and that we clearly communicate to customers that these settings need to be reversed for proper support. These should not be recommended **even as a temporary workaround or diagnostic step**. **With the DMA in effect, they expose us to legal risk.**

## 1. Disable WAM

For some apps such as Office and Teams there is a **legacy** setting to fall back to the **unsupported** ADAL. This is well-known to many customers, but it is unsupported and is being removed in future versions of these apps.

## 2. Modify C:\Windows\System32\IntegratedServicesRegionPolicySet.json

We have learned that some customers are modifying the above file which is part of the internal details of how the Windows OS complies with the Digital Markets Act. This is documented by blogs such as [this](https://pureinfotech.com/windows-11-10-json-file-control-features-eu-users/). **This is an unsupported modification of the Windows OS.**

#Investigation of TPM-related issues 

One of the primary vectors of attack used by cyber criminals is stealing SSO artifacts (cookies, tokens, etc.). It is hard to make impossible of stealing them, however it is possible to make them unusable outside of the device. AAD WAM takes advantage of TPM if available on the device to bind SSO artifacts to the device. This means that cryptographic keys used during authentication are stored in TPM on the device which makes it nearly impossible to steal and successfully use the keys on another device. However, when TPM is reset intentionally, or the device hardware changes (for example hard drive swap), or TPM device detects attempts to extract secrets, access to AAD keys may be limited or even lost (e.g. in case of TPM reset). This inherently affects ability of AAD WAM to provide SSO to AAD resources and may manifest as unexpected authentication issues across applications (including Office applications) on the device. 

The main source for classification for TPM-related issues would be AAD client event logs with error codes like **0x?028????, 0x?029????, 0x?009????** or any other error mentioned in **https://aka.ms/wamtpmerrors**. These errors usually would indicate the authentication issue is likely caused by TPM-related failures. 

**Note:** Though this Wiki contains many clues how to troubleshoot TPM related SSO issues, its highly recommended to engage Platforms Devices and Deployment support team _(Windows\Windows 11\Windows 11 Enterprise and Education\Setup, Upgrades, and Drivers\Driver management)_ via collab to get assistance on specific TPM issues/questions from the customer. 

One of the first thing to address TPM issue would be to recommend the firmware upgrade to avoid these problems in future. The firmware upgrade is especially important if the issue is seen on multiple devices, as TPM vendors are constantly improving their products by shipping firmware updates, based on feedback from Microsoft. 

After firmware upgrade, do recovery action, which would be one of the following: 

**Windows 10 RS2:** AAD clients tries to recover only for Hybrid Azure AD configuration, and manual recovery is the only option for other configurations. If this doesnt happen automatically recommendations then manual recovery, see [Device recovery steps](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=device-recovery-steps) section in this document. 

**Widows 10 RS3 or later:** AAD client tries to detect situations related to TPM-related failures and [offer user recovery automatically in all configurations](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184217/Device-registration?anchor=azure-ad-registration/join-recovery-flow). If this doesnt happen automatically, recommendations then manual recovery, see [Device recovery steps](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=device-recovery-steps) section in this document. 

**On Windows RS5:** WAM will only provision hardware (TPM-bound) keys for devices that have a TPM 2.0 or greater. Software (non-TPM) keys will be provisioned for devices with a TPM 1.2 or lower for quality reasons. 

**Note 1:** there is an option to disable TPM in BIOS, however it puts device in less secure state, we cannot advice this, as this decrease of security of device it should be customer choice between security and reliability. 

**Note 2:** in case of TPM errors all applications are impacted on the device. Disabling WAM is just hiding the problem and customer will come back with a new ticket for a new service as on his/her device everything slowly dies. Recovery of the device is the only right path. 

TPM related questions owned by TPM Feature Team [TPMteam@microsoft.com](mailto:TPMteam@microsoft.com), they keep updated troubleshooting resources for TPM issues https://aka.ms/wamtpmerrors. 

#Edge Browser SSO
To learn more about how Edge browser SSO works review the following Browser team Wikis:
- [Website Authentication](https://dev.azure.com/CSSDigital/Browsers/_wiki/wikis/Browsers.wiki/428/Website-Authentication)
- [Sign In and Profiles](https://dev.azure.com/CSSDigital/Browsers/_wiki/wikis/Browsers.wiki/427/Sign-In-and-Profiles)

#Device recovery steps 

_BEFORE_ doing this, please, make sure that you verify the root cause described in the troubleshooting table above.

 

All steps to recover device follow the same pattern of unjoin/rejoin. These steps will vary depending on how the device is joined to the cloud (i.e. Hybrid Azure AD Join vs. Add Work Account vs. Azure AD Join). 

##Hybrid Azure AD join 
```
dsregcmd /status 
```
 
The output should have following fields (in the Device State): 

```       AzureAdJoined : YES ```

```      DomainJoined : YES ```

```      DomainName : <Customer domain> ```

The current logon user should be a domain user. The affected identity should be the current logon user. 

**Recovery steps:** 

In an administrative Command Prompt window run:  
``` 
dsregcmd /leave 
```
Reboot the device. 

 

##Add Work Account (WPJ)

```
dsregcmd /status 
```
The output should have following fields (in the User State): 
```
WorkplaceJoined : YES 
```

The device state could be any. The current logon user could be any. The affected identity should be a work or school account that you can see within Setting > Accounts > Access work or school. 

**Recovery steps:** 

Remove the work account within Setting > Accounts > Access work or school, by clicking Disconnect button. 

![WPJ Disconnect](.attachments/AAD-Authentication/614537/WPJdisconnect.png) 

Re-add the work account. 

##Azure AD join 
```
dsregcmd /status 
```
The output should have following fields (in the Device State): 

```  AzureAdJoined : YES ```

```  DomainJoined : NO ```


The current logon user should be an AAD user. The affected identity should be the current logon user. 

**Recovery steps (make sure to back up your data first):** 

Create a new local administrator. 

_Settings -> Accounts -> Other people -> Add someone else to this PC._ 

Verify that the added account is an Administrator and if not select Change account type and make the user an administrator. 

Disconnect from the domain - _Settings > Accounts > Access work or school > Disconnect_. 

Log in as the new local administrator, and reconnect to Azure AD. 

#Non-Persisted VDI environment or profile migration tools 

WAM protects the token with special crypto keys. Those keys are not exportable from the device. So, if the environment uses some kind of profile/file migration tools (Fslogix for example) or used as part of Non-Persisted VDI (which usually includes profile migration), then it is better to work with the customer to implement those steps: 

In a VDI environment, please ensure that before launching the application, MSA and AAD WAM plugins are installed. Ask the customer to discuss with a VDI vendor how to automate [this process](https://docs.microsoft.com/en-us/office365/troubleshoot/authentication/automatic-authentication-fails), but basically, you can launch a PS script that will check/install plugins on boot or before launching the application. 

When a customer is using a non-persisted VDI, please make sure that the following registry key is set: 

```HKLM\SOFTWARE\Policies\Microsoft\Windows\WorkplaceJoin ```

```RED_DWORD BlockAADWorkplaceJoin=1 ```

As well as the customer is running Windows version 10.0.17134.677 or higher. 

**Note:** It is not supported any content of %localappdata% migrated outside of the device. If you choose to take a risk to move content under %localappdata%, please, make sure that the content of these folders NEVER leaves the device under any condition and justification, i.e. any profile migration tools must skip those folders: 
 
```
%localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy 

%localappdata%\Packages\Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy 

%localappdata%\Packages\<app package basically any folder>\AC\TokenBroker 

%localappdata%\Microsoft\TokenBroker 
```
 
Also make sure that the content of those registry key will not leave devices as well: 

```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\IdentityCRL 

HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\AAD 
```
These limitations are also documented in [public documentation](https://docs.microsoft.com/en-us/azure/active-directory/devices/howto-device-identity-virtual-desktop-infrastructure#non-persistent-vdi).  

If customer uses FSLogix, refer to these guides to exclude AAD data from managed user profile 

[Profile Container content - FSLogix | Microsoft Docs](https://docs.microsoft.com/en-us/fslogix/manage-profile-content-cncpt) 

[Using Redirections.xml to configure what to copy to a profile with FSLogix (microsoft.com)](https://social.msdn.microsoft.com/Forums/windows/en-US/029e130e-5892-4d1f-88a7-f8046d78f3b0/using-redirectionsxml-to-configure-what-to-copy-to-a-profile-with-fslogix) 

If the customer has further questions, they need to work with the FSLogix CSS. 

#Collecting fiddler traces 

**Note:** most of the time you dont need to collect Fiddler traces when troubleshooting device registration, AAD PRT or WAM related SSO issues. 

However, it is sometimes needed to collect Fiddler traces manually. You need to know that Fiddler changes proxy settings of the user session, and it is man in the middle in SSL stack. It is very easy to make something wrong with Fiddler and user will see weird issues. Your investigation could go wrong direction. 

To collect Fiddler traces for WAM you need: 

Enable AppContainer loopback in Fiddler UI -> WinConfig -> Exempt All -> Save Changes 

OR from elevated cmd.exe: ```%localappdata%\Programs\Fiddler\EnableLoopback.exe -all```
 
 ![FiddlerAppLoopbackSettings](.attachments/AAD-Authentication/614537/FiddlerAppLoopbackSettings.png) 

Enable HTTPS decryption, but exclude AD FS from HTTPS decryption: 
 ![FiddlerHTTPSsettings](.attachments/AAD-Authentication/614537/FiddlerHTTPSsettings.png)

**Note:** on the picture you see AD FS server for Microsoft employers (```msft.sts.microsoft.com```), every enterprise has its own AD FS, so name will be different. 

If youre working in Outlook, youll also want to make sure Streaming mode is enabled otherwise Outlook traffic will stop. 
 ![FiddlerStreamMode](.attachments/AAD-Authentication/614537/FiddlerStreamMode.png) 

#Collecting TTD (Time Travel Debugging) of AAD Plugin
It is rarely needed, but sometimes necessary to use [Time Travel Debugging](https://www.osgwiki.com/wiki/Time_Travel_Debugging) to understand issue with AAD WAM. **Please note that these files are huge and the app will react much more slowly while tracing. Please work to keep your repro time as low as possible.**

In order to collect a TTD (aka TTT and iDNA) of the AAD WAM process, do the following:
- Get the partner version of TTD: https://www.osgwiki.com/wiki/Get_TTD
    - `\\dbg\privates\LKG\partner`
- From PowerShell run `Get-AppxPackage Microsoft.AAD.BrokerPlugin`
- Note the `PackageFullName` of the package
- From admin cmd run: `TTTRacer -initialize`
- Run: `TTTracer.exe -plm -onlaunch <packageFullName> -out <out directory>`
    - e.g. `TTTracer.exe -plm -onlaunch Microsoft.AAD.BrokerPlugin_1000.19580.1000.0_neutral_neutral_cw5n1h2txyewy -out %temp%\AADTTT`
- **REPRO**
- Wait for the time travel dialog box to appear on the desktop:
    - ![ScreenshotOfTtdPopup.png](/.attachments/ScreenshotOfTtdPopup-27dba566-c591-4402-a3ce-ababc3885db0.png)
- TTTracer.exe -plm -delete <PFN>
- Find directory from above (e.g. `%temp%\AADTTT), zip and send the contents.
    - There should be at least one .out and one .run file, otherwise the trace was not successful.

#Password change URL for federated users

If a device is joined to a customer tenant, they may have a custom password change URL for their tenant (intended to be accessed by hitting <Ctrl><Alt>\<Del\> and selecting "Change a password"). The URL accessed from clicking "Change a password" comes from either a customer configured value in the pwd_url claim from ESTS if available, otherwise a hard-coded default is used.

ESTS treats Federated users and Managed usersdifferentlywhen populating the pwd_url claim:[ESTS Code](https://msazure.visualstudio.com/One/_git/ESTS-Main?path=/src/Product/Microsoft.AzureAD.ESTS/Sts/TokenContentCreator.cs&version=GBmaster&line=5627&lineEnd=5769&lineStartColumn=8&lineEndColumn=10&lineStyle=plain&_a=contents).

For Managed users, ESTS always adds the pwd_url claim. But for Federated users, ESTS uses the pwd_url from the ADFS token. If ADFS issues password expiration info with pwd_url, ESTS returns it. If not, ESTSwon'tadd a default value.

ADFSonlyissues password expiration claims when the password is near expiration (within 14 days) in on-premise AD, so a customer's custom pwd_url is not always provided.

For now, this is a limitation of the Federated scenario without a workaround to always pass the pwd_url claim.

#Investigation of network issues 

To verify that you are experiencing a network issue, follow these steps: 

1.    Open Event viewer. 
2.    Go to Applications and Services Logs > Microsoft > Windows > AAD.  
3.    In the Operational logs, locate messages that have any error from following Facility AA3, AA7, AA8 (ex: 0xCAA70004, 0xCAA70007, 0xCAA30194, 0xcaa7000a, 0xcaa82ee2, 0xcaa301aa) or coming from XMLHTTPWebRequest for example: 
 ```
 Error: 0x102 The wait operation timed out. 
 
 Exception of type 'class Win32Exception' at xmlhttpwebrequest.cpp, line: 163, method: XMLHTTPWebRequest::ReceiveResponse. 
```
 

##Common Network Related Errors Table

 

| **Error**      | **Macro**                         | **Description**                                                  |
| ---------- | ----------------------------- | ------------------------------------------------------------ |
| 0xCAA70004 | ERROR_INET_RESOURCE_NOT_FOUND | The  client was not able to establish a connection. Request aborted on the early  phase (Like TCP Syn) Could be by firewall or proxy but could be physical  disconnect.      If  DNS will not resolve the name, youll also get this error. |
| 0xCAA70007 | ERROR_INET_DOWNLOAD_FAILURE   | The  connection was established, but was later aborted by firewall, or certificate  check failed. The fact that it was established means there is a physical  network, but some host aborts the flow. Very often federation IDP (AD FS)  aborts with this error.      Also,  when WAM does certificate check for TLS (Transport Layer Security) and  endpoints for certificate check are not accessible youll get this  error.      AAD  Operational logs could indicate which endpoint failed to connect. |
| 0xCAA30194 | HTTP  404<br/>ERROR_HTTP_STATUS_NOT_FOUND                     | HTTP  404 could also indicate the presence of TLS proxy, or bad ADFS settings. AAD  Operational logs could indicate which endpoint failed to connect. |
| 0x?AA3???? |                               | All  AA3 errors mean HTTP status. The last four hex digit means actual status.  HEX2DEC(0194)=404 => CAA30194 == HTTP 404   0xCAA30191  == HTTP 401   0xCAA30193  == HTTP 403   0xCAA301F6  == HTTP 502   Overall,  it means that request left device, but either server or proxy in between  generated this HTTP response. |
| 0xCAA301AA | HTTP 426                     | HTTPs 426 could be the TLS version mismatch where the client is using TLS version 1.X but server required a higher TLS protocol version. This can be confirmed by looking at the fiddler trace. Recommendation is to work with Cx to update the TLS version and invoke windows networking team if extra help is needed. |
| 0xcAA7000A | ERROR_INET_CONNECTION_TIMEOUT | Timeout  during network operation. Sometimes firewalls/proxy abort connection like  that. |
| 0xcAA82EE2 | ERROR_ADAL_INTERNET_  TIMEOUT |                                                              |
| 0x102      | WAIT_TIMEOUT                  |                                                              |
| 0x80070102 | E_WAITTIMEOUT                 |                                                              |
| 0x80004004 | E_ABORT                       | A  generic error code that can mean many things. Check internet connection,  antivirus software (cutting off connections), ADFS server side issues. AAD  operational logs should indicate the failed endpoint. |
| 0xC00CE584 | MSG_E_DTD_PROHIBITED          | A proxy injects DTDs into server response. |
| 0x80070005 | Access is denied | The client machine is not able to access the endpoint if it failed in method: WSTrustTokenRequest::GetWSTrustResponse. Consider recommending customer to allow those [M365 endpoints](https://learn.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges?view=o365-worldwide) in their network environment. |
 

On any device these errors are present in Operational logs. It is important to correlate these errors with the incident time, otherwise it is just a temporary network issue. If you are sure the customer network is good quality, follow instructions in the section below. 

**Simple check tips when troubleshooting network related issues:** 

- Open Edge (not IE, HTTP stack for IE is different) and navigate https://login.microsoftonline.com. Navigation, should land on https://www.office.com or company default landing page. If it fails, it is most likely a general network issue, incorrect proxy setting etc. 

- Processes that are engaged in token acquisition are: 

   ```C:\Windows\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Microsoft.AAD.BrokerPlugin.exe```

   ```C:\Windows\System32\backgroundTaskHost.exe```
 
   Ask the customer if they have a firewall or antivirus that blocks WAM or the primary destination. 
 
   _Primary destination:_ ```https://login.microsoftonline.com/``` This DNS name covers a lot of IP addresses (lots of services as well), sometimes some of these addresses are blocked in the customer environment for no reason, this causes intermittent problems in some device, but others work fine. 

- Open directory ```%LOCALAPPDATA%\Packages\microsoft.aad.brokerplugin_cw5n1h2txyewy\AC\Microsoft\Crypto\TokenBindingKeys\Keys\``` 

  Open every file with a binary editor for read. If it is filled with zeroes (00 00 00), then it is token binding issue. You need to delete those files. 

- By inspecting Fiddler trace, it is possible to determine the outbound Proxy server name in the customer environment, that the calls from  Microsoft.AAD.BrokerPlugin.exe and backgroundTaskHost.exe are flowing through. 

- ZScaler proxy - Loopback connections are by default not allowed for UWP apps and require configuration of exemptions.

- ZScaler SSL inspection causes 0xC00CE584 (MSG_E_DTD_PROHIBITED) in WAM. AAD URLs need to be exempted from SSL inspection. 



#APPX/UWP deployment

WAM plug in is a Universal Windows platform application (https://docs.microsoft.com/en-us/windows/uwp/) that ships inbox as a system application with Windows OS build.
Regarding [UWP deployment/activation issues](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues?anchor=wam-plug-in-activation-issue), these are the people you need to know: 

| **Delivery Unit**     |  **Name**                                                  |
| ---------- |  ------------------------------------------------------------ |
| Global Delivery Unit Lead:  |  Nam Su Kang      (AMER)  nkang@microsoft.com |
| Global Delivery Unit Co-Leads: | Joe Wu           (APAC)  joewu@microsoft.com |
| | Satoshi Kitazato (Japan) satoshk@microsoft.com |
| | Alex Vulcan      (EMEA)  alvulcan@microsoft.com |
| | Brett Borza       (AMER)  brebor@microsoft.com | 

##Troubleshooting Appx related issues 
When the AAD WAM plugin (i.e.  ```C:\Windows\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy```) didn't installed properly, it causes the authentication flow to fail with the AAD provider not found. This error can be found in the WAM Core log with something like this:  
```
Microsoft.Windows.Security.TokenBroker
	BuiltInProviderNotFound	
	"providerId: 	https://login.windows.net"
```
Where the Microsoft.Windows.Security.TokenBroker is the WAM core component with the BuiltInProviderNotFound as the error. The provider Id `https://login.windows.net` represents the cloud identity provider.

**NOTE:** the fix below should be implemented **ONLY** when mentioned above error message is present in WAM Core logs. 
____
The BuiltInProviderNotFound error can be addressed by re-installing the AAD BrokerPlugin. It can be performed by running this command in PowerShell:
  
``` Add-AppxPackage -Register "C:\Windows\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Appxmanifest.xml" -DisableDevelopmentMode -ForceApplicationShutdown ```
____
#Search support contact by product name
This site https://msaas.support.microsoft.com/queue allows you to query for a product name and it will tell you who supports it in CSS.If your query brings up results, you click on the 3 horizontal lines on the right-hand side to open the "queue" and find people responsible for that technology.

# WAM Errors

## UserInteractionRequired (Expected)  

This chapter describes errors that result in interaction being required. The calling application must repeat the same request using the `RequestTokenAsync` API, i.e., show a UI.

### 0xcaa10001 ERROR_ADAL_NEED_CREDENTIAL
  
Expected. UI required. This error indicates that no user matches to the request. There is no PRT, no RT, and the device is not joined to a domain.

Possible causes include:

- The device is not domain-joined.
- The device in not joined to a cloud.
- The account used by the application is no longer present on the system, i.e. the user has deleted the account.

The only option is to get a token is to show UI.

### 0xcaa20003 ERROR_ADAL_SERVER_ERROR_INVALID_GRANT

Expected. UI required. The SSO artifact is expired or revoked for some reason. The only possible action is to prompt for credentials. The error message will provide more details, as well as server-side investigation using the correlation ID and timestamp.

### 0xcaa2000c ERROR_ADAL_SERVER_ERROR_INTERACTION_REQUIRED

Expected. UI required. Everything is fine with the SSO artifacts, but they dont have sufficient claims to complete the request, for example, 2FA or user consent. A prompt is needed to complete the request.

### 0xcaa90014 ERROR_ADAL_WSTRUST_REQUEST_SECURITYTOKEN_FAILED

Expected. UI required. Federation settings are correct; however, when connecting to ADFS, it rejected issuing a token. A common case is when a device doesnt see the domain controller (e.g., your laptop is DJ, but you took it home without VPN), resulting in on-prem authentication failure. WAM will return `UserInteractionRequired`, and the application must call the `RequestTokenAsync` operation to show the UI. ADFS will take credentials from the ADFS page, and authentication will be completed.

### 0xcaa9001f ERROR_ADAL_INTEGRATED_AUTH_WITHOUT_FEDERATION

Expected. UI required. WAM attempts to get a token silently via WS Trust but realizes the user is managed, hence no WS Trust is possible. WAM informs the application that a prompt is needed. The application must show a UI, and the AAD server will request the username and password in the login UX.

### 0xcaa90022 ERROR_ADAL_COULDNOT_DISCOVER_INTEGRATED_AUTH_ENDPOINT

Expected. UI required. RT/PRT is expired or doesnt exist. The client either communicates outside of the corporate network or has a misconfigured customer environment. WAM tries to get a token silently via WS Trust, but endpoints for Windows Integrated Authentication are not discovered. ADFS (especially MSIT) can hide the WIA endpoint if the call comes from an external network. Some customers do not configure WS Trust correctly. The only way to get a token is through a prompt. WAM returns `UserInteractionRequired`, and the application needs to prompt the user.

### 0xcaa90017 ERROR_ADAL_PROTOCOL_NOT_SUPPORTED

Expected. UI required. The IDP doesnt support WS Trust. The application must call `RequestTokenAsync` with UI to show the prompt. The user will enter credentials afterward. 

There was a bug in this area where WAM did not return `UserInteractionRequired`. Ensure the device is updated.

### 0xc00**C**e584, 0xc00**C**e56d, 0xc00**C**e558, (anything with facility C, i.e., 0x???**C**????), MSG_E_DTD_PROHIBITED, MSG_E_ENDTAGMISMATCH, MSG_E_MISSINGROOT ...

Expected. UI required. This error means WAM expects XML (MEX or SAML request/response), but the actual returned response is not valid XML, i.e. text, free form HTML, empty. This could be due to the following issues:

- Incorrect proxy settings where the proxy generates HTML/text/empty instead of XML, most commonly a 403 Forbidden with an HTML body.
- Incorrect federation settings where the Federation IDP (ADFS or another provider) responds with HTML/text/empty instead of XML.
- Fiddler is running with incorrect settings.

WAM is supposed to prompt and return `WebTokenRequestStatus` as `UserInteractionRequired`, and the application should call `RequestTokenAsync` with a follow-up prompt. 

If WAM returns `ProviderError`, the prompt will not occur. There was a bug in this area where WAM did not return `UserInteractionRequired`. Ensure the device is updated.

## ProviderError (Expected/Unexpected)

### Cannot Find WAM Plugin

If the WAM plugin cannot be found, it may have been removed or disabled. This issue often arises when an enterprise uses an image optimization tool or manually removes the plugin, assuming it is unnecessary. To resolve this, the WAM plugin must be reinstalled or re-enabled.

An enterprise decided to use an image optimization tool and removed the WAM plugin, assuming it was unnecessary. They need to add it back by following the instructions in the official documentation: 

[Automatic authentication fails](https://docs.microsoft.com/en-us/office365/troubleshoot/authentication/automatic-authentication-fails)

### 0xcaa2000b ERROR_ADAL_SERVER_ERROR_INVALID_RESOURCE

Expected for WAM and could be expected for the application. This error means the target resource doesn't exist in the tenant. It could be that the target resource is invalid or not installed by an admin. Additionally, the subscription may not have been purchased or enabled.

### 0xcaa20009 ERROR_ADAL_SERVER_ERROR_INVALID_CLIENT

Expected for WAM but unexpected for the application. This error indicates that the application sent a client ID that is not recognized by the AAD server. This is a bug in the application.

### 0x80070715 (or in AAD logs: 0xc000008a) ERROR_RESOURCE_TYPE_NOT_FOUND/STATUS_RESOURCE_TYPE_NOT_FOUND

This error occurs in device-only tokens when the application specifies an invalid resource or the resource is not installed/enabled in the target tenant. 
OAuth: invalid_resource 
This is either an application bug or a configuration issue.

### 0xcaa20002 ERROR_ADAL_SERVER_ERROR_INVALID_REQUEST

Unexpected from the application's point of view but expected from the AAD plugin side. This requires investigation in the application's context. Most likely, there is an issue with the API input parameters, such as resource or scope. Correlation IDs and timestamps can provide more details. Additionally, this error can be queried by client ID.

### 0xcaa90019 ERROR_ADAL_UNEXPECTED_RESPONSE

Expected. A customer proxy generated an HTML page where an OAuth response was required.

### 0xcaa20004 ERROR_ADAL_SERVER_ERROR_ACCESS_DENIED

Expected. Everything is functioning correctly from an authentication perspective. However, the server has denied access to the resource.

### 0x0000042b, 0x8007042b ERROR_PROCESS_ABORTED

Expected. These errors typically occur when third-party protection software (e.g., antivirus) blocks the AAD or MSA WAM plugin. Enterprises need to add exclusions in the protection software.

### 0x80080300 BT_E_SPURIOUS_ACTIVATION

Expected. This is a catch-all error, which essentially means that either the WAM plugin process didnt start or didnt finish as expected. This may indicate several issues:

1. Third-party protection software blocks the application  the administrator needs to add an exclusion.
2. A token request was made when the system had exhausted resources, or the device was in boot crunch, sleep, or low-power mode.
3. The system is about to shut down, and no further activity is allowed.
4. For UWP applications: they are not allowed to perform extensive activity at the moment of the call.
5. Rarely, it can mean that the WAM plugin crashed, usually in internal Windows builds (if there are bugs). Crashes are monitored via [Watson](https://watsonportal.microsoft.com/).

This error must be retriable.

This dashboard provides a breakdown of the reasons for this error:
https://aka.ms/wamdata

### 0x80010114 RPC_E_INVALID_OBJECT
tbcore@microsoft.com should add documentation on this error.

### 0xd0000225 STATUS_NOT_FOUND
tbcore@microsoft.com should add documentation on this error.

### 0x80070008 E_NOTENOUGHMEMORY
The system is out of memory resources.

### 0x80070583 ERROR_CLASS_DOES_NOT_EXIST
The system is out of atom resources. The system cannot create a window anymore due to a lack of [ATOMs](https://learn.microsoft.com/en-us/windows/win32/dataxchg/about-atom-tables).

Some poorly written software on the system can lead to the exhaustion of the atom table. Remove the problematic software, reboot the device, or re-image the device if the issue persists and the software cannot be identified.

### 0x80040154 REGDB_E_CLASSNOTREG
A required COM class doesnt exist on the device. Possible reasons:

1. Anti-virus software blocks the COM object.
2. The registry registration of the COM object is broken.

Involve Windows CSS to troubleshoot COM issues, but re-imaging the device is often a better solution. If a class is missing, other components may also be missing.

### 0x80080005 CO_E_SERVER_EXEC_FAILURE
COM interaction is not possible. The system cannot create a required COM object. Possible reasons:

1. Anti-virus software blocks the COM object.
2. The registry registration of the COM object is broken.
3. A generic COM failure occurred; a reboot may help.

Involve Windows CSS to troubleshoot COM issues.

### 0x8028008b TPM_20_E_HANDLE
TPM issue. The device needs to get recovered.

### 0x80280909 TPM_20_E_CANCELED
TPM issue. The device needs to get recovered.

### 0x80090030 NTE_DEVICE_NOT_READY
TPM issue. The device needs to get recovered.

### 0x80090016 NTE_BAD_KEYSET
TPM issue. The device needs to get recovered.

### 80284001 TBS_E_INTERNAL_ERROR
TPM issue. The device needs to get recovered.

### 0xc02901df
This is a TPM chipset/firmware failure. If a device encounters this error frequently, the customer needs to perform device recovery.

### 0x80070164 ERROR_EDP_POLICY_DENIES_OPERATION
Expected. The application is marked as a consumer app but requests tokens for enterprise use. Based on policy, consumer apps cannot access enterprise data, which is why the request was blocked. The reverse scenario is also possible, where an enterprise application requests a token for consumer use. This is essentially a configuration issue.

[Windows Information Protection (WIP) Documentation](https://docs.microsoft.com/en-us/windows/security/information-protection/windows-information-protection/wip-app-enterprise-context)

To properly configure Office with WIP, follow the instructions in the "Office 365 ProPlus" section on this page: 

[Enlightened Microsoft Apps and WIP](https://docs.microsoft.com/en-us/windows/security/information-protection/windows-information-protection/enlightened-microsoft-apps-and-wip#adding-enlightened-microsoft-apps-to-the-allowed-apps-list)

To apply these AppLocker rules using the Azure Portal, either click "Add Apps" and select "Office-365-ProPlus-1708" or import AppLocker files from the above link/section. **App rules must be added to both the Allowed and Exempt paths to be supported.**

For assistance, contact the COSINE DP-WIP/EFS Crew at wdpwip@microsoft.com.

### 0x80070003 E_PATHNOTFOUND

The folder infrastructure of the AAD WAM plugin was destroyed by an external entity, such as manual user intervention, image optimization tools, or profile migration. The following commands can help recover the folder structure:

```powershell

# For AAD WAM plugin
Add-AppxPackage -Register "$env:windir\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Appxmanifest.xml" -DisableDevelopmentMode -ForceApplicationShutdown

# For MSA WAM plugin
Add-AppxPackage -Register "$env:windir\SystemApps\Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy\Appxmanifest.xml" -DisableDevelopmentMode -ForceApplicationShutdown

```

### 0xd000000d STATUS_INVALID_PARAMETER
Historically, this error has been caused by a race condition between WAM activating the AAD provider via a background task and a change in the provider apps deployment state.

### 0xd0000001
tbcore@microsoft.com should add documentation for this error.

### 0xcaa5004b ERROR_ADAL_NO_DEVICE_INFO
Part of the AAD stack assumes the device is WPJ, but the certificate is missing. This issue is tracked by a bug on the AAD side.

### 0xcaa60007 ERROR_ADAL_JSON_MALFORMED
AAD WAM expects JSON but receives HTML. This usually indicates the presence of a proxy generating HTML in the middle of an HTTPS request.

In the latest Windows update, better handling of proxy situations has been implemented. Please update the OS.

### 0xcaa90015 ERROR_ADAL_OAUTH_RESPONSE_INVALID

The incoming response is either empty or not a JSON object. AAD WAM expects a JSON object response but does not receive it. This usually indicates the presence of a proxy generating empty responses or responses with a single string in the middle of an HTTPS request.

In the latest Windows update, better handling of proxy situations has been implemented. Please update the OS.

### 0xcaa500e4 ERROR_ADAL_DECRYPT_OAUTH_RESPONSE

AAD WAM expects an encrypted response but receives HTML. This usually indicates the presence of a proxy generating HTML in the middle of an HTTPS request.
In the latest Windows update, better handling of proxy situations has been implemented. Please update the OS.

This error can also mean that the keys on the device do not match the keys in the cloud (a very rare occurrence). This issue requires further investigation.

### 0xcaad000? Background Task Canceled

All 0xcaad???? errors are expected and retriable according to this document. They indicate that a token operation had begun execution but was canceled mid-flight.

The last digit of this error can be used to decode what actually happened. Refer to this table: [BackgroundTaskCancellationReason Enum](https://learn.microsoft.com/en-us/uwp/api/windows.applicationmodel.background.backgroundtaskcancellationreason?view=winrt-19041).

#### 0xcaad000a ResourceRevocation

Expected. If we apply the statement above, 0xcaad000a translates to [ResourceRevocation 10](#0xcaad000-all-0xcaad-errors-are-expected-and-retriable-according-to-this-document).

The background task was canceled because the system needed additional resources. The background task was canceled to free up those resources.

#### 0xcaad0009 ExecutionTimeExceeded

If we apply the statement above, 0xcaad0009 translates to [ExecutionTimeExceeded 9](#0xcaad000-all-0xcaad-errors-are-expected-and-retriable-according-to-this-document).

The background task was canceled because it exceeded its allotted time to run. AAD WAM plugins took too much time. This usually happens when the device is in low-power mode due to the screen being off, battery constraints, or the hibernation process on the device, or due to network delays. Overall, the OS allows 3 minutes to finish any token operation. If it takes more than 3 minutes, the operation will be aborted with this error.

It doesnt make sense to investigate this error based on telemetry or errors seen in the past (e.g., AAD Operational logs). If the device meets any of the above conditions, this error is expected. It only makes sense to investigate this error if you have a reproducible scenario where the above conditions are not met: the device is not in low-power mode, the network is fine, and the device is not in hibernate/sleep mode.

#### 0xcaad0003 ServicingUpdate

Expected. If we apply the statement above, 0xcaad0003 translates to [ServicingUpdate 3](#0xcaad000-all-0xcaad-errors-are-expected-and-retriable-according-to-this-document).

The background task was canceled because the application or operating system was in the process of being updated.

#### 0xcaad0002 LoggingOff

Expected. If we apply the statement above, 0xcaad0002 translates to [LoggingOff 2](#0xcaad000-all-0xcaad-errors-are-expected-and-retriable-according-to-this-document).

The silent token operation was canceled because the system was logging off.

#### 0xcaad0001 Terminating

Expected. If we apply the statement above for 0xcaad000?, 0xcaad0001 translates to [Terminating 1](#0xcaad000-all-0xcaad-errors-are-expected-and-retriable-according-to-this-document).

The silent token operation was canceled because the calling application was terminating.

### 0x0000065e (0x65e or 1630) ERROR_UNSUPPORTED_TYPE
If this error is failing in RegistryKey::TryGetValue from the WAM log, it's a known issue that has been fixed in NI+
Below is the sample log of the failure:

```
2103    False    Microsoft-Windows-AAD    AadTokenBrokerPlugin Operation     0     "    "    "Error:     0x65E
ErrorMessage:     Data of this type is not supported.
AdditionalInformation:     ""Exception of type 'class RegistryException' at RegistryKey.inl, line: 43, method: RegistryKey::TryGetValue.    Log: 0xcaa5011e A token task failed with an exception.  Logged at GetTokenBrokerOperationBase.cpp, line: 431, method: GetTokenBrokerOperationBase::ExecuteImpl::<lambda_c31474b14359272d976d8c8f11c58019>::operator ()."""
```
Confirm with customer about the releases on the repro machine and if it's prior NI, work with customer on making sure the type of BlockAADWorkplaceJoin is DWORD.



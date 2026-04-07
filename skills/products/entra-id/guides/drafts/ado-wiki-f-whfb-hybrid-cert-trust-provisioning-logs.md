---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking at logs/Hybrid Certificate Trust/Provisioning (Fast track)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20at%20logs%2FHybrid%20Certificate%20Trust%2FProvisioning%20%28Fast%20track%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430200&Instance=430200&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430200&Instance=430200&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a sequence of steps from a working scenario to help identify where an issue occurs in a non-working scenario. It includes logs from a specific client build and emphasizes the importance of comparing these logs to pinpoint the problematic step.

[[_TOC_]]

# Tips

You can filter "Microsoft-Windows-HelloForBusiness/Operational" event log using task category elements.

- All events present in Microsoft-Windows-HelloForBusiness/Operational are in <SPAN style="color:green">green</SPAN>.
- All events present in Microsoft-Windows-AAD/Analytic are in <SPAN style="color:blue">blue</SPAN>.
- All events present in Microsoft-Windows-User Device Registration/Admin are in <SPAN style="color:orange">orange</SPAN>.

<SPAN style="color:green">Microsoft-Windows-HelloForBusiness/Operational  
3045, 5555, 3225, 3052, 8052, 5225, 8067, 8225, 3510, 8510, 3066</SPAN>

<SPAN style="color:blue">Microsoft-Windows-AAD/Analytic   
1213, 1214, 1144, 1015, 1031, 1099, 1108, 1028, 1022</SPAN>

<SPAN style="color:orange">Microsoft-Windows-User Device Registration/Admin   
323, 367, 368, 325, 108, 385, 109, 302, 350, 300, 357, 329</SPAN>

---

# Step A

The provisioning application hosted in the Cloud Experience Host (CXH) starts provisioning by requesting an access token for the Azure Device Registration Service (ADRS). The application makes the request using the Azure Active Directory (AAD) Web Account Manager plug-in. In a federated environment, the plug-in sends the token request to the on-premises Security Token Service (STS), such as Active Directory Federation Services (ADFS). The on-premises STS authenticates the user and determines if the user should perform another factor of authentication. Users must provide two factors of authentication. In this phase, the user has already provided one factor of authentication, typically a user name and password. Azure Multi-Factor Authentication (MFA) services (or a third-party MFA service) provide the second factor of authentication. The on-premises STS server issues an enterprise token on successful MFA. The application sends the token to Azure Active Directory. Azure Active Directory validates the access token request and the MFA claim associated with it, creates an ADRS access token, and returns it to the application.

<SPAN style="color:green">Windows Hello processing started.  
<mark>Scenario type: Enrollment</mark></SPAN>

<SPAN style="color:blue">WamExtension process token operation started</SPAN>

<SPAN style="color:orange">Preparing to send a request to the Web Account Manager.  
Account provider ID: https://login.windows.net  
Scope:  
Client ID: dd762716-544d-4aeb-a526-687b73838a22  
Authority: https://login.microsoftonline.com/common  
<mark>Resource: urn:ms-drs:enterpriseregistration.windows.net</mark>  
CorrelationId: {0FE13C60-BB10-40E9-9A2C-9578B43D09DA}  
Added following properties to the Web Account Manager access token request.  
Properties:  
<mark>amr_values : ngcmfa</mark>  
ftcid : {0FE13C60-BB10-40E9-9A2C-9578B43D09DA}  
correlationId : {0FE13C60-BB10-40E9-9A2C-9578B43D09DA}  
resource : urn:ms-drs:enterpriseregistration.windows.net  
prompt : no_select  
authority : https://login.microsoftonline.com/common</SPAN>

<SPAN style="color:blue">Code: 0x4AA90010 Sending web request  
Sending request to https://login.microsoftonline.com/common/oauth2/token  
Logged at oauthtokenrequestbase.cpp, line: 204, method: OAuthTokenRequestBase::SendRequest.  
Request: authority: https://login.microsoftonline.com/common, client: dd762716-544d-4aeb-a526-687b73838a22, redirect URI: ms-appx-web://Microsoft.AAD.BrokerPlugin/dd762716-544d-4aeb-a526-687b73838a22, resource: urn:ms-drs:enterpriseregistration.windows.net, correlation ID (request): 0fe13c60-bb10-40e9-9a2c-9578b43d09da  
Code: 0x4AA90011 <mark>UI flow started</mark>.  
StartUI Url: https://login.microsoftonline.com/common/oauth2/authorize?response_type=code&client_id=dd762716-544d-4aeb-a526-687b73838a22&redirect_uri=ms-appx-web://Microsoft.AAD.BrokerPlugin/dd762716-544d-4aeb-a526-687b73838a22&resource=urn:ms-drs:enterpriseregistration.windows.net&add_account=multiple&login_hint=jan@tailspintoys&response_mode=form_post&amr_values=ngcmfa&ftcid={0FE13C60-BB10-40E9-9A2C-9578B43D09DA}&windows_api_version=2.0  
<...>  
Request: authority: https://login.microsoftonline.com/common, client: dd762716-544d-4aeb-a526-687b73838a22, redirect URI: ms-appx-web://Microsoft.AAD.BrokerPlugin/dd762716-544d-4aeb-a526-687b73838a22, resource: urn:ms-drs:enterpriseregistration.windows.net, correlation ID (request): 0fe13c60-bb10-40e9-9a2c-9578b43d09da  
Code: 0x4AA9000F <mark>Sending request completed successfully</mark>  
<...>  
Logged at oauthtokenrequestbase.cpp, line: 389, method: OAuthTokenRequestBase::ProcessOAuthResponse  
<...>  
Code: 0x4AA9000B <mark>Change authorization code on token completed successfully</mark>  
Logged at appuitokenrequest.cpp, line: 102, method: AppUITokenRequest::ProcessTokenResponse.  
<...>  
Code: 0x4AA90011 <mark>UI flow started</mark>  
StartUI Url: https://login.microsoftonline.com/common/oauth2/authorize?response_type=code&client_id=29d9ed98-a469-4536-ade2-f981bc1d605e&redirect_uri=ms-appx-web://Microsoft.AAD.BrokerPlugin/DRS&<mark>resource=urn:aad:tb:update:prt</mark>&add_account=noheadsup&scope=openid&login_hint=jan@tailspintoys.com&response_mode=form_post&windows_api_version=2.0</mark>  
<SPAN style="color:blue"><...>  
Code: 0x4AA9003C <mark>Redeeming device registration auth code on access token succeeded.</mark>  
Logged at webuitokenrequest.cpp, line: 112, method: WebUITokenRequest::ProcessSecondaryTokenResponse.  
<...>  
Code: 0x4AA50050 <mark>Update user data start.</mark>  
Logged at appuitokenrequest.updatedevicetask.cpp, line: 39, method: AppUITokenRequest::UpdateDeviceTask::Invoke.  
<...>  
Code: 0x4AA9000A <mark>Access token was renewed by refresh token</mark>  
Logged at refreshtokenrequest.cpp, line: 96, method: RefreshTokenRequest::AcquireToken.  
<...>  
Code: 0x4AA5002C Initialization data downloaded.  
Logged at appuitokenrequest.updatedevicetask.cpp, line: 119, method: AppUITokenRequest::UpdateDeviceTask::UpdatePRT.  
<...>  
Code: 0x4AA50051 <mark>Update user data succeeded.</mark>  
<...>  
Code: 0x4AA50013 <mark>Writing to file succeeded.</mark>  
File name: 'C:\Users\jan\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\LocalState\u_d4r592gg7f1pv25c50ueprkc\c_m2novo3260vmramnve9aglul\a_k0d3p7ef9etr0bab3ndnhosd.pwd', Size: 5835 bytes  
<...>  
Code: 0x4AA5004C <mark>Saving data to the operating system.</mark>  
Logged at defaultuser.cpp, line: 102, method: DefaultUser::Save  
AadCloudAPPlugin encrypted OAuth response received</SPAN>

<SPAN style="color:orange">The following token properties were received from the Web Account Manager:  
Properties: ipaddr : 167.xx.xx.xx  
amr : ["pwd","rsa","ngcmfa","mfa"]  
UPN : jan@tailspintoys.com  
DisplayName : Jan Kovac  
family_name : Kovac  
TenantId : 9dc61dxxx  
sub : ZWoJ2mzavDID-wg_Z7uejhv5SXARFFiIRGlMtsVyIBU  
TokenExpiresOn : 13246377838  
FirstName : Jan  
Authority : https://login.microsoftonline.com/common  
SignInName : jan@tailspintoys.com  
given_name : Jan  
onprem_sam_account_name : Jan  
iss : https://sts.windows.net/9dc61dba-xxxb4fd-490aa539f101/  
iat : 1601903339  
aud : dd762716-544d-4aeb-a526-687b73838a22  
UserName : jan@tailspintoys.com  
name : Jan Kovac  
domain_netbios_name : TAILSPINTOYS  
LastName : Kovac  
unique_name : jan@tailspintoys.com  
tenant_display_name : TAILSPINTOYS  
in_corp : true  
domain_dns_name : tailspintoys.com  
<mark>Successfully obtained a token for the current user via token broker.</mark></SPAN>

---

# Step B

After receiving an ADRS access token, the application detects if the device has a Windows Hello biometric compatible sensor. If the application detects a biometric sensor, it gives the user the choice to enroll biometrics. After completing or skipping biometric enrollment, the application requires the user to create a PIN and the default (and fallback gesture when used with biometrics). The user provides and confirms their PIN. Next, the application requests a Windows Hello for Business key pair from the key pre-generation pool, which includes attestation data. This is the user key (ukpub/ukpriv).

<SPAN style="color:green"><mark>Windows Hello key creation started.</mark></SPAN>  
<SPAN style="color:orange">The NGC container was successfully created.  
User SID: S-1-5-21-1319392003-4195456151-1729563318-1608  
IDP domain: login.windows.net  
Tenant domain: 9dc61dba-e80b-4201-b4fd-490aa539f101  
Flags: 0</SPAN>

<SPAN style="color:green">The key pre-generation pool received a request for a new key.  
The new key request from the key pre-generation pool completed successfully.  
<mark>Windows Hello set a certificate property on a Windows Hello key.</mark>  
Key name: S-1-5-21-13193xxx63318-1608/960eb669-c9cb-4f4b-bec5-547636341a0d/login.windows.net/9dc61dba-exxxd-490aa539f101/jan@tailspintoys.com  
Certificate type: Self-signed</SPAN>

<SPAN style="color:orange">The NGC user ID key was successfully created.  
User SID: S-1-5-21-1319392003-4195456151-1729563318-1608  
IDP domain: login.windows.net  
Tenant domain: 9dc61dba-e80bxxx4fd-490aa539f101  
User ID: jan@tailspintoys.com  
<mark>The NGC key registration request was successfully sent. User email: jan@tailspintoys.com.</mark>  
Auth token: <Present; Snipped>.</SPAN>

<SPAN style="color:green">Windows Hello key creation completed successfully.  
<mark>Windows Hello set a certificate property on a Windows Hello key.</mark>  
Key name: S-1-5-21-1319392xxx8-1608/960eb669-c9cb-4f4b-bexx6341a0d/login.windows.net/9dc6xx4201-b4fd-490aa539f101/jan@tailspintoys.com  
Certificate type: Self-signed  
Windows Hello key creation completed successfully.</SPAN>

<SPAN style="color:orange">The NGC user ID key was successfully created.  
User SID: S-1-5-21-131xxx56151-1729563318-1608  
IDP domain: login.windows.net  
Tenant domain: 9dc61dba-e80b-4xxx-490aa539f101  
User ID: jan@tailspintoys.com</SPAN>

---

# Step C

The application sends the ADRS token, ukpub, attestation data, and device information to ADRS for user key registration. Azure DRS validates the MFA claim remains current. On successful validation, Azure DRS locates the user's object in Azure Active Directory, writes the key information to a multi-values attribute. The key information includes a reference to the device from which it was created. Azure Active Directory returns a key ID and a key receipt to the application, which represents the end of user key registration.

<SPAN style="color:green"><mark>Windows Hello key registration started.</mark></SPAN>

<SPAN style="color:orange">The NGC key registration request was successfully sent. User email: jan@tailspintoys.com.  
Auth token: <Present; Snipped>.  
The Microsoft Passport key information was successfully saved.  
<mark>Key ID: 32785eae-699e-49e6-a1e8-5bf1f9e2fc02</mark>  
Attestation level: 1  
AIK status: 0  
Key type: 0  
Key name: S-1-5-21-1319392003-4xxx18-1608/960eb669-c9cb-xxx47636341a0d/login.windows.net/9dc61dba-e8xxx-490aa539f101/jan@tailspintoys.com  
IDP domain: login.windows.net  
Tenant ID: 9dc61dxxxd-490aa539f101  
User email: jan@tailspintoys.com  
The Microsoft Passport key was successfully registered with Azure AD.  
<mark>Key ID: {32785eae-699e-49e6-a1e8-5bf1f9e2fc02}</mark>  
UPN: jan@tailspintoys.com  
Attestation: ATT_SOFT  
Server response: {"kid":"32785eae-699e-49e6-a1e8-5bf1f9e2fc02","upn":"phil@tailspintoys.com","krctx":"eyJEYXRhIjoiWlhsS2FHSkhZMmxQYVVwVFZ<w...>xp5WkdFd2N5MHhTSFI2Y1d0SFRqRjBVbXhzTmsxeFpsVXdNelZoUTBFPSIsIkZvcm1hdCI6MSwiVmVyc2lvbiI6MX0="}</SPAN>

_**For information purposes only: NgcKeyReceiptContext // KEYRECEIPT_CONTEXT_PROPERTY**_

<SPAN style="color:orange">Group Policy indicates the user must enroll for a logon certificate along with their work PIN.  
Sid: S-1-5-21-1319392003xx1729563318-1608  
TenantId: 9dc61dbax-b4fd-490aa539f101  
Preparing to send a request to the Web Account Manager silently (no UI mode).  
Account provider ID: https://login.windows.net  
<mark>Scope: winhello_cert</mark>  
Client ID: dd762716-544d-4aeb-a526-687b73838a22  
Authority: https://sts.tailspintoys.com:443/adfs  
<mark>Resource: urn:microsoft:winhello:cert:prov:server</mark>  
Added following properties to the Web Account Manager access token request.  
Properties:  
<mark>certificateUsage : winhello_cert</mark>  
krctx : eyJEYXRhIjoiWlhsS2FHSkhZMmxQYVVwVFZYcEpNVT<...>x1hdCI6MSwiVmVyc2lvbiI6MX0=  
resource : urn:microsoft:winhello:cert:prov:server  
authority : https://sts.tailspintoys.com:443/adfs</SPAN>

<SPAN style="color:green">Windows Hello key registration completed successfully.</SPAN>  
<SPAN style="color:blue">WamExtension process token operation completed successfully</SPAN>

---

# Step D / E / F / G

Certificate request  
Most of these operations are performed on the ADFS and Certificate Authority (CA) servers.  
You can check the attribute on AAD and AD: [MsDs-KeyCredentialslLink attribute](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/429678/MsDs-KeyCredentialslLink-attribute).

---

# You can see this error 0xcaa20002

<SPAN style="color:red">_Unable to get a token using the Web Account Manager. Error: Unknown HResult Error code: 0xcaa20002  
Request status code: 5 (WebTokenRequestStatus_ProviderError)  
Token provider error code: 0xCAA20002  
Token provider error message: MSIS9711: Unable to create windows hello certificate. Unable to find a NGC Key which has the same public key as the certificate request. The CSR should be created using a registered NGC key._</SPAN>

The following is the enrollment behavior prior to Windows Server 2016 update KB4088889 (14393.2155)

The minimum time needed to synchronize the user's public key from Azure Active Directory (AD) to the on-premises Active Directory is 30 minutes. The Azure AD Connect scheduler controls the synchronization interval. This synchronization latency delays the user's ability to authenticate and use on-premises resources until the user's public key has synchronized to Active Directory. Once synchronized, the user can authenticate and use on-premises resources. Read [Azure AD Connect sync: Scheduler](https://learn.microsoft.com/azure/active-directory/hybrid/how-to-connect-sync-feature-scheduler) to view and adjust the synchronization cycle for your organization.

<u>**Note**</u>:

Windows Server 2016 update KB4088889 (14393.2155) provides synchronous certificate enrollment during hybrid certificate trust provisioning. With this update, users no longer need to wait for Azure AD Connect to sync their public key on-premises. Users enroll their certificate during provisioning and can use the certificate for sign-in immediately after completing the provisioning. The update needs to be installed on the federation servers.

From [here](https://docs.microsoft.com/windows/security/identity-protection/hello-for-business/hello-hybrid-cert-whfb-provision).

**Flow with KB4088889**

![image.png](/.attachments/image-5a878a16-bdc7-4a9f-b95c-1066ea09f5bd.png)

In some scenarios, ADFS does a fallback to the NGC key lookup, and it fails due to a lack of writeback of the user's NGC key to Active Directory Domain Services (ADDS). The fallback occurs if either no Key Receipt is received or that key receipt verification failed, which means ADFS failed the Key Receipt Certificate download. The loading of the Key Receipt Certificate occurs at service start and then periodically (approximately every 6 hours).

**Example:**

![image.png](/.attachments/image-bd42bafe-70ca-4be9-b89e-8c59f7f9fc3c.png)

## How to validate this in ADFS?

Check the DRS Admin Logs event log from ADFS. Search for the **Event 3035**, which indicates if it was successful. If downloading fails, you should get **Event 3037**, which will contain an exception explaining why the call failed. Additionally, you may get **Event 3036**.

## Dsregcmd output

```
User State

NgcSet : YES
NgcKeyId : {32785EAE-699E-49E6-A1E8-5BF1F9E2FC02} 
CanReset : DestructiveAndNonDestructive 
WorkplaceJoined : NO 
WamDefaultSet : YES 
WamDefaultAuthority : organizations 
WamDefaultId : https://login.microsoft.com 
WamDefaultGUID : {B16898C6-A148-4967-9171-64D755DA8520} (AzureAd)
```

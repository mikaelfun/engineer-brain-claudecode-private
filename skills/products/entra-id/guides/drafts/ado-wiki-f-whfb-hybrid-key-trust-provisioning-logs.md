---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking at logs/Hybrid Key Trust/Provisioning (Fast track)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20at%20logs%2FHybrid%20Key%20Trust%2FProvisioning%20%28Fast%20track%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430670&Instance=430670&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430670&Instance=430670&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a step-by-step guide for requesting an access token from Azure Device Registration Service (DRS), enrolling biometrics, registering a Windows Hello key, and synchronizing the key with Azure Active Directory (AAD) and on-premises Active Directory (AD). 

<SPAN style="color:red">_**All domain names, tenant names, user account IDs and associated GUIDS used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments.**_</SPAN>

[[_TOC_]]

**TIPS** : You can filter "Microsoft-Windows-HelloForBusiness/Operational" event log using task category elements. 

All events present in <SPAN style="color:green">Microsoft-Windows-HelloForBusiness/Operational</SPAN> are in <SPAN style="color:green">green</SPAN> color.

All events present in<SPAN style="color:blue">Microsoft-Windows-AAD/Analytic</SPAN> are in <SPAN style="color:blue">blue </SPAN> color.   

All events present in <SPAN style="color:purple">Microsoft-Windows-User Device Registration/Admin</SPAN> are in <SPAN style="color:purple">purple</SPAN> color. 

## Step A "request access token from Azure DRS" 

here are the most interesting event ids that can be used in a filter: 

<SPAN style="color:green">Microsoft-Windows-HelloForBusiness/Operational  
3045,8525</SPAN> 

<SPAN style="color:blue">Microsoft-Windows-AAD/Analytic   
1144,1015,1031,1099,1108</SPAN>  

<SPAN style="color:purple">Microsoft-Windows-User Device Registration/Admin   
323,367,368,325</SPAN>  

---
Verification about the account and domain type against Entra ID (AAD) and get an access token  

<SPAN style="color:blue">**Id 1144**  
```Realm discovery``` for: paul@whfbHKT.contoso.com authority: https://login.microsoftonline.com fallback domain hint: whfbHKT.contoso.com useUpn: 0</SPAN>     

<SPAN style="color:blue">**Id 1015**  
AadCloudAPPlugin ```Realm discovery response```: {"ver":"1.0","account_type":"Managed","domain_name":"whfbhkt.contoso.com","cloud_instance_name":"microsoftonline.com","cloud_audience_urn":"urn:federation:MicrosoftOnline"}. 
Request status: 200</SPAN>    

<SPAN style="color:blue">**Id 1031**   
AadCloudAPPlugin encrypted OAuth response received</SPAN>  

<SPAN style="color:green">**Id 3045**   
```Windows Hello processing started.```   
Scenario type: Enrollment</SPAN>   

<SPAN style="color:blue">**Id 1213**  
WamExtension process token operation started</SPAN> 

<SPAN style="color:purple">**Id 323**  
```Preparing to send a request to the Web Account Manager.```  
Account provider ID: https://login.windows.net  
Scope:   
Client ID: dd762716-544d-4aeb-a526-687b73838a22  
Authority: https://login.microsoftonline.com/common  
Resource: urn:ms-drs:enterpriseregistration.windows.net  
CorrelationId: {D37F9960-321C-4F88-AC59-3D17BECC3CF6</SPAN>  

<SPAN style="color:purple">**Id 367**  
```Added following properties to the Web Account Manager access token request.```    
Properties:    
amr_values : ngcmfa   
ftcid : {D37F9960-321C-4F88-AC59-3D17BECC3CF6}   
correlationId : {D37F9960-321C-4F88-AC59-3D17BECC3CF6}   
resource : urn:ms-drs:enterpriseregistration.windows.net   
prompt : no_select   
authority : https://login.microsoftonline.com/common</SPAN>   
 
<SPAN style="color:blue">**Id 1099**  
Code: 0x4AA90010 ```Sending web request```  
Sending request to https://login.microsoftonline.com/common/oauth2/token  
Logged at oauthtokenrequestbase.cpp, line: 213, method: OAuthTokenRequestBase::SendRequest.    
Request: authority: https://login.microsoftonline.com/common, client: dd762716-544d-4aeb-a526-687b73838a22, redirect URI: ms-appx-web://Microsoft.AAD.BrokerPlugin/dd762716-544d-4aeb-a526-687b73838a22, resource: urn:ms-drs:enterpriseregistration.windows.net, correlation ID (request): d37f9960-321c-4f88-ac59-3d17becc3cf6</SPAN> 

The following is an expected error here as the request needs to honor an MFA request:  

<SPAN style="color:blue">**Id 1108**  
Error: 0xCAA2000C The request requires user interaction.  
Code: interaction_required   
Description: AADSTS50076: Due to a configuration change made by your administrator, or because you moved to a new location, ```you must use multi-factor authentication to access '01cb2876-7ebd-4aa4-9cc9-d28bd4d359a9'.```</SPAN>   

<SPAN style="color:blue">**Id 1099**  
Code: 0x4AA90011 UI flow started.  
StartUI Url: https://login.microsoftonline.com/common/oauth2/authorize?response_type=code&client_id=dd762716-544d-4aeb-a526-687b73838a22&redirect_uri=ms-appx-web://Microsoft.AAD.BrokerPlugin/dd762716-544d-4aeb-a526-687b73838a22&resource=urn:ms-drs:enterpriseregistration.windows.net&add_account=multiple&login_hint=paul@whfbHKT.contoso.com&response_mode=form_post&```amr_values=ngcmfa```&ftcid={D37F9960-321C-4F88-AC59-3D17BECC3CF6}&windows_api_version=2.0   
Headers: client-request-id:d37f9960-321c-4f88-ac59-3d17becc3cf6 
returnclient-request-id:true 
tb-aad-env-id:10.0.18362.752 
tb-aad-device-family:3 
. Secure Header is sent 
Logged at webuitokenrequest.cpp, line: 245, method: WebUITokenRequest::StartUI.</SPAN>  
 
<SPAN style="color:blue">Code: 0x4AA90057 Starting UI navigation.   
Starting navigation to https://login.microsoftonline.com/common/oauth2/authorize 
Logged at webuicontrollerwebview.cpp, line: 265, method: WebUIControllerWebView::OnNavigationStarting. 
Request: authority: https://login.microsoftonline.com/common, client: dd762716-544d-4aeb-a526-687b73838a22, redirect URI: ms-appx-web://Microsoft.AAD.BrokerPlugin/dd762716-544d-4aeb-a526-687b73838a22, resource: urn:ms-drs:enterpriseregistration.windows.net, correlation ID (request): d37f9960-321c-4f88-ac59-3d17becc3cf6</SPAN>     

<SPAN style="color:blue">Code: 0x4AA9000F Sending request completed successfully
Logged at oauthtokenrequestbase.cpp, line: 407, method: OAuthTokenRequestBase::ProcessOAuthResponse.</SPAN>    
   
Code: 0x4AA9000B Change authorization code on token completed successfully    
   
<SPAN style="color:blue">Code: 0x4AA90011 UI flow started.      
StartUI Url: paulhttps://login.microsoftonline.com/common/oauth2/authorize?response_type=code&client_id=29d9ed98-a469-4536-ade2-f981bc1d605e&redirect_uri=ms-appx-web://Microsoft.AAD.BrokerPlugin/DRS&resource=urn:aad:tb:update:prt&add_account=noheadsup&scope=openid&login_hint=@whfbHKT.contoso.com&response_mode=form_post&windows_api_version=2.0    
Headers: client-request-id:d37f9960-321c-4f88-ac59-3d17becc3cf6   
return-client-request-id:true   
tb-aad-env-id:10.0.18362.752   
tb-aad-device-family:3   
. Secure Header is not sent   
Logged at webuitokenrequest.cpp, line: 250, method: WebUITokenRequest::StartUI.</SPAN>    

<SPAN style="color:blue">Code: 0x4AA9003C Redeeming device registration auth code on access token succeeded.  
Code: 0x4AA50050 Update user data start.  
```Code: 0x4AA9000A Access token was renewed by refresh token```  
Code: 0x4AA50051 Update user data succeeded.
Code: 0x4AA9000E UI Flow is completed</SPAN>

<SPAN style="color:blue">Code: 0x4AA50013 ```Writing to file succeeded.```  
File name:   'C:\Users\paul\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\LocalState\u_g76mo10b73o3unf20tp2ki4e\c_m2novo3260vmramnve9aglul\a_k0d3p7ef9etr0bab3ndnhosd.pwd',</SPAN> 

Use access token and get refresh token:  

<SPAN style="color:blue">AadCloudAPPlugin RefreshToken Start   
AadCloudAPPlugin encrypted OAuth response received</SPAN> 

<SPAN style="color:purple">**Id 368**  
```The following token properties were recieved from the Web Account Manager:```  
Properties: ipaddr : 167.220.xx.xx  
amr : ["pwd","rsa","ngcmfa","mfa"]  
UPN : paul@whfbHKT.contoso.com  
tid : 39b3592xxxx  
DisplayName : Paul Borg  
nbf : 1589383164  
IsDefaultPicture : True  
ver : 1.0  
family_name : Borg 
TenantId : 39b35923-xxxx  
sub : j_khRIi_9T1vBEhmxxxx  
PasswordChangeUrl : https://portal.microsoftonline.com/ChangePassword.aspx  
TokenExpiresOn : 13233857663  
FirstName : Paul  
OID : 3c3b976e-xxxx  
pwd_url : https://portal.microsoftonline.com/ChangePassword.aspx  
onprem_sid : S-1-5-21-498230862-2xxxx  
Authority : https://login.microsoftonline.com/common  
exp : 1589384064  
SignInName : paul@whfbHKT.contoso.com  
given_name : Paul  
onprem_sam_account_name : paul  
iss : https://sts.windows.net/39b35923-4cbe-4adb-8ab2-24c70b83f77c/ 
iat : 1589383164  
aud : dd762716-544d-xxx  
UserName : paul@whfbHKT.contoso.com  
correlationId : {D37F9960-321C-4F88-AC59-3D17BECC3CF6}  
name : Paul Borg  
domain_netbios_name : CONTOSO  
LastName : Borg  
UID : j_khRIi_9T1vBExx  
unique_name : paul@whfbHKT.contoso.com  
tenant_display_name : JoWHFB  
tenant_region_scope : EU  
domain_dns_name : CONTOSO.com</SPAN>   

<SPAN style="color:purple">**Id 325**   
```Successfully obtained a token for the current user via token broker.```</SPAN>    

<SPAN style="color:green">**Id 8525**  
```AD/Azure AD plugin request completed successfully.```</SPAN>     

Azure Active Directory validates the access token request and the MFA claim associated with it, creates an ADRS access token, and returns it to the application.   

---
## Step B "enroll biometrics"

After receiving a ADRS access token, the application detects if the device has a Windows Hello biometric compatible sensor.    
If the application detects a biometric sensor, it gives the user the choice to enroll biometrics.    
After completing or skipping biometric enrollment, the application requires the user to create a PIN and the default (and fall-back gesture when used with biometrics). The user provides and confirms their PIN.    
Next, the application requests a Windows Hello for Business key pair from the key pre-generation pool, which includes attestation data. This is the user key (ukpub/ukpriv). 

<SPAN style="color:green">Windows Hello key creation started.</SPAN>  

<SPAN style="color:purple">The NGC container was successfully created. 
User SID: S-1-5-21-498230862-2924710955-1205587603-1119  
IDP domain: login.windows.net  
Tenant domain: 39b35923-4cbe-4adb-8ab2-24c70b83f77c  
Flags: 0</SPAN>  

<SPAN style="color:green">Windows Hello set a certificate property on a Windows Hello key.   
Key name: S-1-5-21-498230862-2924710955-1205587603-1119/27456e01-2f54-4324-b3ee-6d507a86bc7b/login.windows.net/39b35923-4cbe-4adb-8ab2-24c70b83f77c/paul@whfbHKT.contoso.com   
**Certificate type: Self-signed**</SPAN>   

<SPAN style="color:purple">The NGC user ID key was successfully created.  
User SID: S-1-5-21-498230862-2924710955-1205587603-1119  
IDP domain: login.windows.net  
Tenant domain: 39b35923-4cbe-4adb-8ab2-24c70b83f77c  
User ID: paul@whfbHKT.contoso.com  
Flags: 74</SPAN>   

<SPAN style="color:green">Windows Hello key creation completed successfully.</SPAN> 

---
## Step C 

The application sends the ADRS token, ukpub, attestation data, and device information to ADRS for user key registration. Azure DRS validates the MFA claim remains current. On successful validation, Azure DRS locates the user's object in Azure Active Directory, writes the key information to a multi-values attribute. The key information includes a reference to the device from which it was created. Azure Active Directory returns a key ID to the application which signals the end of user provisioning and the application exits. 
 
<SPAN style="color:green">Windows Hello key registration started.</SPAN>  

<SPAN style="color:purple">The NGC key registration request was successfully sent.   
User email: paul@whfbHKT.contoso.com.  
The Microsoft Passport key information was successfully saved.    
Key ID: b30d416a-73eb-4537-a72f-33d86b56fa8e  
Attestation level: 1  
AIK status: 0  
Key type: 0  
Key name: S-1-5-21-498230862-2924710955-1205587603-1119/27456e01-2f54-4324-b3ee-6d507a86bc7b/login.windows.net/39b35923-4cbe-4adb-8ab2-24c70b83f77c/paul@whfbHKT.contoso.com  
IDP domain: login.windows.net  
Tenant ID: 39b35923-4cbe-4adb-8ab2-24c70b83f77c  
User email: paul@whfbHKT.contoso.com
The Microsoft Passport key was successfully registered with Azure AD.  
Key ID: {b30d416a-73eb-4537-a72f-33d86b56fa8e}  
UPN: paul@whfbHKT.contoso.com  
Attestation: ATT_SOFT  
Client request ID: 00000000-0000-0000-0000-000000000000  
Server request ID: bc9f548d-9d8f-48b5-9333-ac077b4fe61d  
Server response: {"kid":"b30d416a-73eb-4537-a72f-33d86b56fa8e","upn":"paul@whfbHKT.contoso.com","krctx":"eyJEYXRhIjoiWlh-----V2Q0VW1wc00yOUJZakZ1VG1WV1V6TkIiLCJGb3JtYXQiOjEsIlZlcnNpb24iOjF9"}</SPAN>  

for information purposes only: NgcKeyReceiptContext // KEYRECEIPT_CONTEXT_PROPERTY 

<SPAN style="color:green">Windows Hello key registration completed successfully.  
Windows Hello processing completed successfully. </SPAN>  
 
---
## Step D 

Azure AD Connect requests updates on its next synchronization cycle. Azure Active Directory sends the user's public key that was securely registered through provisioning. AAD Connect receives the public key and writes it to user's msDS-KeyCredentialLink attribute in Active Directory.   
The newly provisioned user will not be able to sign in using Windows Hello for Business until Azure AD Connect successfully synchronizes the public key to the on-premises Active Directory. 
 
You can check the attribute on AAD and AD:  **MsDs-KeyCredentialslLink** attribute 

Dsregcmd output 


```
+------------+   
| User State  |   
+------------+ 
NgcSet : YES  
NgcKeyId : {0B027195-C6FD-4243-9BFD-2611C032CD95}  
CanReset : NO  
WorkplaceJoined : NO  
WamDefaultSet : YES  
WamDefaultAuthority : organizations 
WamDefaultId : https://login.microsoft.com  
WamDefaultGUID : {B16898C6-A148-4967-9171-64D755DA8520} (AzureAd)
```

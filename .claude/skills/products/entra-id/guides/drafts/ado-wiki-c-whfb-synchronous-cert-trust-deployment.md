---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking for known solutions | tips/Hybrid Certificated Trust/Issue with Synchronous Certificate Trust deployment"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/830065"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/830065&Instance=830065&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/830065&Instance=830065&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article addresses the issue of synchronous certificate trust deployment failure, particularly focusing on the replication of the msDS-KeyCredentialLink to Active Directory (AD). It provides detailed troubleshooting steps and solutions, including the importance of ensuring proper TLS configuration and network connectivity.

[[_TOC_]]

# Problem statement

Synchronous certificate trust deployment is failing. The certificate is only issued by Active Directory Federation Services (ADFS) once the msDS-KeyCredentialLink is replicated back to Active Directory (AD).

---

# Known issue already fixed in March 2018

Essentially the issue highlighted here:

****************************  
_Unable to get a token using the Web Account Manager. Error: Unknown HResult Error code: 0xcaa20002  
Request status code: 5 (WebTokenRequestStatus_ProviderError)  
Token provider error code: 0xCAA20002  
Token provider error message: MSIS9711: Unable to create Windows Hello certificate. Unable to find a NGC Key which has the same public key as the certificate request. The CSR should be created using a registered NGC key._

The following is the enrollment behavior prior to Windows Server 2016 update KB4088889 (14393.2155). The minimum time needed to synchronize the user's public key from Azure Active Directory (Azure AD) to the on-premises Active Directory is 30 minutes. The Azure AD Connect scheduler controls the synchronization interval. This synchronization latency delays the user's ability to authenticate and use on-premises resources until the user's public key has synchronized to Active Directory. Once synchronized, the user can authenticate and use on-premises resources. Read [Azure AD Connect sync: Scheduler](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-sync-feature-scheduler) to view and adjust the synchronization cycle for your organization.

 Note:  
Windows Server 2016 update KB4088889 (14393.2155) provides synchronous certificate enrollment during hybrid certificate trust provisioning. With this update, users no longer need to wait for Azure AD Connect to sync their public key on-premises. Users enroll their certificate during provisioning and can use the certificate for sign-in immediately after completing the provisioning. The update needs to be installed on the federation servers.

From:  
[Configure and enroll in Windows Hello for Business in hybrid certificate trust model](https://docs.microsoft.com/windows/security/identity-protection/hello-for-business/hello-hybrid-cert-whfb-provision)  
[Provisioning (Fast track)](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430200/Provisioning-(Fast-track)?anchor=you-can-see-this-error-0xcaa20002)

The expected flow starting with Windows Server 2016 update KB4088889:

![Expected Flow Diagram](/.attachments/image-d3f3ad15-21be-40d0-8d2c-5244f13a159b.png)

****************************  

# Does the problem still exist?

However, we are running build 14393.5127, which is Server 2016 with the May 2022 OOB update, so we shouldnt be seeing this issue.

Does anyone have good knowledge of synchronous certificate deployment and can help us parse through the data we have and define an action plan? How is synchronous certificate trust deployment supposed to work?

Basic but important question:  
Does ADFS can reach something similar to https://enterpriseregistration.windows.net/tenant/enrollmentserver?

Did you see a krctx sent from Azure AD to the client?  
Yes, I see krctx is sent back from Azure AD in response to the request to DRS.

// Sending Access Token to DRS

```
[Microsoft-Windows-User Device Registration/Debug] WinHttpRequest::SendRequest: Request header(s): User-Agent: Dsreg/10.0 (Windows 10.0.19042.2130)  
18246 ocp-adrs-client-name: Dsreg  
18247 ocp-adrs-client-version: 10.0.19041.2075  
18248 Accept: application/json  
18249 return-client-request-id: true  
18250 client-request-Id: 00000000-0000-0000-0000-000000000000  
18251 Authorization: Bearer eyJ0eXAiOiJxxx...  
{  
  "typ": "JWT",  
  "alg": "RS256",  
  "x5t": "xx",
  "kid": "x"
}.{
  "aud": "urn:ms-drs:enterpriseregistration.windows.net",
  "iss": "https://sts.windows.net/74e42689-984b-4caa-a3c6-03c3f6a91882/",
-   
"amr": [
    "pwd",
    "rsa",
    "ngcmfa",
    "mfa"
  ],
  "appid": "dd762716-544d-4aeb-a526-687b73838a22",
  "appidacr": "0",
  "deviceid": "bdxxxxx07",
  --
  "in_corp": "true",
  "ipaddr": "x.x.X.X",
  "name": "User A",
  "-
  "onprem_sid": "S-1-5-21-4----19",
  -
  -
  "scp": "adrs_access Device.Join Device.Register Device.UploadAIK",
  -
  -
  -
  "unique_name": UPN1@domain.com,
  "upn": UPN1@domain.com,
  -
[Microsoft-Windows-User Device Registration/Debug] WinHttpRequest::SendRequest: Using WinHTTP to detect proxy. 
[Microsoft-Windows-User Device Registration/Admin] The NGC key registration request was successfully sent. User email: UPN1@domain.com.
[Microsoft.CAndE.ADFabric.CDJ] [NGCRegisterKeyEvent] returnCode=0
[Microsoft-Windows-User Device Registration/Debug] NgcRegController::NgcRegisterKey - hr: 0x00000000 
```

// Response from DRS
```
[Microsoft-Windows-User Device Registration/Debug] NgcRegController::AsyncNgcRegResponseCallback started 
[Microsoft-Windows-User Device Registration/Debug] NgcHttpRequest::GetResponse: Getting the http response body. 
[Microsoft-Windows-User Device Registration/Debug] NgcResponseParser::Parse: NgcResponseParser::Parse: response body: {"kid":"f158xxx","upn":UPN1@domain.com,  
--->>>>>> "krctx":"eyJEYXRhIjoi...0="} <<<<-----  
{
"Data":"ZXlKaG...nc=",
```

Do you see the cert req on the client?  
Did you see the same Key Receipt Context sent to ADFS?  

Yes, I see the client is sending the same krctx in the cert request.

// NGC Cert Request starts
```
[Microsoft-Windows-User Device Registration/Debug] NgcRegRT::ShouldEnrollNgcLogonCertificate started   
[Microsoft-Windows-User Device Registration/Admin] Group Policy indicates the user must enroll for a logon certificate along with their work PIN. 
18733 Sid: S-1-5-21-4xxxxx3119 
18734 TenantId: 7xxxxx2 
[Microsoft-Windows-User Device Registration/Debug] Group Policy indicates a logon certificate is required 
[Microsoft-Windows-User Device Registration/Debug] NgcRegRT::EnrollNgcLogonCertificate started 
[Microsoft-Windows-User Device Registration/Debug] NgcStatusStorage::UpdateNgcCertEnrollStatistics: Updated NGC cert enrollment statistics. lastCertEnrollResult = 0x00000001. 
[Microsoft-Windows-User Device Registration/Debug] NgcStatusStorage::UpdateNgcCertEnrollStatistics - hr: 0x00000000 
```
// Prepare request
```
[Microsoft-Windows-User Device Registration/Debug] Logger::WriteRequestTokenSilentlyStartEvent: accountProviderId: https://login.windows.net, scope: winhello_cert, clientid: dd762716-544d-4aeb-a526-687b73838a22, authority: https://sts.contoso.com:443/adfs, resource: urn:microsoft:winhello:cert:prov:server, correlationId: {-} 
[Microsoft-Windows-User Device Registration/Admin] Preparing to send a request to the Web Account Manager silently (no UI mode). 
18819 Account provider ID: https://login.windows.net 
18820 Scope: winhello_cert 
18821 Client ID: - 
18822 Authority: https://sts.contoso.com:443/adfs 
18823 Resource: urn:microsoft:winhello:cert:prov:server 
18824 CorrelationId: {-} 
[Microsoft-Windows-User Device Registration/Debug] SendWamRequest: Calling Windows::Security::Authentication::Web::Core::IWebTokenRequestFactory::CreateWithPromptType.
18826 Provider = https://login.windows.net
18827 Scope = 
18828 Client ID = dd762716-544d-4aeb-a526-687b73838a22
18829 Promp type = 0 
[Microsoft-Windows-User Device Registration/Admin] Added following properties to the Web Account Manager access token request. 
18835 Properties: 
18836 certificateUsage : winhello_cert
18837 krctx : eyJEYXRhIjo...X0=
18838 ftcid : {-}
18839 correlationId : {-}
18840 resource : urn:microsoft:winhello:cert:prov:server
18841 authority : https://sts.contoso.com:443/adfs
``` 

// Here is the error returned
``` 
[Microsoft-Windows-User Device Registration/Debug] SendWamRequest: GetTokenSilentlyAsync failed to obtain a user token. WebTokenRequestStatus: 5 (WebTokenRequestStatus_ProviderError). Provider error code: 0xcaa20002. Provider error message: MSIS9711: Unable to create Windows Hello certificate. Unable to find a NGC Key which has the same public key as the certificate request. The CSR should be created using a registered NGC key. 
[Microsoft-Windows-User Device Registration/Debug] Logger::WriteRequestTokenFailureEvent: webTokenRequestStatus: 5, webTokenRequestStatusName: WebTokenRequestStatus_ProviderError, errorCode: -895352830, errorMsg: MSIS9711: Unable to create Windows Hello certificate. Unable to find a NGC Key which has the same public key as the certificate request. The CSR should be created using a registered NGC key., resultCode: 0xcaa20002, correlationId: {-} 
[Microsoft-Windows-User Device Registration/Admin] Unable to get a token using the Web Account Manager. Error: Unknown HResult Error code: 0xcaa20002 (0xcaa20002) 
22060 Request status code: 5 (WebTokenRequestStatus_ProviderError) 
22061 Token provider error code: 0xCAA20002 
22062 Token provider error message: MSIS9711: Unable to create Windows Hello certificate. Unable to find a NGC Key which has the same public key as the certificate request. The CSR should be created using a registered NGC key. 
22063 CorrelationId: {-}
[Microsoft-Windows-User Device Registration/Debug] SendWamRequest - hr: 0xcaa20002 
[Microsoft-Windows-User Device Registration/Debug] NgcRegRT::EnrollNgcLogonCertificate: EnrollNgcLogonCertificate: SendWamRequest failed with error code: 0xcaa20002. 
```  

On ADFS, do you see that key receipt validated?

It seems ADFS is trying to validate the Key Receipt from the Device Registration Service log of ADFS. However, the log stops as follows. (GetDeviceKeyFromKeyCredLink: keyVersion is 512)  

```  
Log Name:      Device Registration Service Tracing/Debug
Source:        Device Registration Service Tracing
Date:          10/26/2022 2:55:44 PM
Event ID:      2007
Task Category: None
Level:         Information
Keywords:      AD Store
User:          S-1-5-21-419-----1
Computer:      host.sts.contoso.com
Description:
ValidateKeyReceiptContext: Issuer public certs: 
```  
``` 
Log Name:      Device Registration Service Tracing/Debug
Source:        Device Registration Service Tracing
Date:          10/26/2022 2:55:44 PM
Event ID:      2034
Task Category: None
Level:         Verbose
Keywords:      Service Helper
User:          S-1-5-21-419-----1
Computer:      host.sts.contoso.com
Description:
GetDefaultNamingContext: Returning DefaultNamingContext DC=Domain,DC=contoso,DC=com
```  
```  
Log Name:      Device Registration Service Tracing/Debug
Source:        Device Registration Service Tracing
Date:          10/26/2022 2:55:44 PM
Event ID:      2007
Task Category: None
Level:         Information
Keywords:      AD Store
User:           S-1-5-21-419-----1
Computer:      host.sts.contoso.com
Description:
GetDeviceKeyFromKeyCredLink: keyVersion is 512
```  
After that, we can see the following error in the ADFS debug log.

```   
Log Name:      AD FS Tracing/Debug
Source:        AD FS Tracing
Date:          10/26/2022 2:55:44 PM
Event ID:      45
Task Category: None
Level:         Verbose
Keywords:      ADFSPolicyModel
User:           S-1-5-21-419-----1
Computer:      host.sts.contoso.com
Description:
              Constructed MSISAppliesTo: Uri 'microsoft:identityserver:urn:microsoft:winhello:cert:prov:server' from original value 'urn:microsoft:winhello:cert:prov:server'
```  
``` 
Log Name:      AD FS Tracing/Debug
Source:        AD FS Tracing
Date:          10/26/2022 2:55:44 PM
Event ID:      180
Task Category: None
Level:         Information
Keywords:      ADFSOAuth
User:           S-1-5-21-419-----1
Computer:      host.sts.contoso.com
Description:
  ENTER: ConvertPKCS10EncodedStringToObject
```  
```  
Log Name:      AD FS Tracing/Debug
Source:        AD FS Tracing
Date:          10/26/2022 2:55:44 PM
Event ID:      180
Task Category: None
Level:         Information
Keywords:      ADFSOAuth
User:           S-1-5-21-419-----1
Computer:      host.sts.contoso.com
Description:
    EXIT: ConvertPKCS10EncodedStringToObject
```
```
Log Name:      AD FS Tracing/Debug
Source:        AD FS Tracing
Date:          10/26/2022 2:55:44 PM
Event ID:      178
Task Category: None
Level:         Error
Keywords:      ADFSOAuth
User:           S-1-5-21-419-----1
Computer:      host.sts.contoso.com
Description:
An OAuth Win Hello Cert could not be issued: to client 'dd762716-544d-4aeb-a526-687b73838a22' for resource 'urn:microsoft:winhello:cert:prov:server'. 
The client IP is 'x.x.x.x' 
. The user is 'dom\USER' 
.The Exception encountered: 'Microsoft.IdentityServer.Web.Protocols.OAuth.Exceptions.OAuthInvalidRequestException: MSIS9469: Windows Hello --- 'dom\USER'  NGC - NGC -Microsoft.IdentityServer.Web.Protocols.OAuth.OAuthToken.OAuthTokenProtocolHandler.UpdateResponseForWinHelloCertRequest(OAuthJWTBearerRequestContext jwtBearerContext, OAuthAccessTokenResponseMessage responseMessage, SecurityTokenElement signOnTokenElement)
Microsoft.IdentityServer.Web.Protocols.OAuth.OAuthToken.OAuthTokenProtocolHandler.HandleJWTBearerAccessTokenRequest(OAuthJWTBearerRequestContext jwtBearerContext, SessionSecurityToken ssoSecurityToken)
Microsoft.IdentityServer.Web.Protocols.OAuth.OAuthToken.OAuthTokenProtocolHandler.ProcessJWTBearerRequest(OAuthJWTBearerRequestContext jwtBearerContext)
Microsoft.IdentityServer.Web.Protocols.OAuth.OAuthToken.OAuthTokenProtocolHandler.Process(ProtocolContext context)'
```

We also asked the customer to see if the ADFS server can access Azure ADs endpoint.

For the first command, it is because they did set PowerShell to use TLS1.2. I think the ADFS server should be able to access the necessary Azure ADs endpoint.

``` 
Invoke-WebRequest -uri 'https://enterpriseregistration.windows.net/microsoft.com/discover?api-version=1.7' -UseBasicParsing -Headers @{'Accept' = 'application/json'; 'ocp-adrs-client-name' = 'dsreg';
'ocp-adrs-client-version' = '10'}
Invoke-WebRequest : The underlying connection was closed: An unexpected error occurred on a send.
At line:1 char:1
+ Invoke-WebRequest -uri 'https://enterpriseregistration.windows.net/mi ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (System.Net.HttpWebRequest:HttpWebRequest) [Invoke-WebRequest], WebException
    + FullyQualifiedErrorId : WebCmdletWebResponseException,Microsoft.PowerShell.Commands.InvokeWebRequestCommand
```  
```  
Invoke-WebRequest -uri 'https://login.microsoftonline.com/common/oauth2' -UseBasicParsing
StatusCode        : 200
StatusDescription : OK
-
Headers           : {[Pragma, no-cache], [Strict-Transport-Security, max-age=31536000; includeSubDomains], [X-Content-Type-Options, nosniff], [Link, https://aadcdn.msauth.net; rel=preconnect;
crossorigin,https://aadcdn.msauth.net; rel=dns-prefetch,https://aadcdn.msftauth.net; rel=dns-prefetch]...}
```  
```  
Invoke-WebRequest -uri 'https://device.login.microsoftonline.com/common/oauth2' -UseBasicParsing
StatusCode        : 200
StatusDescription : OK
RawContent        : HTTP/1.1 200 OK
                    Pragma: no-cache
                    X-Content-Type-Options: nosniff
                    Link: https://aadcdn.msauth.net; rel=preconnect; crossorigin,https://aadcdn.msauth.net; rel=dns-prefetch,<https://aadcdn.msftaut...
```  

Also, from the ADFS server by using a browser, we can see all endpoints returning the expected result, which means the ADFS server is able to access those endpoints.

The error message indicates that ADFS did a fallback to NGC key lookup but failed due to the lack of writeback of the user's NGC key to Active Directory Domain Services (ADDS). The fallback occurs if either no Key Receipt is received (which does not seem to be the case here) or key receipt verification failed, which means the Key Receipt Certificate download failed.

The loading of the Key Receipt Certificate occurs at service start and then periodically (approximately every 6 hours). If you use PsExec, you can load the service account's certificate store and check if the public key of the Key Receipt is stored.

## Checking the DRS Admin Logs
Search for Event 3035, which indicates if a fetch was successful:
```
MessageId=3035
SymbolicName=KeyReceiptPublicCertDownloadSuccess
Language=English
Successfully downloaded Windows Hello key receipt public issuer certificates.
```
If downloading fails, you should get Event 3037, which will contain an exception explaining why the call failed (further down in the message details):
```
MessageId=3037
SymbolicName=KeyReceiptPublicCertDownloadFailed
Language=English
Failed to download Windows Hello key receipt public issuer certificates.
```
Additionally, you may get Event 3036 in the following format:
```
MessageId=3036
SymbolicName=KeyReceiptPublicCertDownloadFailed
Language=English
Failed to download Windows Hello key receipt public issuer certificates.
```
If this is Windows Server 2016, ensure that the .NET registry key for SchUseStrongCrypto is configured. If not, configure the key and reboot the system afterward.

## Example of Error Event from Customer's Logs
We identified a network issue preventing the ADFS server from downloading the key receipt certificate:
```
Log Name:      DRS/Admin
Source:        Device Registration Service
Event ID:      3037
Level:         Error
Keywords:      Device Registration Service
User:           S-1-5-21-419-----1
Computer:      host.sts.contoso.com
Description:
An error occurred while sending the web request. 
Exception details: 
ErrorMessage: 'Web ', 
Url: 'https://enterpriseregistration.windows.net/kimitest.com/enrollmentserver/contract?api-version=1.3', 
HttpHeaders: 'ocp-adrs-client-name: Microsoft.IdentityServer.ServiceHost
User-Agent: AD FS (6.2.9200.0)
Host: enterpriseregistration.windows.net

ServerResponse: '', 
InnerException: 'System.Net.WebException: -- ---> System.IO.IOException: -- ---> System.Net.Sockets.SocketException:-
-System.Net.Sockets.Socket.EndReceive(IAsyncResult asyncResult)
-System.Net.Sockets.NetworkStream.EndRead(IAsyncResult asyncResult)
-
-System.Net.TlsStream.EndWrite(IAsyncResult asyncResult)
-System.Net.ConnectStream.WriteHeadersCallback(IAsyncResult ar)
-
-System.Net.HttpWebRequest.EndGetResponse(IAsyncResult asyncResult)
-System.Threading.Tasks.TaskFactory`1.FromAsyncCoreLogic(IAsyncResult iar, Func`2 endFunction, Action`1 endAction, Task`1 promise, Boolean requiresSynchronization)
-
- System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()
-System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)
-Microsoft.DeviceRegistration.Utilities.AdrsRequest.<GetHttpResponseAsync>d__38.MoveNext()' ]
```
However, as mentioned, we asked the customer to use Invoke-WebRequest and Edge to check connectivity to https://enterpriseregistration.windows.net from the ADFS server. The ADFS server uses WinHTTP proxy to access this endpoint when downloading the key receipt certificate, so checking connectivity in the user context is not sufficient here.

The error translates to The connection was lost: An unexpected error occurred on a send, suggesting that the TLS configuration is inadequate, and we fail to create a TLS-secured connection.

## Solution
Note that in PowerShell, you manually set the TLS version to 1.2, but the service will inherit the system default. Therefore, for .NET on Windows Server 2016, you must ensure the "StrongCrypto" key is present.

After adding the following registry keys, the customer confirmed the issue is solved. The user is able to enroll in the Windows Hello for Business (WHfB) user certificate during WHfB provisioning:
```
----------------------
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\.NETFramework\v4.0.30319  
SchUseStrongCrypto  
REG_DWORD  
1  
 
HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\.NETFramework\v4.0.30319  
SchUseStrongCrypto  
REG_DWORD  
1  
----------------------
```

Do you recall the very first basic verification step? In order for ADFS to verify the key used in the certificate request, it needs to be able to access the https://enterpriseregistration.windows.net endpoint.

# Useful articles
- [Hybrid Azure AD joined Windows Hello for Business Certificate Trust Provisioning](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/hello-how-it-works-provisioning#hybrid-azure-ad-joined)
- [What is KDFv2 for AD FS?](https://learn.microsoft.com/windows-server/identity/ad-fs/operations/what-is-kdfv2)
- [3.2.5.3.1.3 Processing Details](https://learn.microsoft.com/openspecs/windows_protocols/ms-oidce/f629647a-4825-465b-80bb-32c7e9cec2c8)
- [3.1.5.1.4.3 Processing Details](https://learn.microsoft.com/openspecs/windows_protocols/ms-oapxbc/efeea2cb-563f-44b8-a678-64a315251563)
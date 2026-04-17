---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Deep Dives - Features explained/ADFS Azure MFA Adapter Technical Deep Dive"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-adfs
- cw.adfs features
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::

[**Tags**](/Tags): [comm-adfs](/Tags/comm%2Dadfs) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-ADFS](/Tags/AAD%2DADFS) [AAD-MFA](/Tags/AAD%2DMFA) [AzureAD](/Tags/AzureAD)                

[[_TOC_]]

## Overview


Azure MFA Adapter must be the most common ADFS MFA Adapter you and customers use. In this module, I will show you how Azure MFA Adapter works behind the scenes. 

Of course, it?s also important to know how to troubleshoot general ADFS MFA Adapter issues. I will show you the general troubleshooting methods and several common ADFS MFA Adapter issues we?ve came across before.

This module contains two sub-posts:

- [**ADFS Azure MFA Adapter Technical Deep Dive**](ADFS-Azure-MFA-Adapter-Technical-Deep-Dive.md)
- [ADFS Azure MFA Adapter Troubleshooting Guide](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/856043/ADFS-Azure-MFA-Adapter-Troubleshooting-Guide)


## Basic knowledge of Azure MFA Adapter

Since ADFS Server 2016, Azure MFA Adapter is built in to ADFS directly. No need to register manually like integrating with on-premises MFA Server Adapter.

Azure MFA (or custom MFA) Adapter is supported to be used for both **Primary authentication** and **Secondary authentication** since ADFS Server 2016. 

To configure Azure MFA Adapter and use it as primary/secondary authentication method, you can follow below main steps. 

1. Generate a new self-signed certificate on each ADFS server in the farm. 
2. Update the certificate to Azure AD MFA client Service Principal. 
3. Set Azure MFA for ADFS farm and import config data into ADFS Configuration DB.

Details about steps can also be found in public document here: https://docs.microsoft.com/windows-server/identity/ad-fs/operations/configure-ad-fs-and-azure-mfa#configure-the-ad-fs-servers. 



Below are the related commands we commonly use when configuring Azure MFA Adapter as primary/secondary authentication method:

Using the MGGrapgh module.

1. Install-Module Microsoft.Graph
1. Get-InstalledModule Microsoft.Graph
1. Set-Executionpolicy Unrestricted
1. Import-Module Microsoft.Graph.Authentication


```powershell

$certBase64 = New-AdfsAzureMfaTenantCertificate -TenantID "TenantID/TenantName" # Generate new self-signed cert for Azure MFA Adapter

Connect-MgGraph -Scopes 'Application.ReadWrite.All'
$servicePrincipalId = (Get-MgServicePrincipal -Filter "appid eq '981f26a1-7f43-403b-a875-f8b09b8cd720'").Id
$keyCredentials = (Get-MgServicePrincipal -Filter "appid eq '981f26a1-7f43-403b-a875-f8b09b8cd720'").KeyCredentials
$certX509 = [System.Security.Cryptography.X509Certificates.X509Certificate2]([System.Convert]::FromBase64String($certBase64))
$newKey = @(@{
    CustomKeyIdentifier = $null
    DisplayName = $certX509.Subject
    EndDateTime = $null
    Key = $certX509.GetRawCertData()
    KeyId = [guid]::NewGuid()
    StartDateTime = $null
    Type = "AsymmetricX509Cert"
    Usage = "Verify"
    AdditionalProperties = $null
})
$keyCredentials += $newKey
Update-MgServicePrincipal -ServicePrincipalId $servicePrincipalId -KeyCredentials $keyCredentials

Export-AdfsAuthenticationProviderConfigurationData -Name AzureMfaAuthentication -FilePath "path" #Export ADFS Azure MFA Adapter config data
```

## Azure MFA Adapter common workflows

Currently, when using Azure MFA Adapter for ADFS we support below four kinds of MFA methods:

- OneWaySMS

- TwoWayVoiceMobile

- PhoneAppOTP

- PhoneAppNotification

>**Note**: 
>- When using PhoneAppNotification (Microsoft Authenticator push notifications), number matching is supported (and enforced) on ADFS (2016 and later) if the update is installed. Reference [here](https://learn.microsoft.com/en-us/azure/active-directory/authentication/how-to-mfa-number-match#ad-fs-adapter). 
>- When using Azure MFA Adapter as primary MFA authentication method, we **only** support PhoneAppOTP (OTP Code).

Basically, ADFS Azure MFA Adapter is just a implementation of ADFS MFA Adapter interface (**IAuthenticationAdapter**, in namespace **Microsoft.IdentityServer.Web.Authentication.External**). You can learn how to build a custom MFA Adapter by following instructions [here](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/development/ad-fs-build-custom-auth-method).

By capturing Fiddler trace on ADFS server when performing MFA and investigate, we can know the workflows of Azure MFA Adapter and what Azure MFA Adapter does in the main functions. 

We group the workflows into two here, because the workflow for *TwoWayVoiceMobile & PhoneAppNotification* are almost same, also *OneWaySMS & PhoneAppOTP* are almost same. 



### Workflow 1 (TwoWayVoiceMobile, PhoneAppNotification)

![image01](/.attachments\AAD-Authentication\856031\ADFS_MFA_Adapter_Deep_Dive_image001.png)

1. User access Web App (claim-aware application) on web browser.

2. Because user hasn?t logged in, he/she is redirected to the ADFS for authentication. 

3. User enters credentials against ADFS login page. ADFS verifies user credential.

4. Azure MFA Adapter authenticates to AAD using the self-signed client certificate (we will explain more details for the cert later). AAD returns Access Token. 

   ![image01](/.attachments\AAD-Authentication\856031\ADFS_MFA_Adapter_Deep_Dive_image002.png)

5. Azure MFA Adapter makes calls to Azure MFA API (**GetAvailableUserAuthenticationMethods**) by appending the Access Token in HTTP authorization header. AAD returns the available MFA methods (1 default method + other available methods) for current user.

   *Request*:

   ```xml
   <GetAvailableAuthenticationMethodsRequest
	xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
	<Version>1</Version>
	<UserPrincipalName>testuser@contoso.com</UserPrincipalName>
	<ContextId>35f86a4d-f345-4e55-a8a6-c5de8fac9216</ContextId>
   </GetAvailableAuthenticationMethodsRequest>
   ```
   *Response*:
   ```xml
   <GetAvailableAuthenticationMethodsResponse
	xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
	<Version>1</Version>
	<Result>
		<Value>Success</Value>
		<Message i:nil="true"/>
		<Retry>false</Retry>
		<Error i:nil="true"/>
		<Exception i:nil="true"/>
		<RenewCert>false</RenewCert>
	</Result>
	<AuthenticationMethods>
		<AuthenticationMethod>
			<Id>OneWaySMS</Id>
			<IsDefault>false</IsDefault>
			<Properties
				xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
				<a:KeyValueOfstringstring>
					<a:Key>MobilePhone</a:Key>
					<a:Value>{phone number}</a:Value>
				</a:KeyValueOfstringstring>
			</Properties>
		</AuthenticationMethod>
		<AuthenticationMethod>
			<Id>TwoWayVoiceMobile</Id>
			<IsDefault>false</IsDefault>
			<Properties
				xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
				<a:KeyValueOfstringstring>
					<a:Key>MobilePhone</a:Key>
					<a:Value>{phone number}</a:Value>
				</a:KeyValueOfstringstring>
			</Properties>
		</AuthenticationMethod>
		<AuthenticationMethod>
			<Id>PhoneAppOTP</Id>
			<IsDefault>false</IsDefault>
			<Properties
				xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
				<a:KeyValueOfstringstring>
					<a:Key>StrongAuthenticationPhoneAppDetail</a:Key>
					<a:Value/>
				</a:KeyValueOfstringstring>
			</Properties>
		</AuthenticationMethod>
		<AuthenticationMethod>
			<Id>PhoneAppNotification</Id>
			<IsDefault>true</IsDefault>
			<Properties
				xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
				<a:KeyValueOfstringstring>
					<a:Key>StrongAuthenticationPhoneAppDetail</a:Key>
					<a:Value/>
				</a:KeyValueOfstringstring>
			</Properties>
		</AuthenticationMethod>
	</AuthenticationMethods>
	<CreateTimeSeconds>1627115245</CreateTimeSeconds>
	<UserPrincipalName>testuser@contoso.com</UserPrincipalName>
   </GetAvailableAuthenticationMethodsResponse>
   ```

6. Azure MFA Adapter makes calls to Azure MFA API (**BeginTwoWayAuthenticationRequest**) to begin MFA and return a HTML form fragment (contains Auth method + context, explain later) to user?s browser. Azure MFA API then makes Phone calls/sends Push notification to user?s phone. The "BeginTwoWayAuthentication" request and response are like below: 

   *Request*:
   ```xml
   <BeginTwoWayAuthenticationRequest
	xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
	<Version>1</Version>
	<UserPrincipalName>testuser@contoso.com</UserPrincipalName>
	<TenantId i:nil="true"/>
	<Lcid>en-US</Lcid>
	<AuthenticationMethodId>PhoneAppNotification</AuthenticationMethodId>
	<AuthenticationMethodProperties
		xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays"/>
		<AuthenticationPurpose i:nil="true"/>
		<ContextId>35f86a4d-f345-4e55-a8a6-c5de8fac9216</ContextId>
		<OtpRetryCount>0</OtpRetryCount>
		<SyncCall>false</SyncCall>
		<ReplicationScope i:nil="true"/>
		<ObjectId i:nil="true"/>
		<CompanyName i:nil="true"/>
	</BeginTwoWayAuthenticationRequest>
   ```
   *Response*:
   ```xml
   <BeginTwoWayAuthenticationResponse
	xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
	<Version>1</Version>
	<Result>
		<Value>Success</Value>
		<Message i:nil="true"/>
		<Retry>false</Retry>
		<Error i:nil="true"/>
		<Exception i:nil="true"/>
		<RenewCert>false</RenewCert>
	</Result>
	<SessionId>270867b8-6bac-434b-9a2a-cb682f461cbe</SessionId>
	<AuthenticationResult i:nil="true"/>
	<UserPrincipalName>testuser@contoso.com</UserPrincipalName>
	<AffinityUrl>https://adnotifications.windowsazure.com/StrongAuthenticationService.svc/Connector/EndTwoWayAuthentication?dc=KRS</AffinityUrl>
	<ValidEntropyNumber>0</ValidEntropyNumber>
   </BeginTwoWayAuthenticationResponse>
   ```

7. User receives the Phone call/Push notification and approves. Because this is a time-consuming operation, the JavaScript in user?s browser will regularly (every 5 seconds) send a hidden form post (Auth Method + context) back to ADFS, until ADFS successfully verifies MFA. 

8. Every time ADFS receives the hidden form post from user?s browser, Azure MFA Adapter makes call to Azure MFA API (**EndTwoWayAuthentication**) to verify if MFA has been completed. This process will repeat until time-out or Azure MFA API returns success/failure result. If the result is successful, Azure MFA Adapter will generate a claim like below to indicate user has performed MFA successfully with specific method. The "EndTwoWayAuthentication" request and response are as below:

   *Request*:
   ```xml
   <EndTwoWayAuthenticationRequest
	xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
	<Version>1</Version>
	<SessionId>270867b8-6bac-434b-9a2a-cb682f461cbe</SessionId>
	<ContextId>35f86a4d-f345-4e55-a8a6-c5de8fac9216</ContextId>
	<AdditionalAuthData i:nil="true"/>
	<UserPrincipalName>testuser@contoso.com</UserPrincipalName>
   </EndTwoWayAuthenticationRequest>
   ```
   *Response (Pending)*:
   ```xml
   <EndTwoWayAuthenticationResponse
	xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
	<Version>1</Version>
	<Result>
		<Value>AuthenticationPending</Value>
		<Message>The authentication has not been completed yet, please try again.</Message>
		<Retry>true</Retry>
		<Error i:nil="true"/>
		<Exception i:nil="true"/>
		<RenewCert>false</RenewCert>
	</Result>
	<AuthenticationResult i:nil="true"/>
	<LocationData i:nil="true"/>
	<CompletedInteractively>false</CompletedInteractively>
   </EndTwoWayAuthenticationResponse>
   ```
   *Response (Success)*:
   ```xml
   <EndTwoWayAuthenticationResponse
	xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
	<Version>1</Version>
	<Result>
		<Value>Success</Value>
		<Message i:nil="true"/>
		<Retry>false</Retry>
		<Error i:nil="true"/>
		<Exception i:nil="true"/>
		<RenewCert>false</RenewCert>
	</Result>
	<AuthenticationResult>true</AuthenticationResult>
	<LocationData i:nil="true"/>
	<CompletedInteractively>true</CompletedInteractively>
   </EndTwoWayAuthenticationResponse>
   ``` 

   *Claim name*: http://schemas.microsoft.com/ws/2008/06/identity/claims/authenticationmethod"

   *Value*: http://schemas.microsoft.com/ws/2012/12/authmethod/phoneappnotification (Note: This value is for phone app notification only, different MFA method has different values)

9. ADFS issues SAML token and redirects user back to web app. Once the token is verified successfully, Web App sets session cookies in browser and logs user in.



### Workflow 2 (OneWaySMS, PhoneAppOTP)

![image02](/.attachments\AAD-Authentication\856031\ADFS_MFA_Adapter_Deep_Dive_image003.png)

1. User access Web App (claim-aware application) on web browser.

2. Because user hasn?t logged in, he/she is redirected to the ADFS for authentication. 

3. User enters credentials against ADFS login page. ADFS verifies user credential.

4. Azure MFA Adapter authenticates to AAD using the self-signed client certificate. AAD returns Access Token. 

5. Azure MFA Adapter makes calls to Azure MFA API (**GetAvailableUserAuthenticationMethods**) by appending the Access Token in HTTP authorization header. AAD returns the available MFA methods for current user to ADFS.

6. Azure MFA Adapter makes calls to Azure MFA API (**BeginTwoWayAuthenticationRequest**) to begin MFA and return a HTML form fragment to user?s browser. Azure MFA API then sends SMS code/PhoneAppOTP to user?s phone. 

7. Here is the difference with first workflow. The JavaScript in user?s browser will send hidden form post (Auth Method + context) back to ADFS 1 second later (no repeat).

8. Once ADFS receives the hidden form post from user?s browser, Azure MFA Adapter will make call to Azure MFA API (**EndTwoWayAuthentication**) to check if SMS/PhoneAppOTP has been sent. 

9. User enters the received SMS Code/PhoneAppOTP code into user?s browser. The code will then be sent to ADFS along with a new set of Auth Method + Context in a form post HTTP request.

10. Azure MFA Adapter will make another call to Azure MFA API (**EndTwoWayAuthentication**) to check if MFA has been completed. If the result is successful, Azure MFA Adapter will generate a claim to indicate user has performed MFA successfully with specific method.

11. ADFS issues SAML token and redirects user back to web app. Once the token is verified successfully, Web App sets session cookies in browser and logs user in.

>**Key points to note:**
>
>- No matter for which workflow, Azure MFA Adapter itself needs to authenticate against AAD to get Access Token which later is used to call Azure MFA API. The Access Token is valid for 1 hour so the authentication will not happen again within Access Token?s valid period. The authentication flow used here is called "**OAuth2 Client Credential flow**" via sending *ClientID*, *client_assertion* (signed by the self-signed cert) and other info to AAD to exchange for Access Token. More details about Oauth2 Client credential flow can be found here: https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow. 
>
>- Because ADFS is a stateless service, ADFS will save some MFA related data (like UPN, available MFA methods, MFA session ID, or whatever) in the returned HTML form fragment for later use. You can find such data (encoded) in ADFS?s response, which is called "**AuthMethod**" and "**Context**". The data will be returned to ADFS via a **hidden form post**, so user will not be able to see such data in browser UI. Of course, you can find such data easily via Fiddler or Browser developer tools. 
>
>   ![image03](/.attachments\AAD-Authentication\856031\ADFS_MFA_Adapter_Deep_Dive_image004.png)
>
>- The Cert used for authentication is a self-signed cert generated during Azure MFA Adapter configuration (like below). The cert is valid for 2 years and **will not be renewed automatically**. If this cert expires or somehow becomes invalid MFA will fail. We need to **manually** renew it via PowerShell cmdlets. We will cover more details regarding cert renew later. 
>
>   ![image04](/.attachments\AAD-Authentication\856031\ADFS_MFA_Adapter_Deep_Dive_image005.png)

## How to capture Fiddler trace

Two workflows we discussed above have different logics like the hidden form post, the EndTwoWayAuthentication calls, etc. The key to understand them is to test by using different MFA methods and **capture Fiddler trace** at both front-end (user?s browser side) and back-end (ADFS server side).

It?s easy to capture Fiddler trace at front-end so we won?t cover here. However, we need a bit more steps to capture Fiddler trace on ADFS side. Main steps as below:

1. Set proxy under admin context: `netsh winhttp set proxy 127.0.0.1:8888`

2. Re-login using ADFS service account, or runas CMD use ADFS Service Account. 

3. Launch Fiddler under Service Account context (configure HTTPs decryption if not configured).

4. (**Important**) Restart ADFS service. 

>**Note:** Once you remove proxy, you need to restart ADFS service again to make the change takes effect. 

If everything works fine, you should get ADFS server-side trace collected like below:

![image05](/.attachments\AAD-Authentication\856031\ADFS_MFA_Adapter_Deep_Dive_image006.png)


## Alternate login ID behavior for Azure MFA Adapter

- Alternate Login ID is **not used during AzureMFAPrimary authentication**,  
  AzureMFAPrimary will use the username input AS-IS to query EntraID to verify the user exists (got synced) and is enabled for OTP
  Only if the Entra-MFA finds the user by this name we can perform the OTP authentication and then lookup the user in AD DS for building the claims from the AD attribute store  

  If  the account lookup fails AzureMFAPrimary fails with the following error found in the ADFS Admin log:  
  ![image.png](/.attachments/image-d59c6e56-b7d5-461d-87cc-bb5522f98b7c.png)  
  in the  debug Event logs you should find an event like :  
  ![image.png](/.attachments/image-4712b67d-672c-4699-a825-920162f0092b.png)  
  **Note:**  
  The Status can be :  
  - **AccessDenied** :  The domain suffix of the user is registered in a different Tenant  
  - **InvalidArgument**: The domain suffix is not a verified/registered domain in Entra
  - **UserNotFound** :  The username is not found in the tenant
  

- **Server 2016**. Alternate Login ID is **only** supported if the **AltID** attribute (like "mail") is synced as **UPN** to AAD via AAD Connect.  
This means when you type AltID attribute like "mail" on ADFS login page, the "mail" instead of on-premise UPN will be submitted to Azure MFA Service API to perform MFA. 

   Issue will occur if the AltID attribute is not mapped with UPN on AAD side, you will notice below error message in ADFS debug logs:

   ![image019](/.attachments\AAD-Authentication\856031\ADFS_MFA_Adapter_Deep_Dive_image007.png)

> The exception is a referece to the fact we could not 
- **Server 2019 and 2022**. With the update of [KB5015880](https://support.microsoft.com/en-us/topic/july-21-2022-kb5015880-os-build-17763-3232-preview-1c984723-cdf0-4a24-9a4f-5df11d3024a1) (Server2019) and [KB5015879](https://support.microsoft.com/en-us/topic/july-19-2022-kb5015879-os-build-20348-859-preview-be3951fb-2229-48f7-971c-830745931979) (Server2022), we now have the ability to disable the  userlookup in AAD using the AltID value and mitigate above issue. This means customers can now sync the UPN but still be able to use AltID for logon and MFA.

   You can disable the alternate login ID as required. To configure the Azure MFA ADFS adapter to ignore an alternate login ID, run the following PowerShell command:

   ```powershell
   Set-AdfsAzureMfaTenant -TenantId '<TenandID>' -ClientId '981f26a1-7f43-403b-a875-f8b09b8cd720' -IgnoreAlternateLoginId $true.
   ```

   To restart the ADFS service on each server in the farm, use the `Restart-Service adfssrv` PowerShell command. 

   >**Note**: The adapter configuration will only ignore Alternate Login ID when **IgnoreAlternateLoginId** is explicitly set to **\$true** using the command above. If you do not set **IgnoreAlternateLoginId** or if you set it to **$false**, the default behavior occurs, which causes the adapter to use the Alternate Logon ID settings.
 
### When to use the "IgnoreAlternateLoginId" flag

For example, if the account has on-premise UPN `user1@contoso.com` and mail attribute `user1@contoso_mail.com`. Checkout below two scenarios:

1. `user1@contoso_mail.com` is synced as UPN to AAD via AAD Connect (This can be configured on AAD Connect Synchronize Wizard). In this scenario we should leave **IgnoreAlternateLoginId** as **$false**.

2. `user1@contoso.com` is synced as UPN to AAD via AAD Connect, but for convenience (or some other reasons) I still want to type `user1@contoso_mail.com` on ADFS login page. In such scenario we should explicitly set **IgnoreAlternateLoginId** to **$true** to ensure Azure MFA works properly.

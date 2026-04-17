---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking at logs/On-Premises Certificate Trust/Provisioning (Fast track)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20at%20logs%2FOn-Premises%20Certificate%20Trust%2FProvisioning%20%28Fast%20track%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430182&Instance=430182&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430182&Instance=430182&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a detailed guide on how to filter event logs and perform key steps in the Windows Hello for Business provisioning process. The steps include requesting an access token for Enterprise Device Registration Service (DRS), Hello provisioning, key creation, key registration, and certificate request. Each step is accompanied by relevant event log IDs and descriptions.

[[_TOC_]]

# Tips

You can filter the "Microsoft-Windows-HelloForBusiness/Operational" event log using task category elements.

- All events present in <SPAN style="color:green">**Microsoft-Windows-HelloForBusiness/Operational**</SPAN> are in <SPAN style="color:green">green</SPAN> color.
- All events present in <SPAN style="color:blue">**Microsoft-Windows-AAD/Analytic**</SPAN> are in <SPAN style="color:blue">blue</SPAN> color.
- All events present in <SPAN style="color:purple">**Microsoft-Windows-User Device Registration/Admin**</SPAN> are in <SPAN style="color:purple">purple</SPAN> color.

---

# Step A: Request access token for Enterprise DRS

<SPAN style="color:green">**Microsoft-Windows-HelloForBusiness/Operational**</SPAN>

- <SPAN style="color:green">**Id 8025**: Service start</SPAN>
  - <SPAN style="color:green">Windows Hello for Business prerequisites check started.</SPAN>
- <SPAN style="color:green">**Id 3054 + 8210**: Remote desktop</SPAN>
- <SPAN style="color:green">**Id 8201**: PRT (Primary Refresh Token from ADFS)</SPAN>
- <SPAN style="color:green">**Id 8200**: Device registration (DRS is ADFS here)</SPAN>
- <SPAN style="color:green">**Id 5204**: Certificate Enrollment Method</SPAN>
  - <SPAN style="color:green">Certificate Enrollment Method: RA (Registration Authority, ADFS)</SPAN>
  - <SPAN style="color:green">Certificate Required for On-Premise Auth: true</SPAN>
- <SPAN style="color:green">**Id 8202 + 8203 + 8204**: WHFB configuration</SPAN>
  - <SPAN style="color:green">WHFB enabled?</SPAN>
  - <SPAN style="color:green">Post-logon provisioning enabled?</SPAN>
  - <SPAN style="color:green">Hardware requirements met?</SPAN>
- <SPAN style="color:green">**Id 8206**: Localize a certificate RA (Registration Authority = ADFS)</SPAN>
- <SPAN style="color:green">**Id 8205**: Located a usable sign-on certificate template (WHFB Authentication template)</SPAN>

**Hello Provisioning**

<SPAN style="color:green">**Microsoft-Windows-HelloForBusiness/Operational**</SPAN>

- <SPAN style="color:green">**Id 3045**: Windows Hello processing started.</SPAN>
  - <SPAN style="color:green">Scenario type: Enrollment</SPAN>


<SPAN style="color:blue">**Microsoft-Windows-AAD/Analytic**</SPAN>

- <SPAN style="color:blue">**Id 1213**: WamExtension process token operation started</SPAN>
- <SPAN style="color:blue">**Id 1099**: Oauth request from Microsoft.AAD.BrokerPlugin to DRS</SPAN>
  - <SPAN style="color:blue">Sending request to `https://sts.jobesanc.mit.litware.com/adfs/oauth2/token`</SPAN>

<SPAN style="color:purple">**Microsoft-Windows-User Device Registration/Admin**</SPAN>

- <SPAN style="color:purple">**Id 323**: Preparing to send a request to the Web Account Manager.</SPAN>
  - <SPAN style="color:purple">Account provider ID: `https://login.windows.net`</SPAN>
  - <SPAN style="color:purple">Scope:</SPAN>
  - <SPAN style="color:purple">Client ID: `dd762716-544d-4aeb-a526-687b73838a22`</SPAN>
  - <SPAN style="color:purple">Authority: `https://sts.contoso.com/adfs/oauth2/authorize`</SPAN>
  - <SPAN style="color:purple">Resource: `urn:ms-drs:434DF4A9-3CF2-4C1D-917E-2CD2B72F515A`</SPAN>
  - <SPAN style="color:purple">CorrelationId: `{F3A50C1D-B08A-467E-83FF-FDD1D33E66D9}`</SPAN>

- <SPAN style="color:purple">**Id 367**: Added the following properties to the Web Account Manager access token request.</SPAN>
  - <SPAN style="color:purple">Properties:</SPAN>
    - <SPAN style="color:purple">amr_values: ngcmfa</SPAN>
    - <SPAN style="color:purple">ftcid: `{F3A50C1D-B08A-467E-83FF-FDD1D33E66D9}`</SPAN>
    - <SPAN style="color:purple">correlationId: `{F3A50C1D-B08A-467E-83FF-FDD1D33E66D9}`</SPAN>
    - <SPAN style="color:purple">resource: `urn:ms-drs:434DF4A9-3CF2-4C1D-917E-2CD2B72F515A`</SPAN>
    - <SPAN style="color:purple">prompt: no_select</SPAN>
    - <SPAN style="color:purple">authority: `https://sts.contoso.com/adfs/oauth2/authorize`</SPAN>

<SPAN style="color:blue">**Microsoft-Windows-AAD/Analytic**</SPAN>

- <SPAN style="color:blue">**UI flow started.**</SPAN>
  - <SPAN style="color:blue">StartUI Url: `https://sts.contoso.com/adfs/oauth2/authorize?response_type=code&client_id=dd762716-544d-4aeb-a526-687b73838a22&redirect_uri=ms-appx-web://Microsoft.AAD.BrokerPlugin/dd762716-544d-4aeb-a526-687b73838a22&resource=urn:ms-drs:434DF4A9-3CF2-4C1D-917E-2CD2B72F515A&add_account=multiple&login_hint=whfbopct1@contoso.com&response_mode=form_post&amr_values=ngcmfa&ftcid={F3A50C1D-B08A-467E-83FF-FDD1D33E66D9}&windows_api_version=2.0`</SPAN>
  - <SPAN style="color:blue">Starting UI navigation. (WebUIControllerWebView::OnNavigationStarting.)</SPAN>
  - <SPAN style="color:blue">Starting navigation to `ms-appx-web://microsoft.aad.brokerplugin/DRS`</SPAN>
  - <SPAN style="color:blue">Change authorization code on token completed successfully</SPAN>
  - <SPAN style="color:blue">UI Flow is completed</SPAN>

<SPAN style="color:purple">**Microsoft-Windows-User Device Registration/Admin**</SPAN>

- <SPAN style="color:purple">**Id 368**: The following token properties were received from the Web Account Manager:</SPAN>
  - <SPAN style="color:purple">Properties:</SPAN>
    - <SPAN style="color:purple">UPN: `whfbopct1@contoso.com`</SPAN>
    - <SPAN style="color:purple">sid: `S-1-5-21-2426993522-1213947244-2524399092-1108`</SPAN>
    - <SPAN style="color:purple">nbf: 1578664860</SPAN>
    - <SPAN style="color:purple">IsDefaultPicture: True</SPAN>
    - <SPAN style="color:purple">auth_time: 1578664846</SPAN>
    - <SPAN style="color:purple">TenantId: `383a388..`</SPAN>
    - <SPAN style="color:purple">sub: `FOuc5c.`</SPAN>
    - <SPAN style="color:purple">TokenExpiresOn: 13223138761</SPAN>
    - <SPAN style="color:purple">pwd_exp: 3551641</SPAN>
    - <SPAN style="color:purple">OID: `ADFOREST4\WHFBOPCT1`</SPAN>
    - <SPAN style="color:purple">Authority: `https://sts.contoso.com/adfs`</SPAN>
    - <SPAN style="color:purple">exp: 1578665160</SPAN>
    - <SPAN style="color:purple">SignInName: `whfbopct1@contoso.com`</SPAN>
    - <SPAN style="color:purple">mfa_auth_time: 1578664860</SPAN>
    - <SPAN style="color:purple">iss: `https://sts.contoso.com/adfs`</SPAN>
    - <SPAN style="color:purple">iat: 1578664860</SPAN>
    - <SPAN style="color:purple">aud: `dd762716..`</SPAN>
    - <SPAN style="color:purple">UserName: `whfbopct1@contoso.com`</SPAN>
    - <SPAN style="color:purple">correlationId: `{F3A50C1D-B08A-467E-83FF-FDD1D33E66D9}`</SPAN>
    - <SPAN style="color:purple">UID: `FOuc5c9M..`</SPAN>
    - <SPAN style="color:purple">unique_name: `ADFOREST4\WHFBOPCT1`</SPAN>

- <SPAN style="color:purple">**Id 325**: Successfully obtained a token for the current user via token broker.</SPAN>
  - <SPAN style="color:purple">CorrelationId: `{F3A50C1D-B08A-467E-83FF-FDD1D33E66D9}`</SPAN>

<SPAN style="color:blue">**Microsoft-Windows-AAD/Analytic**</SPAN>

- <SPAN style="color:blue">**Writing to file succeeded.**</SPAN>
  - <SPAN style="color:blue">File name: `'C:\Users\whfbopct1\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\LocalState\u_1smtm6r7etpiagt3mkfvhb5k\c_m2novo3260vmramnve9aglul\a_egetgfa014t5u7kttooqs2hv.pwd'`, Size: 3971 bytes</SPAN>
  - <SPAN style="color:blue">Logged at clientcache.cpp, line: 1052, method: ClientCache::SerializeToFile</SPAN>

- <SPAN style="color:blue">**Id 1121 + 1022 + 1154**: Token request/response with ADFS:</SPAN>
  - <SPAN style="color:blue">Enterprise STS RefreshToken</SPAN>
  - <SPAN style="color:blue">Password expiration claims</SPAN>

The on-premises STS server issues an enterprise DRS token on successful MFA.

---

# Step B: Key creation

<SPAN style="color:green">**Microsoft-Windows-HelloForBusiness/Operational**</SPAN>

- <SPAN style="color:green">**Id 8525**: AD/Azure AD plugin request completed successfully.</SPAN>
- <SPAN style="color:green">**Id 3611 / 6611**: Container deletion if it exists</SPAN>
  - <SPAN style="color:green">Windows Hello container deletion started.</SPAN>
  - <SPAN style="color:green">Windows Hello could not delete the container as no container currently exists for the user.</SPAN>
- <SPAN style="color:green">**Id 3055 + id 8055**: Then container creation</SPAN>
  - <SPAN style="color:green">Windows Hello container provisioning started.</SPAN>
  - <SPAN style="color:green">Windows Hello container provisioning completed successfully.</SPAN>
- <SPAN style="color:green">**Id 5555**: Windows Hello is validating that the device can satisfy all applicable policies.</SPAN>
  - <SPAN style="color:green">TPM Supported: Any TPM</SPAN>
  - <SPAN style="color:green">Hardware Policy: Hardware Preferred</SPAN>
  - <SPAN style="color:green">Exclude TPM 1.2: false</SPAN>
  - <SPAN style="color:green">TPM Version: TPM 2.0</SPAN>
  - <SPAN style="color:green">TPM FIPS: false</SPAN>
  - <SPAN style="color:green">TPM Locked Out: false</SPAN>
  - <SPAN style="color:green">Satisfactory Key Pregeneration Pool: true</SPAN>
  - <SPAN style="color:green">Key Storage Provider: hardware</SPAN>
  - <SPAN style="color:green">Result: 0x0</SPAN>
- <SPAN style="color:green">**Id 3225**: Starting Point</SPAN>
  - <SPAN style="color:green">Windows Hello key creation started.</SPAN>
- <SPAN style="color:green">**Id 3052**: The key pre-generation pool received a request for a new key.</SPAN>
- <SPAN style="color:green">**Id 8052**: The new key request from the key pre-generation pool completed successfully.</SPAN>
  - <SPAN style="color:green">Processing time: 0 seconds.</SPAN>
- <SPAN style="color:green">**Id 5225**: Creating a hardware Windows Hello key with result 0x0.</SPAN>

**Cert enrollment**

<SPAN style="color:green">**Microsoft-Windows-HelloForBusiness/Operational**</SPAN>

- <SPAN style="color:green">**Id 8067**: Windows Hello set a certificate property on a Windows Hello key.</SPAN>
  - <SPAN style="color:green">Key name: `S-1-5-21-2426993522-1213947244-2524399092-1108/5e6dadbc-f50a-4762-85da-4eec24b3fce7/login.windows.net/383a3889-5bc9-47a3-846c-2b70f0b7fe0e/whfbopct1@jobesanc.mit.litware.com`</SPAN>
  - <SPAN style="color:green">Certificate type: Self-signed</SPAN>
  - <SPAN style="color:green">Windows Hello set a certificate property on a Windows Hello key.</SPAN>
  - <SPAN style="color:green">Key name: `S-1-5-21-2426993522-1213947244-2524399092-1108/2212a92f-ddcb-4fdd-99e4-a78df6b22d16/login.windows.net/383a3889-5bc9-47a3-846c-2b70f0b7fe0e/whfbopct1@jobesanc.mit.litware.com`</SPAN>
  - <SPAN style="color:green">Certificate type: CA signed</SPAN>
- <SPAN style="color:green">**Id 8225**: End of the key creation</SPAN>
  - <SPAN style="color:green">Windows Hello key creation completed successfully.</SPAN>
  - <SPAN style="color:green">Processing time: 6 seconds</SPAN>

This is the user key (ukpub/ukpriv).

---

# Step C: Key registration

<SPAN style="color:green">**Microsoft-Windows-HelloForBusiness/Operational**</SPAN>

- <SPAN style="color:green">**Id 3510**: Windows Hello key registration started.</SPAN>

<SPAN style="color:blue">**Microsoft-Windows-AAD/Analytic**</SPAN>

- <SPAN style="color:blue">**Id 1099**: Reading from file success.</SPAN>
  - <SPAN style="color:blue">File name: `'C:\Users\whfbopct1\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\LocalState\u_1smtm6r7etpiagt3mkfvhb5k\c_m2novo3260vmramnve9aglul\a_egetgfa014t5u7kttooqs2hv.pwd'`, Size: 4511 bytes</SPAN>
  - <SPAN style="color:blue">Logged at clientcache.cpp, line: 1031, method: ClientCache::DeserializeFromFile.</SPAN>
  - <SPAN style="color:blue">Request: authority: `https://sts.contoso.com/adfs`, client: `dd762716-544d-4aeb-a526-687b73838a22`, redirect URI: `ms-appx-web://Microsoft.AAD.BrokerPlugin/dd762716-544d-4aeb-a526-687b73838a22`</SPAN>
  - <SPAN style="color:blue">`dd762716-544d-4aeb-a526-687b73838a22` = Client for the Device Registration Service</SPAN>
  - <SPAN style="color:blue">Code: 0x4AA90055 Renew token by the primary refresh token success.</SPAN>
  - <SPAN style="color:blue">Logged at refreshtokenrequest.cpp, line: 143, method: RefreshTokenRequest::AcquireToken.</SPAN>
  - <SPAN style="color:blue">Request: authority: `https://sts.contoso.com/adfs`, client: `dd762716-544d-4aeb-a526-687b73838a22`, redirect URI: `ms-appx-web://Microsoft.AAD.BrokerPlugin/dd762716-544d-4aeb-a526-687b73838a22`, resource: `urn:microsoft:winhello:cert:prov:server`, correlation ID (request): `ff099db5-7c21-4d86-af34-3715984ee491`</SPAN>

- <SPAN style="color:blue">**Id 1023**: NGC UserID Key:</SPAN>
  - `S-1-5-21-2426993522-1213947244-2524399092-1108/2212a92f-ddcb-4fdd-99e4-a78df6b22d16/login.windows.net/383a3889-5bc9-47a3-846c-2b70f0b7fe0e/whfbopct1@contoso.com`

<SPAN style="color:green">**Microsoft-Windows-HelloForBusiness/Operational**</SPAN>

- <SPAN style="color:green">**Id 8510**: Windows Hello key registration completed successfully.</SPAN>

The Enterprise DRS locates the user's object in Active Directory, writes the key information to a multi-values attribute "msDS-KeyCredentialsLink". The Enterprise DRS returns a key ID to the application, which represents the end of user key registration.

---

# Step D/E/F/G: Certificate request

Most of these operations are performed on the ADFS and CA servers. There are some few events on the client:

<SPAN style="color:green">**Microsoft-Windows-HelloForBusiness/Operational**</SPAN>

- <SPAN style="color:green">**Id 3066**: Windows Hello sign-in certificate enrollment started.</SPAN>
- <SPAN style="color:green">**Id 8067**: Windows Hello set a certificate property on a Windows Hello key.</SPAN>
  - <SPAN style="color:green">Key name: `S-1-5-21-2426993522-1213947244-2524399092-1108/2212a92f-ddcb-4fdd-99e4-a78df6b22d16/login.windows.net/383a3889-5bc9-47a3-846c-2b70f0b7fe0e/whfbopct1@contoso.com`</SPAN>
  - <SPAN style="color:green">Certificate type: CA signed</SPAN>
- <SPAN style="color:green">**Id 8066**: Windows Hello sign-in certificate enrollment completed successfully.</SPAN>

<SPAN style="color:green">**Microsoft-Windows-HelloForBusiness/Operational**</SPAN>

- <SPAN style="color:green">**Id 8045**: Windows Hello processing completed successfully.</SPAN>

The application receives the newly issued certificate and installs it into the Personal store of the user. This signals the end of provisioning.

You can check the attribute on AAD and AD: MsDs-KeyCredentialslLink attribute

Dsregcmd output


```
+----------------------------------------------------------------------+ 
| User State                                                           | 
+----------------------------------------------------------------------+ 
NgcSet : YES 
NgcKeyId : {E4D034CF-9C09-4CC3-BE14-42A3483D141C} 
CanReset : DestructiveOnly 
WorkplaceJoined : NO 
WamDefaultSet : YES
```

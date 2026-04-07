---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Auth Methods Used"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Conditional%20Access%20Policy/Azure%20AD%20Auth%20Methods%20Used"
importDate: "2026-04-07"
type: reference-table
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- cw.MFAMethods
- cw.AzureMFA
- cw.MFARegistration
- SCIM Identity
-  Entra ID MFA
-  Authentication Methods 
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AzureAD](/Tags/AzureAD) [AAD-Conditional-Access](/Tags/AAD%2DConditional%2DAccess) [comm-idsp](/Tags/comm%2Didsp) 


       


# Azure AD Authentication Methods Used

This article is meant to provide information on values seen in login events against what specific authentication method was used.  Additionally, this document will provide additional information on the Credential Types being passed.

## Authentication Methods Used

| Value                                 | Explanation                                                  |
| ------------------------------------- | ------------------------------------------------------------ |
| Password = 0x1                        | Authentication by using a password                           |
| X509 = 0x2                            | Authentication on a key authenticated using an X.509 PKI     |
| WindowsIntegrated = 0x4               | Windows integrated authentication                            |
| MultiFactor = 0x8                     | Multiple factor authentication                               |
| WindowsIntegratedOrMultiFactor = 0x10 | If the HTTP GET of the wsignin1.0 request message contains an X-MS-Proxy HTTP header,<br/>then Windows integrated authentication; otherwise, multiple factor authentication. |
| Unspecified = 0x20                    | Authentication by unspecified means                          |
| ProtectedTransport = 0x40             | This is a special case. It's not a real authentication method. It indicates that the transport layer is secure only. To get authentication method PasswordProtectedTransport,users can do something like: AuthMethodsUsed.Password |
| NgcMfa = 0x80                         | This is a special case - it's not a real authentication method. The flag indicates that the request specified 'ngcmfa' value for the 'amr_values' parameter when redeeming refresh token. The result, MFA will be required. |
| InternetProtocolPassword = 0x100      | Authentication by Internet protocol password.                |
| SecureRemotePassword = 0x200          | Authentication by secure remote password.                    |
| KnownNonPasswordMethod = 0x400        | Known Non-Password method                                    |
| OneTimePasscode = 0x1000              | One time passcode method                                     |
| X509Federated = 0x2000                | Explicit indication that X509 auth method was provided by federated IdP. |
| MultiFactorFederated = 0x4000         | Explicit indication that MFA auth method was provided by federated IdP. |
| TemporaryAccessPass = 0x8000          | Authentication by using a Temporary Access Pass.             |

## Credential Type

This table provides additional context on the credential type that was passed.

![ASC Credential type example](/.attachments/AAD-Authentication/388383/CredentialType.jpg)

| Value                                          | Description                                                  |
| ---------------------------------------------- | ------------------------------------------------------------ |
| AuthorizationCode = 1,                         | An authorization code used in OAuth 2.                       |
| ExternalAuthCode = 2,                          | An authorization code issued by external OAuth2 identity provider. |
| RefreshToken = 3,                              | A refresh token used in OAuth 2.                             |
| ClientSecret = 4,                              | A client secret used in OAuth 2.                             |
| LogoutClientRedirectUri = 6,                   | A client redirect Uri used in OpenID Connect logout.         |
| ClientAssertion = 7,                           | A client assertion used in OAuth 2.                          |
| OfficeS2SClientAssertion = 8,                  | A client assertion used in OAuth 2 protocol version for OfficeS2S. |
| Consent = 9,                                   | Used to track granting of consent.                           |
| FlowToken = 10,                                | Used to protect against CSRF attacks.                        |
| JwtBearer = 11,                                | JWT Access token, signed by STS service itself               |
| Password = 12,                                 | A plaintext user password.                                   |
| Viral = 13,                                    | Viral credential contains account creation input             |
| NewGenerationCredentials = 14,                 | New Generation Credentials (or NGC)                          |
| PassportAuth = 15,                             | Passport authentication cookie.                              |
| ResourceReplyAddress = 16,                     | Deprecated. See ReplyAddress below. Supported only for back-compat purposes. |
| Saml11 = 17,                                   | A SAML 1.1 token.                                            |
| Saml20 = 18,                                   | A SAML 2.0 token.                                            |
| SessionToken = 19,                             | A session credential used in session management.             |
| SignInState = 20,                              | Used to track the sign-in state.                             |
| UserInfoAccessToken = 21,                      | Opaque access token for the userinfo endpoint.               |
| SignedRequest = 22,                            | A refresh token used in OAuth 2. Refresh token is sent as part of signed JWT request. |
| SignedUserKeysRequest = 23,                    | Credential used in Key Data service. The credential itself is the request to the service. PRT is sent as part of request in JWS format |
| PKeyAuth = 24,                                 | PKeyAuth information used for device auth.                   |
| SPNameQualifier = 25,                          | SAMLP NameIDPolicy SP name qualifier                         |
| ReplyAddress = 26,                             | Unified protocol-agnostic reply address representation       |
| OfficeS2SClientID = 27,                        | A client ID used in OAuth 2 protocol version for OfficeS2S.  |
| TlsDeviceCert = 28,                            | Tls device certificate used for device auth.                 |
| OfficeS2SResourceRedirectUri = 29,             | The Redirect Uri of the resource principal for OfficeS2S delegation protocol. |
| BrowserSSO = 30,                               | Credential used by Browser SSO feature.                      |
| AddSsoAccountFlowConsent = 31,                 | Credential used by 'Add SSO Account' flow                    |
| DeviceSecret = 32,                             | A device secret used in OAuth 2.                             |
| OfficeS2SAuthorizationCode = 33,               | An authorization code used in OfficeS2S OAuth 2.             |
| OfficeS2SRefreshToken = 34,                    | A refresh token used in OfficeS2S OAuth 2.                   |
| OfficeS2SDelegationServiceUserInfo = 35,       | The user information asserted by the caller to the OfficeS2S delegation service endpoint. |
| ThresholdJwt = 36,                             | Protocol Messages for AD/AAD Auth client on Windows 10/Threshold |
| AuthorizationCodeAssertion = 37,               | An authorization code assertion used by AD/AAD Auth client on Windows 10/Threshold |
| ProxyAuthorizationCode = 38,                   | An authorization code intended to be proxied to a different STS |
| ProxyRefreshToken = 39,                        | A refresh token intended to be proxied to a different STS    |
| SavedUserReplyAddress = 40,                    | A reply Address used for saved user endpoint                 |
| ShortLivedToken = 41,                          | A short-lived token used to log the user in.                 |
| SsoRefreshToken = 42,                          | Refresh token supplied as SSO artifact by the client (identical to regular OAuth2 refresh token from contents point of view, while different validation rules applied to it) |
| EASCertBasedAuth = 43,                         | Used by Exchange, to authenticate users with their certificates. Checks that certificate is not revoked and returns an id token to Exchange. We trust the proxy app (Exchange) to validate the possession of private key. |
| AuthTicket = 44,                               | An authentication ticket credential contains user information similar to a refresh token. This is extracted from the DomainAuthorityTicket that is presented by a client and represents a session for the user. |
| WindowsAuthenticationAuthorizationTicket = 45, | Authorization ticket sent by the client. This ticket is issued by a local AD of a tenant that was registered to DesktopSSO |
| VerifiedWindowsClientClaims = 46,              | Special credential type for credential that is used to pass additional information to pipeline<br/>in the form of verified claims |
| ThresholdJwtDevice = 48,                       | Windows 10/Threshold device credential                       |
| BrowserId = 49,                                | Browser specific persistent cookie that is used to identify same device flow |
| ProofOfPossessionKey = 51,                     | A proof of possession key                                    |
| DesktopSsoAuthToken = 52,                      | DesktopSsoAuthToken token obtained from the IWA endpoint in ESTS. This token is used by DesktopSSO. |
| ProxyJwtBearer = 53,                           | Proxied JWT bearer (aka on-behalf-of) flow                   |
| BulkAADJJwtBearer = 54,                        | Special case of JWT bearer: used to extract user authentication<br/>information and bubble it up to pipeline in BulkAADJ token flow |
| DeviceFlowUserCode = 55,                       | Credential used in the device flow user code scenario        |
| FidoSignature = 56,                            | Fido signature                                               |
| SidToNameRequest = 57,                         | Credential used by the SidToName service.                    |
| ExternalIdToken = 58,                          | An id_token issued by external OAuth2 claims provider.       |
| CachedCredentialStateToken = 59,               | Cached credential state token cookie from client             |
| UserInfoPurposeAccessToken = 60,               | A PurposeAccessToken with purpose set to UserInfoPurpose     |
| LinkedInBindPurposeAccessToken = 61,           | A PurposeAccessToken with purpose set to LinkedInBindPurpose |
| ExternalAuthCodeBind = 62,                     | An authorization code issued by external OAuth2 identity provider<br/>in order to bind an account from that IDP to the current account |
| SocialIdpMSExternalIdToken = 63,               | An id_token issued by external SocialIdpMS claims provider.  |
| SignedOidcRequest = 64,                        | Signed request with proof of possession key                  |
| CachedCredentialSignInState = 65,              | SignInState issued by ESTS for CCS                           |
| ManagedBrowserPurposeAccessToken = 66,         | A PurposeAccessToken with purpose set to ManagedBrowserPurpose |
| LinkedInReverseBindPurposeAccessToken = 67,    | A PurposeAccessToken with purpose set to LinkedInReverseBindPurpose |
| MsaRefreshToken = 68,                          | Refresh Token generated by MSA.                              |
| OneTimePasscode = 69,                          | The one time passcode. This is used by EMAIL One Time Passcode scenarios. |
| PublicIdentifier = 71,                         | Public Identifier Credential type.                           |
| Saml20Obo = 72,                                | Saml 2.0 token, signed by eSTS service itself                |
| Saml11Obo = 73,                                | Saml 1.1 token, signed by eSTS service itself                |
| TransferToken = 74,                            | A token which is transferred to a different device           |
| RemoteNgc = 75,                                | Special NGC assertion used in the Authenticator app sign-in scenario |
| ResourceAccountCredential = 76,                | Resource account credential, used in Aruba device auth scenario where user is modeled as a resource account |
| ProxyDeviceCode = 77,                          | A device code intended to be proxied to a different STS      |
| IotClientAssertion = 78,                       | An Oauth2 client assertion used by IoT devices.              |
| SmartcardCredential = 79,                      | A smartcard credential                                       |
| PassThruGitHubAccessTokenCredential = 80,      | GitHub access token passed by MSA.  It is forwarded to applications in an ID token. |
| AccessPass = 81,                               | An Access Pass credential.                                   |
| SessionTransportKeyJWK = 82,                   | Session transport key sent in the request, which contains 'kty' and 'x5c'. |
| ProxyRequestJwt = 83,                          | Request Jwt intended to be proxied to MSA                    |
| KerberosPreAuthData = 84,                      | Pre-Auth data used to authenticate a Kerberos client through the KDC Proxy flow |
| KerberosTicket = 85,                           | A Kerberos TGT issued by the KDC Proxy flow                  |
| MsaAuthCode = 86,                              | Auth Code generated by MSA                                   |
| CertBasedAuth = 87                             | A certificate based authentication credential used by managed users that wish to authenticate using a certificate. Checks that the certificate is not revoked. |

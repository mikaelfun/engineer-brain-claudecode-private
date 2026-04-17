---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/Token Validation General Guidance"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FToken%20Validation%20General%20Guidance"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD Dev
- cw.AAD-Authentication
- cw.AAD-Workflow
- cw.comm-devex
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD Dev](/Tags/AAD-Dev) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) 


[[_TOC_]]

# Validating Azure AD JWT Bearer Tokens #

This is meant to be a general guide to how token validation works. This will not cover every scenario.
First and foremost, there is always confusion on who performs the validation. There is a misconception that Azure AD is the one performing validation. That is not true. The Web Application or API and its authentication stack (the library code) is performing the validation. Azure AD does not and will never validate access tokens. The resource where you send the access token, is the one that validates the access token and the users (or application) access. We will call this the **Resource provider** through the rest of this article. The only interaction that happens to Azure AD is when the Resource provider downloads the Azure AD Open ID Connect and OAuth2 metadata configuration and the signing keys. Which leads to our first topic of discussion

## Open ID Connect and OAuth2 Configuration

Generally, when you protect a web application or web API with Azure AD, you are prompted to provide some settings. This is so that the Middleware can use this information to validate the token.
- Metadata: This might also be called Issuer or Authority. 
- Client ID: We will talk more about this one in the Audience validation section.

You might see other configuration options if the Middleware will also be handling Open ID Connect authentication. For the purpose of this article, Open ID Connect Authentication is outside of scope for this article.
- Client Secret:
- Scopes:

Most Resource proviers will look at your Metadata configuration value and determine if it needs to concatenate .well-known/openid-configuration to the end by checking if it is already included. For example, if your Metadata configuration value looks like this
```
https://login.microsoftonline.com/contoso.onmicrosoft.com
```

Then it will add .well-known/openid-configuration to the end of Metadata configuration value and make a call to that endpoint. So, it will make a call to
```
https://login.microsoftonline.com/contoso.onmicrosoft.com/.well-known/openid-configuration
```

Otherwise if .well-known/openid-configuration is already included then it will not concatenate it. This is because in certain environments or configurations, you might need to pass other parameters to customize the result that gets returned. For example, in B2C you might set your Metadata value to something that looks like this
```
https://contoso.b2clogin.com/contoso.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_SUSI
```

Notice the p parameter at the end. This is to tell Azure AD B2C which policy to use and return the results for that policy.

Once the Resource makes a call to this Metadata endpoint, there are some key important properties that are used to validate a token. These are
- Issuer: We will discuss this one further in the Issuer validation section.
- Jwks_uri: The Resource provider will make another call to this endpoint to download the signing keys. A signing key endpoint will look something like this
  ```
  https://login.microsoftonline.com/common/discovery/keys
  ```

We will talk more about this one in the Signature validation sections.
There are many other properties at the Metadata endpoint however most of these are used for Web Applications to configure Open ID Connect Authentication and not used for JWT Bearer authentication.
Troubleshooting tips
You might get an error that looks something like this
```
IDX20803: Unable to obtain configuration from: '[PII is hidden]'.
```

I have seen two causes
- 	Ensure the Metadata configuration value is correct and that you can navigate to it. (With the .well-known/openid-configuration)
- 	If you can navigate to it, then the Middleware or network in the middle is unable to access it for whatever reason. This would not be a Azure AD issue. I have seen firewalls block this.

## Signature validation

### Update to Signing Key Rollover Frequency

On November 29, 2021 a courtesynotification concerning a change to Azure Active Directory SigningKeyRolloverFrequency was sent to Azure AD application developers in the [Health advisories](https://portal.azure.com/?source=akams%2F#blade/Microsoft_Azure_Health/AzureHealthBrowseBlade/otherAnnouncements) section of the Azure Service Health dashboard.

Starting in early December 2021, the Identity and Network Access (IDNA) organization will beginagradualincrease of thefrequency of Signing keyrollovers in PROD and they will continue to increase thefrequency over the courseof several monthsuntil a one-week frequency is reached.  Sovereign clouds will not see this for at least a year.

In the past, Microsoft periodicallyinformed customers of signing key rolls taking place with the Microsoftidentity platform and, in the case of an emergency, rolled them overimmediately. Going forward, therewill continue to beno set or guaranteed time when these key rolls will take place. Customers should take steps to ensure any applications that integrate with the Microsoft identity platform are prepared to handle a key rollover events,no matterhowfrequently they may occur.

Customers should reference the [Signing Key Rollover in Microsoft identity platform | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-signing-key-rollover)and follow the instructions toassessif their applications will be affected and take appropriate action to prevent a negative impact.

### Key Rollover Flow

Sometimes the customers might report seeing different amount of keys advertised by Entra ID depending on what backend machine the validation request was recived at. This is expected behavior due to the distrubuted nature of Entra ID and should not effect the sign in flow for correctly configured application. 
      
Here are the key rollover flow steps:
*   **Exposure Roll** - When the key is gradually advertised, one Azure backend ring at a time is updated. During this phase it is possible that there could be difference in the number of keys you see on the key discovery endpoint (as the request could land on any machine). Note during this time frame, the new keys in only advertised. And it is not used to sign any tokens.
*   **Rollover Complete** - Once the exposure roll is complete, the new key should be available on all regions and associated rings.
*   **Selection Roll / Sign** - In this roll, the new key will be used to sign tokens (and again this also is a gradual process that goes ring by ring).
*   **Unexposed / Removal** - Once the new key is fully saturated, the N-1 key will be removed from the system (once all tokens signed by the n-1 key has expired, which is ~ 3 days). Removal is a gradual process too. And during this phase the number of keys seen on the discovery endpoint can vary.

### AADSTS Error Codes

Applications that don't correctly handle sudden refreshes, and attempts to use an expired key to verify the signature on a token will reject the token and ESTS will likely return one of these error codes. See the [Signing Key Rollover in Microsoft identity platform | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-signing-key-rollover) document for guidance on how to update the application to support automatic rollover.

| AADSTS Error | Code | Description |
|----|----|----|
| MissingSigningKey | 50003 | Cannot find signing certificate configured |
| MissingSigningCertificate | 50004 | Unable to find signing certificate in certificate store. Make sure a certificate with thumbprint {0} is in the store and that the current process can access the certificate private key. |
| MissingEncryptionCertificate | 50005 | Token encryption is required but no encrypting certificate is configured for the relying party. |
| InvalidSignature | 50006 | Signature verification failed. (Possibly more details in message) |
| MissingSignature | 50007 | Encryption certificate was not found in the directory. |
| CertificateNotFound | 50016 | X509Certificate with subject '<Certificate subject name>' and thumbprint '<Certificate thumbprint>' does not match any configured certificate. |
| CertificateValidationFailed | 50017 | The certificate with subject '<Certificate subject name>' and issuer '<Issuer name>' failed validation. |



You might also see the following similar errors regarding unable to validate signature...
* IDX10503: Signature validation failed. The token's kid is: '---', but did not match any keys in TokenValidationParameters or Configuration.
* IDX10511: Signature validation failed. Keys tried: ...
* IDX10501: Signature validation failed. Unable to match 'kid'

Remember the signing keys the Middleware downloaded? 
A signing key will look something like this
~~~
{
            "kty": "RSA",
            "use": "sig",
            "kid": "CtTuhMJmD5M7DLdzD2v2x3QKSRY",
            "x5t": "CtTuhMJmD5M7DLdzD2v2x3QKSRY",
            "n": "18uZ3P3IgOySlnOsxeIN5WUKzvlm6evPDMFbmXPtTF0GMe7tD2JPfai2UGn74s7AFwqxWO5DQZRu6VfQUux8uMR4J7nxm1Kf__7pVEVJJyDuL5a8PARRYQtH68w-0IZxcFOkgsSdhtIzPQ2jj4mmRzWXIwh8M_8pJ6qiOjvjF9bhEq0CC_f27BnljPaFn8hxY69pCoxenWWqFcsUhFZvCMthhRubAbBilDr74KaXS5xCgySBhPzwekD9_NdCUuCsdqavd4T-VWnbplbB8YsC-R00FptBFKuTyT9zoGZjWZilQVmj7v3k8jXqYB2nWKgTAfwjmiyKz78FHkaE-nCIDw",
            "e": "AQAB",
            "x5c": [
                "MIIDBTCCAe2gAwIBAgIQXVogj9BAf49IpuOSIvztNDANBgkqhkiG9w0BAQsFADAtMSswKQYDVQQDEyJhY2NvdW50cy5hY2Nlc3Njb250cm9sLndpbmRvd3MubmV0MB4XDTIwMDMxNzAwMDAwMFoXDTI1MDMxNzAwMDAwMFowLTErMCkGA1UEAxMiYWNjb3VudHMuYWNjZXNzY29udHJvbC53aW5kb3dzLm5ldDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANfLmdz9yIDskpZzrMXiDeVlCs75ZunrzwzBW5lz7UxdBjHu7Q9iT32otlBp++LOwBcKsVjuQ0GUbulX0FLsfLjEeCe58ZtSn//+6VRFSScg7i+WvDwEUWELR+vMPtCGcXBTpILEnYbSMz0No4+Jpkc1lyMIfDP/KSeqojo74xfW4RKtAgv39uwZ5Yz2hZ/IcWOvaQqMXp1lqhXLFIRWbwjLYYUbmwGwYpQ6++Cml0ucQoMkgYT88HpA/fzXQlLgrHamr3eE/lVp26ZWwfGLAvkdNBabQRSrk8k/c6BmY1mYpUFZo+795PI16mAdp1ioEwH8I5osis+/BR5GhPpwiA8CAwEAAaMhMB8wHQYDVR0OBBYEFF8MDGklOGhGNVJvsHHRCaqtzexcMA0GCSqGSIb3DQEBCwUAA4IBAQCKkegw/mdpCVl1lOpgU4G9RT+1gtcPqZK9kpimuDggSJju6KUQlOCi5/lIH5DCzpjFdmG17TjWVBNve5kowmrhLzovY0Ykk7+6hYTBK8dNNSmd4SK7zY++0aDIuOzHP2Cur+kgFC0gez50tPzotLDtMmp40gknXuzltwJfezNSw3gLgljDsGGcDIXK3qLSYh44qSuRGwulcN2EJUZBI9tIxoODpaWHIN8+z2uZvf8JBYFjA3+n9FRQn51X16CTcjq4QRTbNVpgVuQuyaYnEtx0ZnDvguB3RjGSPIXTRBkLl2x7e8/6uAZ6tchw8rhcOtPsFgJuoJokGjvcUSR/6Eqd"
            ]
        },
~~~
A token has 3 parts: the header, payload, and signature. The Middleware will use this signing key to validate the signature of the token.

### Troubleshooting tip

#### **Scenario: Microsoft Graph access token**

Review the payload of the access token and observe the `"aud"` claim. If the `"aud"` claim is one of the following...

* `https://graph.microsoft.com`

* `00000003-0000-0000-c000-000000000000`

You will not be able to validate the signature. You will get a signature validation error.

**Note**: Starting mid-September 2025, audience claim `"aud"` in access tokens for Microsoft Graph will change from a URI format (e.g., https://graph.microsoft.com) to an AppID GUID format. This SFI change aims to enhance security by making it harder to spoof audience claims. Customer applications/APIs should not validate these tokens. This is an anti-pattern and can cause application failure if actions are taken based on token properties not intended for them. There is no ability to exclude tenants from this behavior.

Your solution would be to get an access token for your application (not Microsoft Graph). 

#### **Scenario: Your Issuer/Authority configuration may be mis-configured and pulling the wrong keys**

**Azure AD...**

If you want to validate an access token issued by Azure AD (not Azure B2C) where the issuing tenant looks like this...
~~~
"iss": "https://login.microsoftonline.com/aa00d1fa-####-####-####-############/v2.0"
~~~
or
~~~
"iss": "https://sts.windows.net/aa00d1fa-####-####-####-############/"
~~~

Make sure your Issuer/Authority is configured accordingly to the following...

v1 Token...
~~~
https://login.microsoftonline.com/aa00d1fa-####-####-####-############/
~~~

v2 Token...
~~~
https://login.microsoftonline.com/aa00d1fa-####-####-####-############/v2.0/
~~~

This will end up gettings keys here...
~~~
https://login.microsoftonline.com/aa00d1fa-####-####-####-############/discovery/v2.0/keys
~~~

**B2C...**

If you want to validate an access token issued by Azure B2C (not Azure AD) where the issuer looks like this...
~~~
https://contoso.b2clogin.com/tfp/contoso.onmicrosoft.com/B2C_1a_PolicyName/v2.0/discovery/v2.0/keys
~~~

Make sure your Issuer/Authority is configured like this...
~~~
https://contoso.b2clogin.com/tfp/655e51e9-####-####-####-############/B2C_1a_PolicyName/v2.0/
~~~

This will end up gettings keys here......
~~~
https://contoso.b2clogin.com/tfp/contoso.onmicrosoft.com/B2C_1a_PolicyName/v2.0/discovery/v2.0/keys
~~~

> Replace "aa00d1fa-####-####-####-############" and "contoso.onmicrosoft.com" with your Tenant ID

#### **Scenario: Cached signing key used**

Some Middleware components will cache the signing keys so they do not always re-download the signing keys every time it needs to validate a token. Azure AD does rotate the keys on a regular basis and sometimes can rotate them all of a sudden. There are no set intervals. Expect a rollover at any time. We also do not keep track of the history of when the signing keys rotate.
For more information about Azure AD and our Signing Keys<br>

https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-signing-key-rollover

When this happens, when Azure AD rotates a signing key and the Middleware caches previous set of signing keys, you might get an error look looks something like this<br>
```
IDX10501: Signature validation failed. Unable to match 'kid'
```

Youre going to have to tell the Resource to update its cached signing keys. Or the Middleware has a very specific signing key configured and you would need to tell the Middleware to which signing keys to use.

#### **Scenario: Application has its own signing certificate uploaded to Azure AD**

Another reason for this error is if an Azure AD Enterprise application is enabled for Single-Sign On. Single-Sign On is meant for SAML based applications and will break Middleware components from validating tokens issued by Azure AD for this application. This is because a certificate gets added to the Enterprise app with a private key and all tokens issued for this app will be signed by this private key. 

A possible solution would be to add the appid parameter at the end of the Metadata configuration, so it should look something like this
```
https://login.microsoftonline.com/{your-tenant-id}.onmicrosoft.com/.well-known/openid-configuration?appid={your-app-id}
```

Otherwise its best to create a new application registration.

## Token Expiration validation

The Resource API will check if the token is valid and not expired. The nbf (Not Before) claim of the JWT bearer token will be checked to ensure the token is valid and can be used.  The exp (Expiration) claim of the JWT bearer token will be checked to ensure the token is not expired. When looking at these values, they will be in a long integer format. You can use a tool like https://jwt.ms  to better understand the token lifetime.

1.	Get your access token and copy it to the clipboard.
2.	Go to https://jwt.ms
3.	Paste your access token
4.	Go to the Claims tab.
5.	Observe the nbf and exp claims. 

Access tokens issued by Azure AD by default last one hour. An Azure AD organizationl admin can change the token lifetime of access tokens using Azure AD policies. 
If the Middleware finds that the token should not be used yet or has expired, it will throw a 401.

## Audience validation

Resource provider API will check and validate the audience claim. This is the aud claim within the access token. Each middleware or resource API will be looking for a specific value.  For example, when making a Microsoft Graph API call, the accepted aud value is either https://graph.microsoft.com or 00000003-0000-0000-c000-000000000000
Here is a portion of the Access Token that shows an example of the audience claim
~~~
{
  "typ": "JWT",
  "alg": "RS256",
  "kid": "X5eXk4xyojNFum1kl2Ytv8dlNP4-c57dO6QGTVBwaNk"
}.{
  "iss": "https://login.microsoftonline.com/655e51e9-####-####-####-############/v2.0",
  "exp": 1599008698,
  "nbf": 1599005098,
  "aud": "98c1c958-d3a1-4275-960b-c2ad29796940",
~~~

### Troubleshooting tip

If you see an error about audience validation failed, verify you have the correct token with the correct aud claim and understand what the Resource provider is looking for as the aud claim. 

> For Microsoft first-party applications and APIs, the Microsoft support team for that Resource Provider needs to understand basic OAuth2 concepts and its token validation requirements like the aud claim. Azure AD support team will not know what this is.

## Issuer validation

The Resource provider API will check and validate the issuer claim. This is the iss claim within the access token. Each middleware or resource API will be looking for a specific value.  For tokens issued by Azure AD, this will be one of the following values
- https://sts.windows.net/{your-tenant-id} (This one is used for Azure AD v1.0 tokens)
- https://login.microsoftonline.com/{your-tenant-id}/v2.0 (This one is used for Azure AD v2.0 tokens)
- https://{your-domain}.b2clogin.com/tfp/[your-tenant-id}/{your-policy-id}/v2.0/ (This one is used for Azure B2C tokens)

Where **{your-tenant-id}** is the Directory ID for your Azure Active Directory tenant.

Where **{your-policy-id}** is the Azure B2C user flow Policy ID

Where **{your-domain}** is the first portion of your domain from the initial domain Azure AD provided you. For example if your initial domain from Azure AD is contoso.onmicrosoft.com then {your-domain} is contoso.
Here is a portion of the Access Token that shows an example of the issuer claim

~~~
{
  "typ": "JWT",
  "alg": "RS256",
  "kid": "X5eXk4xyojNFum1kl2Ytv8dlNP4-c57dO6QGTVBwaNk"
}.{
  "iss": "https://login.microsoftonline.com/655e51e9-####-####-####-############/v2.0",
~~~

## Scope or Roles validation

The Resource provider API will check and validate the scope claim for User based access tokens or roles claim for app-based access tokens. Accepted values for the scope or roles claim will vary depending on the requirements and API call that is being made to the resource provider. 
> For Microsoft first-party applications and APIs, the Microsoft support team for that Resource Provider needs to understand basic OAuth2 concepts and its token validation requirements for the scope and roles claim. Azure AD support team will not know what these requirements are.

Here is a portion of the Access Token that shows an example of the scope claim
~~~
{
  "typ": "JWT",
  "alg": "RS256",
  "kid": "X5eXk4xyojNFum1kl2Ytv8dlNP4-c57dO6QGTVBwaNk"
}.{
  "iss": "https://login.microsoftonline.com/655e51e9-####-####-####-############/v2.0",
  "exp": 1599008698,
  "nbf": 1599005098,
  "aud": "98c1c958-d3a1-4275-960b-c2ad29796940",
  
  "scp": "user_impersonation",
  }
~~~

Here is a portion of the Access Token that shows an example of the roles claim
~~~
{
  "typ": "JWT",
  "alg": "RS256",
  "kid": "X5eXk4xyojNFum1kl2Ytv8dlNP4-c57dO6QGTVBwaNk"
}.{
  "iss": "https://login.microsoftonline.com/655e51e9-####-####-####-############/v2.0",
  "exp": 1599008698,
  "nbf": 1599005098,
  "aud": "98c1c958-d3a1-4275-960b-c2ad29796940",
  
  "roles": [ "app_role" ],
  }
~~~

For more information about how to validate Scopes and Roles...<br>
https://learn.microsoft.com/en-us/entra/identity-platform/scenario-protected-web-api-verification-scope-app-roles?tabs=aspnetcore

## Guest user validation

Use the "idp" claim

  * If "idp" claim is missing > user is a local member of the tenant
  * If "idp" claim is present > user is a guest user

Furthermore the idp claim is the home idp/tenant of user<br>
https://sts.windows.net/{tenant-id}


## Validating other claims from ClaimsPrincipal or ClaimsIdentity

For example getting the **employeeid** claim...
~~~
using System.Security.Claims
//...
var identity = User.Identity as ClaimsIdentity;
            var userClaims = identity.Claims;

	// Get claim in token by its claim name
string EmployeeId = userClaims.FirstOrDefault( c => c.Type.Equals( "employeeid" ) ).Value;
~~~

## Extract claims from the token directly

### CSharp
~~~public static string GetTokenClaim(string token, string key)
using System.IdentityModel.Tokens.Jwt
//...
        {
            if (!String.IsNullOrEmpty(IdToken)) {
                var handler = new JwtSecurityTokenHandler();
                JwtSecurityToken token = handler.ReadToken(token) as JwtSecurityToken;

                return token.Claims.Where(claim => claim.Type == key).FirstOrDefault().Value;
            }

            return String.Empty;
        }
~~~

---
source: ado-wiki
sourceRef: Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C with Custom Policies/Adding Azure B2C as an IDP in Salesforce
importDate: 2026-04-06
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
-  cw.comm-extidmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
In a recent case I got an opportunity to work on an Advisory case with Azure B2C where customer was looking for an instruction on using Azure B2C as Identity Provider (IDP) in Salesforce.


**Steps to configure Azure B2C as Identity Provider in Salesforce**


- **Create an Azure AD B2C Application**

1. Log into the Azure AD B2C instance you wish to connect to.

1. Go to Applications. Click + Add.

1. Add https://www.salesforce.com as a Reply URL. Click Create.

1. Select the new app you just created. Save the Application ID.

1. Click Published Scope. Add read as a scope. Click Save.

1. Save the Full Scope Value.

1. Click API access. Click + Add. Under Select API, select the name of the application. Under Select Scopes, ensure read and user_impersonation are selected.

1. Click OK. Select Keys from the left nav. Click + Generate key. Click Save.

1. Check the value of the generated App key. If it contains �/�, �?�, �&�, or �%� (there may be more invalid characters), delete the generated key and repeat steps 8 and 9 until a valid key is generated. Save the valid key.

Sample from my test tenant
![image.png](/.attachments/image-59571840-1b51-4ecc-b0b3-aaeb885a5d05.png)


- **Configure Salesforce Auth. Provider**
1. Log into Salesforce. Go to Setup. In the Quick Find box, type Auth. Select Auth. Providers.

1. Click New.

1. Under Provider Type, select Open ID Connect.

1. Add an informative Name. This will be displayed to users as an option when signing in. Salesforce will generate a URL Suffix.

1. Place the Application ID, from Step 4 of �Create an Azure AD B2C Application�, in Consumer Key. Place the App key, from Step 9 of �Create an Azure AD B2C Application�, in Consumer Secret.

1. Retrieve the OpenID Connect discovery endpoint of the Azure AD B2C Custom Policy you wish to integrate with. This discovery endpoint can be found at https://{tenant-id}.b2clogin.com/{tenant-id}.onmicrosoft.com/v2.0/.well-known/openid-configuration?p={policy-id}.

1. Use the authorization_endpoint field in the discovery endpoint as the Authorize Endpoint URL in Salesforce. Use the token_endpoint field in the discovery endpoint as the Token Endpoint URL in Salesforce. Use the issuer field in the discovery endpoint as the Token Issuer in Salesforce.

1. Place the Full Scope Value, from Step 6 of �Create an Azure AD B2C Application�, in Default Scopes. Add � read� to the end. (The final value should look something like this: https://{tenant-id}.onmicrosoft.com/{application-name}/read openid)

1. For Registration Handler, follow Step 11 from these directions: https://help.salesforce.com/articleView?id=sso_provider_openid_connect.htm&type=5 a. Note, in case that link changes. You can create a new Registration Handler using the code in this GitHub repository: https://github.com/salesforceidentity/social-signon-reghandler/blob/master/SocialRegHandler.cls. You may need to add u.CompanyName = 'CompanyName'; in the prepareUserData method.

1. Pause here, we�ll come back from Token Issuer.


- # **Setup a User Info Endpoint** 

Salesforce requires a User Info endpoint. 
Azure AD B2C does not provide one. 

You can use the code in this GitHub repository to create a version of a user info endpoint: https://github.com/azure-ad-b2c/samples/tree/master/policies/user-info-endpoint

This code will only return the claims present on the user�s token. 
Place that REST endpoint in the User Info field of the Auth. Provider in Salesforce.
Click Save.

The detail on how to configure User Info Endpoint is mentioned in the link 

https://learn.microsoft.com/en-us/azure/active-directory-b2c/userinfo-endpoint?pivots=b2c-custom-policy

- **Authorize the Callback URL in Azure AD B2C Application**

1. Click on the Auth Provider configured in the above steps.

1. Under Salesforce Configuration, save the Single Logout URL.

1. Expand Communities and save the Callback URL of the Community in which you want to enable SSO.

1. Return to Azure AD B2C. Navigate to App registrations (Preview). Click All applications.

1. Select the application created in �Create an Azure AD B2C Application�. Click Authentication.

1. Click Add URI. Add the Callback URL from Step 3. Update the Logout URL with the Single Logout URL from Step 2. Click Save.


**Example from my test tenant**
==========================

Log into Salesforce. Go to Setup. In the Quick Find box, type Auth. Select Auth. Providers.

Click New.
![image.png](/.attachments/image-82a01bca-cfbe-40cc-8d88-4274ca167713.png)

Under Provider Type, select Open ID Connect.

However, for reference, these are the values that worked in this case using your custom policy and B2C tenant:

Consumer Key: 7d4eca9e-4fda-43f7-8fde-93fc46b3ed69 (Application ID)

Authorize Endpoint URL: https://joycepaulb2c.b2clogin.com/joycepaulb2c.onmicrosoft.com/b2c_1a_signup_signin/oauth2/v2.0/authorize

Token Endpoint URL: https://joycepaulb2c.b2clogin.com/joycepaulb2c.onmicrosoft.com/b2c_1a_signup_signin/oauth2/v2.0/token

User Info Endpoint URL: https://joycepaulb2c.b2clogin.com/joycepaulb2c.onmicrosoft.com/b2c_1a_signup_signin/openid/v2.0/userinfo

Token Issuer: https://joycepaulb2c.b2clogin.com/02e3c149-15d3-45fd-946e-b4d4163a5ae5/v2.0/

Default Scopes: 7d4eca9e-4fda-43f7-8fde-93fc46b3ed69


Notice the Authorize, Token, and User Info Endpoints can be found here: https://joycepaulb2c.b2clogin.com/joycepaulb2c.onmicrosoft.com/B2C_1A_SIGNUP_SIGNIN/v2.0/.well-known/openid-configuration.

![image.png](/.attachments/image-4383db01-0928-47ab-8c13-9b72e317b07d.png)

Sample Files for your reference <Note : we need to replace the values as per your tenant>

`<ClaimsProviders> -->
    <ClaimsProvider>
      <DisplayName>Token Issuer</DisplayName>

      <!--<TechnicalProfiles>-->
      <TechnicalProfiles>
        <TechnicalProfile Id="UserInfoIssuer">
          <DisplayName>JSON Issuer</DisplayName>
          <Protocol Name="None" />
          <OutputTokenFormat>JSON</OutputTokenFormat>
          <CryptographicKeys>
            <Key Id="issuer_secret" StorageReferenceId="B2C_1A_TokenSigningKeyContainer" /> 
          </CryptographicKeys>
          <!-- The Below claims are what will be returned on the UserInfo Endpoint if in the Claims Bag-->
          <InputClaims>
            <InputClaim ClaimTypeReferenceId="objectId" PartnerClaimType="sub" />
            <InputClaim ClaimTypeReferenceId="givenName" PartnerClaimType="given_name" />
            <InputClaim ClaimTypeReferenceId="surname" PartnerClaimType="family_name" />
            <InputClaim ClaimTypeReferenceId="displayName" PartnerClaimType="full_name" />
            <InputClaim ClaimTypeReferenceId="signInNames.emailAddress" PartnerClaimType="preferred_username" />
            <InputClaim ClaimTypeReferenceId="userPrincipalName"/>
          </InputClaims>
        </TechnicalProfile>
        <TechnicalProfile Id="UserInfoAuthorization">
          <DisplayName>UserInfo authorization</DisplayName>
          <Protocol Name="None" />
          <InputTokenFormat>JWT</InputTokenFormat>
          <Metadata>
            <!-- Update the Issuer and Audience below -->
            <!-- Audience is optional, Issuer is required-->
            <Item Key="issuer">https://joycepaulb2c.b2clogin.com/02e3c149-15d3-45fd-946e-b4d4163a5ae5/v2.0/</Item>
            <Item Key="audience">["5d0e1f5d-d7d0-4de7-b2e9-8fd1ed6532fc","7d4eca9e-4fda-43f7-8fde-93fc46b3ed69"]</Item>
            <Item Key="client_assertion_type">urn:ietf:params:oauth:client-assertion-type:jwt-bearer</Item>
          </Metadata>
          <CryptographicKeys>
            <Key Id="issuer_secret" StorageReferenceId="B2C_1A_TokenSigningKeyContainer" />
          </CryptographicKeys>
          <OutputClaims>
            <OutputClaim ClaimTypeReferenceId="objectId" PartnerClaimType="sub"/>
            <OutputClaim ClaimTypeReferenceId="signInNames.emailAddress" PartnerClaimType="email"/>
            <!-- Optional claims to read from the access token. -->
            <OutputClaim ClaimTypeReferenceId="givenName" PartnerClaimType="given_name"/>
             <OutputClaim ClaimTypeReferenceId="surname" PartnerClaimType="family_name"/>
             <OutputClaim ClaimTypeReferenceId="displayName" PartnerClaimType="name"/> 
          </OutputClaims>
        </TechnicalProfile>
      </TechnicalProfiles>
    </ClaimsProvider>
    <!-- 
</ClaimsProviders> -->`

![image.png](/.attachments/image-01081887-6a84-4c44-9e73-583673815830.png)


[SAML - ADFS with Userinfoendpoint.zip](/.attachments/SAML%20-%20ADFS%20with%20Userinfoendpoint-96174f9d-ec54-4f96-9317-2408e58335ee.zip)

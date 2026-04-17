---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C LinkedIn as OIDC IdP"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAzure%20AD%20B2C%20LinkedIn%20as%20OIDC%20IdP"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Set up sign-up and sign-in with a LinkedIn account using Azure Active Directory B2C and LinkedIn OpenID Connect

LinkedIn discontinued OAuth2 as the IdP protocol for new configurations which were based on [Set up sign-up and sign-in with a LinkedIn account](https://learn.microsoft.com/azure/active-directory-b2c/identity-provider-linkedin?pivots=b2c-custom-policy). New setups post August 1 will result in the following error:

    AAD2C90273: An invalid response was received: Error: unauthorized_scope_error, Error Description: Scope "r_emailaddress" is not authorized for your application.

LinkedIn is using OpenID Connect for new configurations. This article replaces the previous one. Older configurations will continue to function.

## Prerequisites

- [Create a user flow](https://learn.microsoft.com/azure/active-directory-b2c/tutorial-create-user-flows) so users can sign up and sign in to your application.
- [Register a web application](https://learn.microsoft.com/azure/active-directory-b2c/tutorial-register-applications).

## Create a LinkedIn application

To enable sign-in for users with a LinkedIn account in Azure Active Directory B2C (Azure AD B2C), you need to create an application in [LinkedIn Developers website](https://developer.linkedin.com/).

1. Sign in to the [LinkedIn Developers website](https://developer.linkedin.com/) with your LinkedIn account credentials.
2. Select **My Apps**, and then click **Create app**.
3. Enter **App name**, **LinkedIn Page**, **Privacy policy URL**, and **App logo**.
4. Agree to the LinkedIn **API Terms of Use** and click **Create app**.
5. Select the **Auth** tab. Under **Authentication Keys**, copy the values for **Client ID** and **Client Secret**.
6. Select the edit pencil next to **Authorized redirect URLs for your app**, and then select **Add redirect URL**. Enter `https://your-tenant-name.b2clogin.com/your-tenant-name.onmicrosoft.com/oauth2/authresp`. If you use a custom domain, enter `https://your-domain-name/your-tenant-name.onmicrosoft.com/oauth2/authresp`.
7. By default, your LinkedIn app isn't approved for scopes related to sign in. To request a review, select the **Products** tab, and then select **Sign In with LinkedIn using OpenID Connect**. When the review is complete, the required scopes will be added to your application.

## User Flow Configuration

1. Sign in to the [Azure portal](https://portal.azure.com/) as the global administrator of your Azure AD B2C tenant.
2. Navigate to your Azure AD B2C tenant.
3. Select **Identity providers**, then select **New OpenID Connect provider**.
4. Enter a **Name** (e.g., *LinkedIn-OIDC*).
5. For the **Metadata URL**, enter `https://www.linkedin.com/oauth/.well-known/openid-configuration`.
6. For the **Client ID**, enter the Client ID from your LinkedIn application.
7. For the **Client secret**, enter the Client Secret.
8. For the **Scope**, enter `openid profile email`.
9. For the **Response type**, enter `code`.
10. For the **User ID**, enter `email`.
11. For the **Display name**, enter `name`.
12. For the **Given name**, enter `given_name`.
13. For the **Surname**, enter `family_name`.
14. For the **Email**, enter `email`.
15. Select **Save**.
16. Add the LinkedIn-OIDC provider to your user flow under **Custom identity providers**.

## Custom Policy Configuration

### Create a policy key

1. On the B2C Overview page, select **Identity Experience Framework**.
2. Select **Policy keys** > **Add**.
3. For **Options**, choose `Manual`.
4. Enter a **Name** (e.g., `LinkedInSecret`). The prefix *B2C_1A_* is added automatically.
5. In **Secret**, enter the client secret.
6. For **Key usage**, select `Signature`.

### Claims Provider XML

Add the following ClaimsProvider to `TrustFrameworkExtensions.xml`:

```xml
<ClaimsProvider>
  <Domain>linkedin.com</Domain>
  <DisplayName>LinkedIn-OIDC</DisplayName>
  <TechnicalProfiles>
    <TechnicalProfile Id="LinkedIn-OIDC">
      <DisplayName>LinkedIn</DisplayName>
      <Protocol Name="OpenIdConnect" />
      <Metadata>
        <Item Key="METADATA">https://www.linkedin.com/oauth/.well-known/openid-configuration</Item>
        <Item Key="scope">openid profile email</Item>
        <Item Key="HttpBinding">POST</Item>
        <Item Key="response_types">code</Item>
        <Item Key="UsePolicyInRedirectUri">false</Item>
        <Item Key="client_id">Your LinkedIn application client ID</Item>
      </Metadata>
      <CryptographicKeys>
        <Key Id="client_secret" StorageReferenceId="B2C_1A_LinkedInSecret" />
      </CryptographicKeys>
      <InputClaims />
      <OutputClaims>
        <OutputClaim ClaimTypeReferenceId="issuerUserId" PartnerClaimType="email" />
        <OutputClaim ClaimTypeReferenceId="givenName" PartnerClaimType="given_name" />
        <OutputClaim ClaimTypeReferenceId="surname" PartnerClaimType="family_name" />
        <OutputClaim ClaimTypeReferenceId="identityProvider" DefaultValue="linkedin.com" AlwaysUseDefaultValue="true" />
        <OutputClaim ClaimTypeReferenceId="authenticationSource" DefaultValue="socialIdpAuthentication" AlwaysUseDefaultValue="true" />
      </OutputClaims>
      <OutputClaimsTransformations>
        <OutputClaimsTransformation ReferenceId="CreateRandomUPNUserName" />
        <OutputClaimsTransformation ReferenceId="CreateUserPrincipalName" />
        <OutputClaimsTransformation ReferenceId="CreateAlternativeSecurityId" />
        <OutputClaimsTransformation ReferenceId="CreateSubjectClaimFromAlternativeSecurityId" />
      </OutputClaimsTransformations>
      <UseTechnicalProfileForSessionManagement ReferenceId="SM-SocialLogin" />
    </TechnicalProfile>
  </TechnicalProfiles>
</ClaimsProvider>
```

### User Journey

Add the ClaimsProviderSelection and ClaimsExchange to your user journey orchestration steps:

```xml
<OrchestrationStep Order="1" Type="CombinedSignInAndSignUp" ContentDefinitionReferenceId="api.signuporsignin">
  <ClaimsProviderSelections>
    <ClaimsProviderSelection TargetClaimsExchangeId="LinkedInExchange" />
  </ClaimsProviderSelections>
</OrchestrationStep>
<OrchestrationStep Order="2" Type="ClaimsExchange">
  <ClaimsExchanges>
    <ClaimsExchange Id="LinkedInExchange" TechnicalProfileReferenceId="LinkedIn-OIDC" />
  </ClaimsExchanges>
</OrchestrationStep>
```

## Testing

1. Select your relying party policy (e.g., `B2C_1A_signup_signin`).
2. For **Application**, select a registered web application. The **Reply URL** should show `https://jwt.ms`.
3. Select **Run now**.
4. From the sign-up or sign-in page, select **LinkedIn-OIDC** to sign in with LinkedIn account.
5. If successful, your browser redirects to `https://jwt.ms` displaying the token contents.

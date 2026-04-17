# Sign Out Without User Selection Prompt (OpenID Connect/OAuth2)

Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/sign-out-of-openid-connect-oauth2-applications-without-user-selection-prompt

## Problem

When signing out of an OpenID Connect/OAuth2 app, users are prompted to select which account to sign out of, even if only one account is active.

## Solution: logout_hint Parameter

### Step 1: Add login_hint Optional Claim

Entra Admin Center > App Registrations > Token configuration > Add optional claim > ID token > `login_hint`

### Step 2: Include openid + profile Scopes

Ensure sign-in request includes both `openid` and `profile` scopes so `login_hint` claim appears in id_token.

### Step 3: Pass logout_hint in Sign-out Request

```
/oauth2/v2.0/logout?post_logout_redirect_uri=...&logout_hint=<login_hint_claim_value>
```

## Framework Examples

### MSAL.js
```typescript
logout() {
    var account = this.authService.instance.getAllAccounts()[0];
    let logoutRequest: EndSessionRequest = { account: account };
    this.authService.logout(logoutRequest);
    // MSAL.js automatically sends logout_hint if login_hint claim detected
}
```

### ASP.NET Core (Microsoft Identity Web / OpenID Connect)
```csharp
options.Events.OnRedirectToIdentityProviderForSignOut = (context) => {
    var login_hint = context.HttpContext.User.Claims
        .Where(c => c.Type == "login_hint").FirstOrDefault();
    if (login_hint != null)
        context.ProtocolMessage.SetParameter("logout_hint", login_hint.Value);
    return Task.FromResult(true);
};
```

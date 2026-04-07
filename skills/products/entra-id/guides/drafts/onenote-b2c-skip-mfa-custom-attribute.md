# Skip MFA for Specific B2C Accounts Using Custom Attributes

## Overview
Temporarily disable MFA for specific Azure AD B2C users using custom user attributes and custom policy modifications.

## Steps

### 1. Add Custom Attribute
In B2C tenant, add custom attribute: `skipmfa` (Boolean type)

### 2. Modify Custom Policy

#### a. Add ClaimType in ClaimsSchema
```xml
<ClaimType Id="extension_skipmfa">
  <DisplayName>Skip MFA</DisplayName>
  <DataType>boolean</DataType>
</ClaimType>
```

#### b. Update AAD ClaimsProvider Technical Profiles
- Add `extension_skipmfa` to OutputClaims in:
  - `AAD-UserReadUsingObjectId`
  - `AAD-UserReadUsingAlternativeSecurityId`
  - `login-NonInteractive`

#### c. Add Precondition to MFA Orchestration Step
```xml
<Precondition Type="ClaimEquals" ExecuteActionsIf="true">
  <Value>extension_skipmfa</Value>
  <Value>True</Value>
  <Action>SkipThisOrchestrationStep</Action>
</Precondition>
```

### 3. Set Skip MFA for Specific User (via Graph API)
```powershell
$params = @{
  extension_<b2c-extensions-app-id-no-dashes>_skipmfa = "True"
}
Update-MgUser -UserId <user-id> -BodyParameter $params
```

### 4. Restore MFA
Set `extension_..._skipmfa` to `null` or `false` via Graph API.

### 5. Verify
```powershell
$user = Get-MgUser -UserId <user-id> -Property "extension_<appid>_skipmfa"
$user.AdditionalProperties
```

## References
- Custom attributes: https://learn.microsoft.com/en-us/azure/active-directory-b2c/user-flow-custom-attributes
- Extensions: https://learn.microsoft.com/en-us/graph/extensibility-overview

## Source
- OneNote: MCVKB/VM+SCIM/11.53

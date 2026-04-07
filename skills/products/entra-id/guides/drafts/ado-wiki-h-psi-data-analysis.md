---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Microsoft Authenticator (PSI) For Work Accounts/MS Authenticator PSI Data analysis"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FMicrosoft%20Authenticator%20(PSI)%20For%20Work%20Accounts%2FMS%20Authenticator%20PSI%20Data%20analysis"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# MS Authenticator PSI Data Analysis Guide

## Determine if Company Portal is being used as the broker

Obtain the Authenticator logs and look for this string:

`"isAuthenticatorBroker: false MsalTokenRefreshManager.initializeMultipleAccountPublicClientApplication"`

A response of `False` implies Company Portal is functioning as the Broker, because only Company Portal or Authenticator app can be the Broker host.

## Determine if a User Enabled Passwordless Authenticator Sign-in

### Microsoft Graph PowerShell

```powershell
# Get all registered authentication methods for a user
Get-MgUserAuthenticationMethod -UserId john@contoso.com

# Once you know the Microsoft Authenticator Authentication Method Id:
Get-MgUserAuthenticationMicrosoftAuthenticatorMethodDevice -UserId john@contoso.com -MicrosoftAuthenticatorAuthenticationMethodId $microsoftAuthenticatorAuthenticationMethodId
```

### DSExplorer

1. Examine the **StrongAuthenticationPhoneAppDetails** attribute of the user account.
2. When passwordless Authenticator sign in is enabled it will contain a **DeviceId** value populated with the guid of a registered device.

### Interpret Microsoft Authenticator App Account Status

Key attributes to check on user object:

- **StrongAuthenticationPhoneAppDetails**: DeviceTag changes from "SoftwareTokenActivated" to "iOS"/"Android", DeviceId populated, AuthenticationType changes from 3 to 1 (PushNotification)
- **SearchableDeviceKey**: Usage value of 1 = NGC (next generation credential)
- **OathTokenMetadata**: TokenType 2 = Software token

### Entra Audit Log

Look for `Update user` initiated by `fim_password_service@support.onmicrosoft.com` with `StrongAuthenticationPhoneAppDetail` changes showing DeviceTag change and DeviceId population.

## Entra Sign-ins Logs

Look for:
- `appDisplayName: "Microsoft Authentication Broker"`
- `mfaDetail.authMethod: "Mobile app notification"`
- `status.additionalDetails: "MFA completed in Entra ID"`

## Sign-ins and MFA-SAS-Detailed

1. Locate sign-in event with Status = *Interrupted*
2. Under MFA Logs > MFA-SAS-Detailed, filter Messages for `entropy`:
   - "Generating payload for push notification" — contains three EntropyChallenges
   - `AuthDetailsIsEmpty: False` = app/location rich context shown to user
   - "Selected entropy number is correct!" = user entered correct number
   - "MobileApp authentication succeeded" = success

## Authentication Diagnostic

1. Click "Troubleshoot this sign-in" on the event
2. Select `OAuth2:Authorize` Call with ErrorCode `UserStrongAuthClientAuthNRequiredInterrupt` (50074)
3. Expert view > Diagnostic logs:
   - `AuthMethodType:PhoneAppNotification IsDefault:true` = PSI configured
   - `StrongAuthenticationPhoneAppDetails` shows registered DeviceId
4. Check `SAS:BeginAuth` → `SAS:ProcessAuth` showing `MfaDoneInCloud`
5. Final `OAuth2:Token` call: AuthMethods = `Password, X509, MultiFactor`, OTAppID = `4813382a-8fa7-425e-ab75-3b753aab3abb` (Authenticator App)

## ASC Graph Explorer

### View Microsoft Authenticator Policy

Query URL: `/authenticationMethodsPolicy/authenticationMethodConfigurations/MicrosoftAuthenticator`
Version: `beta`

### Determine policies for specific user

Query URL: `users/{user-UPN-or-objectID}/authentication/policy`
Version: `beta`

### View registered devices for user

Query URL: `/users/{UPN}/authentication/MicrosoftAuthenticatorMethods`
Version: `Beta`

## Generic Policy Explorer (Tenant Explorer)

1. Select Directory object node > Policy tab
2. Filter by "Default User Credential Policy"
3. Search Policy Detail for `{"type":"PhoneSignIn"` — check if user's objectID or group is listed

## Troubleshooting Risk-based Scenarios

### ESTS Kusto

Cluster: `https://estsam2.kusto.windows.net` / Database: ESTS

```kql
AllPerRequestTable
| where env_time > ago(2d)
| where RequestId == "<request-id>"
| project env_time, CorrelationId, RequestId, Call, UserPrincipalObjectID, ErrorCode, ErrorNo, RamAdhocDebuggingInfo, RngcData, env_appId
```

`RamAdhocDebuggingInfo` contains **PSIBLK** flag when risk-based blocking occurs (unfamiliar location).

# Microsoft Authenticator Push Notification Log Analysis Guide

> Source: OneNote - Mooncake POD Support Notebook / Azure AD / MFA / Case study / Authenticator Push Notification Log Sample

## Overview

This guide documents how to troubleshoot Microsoft Authenticator push notification issues using HAR traces, Jarvis/Geneva logs, and Authenticator diagnostic logs (MicrosoftAuthenticatorLogs).

## Step 1: Capture Correlation IDs from HAR (F12)

### BeginAuth Request
- Capture the `SasSessionId` from the BeginAuth request payload
- This correlates the browser-side auth request with server-side logs

### EndAuth Response
- Capture the final authentication result

## Step 2: Check Server-Side Notification Delivery (Jarvis)

Query Jarvis for SAS (Strong Authentication Service) logs:
- **Jarvis shortlink**: `https://portal.microsoftgeneva.com/s/9E6980E6`
- Filter by `SasSessionId` from HAR trace

### Key Result Codes

| ResultCode | Meaning |
|-----------|---------|
| `Success` | Notification sent successfully |
| `RequestRedirected` | Request redirected to correct replication scope |
| `AuthenticationPending` | Waiting for user to approve |
| `UserAuthFailedDuplicateRequest` | Duplicate auth request — user may have triggered multiple sign-ins |

## Step 3: Analyze Authenticator App Logs (MicrosoftAuthenticatorLogs)

### Collecting Logs
1. In Authenticator app: Settings → Send Feedback → Upload Diagnostic Logs
2. Download from [PowerLift](https://aka.ms/powerlift) (requires `authlogreader` security group membership)

### Key Log Events (in chronological order)

| Log Keyword | Meaning |
|------------|---------|
| `didReceiveNotificationResponse` | App received and opened push notification |
| `Creating an MFA session from enhanced notification` | Creating approval dialog from push |
| `pullPendingNotificationsAsync` | App pulling pending notifications (auto or manual) |
| `sendRequestAsync ... POST ... MobileAppCommunicator.svc` | Communicating with MFA backend |
| `handleCheckForAuthResponse: Pending authentication found` | Found pending auth request |
| `executeAuthDetailsRequest ... SessionApprovalCheckForAuth` | Processing auth details from pull response |
| `displayStandardNotification` | Displaying approval dialog to user |
| `viewDidAppear: Mfa Sdk parent notification view controller` | Approval dialog visible |
| `批准 button clicked` / `Approve button clicked` | User tapped Approve |
| `sendPhoneAppAuthenticationResult` | Sending approval result to server |
| `phoneAppAuthenticationResultComplete` | Server processed result |

### MFA Backend Endpoints

| Environment | Endpoint |
|------------|----------|
| Global (AS/NA) | `mobileappcommunicator.auth.microsoft.com/mac/MobileAppCommunicator.svc` |
| China (CN-MFA) | `mobileappcommunicator.auth.microsoft.cn/mac/MobileAppCommunicator.svc/` |

### Account Identification in Logs

Look for `Accounts in the app` section:
- `PhoneAppDetailId` — links to specific account
- `Replication scope` — `CN-MFA` = China, `NA`/`AS` = Global
- `Account type: MFA`
- `Group key` — unique per account registration
- `Tenant ID` — identifies the tenant

## Step 4: Common Issues & Fixes

### Push Notification Delays (especially Android)

If users report delayed notifications:
1. Go to OS Settings → Apps → Authenticator:
   - Allow background activity
   - Allow data usage in background
   - Override "Do Not Disturb" mode
   - Disable battery optimization / doze mode
   - Set high priority for notifications

> iOS is generally less affected. Android is notorious for notification delays.

### Duplicate Request Errors

`UserAuthFailedDuplicateRequest` in Jarvis logs indicates:
- User triggered multiple sign-in attempts
- Each generates a new SasSessionId
- Only one can succeed; others fail with duplicate error
- Resolution: Ask user to wait for notification and only attempt one sign-in at a time

## References

- [Troubleshoot Microsoft Authenticator](https://support.microsoft.com/account-billing/troubleshoot-microsoft-authenticator)
- [Microsoft Authenticator App - ADO Wiki](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/337053/Microsoft-Authenticator-App)
- [iOS Generic Logs Collection](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/337053/Microsoft-Authenticator-App?anchor=%5Bios%5D-generic-logs)

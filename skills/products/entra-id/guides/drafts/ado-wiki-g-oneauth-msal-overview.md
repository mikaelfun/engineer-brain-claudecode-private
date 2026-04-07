---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/OneAuth MSAL/Overview"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/OneAuth%20MSAL/Overview"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# OneAuth-MSAL Overview

OneAuth-MSAL is a cross-platform authentication library that enables 1P developers to authenticate against Microsoft Identity services in their client side (public client) applications. It supports various authentication scenarios, such as single sign-on, multi-factor authentication, and conditional access policies. It also provides a consistent and secure token acquisition and caching mechanism across different platforms and devices.

## Key Features
- Supports both AAD and MSA accounts.
- Supports AAD v2 protocol.
- Provides a unified and extensible public API for different platforms: Android, iOS, macOS, Windows, Linux.
- Provides a secure and reliable token cache that can be shared across applications on a given device.
- Provides built-in support for logging, telemetry, and diagnostics.
- Provides seamless integration with platform specific identity brokers and allows applications to request access tokens containing device CA claims.

## Top Level APIs

### Account Retrieval APIs
1. **ReadAccountById** (synchronous) - Retrieves an account object for a given account id from OneAuth store. Blocking local I/O operation.
2. **SignInSilently** (asynchronous) - Retrieves a new account object inferred from the underlying OS infrastructure without any user interaction, if such an inference is possible.
3. **SignInInteractively** (asynchronous) - Retrieves a new account by prompting the user for necessary sign-in information.
4. **ReadAllAccounts** (synchronous) - Returns all accounts from OneAuth-MSAL local persistent store. Multiple blocking read operations.
5. **DiscoverAccounts** (asynchronous) - Discovers new accounts from various sources like Brokers and persists new accounts in OneAuth-MSAL local persistent store. Performance penalty is significant.

### Key Differences
- **DiscoverAccounts**: Async, ensures OneAuth-MSAL local store is populated with up-to-date account information from external sources (Brokers). Not recommended in performance sensitive flows like app startup.
- **ReadAllAccounts**: Synchronous, enumerates all accounts from local store. Used for account selection, matching internal user data, multi-user apps.

### Important Rules
- When signing in a new user, apps calling ReadAllAccounts and DiscoverAccounts must prompt the user to select an account instead of randomly choosing it.
- After initial account retrieval, for most scenarios, apps should use ReadAccountById() for rehydrating account objects.

## Sign-Out APIs

### DisassociateAccount()
- Works at the OneAuth layer on App <-> Account association
- Driven off the ApplicationID provided by the app
- Does NOT have any impact on SSO/prompting
- Only controls which accounts are returned when ReadAssociatedAccounts() is called

### SignOutSilently()
- Works at the MSAL layer with traditional sign-out concept
- Deletes all access tokens and app-specific refresh tokens for the current app's Client ID
- Writes a flag to block all silent auth attempts and force a prompt on next interactive call
- Does NOT expose a global sign out concept (delete account from system for all apps)

## Error/Status System
- **Top level error statuses**: Used for flow control. Documented in Status.hpp
- **Sub-statuses**: Differentiate between closely related error states. Documented in SubStatus.hpp
- **Internal errors**: Part of error object/telemetry blobs. Platform specific.
- **Tags**: Identify a specific line of code that triggered the error condition. Format: `tag_XXXXX`

## Investigating OneAuth-MSAL Failures
Required data:
1. The precise error code and tag OneAuth-MSAL returned
2. Correlation id and timestamp of the failed request
3. OneAuth-MSAL verbose logs
4. Platform broker logs when applicable
5. Fiddler traces
6. A screenshot of the failed interactive request (expand Troubleshooting details section)

## Collecting OneAuth-MSAL Logs
OneAuth-MSAL doesn't write/persist logs directly. The application registers a callback and all log events are returned to the calling app. Each application has a different mechanism:

| App | How to Collect |
|-----|----------------|
| **Office** | "Send-a-frown" uploads logs (tag_48cmb for OneAuth), or use https://aka.ms/msoaid |
| **Teams (classic)** | See UC wiki: Troubleshooting Authentication |
| **New Teams** | See UC wiki: Collect Teams Logs |
| **Edge** | See Edge wiki: Identity TSG - Capturing detailed OneAuth logs |
| **OneDrive** | Involve OneDrive engineer, logs at `%localappdata%\Microsoft\OneDrive\logs`, analyze with Scout (https://aka.ms/getscout) |

## MATS Telemetry Portal
- Visualization portal for monitoring authentication flow reliability: https://aka.ms/mats
- Client-side library for processing authentication signals and generating telemetry data
- Support engineers can use MATS portal for assessing the true impact of a given issue

## OneAuth-MSAL Tags
- Tags identify the exact line of code that triggered an error condition
- Example: `tag_4p9ga` means WAM returned an invalid response
- Best way to track tags is to use the hashed representation (e.g. tag_4p9ga)

## ICM Path
- Submit ICM: https://aka.ms/M365ID/OneAuthICM
- **Must be reviewed by CSS TA/PTA before submission**
- Owning Service: Cloud Identity AuthN Client
- Owning Team: Cloud Identity AuthN OneAuth-MSAL C++
- All ICMs: https://aka.ms/oneauth/incidents
- Severity 2+ generates phone call to on-call engineer (<5 min SLA)

## URLs and IPs
- Reference: https://learn.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges
- Typically row 46 and row 56 should be included in the allowlist

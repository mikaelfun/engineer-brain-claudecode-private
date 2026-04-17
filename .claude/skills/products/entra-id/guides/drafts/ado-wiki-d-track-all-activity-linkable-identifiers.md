---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Logs and Reporting/Azure AD Reporting Workflow/Track All Activity with Linkable Identifiers"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20Logs%20and%20Reporting/Azure%20AD%20Reporting%20Workflow/Track%20All%20Activity%20with%20Linkable%20Identifiers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Track All Activity with Linkable Identifiers

## Summary

Microsoft introduced linkable identifiers in all tokens and customer-facing logs to enhance security and aid in investigation of identity-related attacks. Two types:

- **DUSI (Device/User/Session ID)**: Uses Session ID (SID) to link all authentication artifacts from a single root authentication
- **UTI (Unique Token Identifier)**: Per-token identifier in leaf tokens (access tokens, id tokens) for finer granularity tracking

All linkable identifiers appear in:
- Entra Sign-in logs
- Exchange Online audit logs
- SharePoint Online audit logs
- Teams audit logs
- MS Graph Activity logs

> No plans to extend beyond these services.

## Linkable Identifier Claims

| Event field | Claim | Format | Description |
|---|---|---|---|
| Date | `iat` | int (Unix timestamp) | When authentication occurred |
| User ID | `oid` | String (GUID) | Immutable identifier for requestor |
| Session ID | `sid` | String (GUID) | Unique per interactive authentication session |
| Resource Tenant ID | `tid` | String (GUID) | Tenant user is signing in to |
| Unique Token Identifier | `uti` | String (case-sensitive) | Per-token identifier |
| Device ID | `deviceid` | String (GUID) | Device identifier |

## Sample Investigation Scenarios

### 1. UTI-based search
Begin with UTI from Entra Sign-in logs (points to specific access token) -> join with workload logs (EXO audit, MSGraph activity) to identify all activities performed with that token.

### 2. SID-based search
Begin with SID from Entra Sign-in logs (points to all access tokens in session) -> join with workload logs to identify all activities from any token in the same session.

### 3. Further filtering
Filter by User ID, Device ID, or token issued time frame.

## Investigation Flow (Example: Entra + Exchange)

1. Start with Entra Sign-in log entry - get SID, UTI, OID from Basic info and Device info tabs
2. Use SID/UTI to correlate with Exchange Online audit logs
3. Same process applies for SPO, Teams, and MS Graph Activity logs

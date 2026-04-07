---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Entra ID My Signins"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FEntra%20ID%20My%20Signins"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Entra ID My Sign-Ins

## Summary
My Sign-Ins (RecentActivity) page allows enterprise users to review their sign-in history at https://mysignins.microsoft.com/. Users can monitor for unusual activity and reset passwords if unauthorized access is detected.

## Access
Enterprise users navigate to https://mysignins.microsoft.com/

## Limitations
1. Unsuccessful sign-ins do not report why authentication failed (admin must correlate with Entra ID Sign-in logs)
2. No CorrelationID available for users to provide administrators (report App name + time/date instead)
3. Does not show primary authentication method (no distinction between password and passwordless)

## Known Issues

### Issue #1: Excessive implicit sign-ins to Microsoft App Access Panel
Users with My Apps Secure Sign-in Extension see repeated sign-in events.
**Workaround:** Disable the extension while reviewing activity.

### Issue #2: PowerShell sign-in shows Browser
ADAL connections from PowerShell register the default browser name. Informational only.

### Issue #3: Map not available for mobile activities
By design - mobile sign-ins route through unpredictable IPs. Reduces confusion and false positives.

### Issue #4: Filtering by IP/Session fails
Filtering by IPv4 address or Session activity (Successful/Unsuccessful) returns no results. Known issue.

### Issue #5: Sign out everywhere link fails
"Sign out everywhere" link in Security Info page shows error. Tracked in ICM-640632289, Bug 3283985.

## January 2026 Update: MFA Requirement for Graph API Auth Methods

Starting January 26, 2026, managing authentication methods via Microsoft Graph API requires MFA within last 10 minutes.

**Impact:** Applications calling Graph authentication method management APIs may receive 403 Forbidden.

**Developer Guidance:**
- Handle 403 responses by initiating new interactive OAuth 2.0 authorization with claims:
```json
{
  "access_token": {
    "amr": {
      "essential": true,
      "values": ["ngcmfa"]
    }
  }
}
```
- Retry credential management request with new access token

**Not affected:** Users managing auth methods through https://aka.ms/mysecurityinfo (MFA already required)

## Summary View Columns
| Column | Description |
|--------|-------------|
| Date/Time | Local client time |
| Country | Country code of sign-in location |
| Application | Cloud app display name |
| Sign-in status | Successful/Unsuccessful |

## Taking Corrective Action
Left-hand navigation differs based on credential registration flow. Users can click **Reset your password** to change credentials if unauthorized access detected.

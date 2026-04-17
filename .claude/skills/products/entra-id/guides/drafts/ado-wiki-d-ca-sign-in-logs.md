---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Conditional Access Sign-in Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FAzure%20AD%20Conditional%20Access%20Sign-in%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Summary

Azure AD Sign-ins logging has been extended to include Conditional Access data. Customers can now troubleshoot Conditional Access policies through the All sign-in report, reviewing the CA status and examining details of policies applied and controls enforced.

## Enable the Conditional Access Filter

1. Navigate to the Azure AD tenant
2. Select **Sign-ins**
3. Click **Add filters**
4. Select **Conditional Access** and **Apply**
5. Filter results by: All, Not Applied, Success, or Failure

## Filter Options

| CA Filter | Description |
|-----------|-------------|
| All | All sign-ins regardless of CA |
| Not Applied | Sign-ins where no CA policy applied |
| Success | CA conditions and controls satisfied |
| Failed | CA conditions/controls not satisfied |

### Client App Filter Values

| Filter | Description |
|--------|-------------|
| Browser | Sign-ins using browser flows |
| Exchange ActiveSync (supported) | EAS from iOS, Android, Windows Phone |
| Exchange ActiveSync (unsupported) | EAS from unsupported platforms like Linux |
| Mobile Apps and Desktop clients | Non-browser sign-ins (mobile apps, desktop Office) |
| Other clients | Legacy protocols: IMAP, MAPI, POP, SMTP, Older Office clients |

## Known Issue: EAS Legacy Auth Sign-in Log Confusion

**Scenario**: Customer configures CA to block EAS legacy authentication. User attempts EAS access to EXO. Sign-in logs show CA status as Failure but Session status as Success.

**Explanation**: By design — Azure AD relies on Exchange to enforce EAS CA policies. Azure AD sends a signal for Exchange to block but still issues a token (ESTS doesn't block on CA for EAS). The session field currently shows Success incorrectly. Future update will correct to Failed (tracked: Epic 1071328).

## Export Sign-in Logs

- **Download** button saves filtered view to CSV
- Date always saved in UTC format regardless of portal display setting
- Client App field shows "Other clients; Older Office clients" for legacy protocols
- Browser column contains initial portion of UserAgent

## Summary View Fields

For each sign-in event in Summary view:
- Date
- User
- Application
- Sign-in Status (Success/Failure)
- Conditional Access status

## Detailed View

Clicking a specific event shows:
- All CA policies that were evaluated
- Per-policy: conditions matched, controls required, grant/session controls result
- Whether the policy was in Report-only mode

## Troubleshooting Tips

1. **User Name Filter must contain DisplayName** — UPN will not work in the filter
2. **EAS block shows misleading status** — Success in session doesn't mean access was granted; Exchange enforces the block
3. **Export date is always UTC** — regardless of local/UTC toggle in portal
4. **Check Report-only policies** — they appear in detailed view but don't enforce controls
5. **Legacy protocol identification** — use Client App filter to isolate legacy auth attempts

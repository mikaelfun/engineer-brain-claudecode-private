# DLP Policy Tip HAR Diagnostic Guide

> Source: https://learn.microsoft.com/troubleshoot/microsoft-365/purview/data-loss-prevention/diagnose-dlp-policy-tip-display-issues
> Status: guide-draft (pending SYNTHESIZE review)

## When to Use

DLP policy tips in OWA (Outlook on the web) either:
- Appear sporadically or never appear
- Show incorrect tips
- Are not triggered as expected

## How It Works

When composing email in OWA, Outlook calls the `GetDlpPolicyTips` service which checks:
1. The text typed by the user
2. The recipients of the email
3. The DLP policies that apply

## Diagnostic Steps

### Step 1: Collect HAR Trace

1. Open browser Developer Tools (F12)
2. Go to Network tab, enable "Preserve log"
3. Start recording BEFORE trying to trigger the policy tip
4. Reproduce the issue in OWA
5. Export HAR file (must be < 100 MB)

### Step 2: Upload to HAR Diagnostic

Navigate to: `purview.microsoft.com/datalossprevention/diagnostics`

### Step 3: Interpret Results

The diagnostic extracts from `GetDlpPolicyTips` calls:

| Output Field | What It Tells You |
|-------------|-------------------|
| Sender and Recipient Info | Whether participants are in policy scope |
| Evaluation Result | Whether policy check succeeded or failed |
| Detected SITs | SITs found, occurrence count, confidence level |
| Evaluated Policies and Rules | Which DLP rules were checked and matched |

### Common Scenarios

| Scenario | Meaning | Next Steps |
|----------|---------|------------|
| No GetDlpPolicyTips API calls | OWA didn't send evaluation request | Recapture HAR trace; contact support |
| Evaluation result 8 | Back-end service error | Contact support |
| No matching rules found | Content doesn't meet any DLP conditions | Check SIT types, confidence levels, thresholds in policy |

### Key Checks When No Rules Match

1. Verify DLP policy is enabled and configured correctly
2. Check SITs in policy match content in email
3. Check confidence levels (may be too strict)
4. Check match threshold (may be too high)
5. Verify policy is published and assigned to correct scope

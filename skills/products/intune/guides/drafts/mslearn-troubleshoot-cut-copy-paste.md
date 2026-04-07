# Troubleshooting Cut/Copy/Paste Restrictions

Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-cut-copy-paste

## APP Settings Reference

| Setting Value | Effect |
|--------------|--------|
| Blocked | Block copy/paste to AND from all managed apps |
| Policy managed apps | Allow between managed apps only; block managed↔unmanaged |
| Policy managed apps with paste in | Allow between managed + allow unmanaged→managed; block managed→unmanaged |
| Any app | No restriction |

Additional: "Cut and copy character limit" (0-65535) provides exception to blocked operations.

## Common Scenarios

### Users CAN paste from managed to unmanaged (should be blocked)
- **Check**: "Restrict cut, copy, and paste between other apps" setting
- Likely set to "Any app" instead of "Policy managed apps"
- Verify in both Intune admin center AND on device (Edge → about:intunehelp)

### Users CANNOT paste between managed apps (should be allowed)
- **Check**: Setting may be "Blocked" (blocks ALL including managed-to-managed)
- Also verify document is opened from managed location (OneDrive/SharePoint)
- APP doesn't apply to unsaved new documents
- Change to "Policy managed apps" to allow managed-to-managed transfer

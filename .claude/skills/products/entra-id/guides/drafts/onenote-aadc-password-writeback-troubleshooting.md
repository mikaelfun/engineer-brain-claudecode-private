# Password Writeback Troubleshooting Guide

**Source**: OneNote - Mooncake POD Support Notebook
**Status**: Draft (pending SYNTHESIZE review)

## Prerequisites
- AAD Connect installed with Password Writeback enabled
- Supported OS
- Proxy settings configured correctly

## Log Collection
1. On the **password reset portal**, locate the **support code** (bottom-right corner)
2. Collect **Application event log** on the AAD Connect server
3. Use the support code to search in Application event log

## Troubleshooting Steps

### Step 1: Check Support Code in Event Log
- If found → troubleshoot according to the error message
- If NOT found → proceed to Step 2

### Step 2: Check Prerequisites
- Reference: [Getting started with Password Management](https://azure.microsoft.com/en-us/documentation/articles/active-directory-passwords-getting-started/)

### Step 3: Verify Password Writeback Status
```powershell
$aadConnectorName = Get-ADSyncConnector -name "<tenant>.onmicrosoft.com – AAD"
Get-ADSyncAADPasswordResetConfiguration -Connector $aadConnectorName.Name
```

### Step 4: Reset Password Writeback (without re-configuration)
```powershell
Set-ADSyncAADPasswordResetConfiguration -Connector $aadConnectorName.Name -Enable $true
Get-ADSyncAADPasswordResetConfiguration -Connector $aadConnectorName.Name
```

### Step 5: Check Sync Rule
- Verify sync rule **"Out to AAD – User Join"** has **Enable Password Sync** checked
- Even if Password Sync is not enabled in AADC config, this flag must be checked for writeback to work
- Reference: entra-id-onenote-299

## Common Causes
- Unsupported OS
- Proxy settings blocking connectivity to Azure AD
- Internal bad state (reset via Step 4)
- Sync rule misconfiguration (Step 5)
- Network connectivity issues

## References
- [Troubleshoot connectivity issues with Azure AD Connect](https://azure.microsoft.com/en-us/documentation/articles/active-directory-aadconnect-troubleshoot-connectivity/)
- [How to troubleshoot Password Management](https://azure.microsoft.com/en-us/documentation/articles/active-directory-passwords-troubleshoot/)

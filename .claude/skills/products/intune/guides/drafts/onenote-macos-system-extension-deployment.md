# macOS System Extension Deployment Guide

> Source: OneNote - Mooncake POD Support Notebook / Intune / MacOS TSG / MacOS extension

## Overview

Starting from macOS Catalina 10.15, kernel extensions are deprecated. Use **system extensions** instead, deployed via Intune device configuration profiles.

## Verify Extension Deployment

### Check via Terminal

```bash
systemextensionsctl list
```

### Check via Console Logs (Successful Deployment)

```
SystemExtensionsMDM  cpValidatePayloadForInstall for profile name System Extension Profile returning success
sysextd  Received request to install MDM payload with UUID {uuid}
sysextd  Installed MDM payload with UUID {uuid}
SystemExtensionsMDM  cpInstallPayload for profile name System Extension Profile returned success
mdmclient  Installed configuration profile: System Extension Profile (www.windowsintune.com.systemExtensionPolicy:{id}) for <Computer> (Source: MDM)
```

## Find Team ID and Bundle ID

Required for Intune system extension allowlist configuration.

```bash
# Open Terminal
sqlite3 /var/db/SystemPolicyConfiguration/KextPolicy

# Run query
SELECT * FROM kext_policy;
```

Output shows: Team ID (first column), Bundle ID, and developer display name for each extension.

## References

- [Support Tip: Using system extensions instead of kernel extensions (Microsoft Tech Community)](https://techcommunity.microsoft.com/t5/intune-customer-success/support-tip-using-system-extensions-instead-of-kernel-extensions/ba-p/1191413)
- [Deprecated Kernel Extensions and System Extension Alternatives (Apple Developer)](https://developer.apple.com/support/kernel-extensions/)

# macOS System/Kernel Extension Management via Intune

> Source: MCVKB/Intune/Mac/MacOS extension.md
> Quality: guide-draft (pending review)

## Overview

macOS Catalina 10.15+ deprecated kernel extensions in favor of system extensions. Intune can deploy system extension profiles to pre-approve extensions on managed devices.

## Key References

- [Support Tip: Using system extensions instead of kernel extensions](https://techcommunity.microsoft.com/t5/intune-customer-success/support-tip-using-system-extensions-instead-of-kernel-extensions/ba-p/1191413)
- [Apple: Deprecated Kernel Extensions and System Extension Alternatives](https://developer.apple.com/support/kernel-extensions/)

## Verification

### Check if extension is deployed

Run on macOS device:
```bash
systemextensionsctl list
```

### Successful deployment logs (Console.app)

Look for these log entries:
```
SystemExtensionsMDM: cpValidatePayloadForInstall for profile name System Extension Profile returning success
sysextd: Installed MDM payload with UUID <uuid>
mdmclient: Installed configuration profile: System Extension Profile
```

## Finding Team Identifier and Bundle Identifier

Required when configuring system extension profiles in Intune:

1. Open Terminal
2. Run: `sqlite3 /var/db/SystemPolicyConfiguration/KextPolicy`
3. Execute: `SELECT * FROM kext_policy;`

Output shows: Team ID | Bundle ID | Display Name for each extension.

## Troubleshooting

- `"request contains no authorizationref"` in sysextd logs - may indicate profile deployment timing issue
- Verify profile is targeting device channel, not user channel
- Check that Team ID and Bundle ID match exactly in Intune profile configuration

# iOS App Types and Deployment in Intune

> Source: OneNote — iOS TSG
> Status: DRAFT — pending SYNTHESIZE review

## iOS App Types Overview

| App Type | Source | Deployment | Updates | Key Notes |
|----------|--------|------------|---------|-----------|
| Store Apps | Apple App Store | Intune deploys from App Store | Automatic | Standard public apps |
| LOB Apps | In-house / Third-party | Upload .ipa to Intune | Manual (admin uploads new version) | Custom business apps |
| Web Apps | URL/Web link | Intune creates home screen shortcut | Automatic | Web-based applications |
| Built-in Apps | Pre-installed on device | No deployment needed | Automatic | Default iOS apps |
| VPP Apps | Apple Business Manager | Sync VPP token with Intune | Automatic | Centralized license management, no Apple ID required on device |
| Managed App Config | Any supported app | Via app configuration policies | Depends on base app type | Push config settings to apps |

## VPP App Management Best Practices

### Keeping VPP Apps Updated

1. **Sync VPP Tokens Regularly**: Configure automatic sync in Intune for VPP token updates
2. **Enable Automatic App Updates**: Intune auto-pushes VPP app updates when new versions available
3. **Monitor Update Status**: Intune admin center > Apps > All apps > select VPP app > check deployment status
4. **Compliance Policies**: Create policies requiring latest app versions
5. **User Notifications**: Use Company Portal notifications to remind users about updates

### VPP Licensing

- **User-based licensing**: 1 Apple ID can associate max 10 devices (<5 PC/Mac)
- **Device-based licensing**: No Apple ID required, app assigned directly to device serial number
- **Recommendation**: Use device-based licensing to avoid Apple ID prompts and limits

## Key Differences

- **Store vs VPP**: VPP provides centralized license management; store apps require individual App Store purchases
- **LOB vs Store**: LOB apps uploaded as .ipa files; store apps linked from App Store
- **User vs Device licensing**: User-based requires Apple ID; device-based does not

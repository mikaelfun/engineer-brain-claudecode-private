---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Security Baselines"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FSecurity%20Baselines"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Security Baselines — Troubleshooting Guide

## Overview

Security baselines are pre-configured groups of Windows settings recommended by relevant security teams. Deploy to groups of users/devices running Windows 10/11.

Available baselines:
- Windows 10/11 MDM Security Baseline
- Microsoft Defender for Endpoint baseline
- Microsoft 365 Apps for Enterprise
- Microsoft Edge Baseline
- Windows 365 Security Baseline

## Scoping Questions

1. Full error description
2. Steps to reproduce
3. PolicyID, example userID and deviceID
4. Device management type (Intune enrolled, co-managed, tenant attached, MDE attached)
5. Whether it ever worked and last change before issue

## Support Boundaries

| Feature | Owner if not working on device |
|---------|-------------------------------|
| Defender Application Guard | Windows UEX |
| Defender Firewall | Windows networking |
| Defender SmartScreen | Azure Security |
| Windows Encryption | MSaaS Windows Devices |
| Defender Exploit Guard | Azure Security |
| Defender Application Control | MSaaS Windows Devices |
| Defender Credential Guard | MSaaS Windows Devices |
| Defender Security Center | Azure Security |
| Local device security options | Intune |
| User Rights | MSaaS Windows Devices |

**Important**: Intune supports configuration and verifying policy/registry settings reach the device. If settings are applied but feature doesn't work → not an Intune issue, transfer to relevant team.

## Troubleshooting

### Assignment States
- **Succeeded**: Policy applied
- **Conflict**: Two settings on same device, admin must review
- **Error**: Policy failed, error code links to explanation
- **Pending**: Device hasn't checked in
- **Not applicable**: Device can't receive policy (e.g., OS version too old)

### Conflicts

Use Kusto to identify conflicts:
```kusto
let _deviceId = "<DeviceID>";
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time between (datetime(start)..datetime(end))
| where DeviceId == _deviceId or ActivityId == _deviceId
| where Col1 contains "conflict"
| where ApplicationName startswith 'DeviceCheckin'
| where Col5 != 'NotApplicable'
| project env_time, ApplicationName, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| take 2000
```

Related KB: [How to troubleshoot Device Configuration policy conflicts](https://internal.evergreen.microsoft.com/en-us/topic/60d80b3a-8db4-a7de-670f-02a6f19b5d6d)

### Errors
Most errors related to scope (user vs device assignment) or applicability (CSP support).
- Review CSP pre-requirements for each security setting
- KB: [How to configure Security Baselines](https://internal.evergreen.microsoft.com/en-us/topic/47625e81-41a4-d0d2-6fa2-93e0adbd3d59)

### Pending
1. Confirm device last check-in is recent
2. Force sync and verify status updates
3. Confirm user/device is direct member of assigned group
4. Verify Azure deviceId/objectId matches group membership in ASC
5. [Troubleshoot effective group membership](https://internal.evergreen.microsoft.com/en-us/topic/63526f19-9ef6-9b79-d381-d8ac8dda1ee5)

## Firewall Unsupported Configurations
- [Unsupported configurations](https://docs.microsoft.com/en-us/mem/intune/protect/endpoint-security-firewall-rule-tool#unsupported-configurations)
- [Unsupported setting values](https://docs.microsoft.com/en-us/mem/intune/protect/endpoint-security-firewall-rule-tool#unsupported-setting-values)

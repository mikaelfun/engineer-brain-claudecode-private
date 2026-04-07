---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Tenant Attach"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FTenant%20Attach"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# About Tenant Attach

When you use the Configuration Manager tenant attach scenario, you can deploy endpoint security policies from Intune to devices you manage with Configuration Manager. To use this scenario, you must first configure tenant attach for Configuration Manager and enable collections of devices from Configuration Manager for use with Intune. After collections are enabled for use, you use the Microsoft Endpoint Manager admin center to create and deploy policies.

[Use Intune policies with tenant attached Configuration Manager devices | Microsoft Docs](https://docs.microsoft.com/en-us/mem/intune/protect/tenant-attach-intune)

# How Tenant Attach works

Tenant attach works by performing a one-way sync of the devices from the ConfigMgr environment to the Intune environment. Creating synthetic objects that you can perform certain commands on as well as deploy policies to them.

# How to configure Tenant Attach

Requirements to use Intune policy for tenant attach:

- **Configure tenant attach** - synchronize devices from Configuration Manager to the Microsoft Endpoint Manager admin center
- **Synchronize Configuration Manager devices and collections** - select devices to sync, enable collections for endpoint security policies
- **Permissions to Azure AD** - Global Administrator permissions required
- **Tenant for Microsoft Defender for Endpoint** - must be integrated with Intune subscription

## Configuration Tasks

1. **Confirm your Configuration Manager environment** - verify minimum version requirements
2. **Configure tenant attach and synchronize devices** - specify collections to sync
3. **Select devices to synchronize** - edit co-management properties to select devices
4. **Enable collections for endpoint security policies** - enable collections to work with endpoint security policies

# Scoping Questions for Tenant Attach

1. Please provide the full error description.
2. Please provide the steps taken to observe the behavior.
3. Please provide the policyID, example userID and deviceID for the investigation.
4. Please provide if the deviceID is Intune enrolled, co-managed, tenant attached or MDE attached.
5. Please provide if this ever worked and what was the last change if any before the issue occurred.

# Support Boundaries for Tenant Attach

Intune supports the configurations of the settings below, and in verifying that the policy and Windows Registry settings get applied to the device. If the setting is correctly applied to the device but the feature is not working as expected, this is not an Intune issue.

## Endpoint Security Policy Routing

| Feature | Owning Team |
|---------|-------------|
| Microsoft Defender Application Guard | Windows UEX |
| Microsoft Defender Firewall | Windows networking |
| Microsoft Defender SmartScreen | Azure Security |
| Windows Encryption | MSaaS Windows Devices |
| Microsoft Defender Exploit Guard | Azure Security |
| Microsoft Defender Application Control | MSaaS Windows Devices |
| Microsoft Defender Credential Guard | MSaaS Windows Devices |
| Microsoft Defender Security Center | Azure Security |
| Local device security options | Intune |
| User Rights | MSaaS Windows Devices |

## Endpoint Security Routing

| Feature | Owning Team |
|---------|-------------|
| Antivirus | Azure Security |
| Disk Encryption | MSaaS Windows Devices |
| Firewall (incl. Firewall rule migration) | Windows networking |
| ASR | Azure Security |
| Account protection (Credential Guard) | MSaaS Windows Devices |
| Account protection (WHFB) | Azure Identity |

## Additional Notes

- **MDE Onboarding**: Intune supports deployment and connector enablement. If issue is with onboarding itself → Azure Security team
- **Security Endpoint Reports**: Reports on endpoint.microsoft.com supported by Intune; security-related issues → Azure Security
- **Endpoint Analytics**: Deployment through Intune supported; workspace/agent/connector issues → Azure Monitor team
- **Windows AR Requirement**: All Assistance Requests going to ANY Windows support team must first be posted in an SME channel tagged with WindowsAR for review

# Training and Videos

- [Tenant Attach Wiki Page from SCCM Team](https://supportability.visualstudio.com/ConfigurationManager/_wiki/wikis/ConfigurationManager/305059/Tenant-Attach)
- Intune Role-based access for tenant attached devices: [Wiki Link](https://supportability.visualstudio.com/ConfigurationManager/_wiki/wikis/ConfigurationManager/697594/Role-Based-Access)

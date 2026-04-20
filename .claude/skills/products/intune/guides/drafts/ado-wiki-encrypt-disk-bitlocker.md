---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Encrypt Disk (Bitlocker)"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Endpoint%20Security/Encrypt%20Disk%20%28Bitlocker%29"
importDate: "2026-04-20"
type: guide-draft
---

[[_TOC_]]

# About Encrypt Disk
Use Intune to configure BitLocker Drive Encryption on devices that run Windows 10. BitLocker is available on devices that run Windows 10 or later. Some settings for BitLocker require the device have a supported TPM. Intune supports macOS FileVault disk encryption. FileVault is a whole-disk encryption program that is included with macOS. You can use Intune to configure FileVault on devices that run macOS 10.13 or later. The Microsoft Intune encryption report is a centralized location to view details about a device's encryption status and find options to manage device recovery keys. The recovery key options that are available depend on the type of device you're viewing.

[Encrypt Windows devices with BitLocker in Intune - Microsoft Intune | Microsoft Docs](https://docs.microsoft.com/en-us/mem/intune/protect/encrypt-devices)

# How Encrypt Disk works
Use one of the following policy types to configure BitLocker on your managed devices

[Endpoint security disk encryption policy for Windows 10/11 BitLocker](https://docs.microsoft.com/en-us/mem/intune/protect/encrypt-devices#create-an-endpoint-security-policy-for-bitlocker). The BitLocker profile in Endpoint security is a focused group of settings that is dedicated to configuring BitLocker.

View the BitLocker settings that are available in BitLocker profiles from disk encryption policy.

[Device configuration profile for endpoint protection for Windows 10/11 BitLocker](https://docs.microsoft.com/en-us/mem/intune/protect/encrypt-devices#create-an-endpoint-security-policy-for-bitlocker). BitLocker settings are one of the available settings categories for Windows 10/11 endpoint protection.

View the BitLocker settings that are available for [BitLocker in endpoint protection profiles form device configuration policy](https://docs.microsoft.com/en-us/mem/intune/protect/endpoint-protection-windows-10#windows-settings).

# How to configure Encrypt Disk
To manage BitLocker in Intune, your account must have the applicable Intune role-based access control (RBAC) permissions. Following are the BitLocker permissions, which are part of the Remote tasks category, and the built-in RBAC roles that grant the permission:

- Rotate BitLocker Keys
- Help Desk Operator

Use one of the following procedures to create the policy type you prefer.

- [Create an endpoint security policy for BitLocker](https://docs.microsoft.com/en-us/mem/intune/protect/encrypt-devices#create-an-endpoint-security-policy-for-bitlocker)
- [Create an device configuration profile for BitLocker](https://docs.microsoft.com/en-us/mem/intune/protect/encrypt-devices#create-a-device-configuration-profile-for-bitlocker)

You can configure a BitLocker policy that automatically and silently enables BitLocker on a device. That means that BitLocker enables successfully without presenting any UI to the end user, even when that user isn't a local Administrator on the device. See https://docs.microsoft.com/en-us/mem/intune/protect/encrypt-devices#silently-enable-bitlocker-on-devices

View details for recovery keys: https://docs.microsoft.com/en-us/mem/intune/protect/encrypt-devices#view-details-for-recovery-keys

Rotate BitLocker recovery keys: https://docs.microsoft.com/en-us/mem/intune/protect/encrypt-devices#rotate-bitlocker-recovery-keys


# Scoping Questions for Encrypt Disk cases
1. Please provide the full error description.
2. Please provide the steps taken to observe the behavior.
3. Please provide if the encryption is through device configuration or Endpoint Security.
4. Please provide the policyID, example userID and deviceID for the investigation.
5. Please provide if the deviceID is Intune enrolled, co-managed, tenant attached or MDE attached.
6. Please provide if this ever worked and what was the last change if any before the issue occurred.

# Support Boundaries for Encrypt Disk cases
Intune supports the configurations of the settings below, and in verifying that the policy and Windows Registry settings get applied to the device. If the setting is correctly applied to the device but the feature is not working as expected, this is not an Intune issue. Transfer the case or open an AR with the following teams.

- Microsoft Defender Application Guard: Windows UEX
- Microsoft Defender Firewall: Windows networking.
- Microsoft Defender SmartScreen: Azure Security
- Windows Encryption: MSaaS Windows Devices
- Microsoft Defender Exploit Guard: Azure Security
- Microsoft Defender Application Control: MSaaS Windows Devices
- Microsoft Defender Credential Guard: MSaaS Windows Devices
- Microsoft Defender Security Center: Azure Security
- Local device security options: Intune
- User Rights: MSaaS Windows Devices

**NOTE:** Due to misroutes and CSS support to remove delays to customers, please when referencing this article for Endpoint Security, please review the following MDE Attach and ConfigMgr Tenant attach articles below to assure that the support scenario you are facing aligns with Intune support. Please note that even in the event of the support falling under Intune these articles provide information relative to the investigation as well.

- [MDE Attach for Windows Server security management - Support Boundaries](https://supportability.visualstudio.com/M365%20Release%20Announcements/_wiki/wikis/M365-Product-Updates.wiki/542613/MDE-Attach-for-Windows-Server-security-management?anchor=support-boundaries)
- [Configuration Manager Tenant Attach - Support Boundaries](https://dev.azure.com/supportability/ConfigurationManager/_wiki/wikis/ConfigurationManager/378680/Security-Policies?anchor=support-boundaries) and [How to deploy MDE policies to Windows Server KB](https://internal.evergreen.microsoft.com/en-us/topic/287bc7bd-71f3-c170-995f-80b68f0537ef)

**Endpoint Security**

Intune supports the configurations of the settings below, and in verifying that the policy and Windows Registry settings get applied to the device. If the setting is correctly applied to the device but the feature is not working as expected, this is not an Intune issue. Transfer the case or open an AR with the following teams.

- Antivirus: Azure Security
- Disk Encryption: MSaaS Windows Devices
- Firewall: Windows networking.
- Includes Firewall rule migration
- ASR: Azure Security
- Account protection: MSaaS Windows Devices credential guard or Azure Identity for WHFB

**Microsoft Defender Onboarding using Intune**

Intune supports the deployment of Defender and enabling the connector. Intune also supports verifying that the onboarding script gets to the devices and onboards to https://security.microsoft.com/. If there issue is with onboarding itself, submit an AR to the Azure Security team.

Firewall unsupported configurations:Unsupported configurations:https://docs.microsoft.com/en-us/mem/intune/protect/endpoint-security-firewall-rule-tool#unsupported-configuration Unsupported settings values: https://docs.microsoft.com/en-us/mem/intune/protect/endpoint-security-firewall-rule-tool#unsupported-setting-values

**Security Endpoint Reports**

Intune security reports on endpoint.microsoft.com are supported by Intune. If the issue is directly related to security itself, that is owned by Azure Security.

**Endpoint Analytics: Azure Monitor**

Intune supports the deployment thru Intune stated on [Quickstart - Enroll Intune devices - Microsoft Endpoint Manager | Microsoft Docs](https://nam06.safelinks.protection.outlook.com/?url=https:%2f%2fdocs.microsoft.com%2fen-us%2fmem%2fanalytics%2fenroll-intune&data=05%7c01%7ccarlos.e.fernandez%40microsoft.com%7c54dc4478fcda458c61c808da85364085%7c72f988bf86f141af91ab2d7cd011db47%7c1%7c0%7c637968765312101292%7cUnknown%7cTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7c3000%7c%7c%7c&sdata=i7o1QKge3VXs5LwNaxwVvBbNyVI%2ft00asm%2fOKTVHRZA%3D&reserved=0)

**Note that the Azure Monitor team is responsible for the following:**

- Workspace management (create, move, remove)
- Log Analytics agents installation and maintenance, both direct agents and extensions
- Workbook experience (not related to missing data / data accuracy)
- The following data connectors: Azure Active Directory, Azure Activity, Microsoft Web application firewall (WAF), Office 365 (legacy solution)
- Syslog related issues: Connector and agent deployment, data delays, data loss
- Parsing issues with Syslog and Windows/Linux agent
- Interflow data enrichment is also supported by the Monitoring team based on conversations with their Product Teams

**Disclaimer**

All Assistance Requests going to ANY Windows support team, requires to first be posted in a SME channel for the feature area in Intune and tagged with the WindowsAR tag to be reviewed by the Windows AR team. The Windows AR review team will review and provide feedback.

# How to troubleshoot Encrypt Disk cases

[Troubleshooting tips for BitLocker policies in Microsoft Intune - Intune | Microsoft Docs](https://docs.microsoft.com/en-us/troubleshoot/mem/intune/troubleshoot-bitlocker-policies)
[Enforcing BitLocker policies by using Intune known issues - Windows security | Microsoft Docs](https://docs.microsoft.com/en-us/windows/security/information-protection/bitlocker/ts-bitlocker-intune-issues)

# Training and Videos for Encrypt Disk

- [Microsoft Intune Endpoint Security First Look - Disk Encryption](https://youtu.be/0rDr33SWDuk)
- [Configuring and Deploying BitLocker policies from Intune](https://www.youtube.com/watch?v=IXHjQM8feWM)
- [Intune Encryption Report to Troubleshooting BitLocker issues](https://www.youtube.com/watch?v=De2ngxtZVao)

# How to get help with cases
If you require additional assistance after following this workflow, please work with your TA/Lead to file an Assistance Request.

You can also reach out directly to a SME for this topic. See https://aka.ms/IntuneSMEs (Opens in new window or tab) to find an Endpoint Security SME.











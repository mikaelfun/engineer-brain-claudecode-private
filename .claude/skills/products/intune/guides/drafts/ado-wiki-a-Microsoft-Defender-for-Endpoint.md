---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Microsoft Defender for Endpoint"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FMicrosoft%20Defender%20for%20Endpoint"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# About Microsoft Defender for Endpoint

ou enforce compliance for Microsoft Defender for Endpoint with Conditional Access in Intune. You can integrate Microsoft Defender for Endpoint with Microsoft Intune as a Mobile Threat Defense solution. Integration can help you prevent security breaches and limit the impact of breaches within an organization.

Microsoft Defender for Endpoint works with devices that run:

- Android
- iOS/iPadOS
- Windows 10
- Windows 11

To be successful, you'll use the following configurations in concert:

Establish a service-to-service connection between Intune and Microsoft Defender for Endpoint. This connection lets Microsoft Defender for Endpoint collect data about machine risk from supported devices you manage with Intune.

Use a device configuration profile to onboard devices with Microsoft Defender for Endpoint. You onboard devices to configure them to communicate with Microsoft Defender for Endpoint and to provide data that helps assess their risk level.

Use a device compliance policy to set the level of risk you want to allow. Risk levels are reported by Microsoft Defender for Endpoint. Devices that exceed the allowed risk level are identified as noncompliant.

Use a conditional access policy to block users from accessing corporate resources from devices that are noncompliant.

When you integrate Intune with Microsoft Defender for Endpoint, you can take advantage of Microsoft Defender for Endpoints Threat & Vulnerability Management (TVM) and use Intune to remediate endpoint weakness identified by TVM. For more information see Use [Microsoft Defender for Endpoint in Microsoft Intune | Microsoft Docs](https://docs.microsoft.com/en-us/mem/intune/protect/advanced-threat-protection).

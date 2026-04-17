---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## China Intune Feature gaps.md"
sourceUrl: null
importDate: "2026-04-04"
type: reference-table
---

# China (21v) Intune Feature Gaps — Reference Table

> Last updated in OneNote: 2026-01-21. Monitor ADO work items for status changes.
>
> ADO search: https://msazure.visualstudio.com/Intune/_search?text=mooncake%20support*&type=workitem

**Android DA support**: DA support includes Android 15 in 21v Intune.

## Feature Availability Table

| Feature | Available in 21v Intune | Comments |
|---------|------------------------|----------|
| Co-management | ✅ Yes (partial) | No CMG available in 21v; only Hybrid AADJ + co-management supported; CmClient can only auth with local AD |
| Microsoft Tunnel | ❌ No | Requires MDE; China law only allows 3 major telecoms to operate VPN services |
| Microsoft Endpoint Manager / Endpoint Analytics / Log Analytics | ❌ No | |
| Tenant Attach | ❌ No | |
| Derived Credentials | ❌ No | |
| On-Premises Exchange Connector | ❌ No | EOL on Global in CY22; will **never** GA for 21v Intune |
| Mobile Threat Defense (MTD) Connector | ✅ Yes | https://learn.microsoft.com/en-us/mem/intune/fundamentals/whats-new#21vianet-support-for-mobile-threat-defense-connectors |
| Windows Autopilot | ✅ Yes | Autopilot v2 GA in 21v from Sept 2024 (PM: juanita.baptiste@microsoft.com) |
| Microsoft Store (new) / winget | ❌ No | Will not support for Mooncake; compliance issue with winget; DCR-M365-5114 |
| SafetyNet Device Attestation | ❌ No | Google Mobile Services dependency |
| Managing apps from Google Play Store | ❌ No | Google Mobile Services dependency |
| Android Enterprise (Work Profile / COBO / COPE / COSU) | ❌ No | Google Mobile Services dependency |
| Android (AOSP) management for corporate devices | ❌ No | Depends on OEM AOSP support; Feature 14514386; DCR-M365-6783 |
| Jamf partner integration for macOS | ❌ No | Depends on Jamf Apple Management |
| Fencing | ❌ No | |
| Enterprise Application | ❌ No | Azure feature |
| Microsoft Edge Sign In | ❌ No | AAD related |
| Apple Business Manager (ABM) with 21v AAD Federation | ❌ No | ABM app not available in 21v AAD |
| Microsoft Defender for Endpoint (including Tamper Protection) | ❌ No | Depends on MDE |
| Windows AutoPatch | ❌ No | |
| Cloud PKI | ❌ No | No Intune Suite & Cloud PKI add-on license; Feature 27029020 |
| AVD Enrollment with 21v Intune | ❌ No | Feature 15571094 |
| Windows Feature & Quality Update (WUfB) | ❌ No | Dev team confirms no plan (2024-06); DCR-M365-4825 |
| Windows Remediation | ❓ Unknown | |
| Windows Update for Business Report | ❌ No | DCR-M365-6907 |

## ADO Work Items to Monitor

| Feature | Work Item |
|---------|-----------|
| AOSP support in Mooncake | [Feature 14514386](https://msazure.visualstudio.com/Intune/_workitems/edit/14514386) |
| Microsoft Store for Business in Mooncake | [Task 5627116](https://msazure.visualstudio.com/Intune/_workitems/edit/5627116) |
| Cloud PKI Mooncake support | [Feature 27029020](https://msazure.visualstudio.com/Intune/_workitems/edit/27029020) |
| AVD Mooncake cloud support | [Feature 15571094](https://msazure.visualstudio.com/Intune/_workitems/edit/15571094) |
| Windows Feature Update | DCR-M365-4825 |
| WUfB Report | DCR-M365-6907 |
| Microsoft Store | DCR-M365-5114 |
| AOSP | DCR-M365-6783 |

## Workaround Summary

| Unsupported Feature | Recommended Workaround |
|--------------------|----------------------|
| Android Enterprise | Use Android DA (supports up to Android 15) |
| Google Play Store | LOB (.apk) sideloading via Intune; MCVKB Android App Store guide |
| Microsoft Tunnel VPN | Third-party VPN apps + Per-App VPN profile |
| New Microsoft Store / winget | Win32 (.intunewin) app packaging |
| Windows Feature/Quality Update | WSUS or third-party patch management |
| Cloud PKI | On-premises ADCS + NDES + Intune Certificate Connector (SCEP) |
| On-Premises Exchange Connector | Use Modern Authentication / Hybrid Exchange |

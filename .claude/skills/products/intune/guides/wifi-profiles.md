# INTUNE Wi-Fi 配置 — 排查速查

**来源数**: 2 | **21V**: 部分 (19/20)
**条目数**: 20 | **最后更新**: 2026-04-17

## 快速排查路径

1. **Network connectivity drops during Windows new hire onboarding after Intune deploys SCEP certificate and WiFi profile; WiFi disconnects when authentication method switches from PEAP to EAP-TLS on th...**
   → (1) Check WiFi connection timestamp vs auth method switch timing to confirm this is the cause; (2) Customer-developed PowerShell script workaround (coordinated with networking team) handles the aut... `[onenote, 🟢 9.5]`

2. **Users report that �Per APP VPN� doesn�t work anymore on iOS devices because the certificates have expired. The certificates were initially deployed via a per app VPN profile. Users usually discover...**
   → The workaround is to create a new SCEP profile and accompanying VPN/Wifi profile.  Once compliance reaches expected levels, remove the older SCEP profile and associated VPN and Wifi profiles. See 1... `[contentidea-kb, 🔵 7.5]`

3. **IT Administrator has a SCEP, Wifi, and VPN Profiles deployed for iOS.&nbsp; On the iOS Device you will see multiple SCEP Certificates&nbsp;under:&nbsp;Settings --&gt;General--&gt; Management Profil...**
   →  `[contentidea-kb, 🔵 7.5]`

4. **A VPN or WiFi configuration profile is deployed to a device.  This profile is dependent on another profile/s i.e.: -&nbsp;A SCEP profile which depends on the Root CA certificate profile-&nbsp;A VPN...**
   → Make sure all the policies involved are targeted to exactly the same group/s (the same applies to dynamic groups).   You can use Assist to check each of the policies and its Targeting under &quot;T... `[contentidea-kb, 🔵 7.5]`

5. **macOS devices cannot connect to 802.1x auth. WIFI network.            Windows devices work fine.                       RADIUS Server service is provided by NPS role running on Windows Server.      ...**
   → Apple input is necessary to determine why the device is not using EAP-PEAP. however, you can also resolve it adding support for EAP-TLS on RADIUS Server.Open NPS console -&gt; under “Policies”, go ... `[contentidea-kb, 🔵 7.5]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Network connectivity drops during Windows new hire onboarding after Intune deploys SCEP certifica... | When Intune pushes SCEP+WiFi profile to newly enrolled device, the WiFi authentication method cha... | (1) Check WiFi connection timestamp vs auth method switch timing to confirm this is the cause; (2... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | Users report that �Per APP VPN� doesn�t work anymore on iOS devices because the certificates have... | This occurs because the certificates fail to automatically renew. In my case this was ICM 32775 (... | The workaround is to create a new SCEP profile and accompanying VPN/Wifi profile.  Once complianc... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4056095) |
| 3 | IT Administrator has a SCEP, Wifi, and VPN Profiles deployed for iOS.&nbsp; On the iOS Device you... | The behavior is By Design. |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4077699) |
| 4 | A VPN or WiFi configuration profile is deployed to a device.  This profile is dependent on anothe... | There is a requirement to have the same targeting on all dependent policies.  You can use the fol... | Make sure all the policies involved are targeted to exactly the same group/s (the same applies to... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4492186) |
| 5 | macOS devices cannot connect to 802.1x auth. WIFI network.            Windows devices work fine. ... | Even the right protocol is pushed down to the device, it does not use it. instead it tries to use... | Apple input is necessary to determine why the device is not using EAP-PEAP. however, you can also... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4494718) |
| 6 | Welcome to Intune's workflow for WiFi profile deployment. Here you will find everything you need ... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4530673) |
| 7 | Welcome to Intune's workflow for&nbsp;Wi-Fi Profiles. Here you will find everything you need to k... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4530951) |
| 8 | This fits a specific scenario - If you want to have your Surface Hub connect to a Wi-Fi networkin... | The Surface Hub does not, as of this writing, appear to fully support the Wi-Fi CSP per this arti... | For this to work, you must be able to successfully deploy certificates to your devices without is... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4534579) |
| 9 | For devices that run Windows, you can import a Wi-Fi configuration profile that was previously ex... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/3062813) |
| 10 | In Intune, as of service release 2006, when you deploy a macOS Wi-Fi profile, on the device the p... | The reason for this behavior is that when creating a macOS Wi-Fi profile, we can only set the SSI... | Until we get the &quot;Network name&quot; field in the portal GUI, there are two options:1) Modif... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4570906) |
| 11 | Devices when enrolled are not getting the SCEP profile applied to them even though trusted certif... | The SCEP profile isn't targeted to the device.&nbsp; When looking at the policy for an affected d... | This can happen if the customer is assigning the Trusted root profiles to a device group and the ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4571109) |
| 12 | Android Fully managed device failed to receive cert-based AUTH Wi-fi profile which linked with SC... | From Android Fully management&nbsp;and dedicated device,&nbsp;DeviceManagementProvider&nbsp;can't... | Ask user to delete previous Wi-fi profile and sync device to receive Wi-fi profile Intune&nbsp; | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4578332) |
| 13 | We sometimes need validation of our SCEP certificate and Wi-Fi Configuration. With Hyper-V and a ... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4614813) |
| 14 | The Objectives of this lab manual guidance are:During this session, new-hires complete the detail... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4618900) |
| 15 | High-level steps:           The aim of the following tests is to ensure engineers have a good ... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4618112) |
| 16 | When trying to&nbsp;deploy a WiFi profile to a Windows 10 Surface Hub device, the profile gets st... | This occurs because Wi-Fi profiles for “Windows 10 and Later” and “Windows 8.1 and Later” will no... | To resolve this problem, deploy a Windows 10 Custom profile: 1. Go to     Devices     &nbsp;&gt;&... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5010283) |
| 17 | The purpose of this document is to help you map the values shown in Rave to the ones in the MEM p... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5011359) |
| 18 | Custom wi-Fi configuration using pre-shared key fails to deploy with a remediation failure.  In a... | The problem was due to the XML file format. it should be edited by XML editing tool. | The solution steps :  1- Download Notepad ++ and add the plugin which called linearize https://co... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5026994) |
| 19 | A VPN or WiFi configuration profile is deployed to a device. This profile is dependent on another... | There is a requirement to have the same targeting on all dependent policies. You can use the foll... | Make sure all the policies involved are targeted to exactly the same group/s (the same applies to... | 🟡 4.5 | contentidea-kb |
| 20 | macOS devices cannot connect to 802.1x auth. WIFI network. Windows devices work fine. RADIUS Serv... | Even the right protocol is pushed down to the device, it does not use it. instead it tries to use... | Apple input is necessary to determine why the device is not using EAP-PEAP. however, you can also... | 🟡 3.0 | contentidea-kb |

> 本 topic 有排查工作流 → [排查工作流](workflows/wifi-profiles.md)
> → [已知问题详情](details/wifi-profiles.md)

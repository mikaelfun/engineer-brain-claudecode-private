# INTUNE Wi-Fi 配置 — 已知问题详情

**条目数**: 20 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Network connectivity drops during Windows new hire onboarding after Intune deploys SCEP certificate and WiFi profile; WiFi disconnects when authent...
**Solution**: (1) Check WiFi connection timestamp vs auth method switch timing to confirm this is the cause; (2) Customer-developed PowerShell script workaround (coordinated with networking team) handles the auth transition; (3) Consider using separate SSIDs for PEAP and EAP-TLS to avoid in-place auth switching; (4) If using ClearPass NAC, coordinate with networking team to ensure smooth cert-based auth transition.
`[Source: onenote, Score: 9.5]`

### Step 2: Users report that �Per APP VPN� doesn�t work anymore on iOS devices because the certificates have expired. The certificates were initially deployed...
**Solution**: The workaround is to create a new SCEP profile and accompanying VPN/Wifi profile.  Once compliance reaches expected levels, remove the older SCEP profile and associated VPN and Wifi profiles. See 117091816352445 for more details.Related cases include:117040715572384117022294104190116122115093167
`[Source: contentidea-kb, Score: 7.5]`

### Step 3: IT Administrator has a SCEP, Wifi, and VPN Profiles deployed for iOS.&nbsp; On the iOS Device you will see multiple SCEP Certificates&nbsp;under:&n...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 4: A VPN or WiFi configuration profile is deployed to a device.  This profile is dependent on another profile/s i.e.: -&nbsp;A SCEP profile which depe...
**Solution**: Make sure all the policies involved are targeted to exactly the same group/s (the same applies to dynamic groups).   You can use Assist to check each of the policies and its Targeting under &quot;Troubleshooting/Policy&quot;. Use the PolicyID showing in the Kusto query result. Expand the policy and look under &quot;Target Group Information&quot;. The group/s targeted to all the dependent policies have to be exactly the same.
`[Source: contentidea-kb, Score: 7.5]`

### Step 5: macOS devices cannot connect to 802.1x auth. WIFI network.            Windows devices work fine.                       RADIUS Server service is pro...
**Solution**: Apple
input is necessary to determine why the device is not using EAP-PEAP. however, you can also resolve it adding support for EAP-TLS
on RADIUS Server.Open NPS console -&gt; under “Policies”, go to “Network Policies” -&gt; Open the WIFI policy you want to edit, go to Constraints tab. Under Authentication Methods option go to EAP Types and click on Add… select: 
    “Microsoft: Smart Card or other certificate”
     click OK twice to save changes.
  
  
    the supported EAP methods should look 
`[Source: contentidea-kb, Score: 7.5]`

### Step 6: Welcome to Intune's workflow for WiFi profile deployment. Here you will find everything you need to know about working with customers on Wi-Fi case...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 7: Welcome to Intune's workflow for&nbsp;Wi-Fi Profiles. Here you will find everything you need to know about working with customers on WiFi cases. A ...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 8: This fits a specific scenario - If you want to have your Surface Hub connect to a Wi-Fi networking using a certificate (cert-based authentication) ...
**Solution**: For this to work, you must be able to successfully deploy certificates to your devices without issue using SCEP - see here for more information:&nbsp;https://docs.microsoft.com/en-us/intune/protect/certificates-scep-configureImportant: PKCS cannot be used at this time.&nbsp;You must be deploying these certificates using a Device Certificate as the certificate type.&nbsp;Once this is on the device without issue - you must deploy the Wi-Fi profile. You cannot use the standard Wi-Fi profile creatio
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Network connectivity drops during Windows new hire onboarding after Intune de... | When Intune pushes SCEP+WiFi profile to newly enrolled device, the WiFi authe... | (1) Check WiFi connection timestamp vs auth method switch timing to confirm t... | 9.5 | onenote |
| 2 | Users report that �Per APP VPN� doesn�t work anymore on iOS devices because t... | This occurs because the certificates fail to automatically renew. In my case ... | The workaround is to create a new SCEP profile and accompanying VPN/Wifi prof... | 7.5 | contentidea-kb |
| 3 | IT Administrator has a SCEP, Wifi, and VPN Profiles deployed for iOS.&nbsp; O... | The behavior is By Design. |  | 7.5 | contentidea-kb |
| 4 | A VPN or WiFi configuration profile is deployed to a device.  This profile is... | There is a requirement to have the same targeting on all dependent policies. ... | Make sure all the policies involved are targeted to exactly the same group/s ... | 7.5 | contentidea-kb |
| 5 | macOS devices cannot connect to 802.1x auth. WIFI network.            Windows... | Even the right protocol is pushed down to the device, it does not use it. ins... | Apple input is necessary to determine why the device is not using EAP-PEAP. h... | 7.5 | contentidea-kb |
| 6 | Welcome to Intune's workflow for WiFi profile deployment. Here you will find ... |  |  | 7.5 | contentidea-kb |
| 7 | Welcome to Intune's workflow for&nbsp;Wi-Fi Profiles. Here you will find ever... |  |  | 7.5 | contentidea-kb |
| 8 | This fits a specific scenario - If you want to have your Surface Hub connect ... | The Surface Hub does not, as of this writing, appear to fully support the Wi-... | For this to work, you must be able to successfully deploy certificates to you... | 7.5 | contentidea-kb |
| 9 | For devices that run Windows, you can import a Wi-Fi configuration profile th... |  |  | 7.5 | contentidea-kb |
| 10 | In Intune, as of service release 2006, when you deploy a macOS Wi-Fi profile,... | The reason for this behavior is that when creating a macOS Wi-Fi profile, we ... | Until we get the &quot;Network name&quot; field in the portal GUI, there are ... | 7.5 | contentidea-kb |
| 11 | Devices when enrolled are not getting the SCEP profile applied to them even t... | The SCEP profile isn't targeted to the device.&nbsp; When looking at the poli... | This can happen if the customer is assigning the Trusted root profiles to a d... | 7.5 | contentidea-kb |
| 12 | Android Fully managed device failed to receive cert-based AUTH Wi-fi profile ... | From Android Fully management&nbsp;and dedicated device,&nbsp;DeviceManagemen... | Ask user to delete previous Wi-fi profile and sync device to receive Wi-fi pr... | 7.5 | contentidea-kb |
| 13 | We sometimes need validation of our SCEP certificate and Wi-Fi Configuration.... |  |  | 7.5 | contentidea-kb |
| 14 | The Objectives of this lab manual guidance are:During this session, new-hires... |  |  | 7.5 | contentidea-kb |
| 15 | High-level steps:           The aim of the following tests is to ensure en... |  |  | 7.5 | contentidea-kb |
| 16 | When trying to&nbsp;deploy a WiFi profile to a Windows 10 Surface Hub device,... | This occurs because Wi-Fi profiles for “Windows 10 and Later” and “Windows 8.... | To resolve this problem, deploy a Windows 10 Custom profile: 1. Go to     Dev... | 7.5 | contentidea-kb |
| 17 | The purpose of this document is to help you map the values shown in Rave to t... |  |  | 7.5 | contentidea-kb |
| 18 | Custom wi-Fi configuration using pre-shared key fails to deploy with a remedi... | The problem was due to the XML file format. it should be edited by XML editin... | The solution steps :  1- Download Notepad ++ and add the plugin which called ... | 7.5 | contentidea-kb |
| 19 | A VPN or WiFi configuration profile is deployed to a device. This profile is ... | There is a requirement to have the same targeting on all dependent policies. ... | Make sure all the policies involved are targeted to exactly the same group/s ... | 4.5 | contentidea-kb |
| 20 | macOS devices cannot connect to 802.1x auth. WIFI network. Windows devices wo... | Even the right protocol is pushed down to the device, it does not use it. ins... | Apple input is necessary to determine why the device is not using EAP-PEAP. h... | 3.0 | contentidea-kb |

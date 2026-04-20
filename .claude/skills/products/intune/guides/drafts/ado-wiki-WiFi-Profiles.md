---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/WiFi Profiles"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Device%20Config%20Certificates%20Email%20VPN%20Wifi/WiFi%20Profiles"
importDate: "2026-04-20"
type: guide-draft
---

[[_TOC_]]

# Description of Wi-Fi Profiles

**Summary**

Wi-Fi is a wireless network that's used by many mobile devices to get network access. Microsoft Intune includes built-in Wi-Fi settings that can be deployed to users and devices in your organization. This group of settings is called a "profile", and can be assigned to different users and groups. Once assigned, your users get access your organization's Wi-Fi network without configuring it themselves.

For example, you install a new Wi-Fi network named Contoso Wi-Fi. You then want to set up all iOS/iPadOS devices to connect to this network. Here's the process:

1. Create a Wi-Fi profile that includes the settings that connect to the Contoso Wi-Fi wireless network.
2. Assign the profile to a group that includes all users of iOS/iPadOS devices.
3. On their devices, users find the new Contoso Wi-Fi network in the list of wireless networks. They can then connect to the network, using the authentication method of your choosing.

This article lists the steps to create a Wi-Fi profile. It also includes links that describe the different settings for each platform.

**Supported device platforms**

Wi-Fi profiles support the following device platforms:

- Android 4 and newer
- Android Enterprise and kiosk
- iOS 8.0 and newer
- iPadOS 13.0 and newer
- macOS X 10.11 and newer
- Windows 10 and newer, Windows 10 Mobile, and Windows Holographic for Business

**NOTE** For devices running Windows 8.1, you can import a Wi-Fi configuration that was previously exported from another device.


# How it Works

Depends on the device type, Intune can push Wi-Fi profiles using different methods:

1. **Wi-Fi profile created using the user interface**: These profiles usually are Device Configuration > Wi-Fi profiles and available for all platforms. Read: [Add and use Wi-Fi settings on your devices in Microsoft Intune.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-configure)
2. **Custom Wi-Fi profiles**: These types of profiles you create them using a custom Device Configuration profile where you configure OMA-URI and XML string to configure the settings and it is available for Windows and Android platforms Read: [Use a custom device profile to create a WiFi profile with a preshared key using Intune.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-profile-shared-key)
3. **Wi-Fi imported profile**: This type of profile depends on exporting an existed configuration from one of the machines connected to the access point then import the settings to Intune then deploy it for the rest of devices. This profile is available for Windows 8.1 or later Read: [Import Wi-Fi settings for Windows devices in Intune.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-import-windows-8-1)

**Where do I start and what do I need?**

- Wireless AP that supports WPA/WPA2 Enterprise
- Active Directory
- Certificate Authority
- RADIUS Server

Before Intune can deliver the Wi-Fi profile to the device, it needs to deploy the certificates (in case the authentication of the Wi-Fi profile used certificate authentication):

![](../.attachments/Dev-Config-Certs/wifideliveryeaptls.png)

Once the certificates and the Wi-Fi profile are deployed to the device, the connection flow will be as follows:

![](../.attachments/Dev-Config-Certs/wifiautheaptls.png)


# How it’s Configured

How it is configured depends on the Wi-Fi profile type discussed in the "How Wi-Fi profiles work".

You can configure the Wi-Fi profile as the following:

- For Wi-Fi profile created using the user interface, read [Create the profile.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-configure#create-the-profile)
- For custom Wi-Fi profiles, read [Create a custom profile.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-profile-shared-key#create-a-custom-profile)
- For Wi-Fi imported profiles, read [Import the Wi-Fi settings into Intune.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-import-windows-8-1#import-the-wi-fi-settings-into-intune)

# Scenarios

In most scenarios, customers tend to push enterprise Wi-Fi profiles to devices. Enterprise Wi-Fi profiles depends on using enterprise grade authentication methods when connecting to corporate access points. In this scenario, customers are relying on using username/password or certificate-based authentication, in which you need to provide client certificate to authenticate the devices. In certificate-based authentication, Customer needs to have a PKI infrastructure in place to support that method. From Intune, we can take advantage of that infrastructure to push client certificates to devices using PKCS and SCEP device configuration profiles and tie them with the Wi-Fi profile for authentication.


# Scoping Questions 

You can follow the below workflow to identify the scoping questions needed to troubleshoot the case:

![](../.attachments/Dev-Config-Certs/wifiscopingq.png)


# Support Boundaries

Intune is a delivery mechanism for policies and configurations. As such, Intune supports policy configuration and delivery of these policies to the device.
Intune does not guarantee that these configurations will allow the connection to be established.
Use Assist365, Kusto and device logs to make sure all the settings from Intune are arriving correctly to the device. If this is the case, it is not an Intune problem.
In case of connectivity issues (intermittent disconnection or failed connectivity), these are not Intune problems and the case should be transferred to the Windows Networking team or the network team at the customer's side for further investigation.


# Troubleshooting WiFi Profile Issues

**Tips and guidelines when configuring Wi-Fi:**

Cert Auth: Always target the SCEP/PKCS , root certificate, and Wi-Fi profiles to the same group/s.

- Cert Auth: Use user certificate instead of device certificate as it works flawlessly for most of the scenarios.
- Cert Auth: Make sure to have the UPN as the SAN for user certificates and FQDN of the device as the SAN for device certificates when using NPS (Network Policy Service, the Microsoft implementation for Radius) as your RADIUS server.
- Remember that the RADIUS server needs a source to authenticate the client. In most scenarios, the source would be the local Active Directory, but it might be a local database or 3rd party LDAP server.
- Intune is a delivery mechanism for settings and configurations, but it is not responsible for making the connection. If the customer is facing a connectivity issue, it is always recommended to engage his/her network team.
- Make sure to troubleshoot Enterprise Wi-Fi issues from top to bottom and check that all the dependent policies are compliant and delivered to the device (e.g. trusted root certificates and SCEP/PKCS certificates), more information in this article: [Intune: VPN or WiFi profile may not be applied if dependent policies have a different targeting.](https://internal.evergreen.microsoft.com/en-us/topic/e247a7e7-481b-ec89-9b39-cf211d6ccc38)

**Intune Portal Troubleshooting:**

Client-side troubleshooting steps for Wi-Fi issues are documented publicly and can be found in the following link: Troubleshooting Wi-Fi profile issues in Microsoft Intune

**WINDOWS DEVICE TROUBLESHOOTING:**
![](../.attachments/Dev-Config-Certs/wifitswin1.png)  

![](../.attachments/Dev-Config-Certs/wifitswin2.png)  

![](../.attachments/Dev-Config-Certs/wifitswin3.png)  

![](../.attachments/Dev-Config-Certs/wifitswin4.png)


**Backend Troubleshooting:**

For back-end side troubleshooting, engineers should investigate on the delivery of the profile as well as the settings pushed. That can be done from two places:

**Assist365 Troubleshooting:**

- Check the policy settings and try to repro what the customer is configuring.
- Check policy targeting (With certificate-based authentication, make sure the Root, SCEP/PKCS, and the Wi-Fi profiles are targeting the same group. Check the following internal article.

Export the targeted policy for one of the affected device and match the settings sent with what the user is configuring in the profile.
![](../.attachments/Dev-Config-Certs/wifiravets1.png)
![](../.attachments/Dev-Config-Certs/wifiravets2.png)


**Kusto Troubleshooting:**

Check IntuneEvent table for the processing of the policy and the compliance state. Filter on the device ID, and time and project the message column where you will find the processing and the compliance state of that policy.

If the policy processing was not compliant overall, try to understand what settings made it so and try to check the values of these settings.

![](../.attachments/Dev-Config-Certs/wifikustots.png)

**Infraestructure Troubleshooting** (the extra mile)

Even though _in Intune we support the profile deployment only_, this section can be useful when customer claims there are issues connecting to the Wi-Fi network. Be very careful to explain that this is a pure connectivity/authentication issue which is not related to Intune (as long as the Wi-Fi and certificate settings have been successfully deployed) but can help you with doing a quick check on the infrastructure and things that can be affecting the connectivity:

![](../.attachments/Dev-Config-Certs/wifiinfrats1.png)

![](../.attachments/Dev-Config-Certs/wifiinfrats2.png)

# FAQ

_upgrade in progress_
![](../.attachments/Dev-Config-Certs/work-in-progress.png)

# Training and Videos

- [Wi-Fi Troubleshooting and Management in Intune](https://microsoft.sharepoint.com/teams/LearnCSSIntune/_layouts/15/stream.aspx?id=%2Fteams%2FLearnCSSIntune%2FStream%20on%20SharePoint%2FInternal%20Intune%20videos%2FDevice%20Config%20%2D%20Certs%2C%20Email%2C%20VPN%20%26%20Wifi%2FIntune%20%5F%20Management%20and%20Troubleshooting%20Wi%2DFi%20Profiles%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview)


- [Synergy Presentation FY23 - **Understanding Server Name Validation**.](https://microsoft.sharepoint.com/teams/LearnCSSIntune/_layouts/15/stream.aspx?id=%2Fteams%2FLearnCSSIntune%2FStream%20on%20SharePoint%2FSynergy%2FUnderstanding%20Server%20Name%20Validation%20for%20Wi%2DFi%20and%20VPN%20scenarios%2D20221005%5F173211%2DMeet%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview)

-----

**TGP Presentations**

- Vignesh Thalamuthu 3/22/2023 Recording - [TGP Presentation Wi-Fi Profile with Certificate Based Authentication](https://microsoft.sharepoint.com/teams/LearnCSSIntune/_layouts/15/stream.aspx?id=%2Fteams%2FLearnCSSIntune%2FStream%20on%20SharePoint%2FTGP%2FTGP%20Recordings%5FDecks%5FInternal%20articles%2FTGP%20Presentation%20Wi%2DFi%20Profile%20with%20Certificate%20Based%20Authentication%2Emp4&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview)
  - Deck - [Wi-Fi Profile with Certificate -based Authentication - vthalamuthu.pptx](https://microsoft.sharepoint.com/:p:/r/teams/LearnCSSIntune/Stream%20on%20SharePoint/TGP/TGP%20Intune%20Presentation%20decks/Wi-Fi%20Profile%20with%20Certificate%20-based%20Authentication%20-%20vthalamuthu.pptx?d=wd2107765e9fe4c99aad9b19d457de5d0&csf=1&web=1&e=vz32TP)
  - [Intune: SCEP Error - NewGetCrpCertificateRequestInfo - Issue detected when generating subject name and san](https://internal.evergreen.microsoft.com/en-us/topic/9732b104-5d4b-9c16-a81b-f56defc316f9)

- [**TGP repository**](https://microsoft.sharepoint.com/teams/LearnCSSIntune/Stream%20on%20SharePoint/Forms/AllItems.aspx?id=%2Fteams%2FLearnCSSIntune%2FStream%20on%20SharePoint%2FTGP%2FTGP%20Recordings%5FDecks%5FInternal%20articles&viewid=3d246d60%2Dfdc7%2D4528%2D9ca8%2D667d98dbc9c8&OR=Teams%2DHL&CT=1709941867938&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI0OS8yNDAyMjkyNDUwNyIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D): Includes all the presentations and decks by area

# Additional Documentation / Resources

**Group Membership**

- [Intune: VPN or WiFi profile may not be applied if dependent policies have a different targeting.](https://internal.evergreen.microsoft.com/en-us/topic/e247a7e7-481b-ec89-9b39-cf211d6ccc38)
- [Intune: How to Troubleshoot Effective Group Membership.](https://internal.evergreen.microsoft.com/en-us/topic/63526f19-9ef6-9b79-d381-d8ac8dda1ee5)

**Windows**

- [Advanced troubleshooting 802.1X authentication.](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/802-1x-authentication-issues-troubleshooting)
- [Certificate requirements when you use EAP-TLS or PEAP with EAP-TLS.](https://learn.microsoft.com/en-US/troubleshoot/windows-server/networking/certificate-requirements-eap-tls-peap)
- [Add and use Wi-Fi settings on your devices in Microsoft Intune.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-configure)
- [Add Wi-Fi settings for Android Enterprise dedicated and fully managed devices in Microsoft Intune.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-android-enterprise)
- [Add Wi-Fi settings for devices running Android in Microsoft Intune.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-android)
- [Add Wi-Fi settings for iOS and iPadOS devices in Microsoft Intune.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-ios)
- [Add Wi-Fi settings for macOS devices in Microsoft Intune.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-macos)
- [Add Wi-Fi settings for Windows 10 and later devices in Intune.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-windows)
- [Import Wi-Fi settings for Windows devices in Intune.](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-import-windows-8-1)


# How to Get Help With Wi-Fi Profile Cases

For more information about Wi-Fi profiles in Microsoft Intune, see the following articles:

- [Add Wi-Fi settings for devices running Android in Microsoft Intune](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-android)
- [Add Wi-Fi settings for iOS devices in Microsoft Intune](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-ios)
- [Add Wi-Fi settings for Windows 10 and later devices in Intune](https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-windows)
- [Support Tip - How to configure NDES for SCEP certificate deployments in Intune](https://techcommunity.microsoft.com/t5/intune-customer-success/support-tip-how-to-configure-ndes-for-scep-certificate/ba-p/455125)
- [Troubleshooting SCEP certificate profile deployment in Microsoft Intune](https://learn.microsoft.com/en-US/troubleshoot/mem/intune/certificates/troubleshoot-scep-certificate-profiles)
- [Troubleshooting NDES configuration for use with Microsoft Intune certificate profiles](https://learn.microsoft.com/en-US/mem/intune/protect/certificates-scep-configure)

The most current list of SMEs can be found at https://aka.ms/IntuneSMEs

**Using Teams to get help**

If you need help with a support case, you can post your question to the "Device Config - Certificates, Email, VPN and Wifi" collaboration channel [**here**](https://teams.microsoft.com/l/channel/19%3A44147886ab194ddd9395a1e2868a1eb2%40thread.skype/Device%20Config%20-%20Certificates%2C%20Email%2C%20VPN%20and%20Wifi?groupId=8aefb036-b9be-4a78-9c84-51120af6a695&tenantId=).

Your Certificates and resources access SMEs:  

<div class="relative overflow-hidden shadow-md rounded-lg">
    <table class="table-auto w-full text-left">
        <thead class="uppercase bg-[#4682B4] text-[#e5e7eb]" style="background-color: #4682B4; color: #e5e7eb;">
            <tr>
                <td class="py-1 border text-center font-bold p-4" contenteditable="true"></td>
                <td class="py-1 border text-center font-bold p-4" contenteditable="true"><div style="text-align: center;"><b>ATZ</b></div></td>
                <td class="py-1 border text-center font-bold p-4" contenteditable="true"><div style="text-align: center;"><b>EMEA</b></div></td>
                <td class="py-1 border text-center font-bold p-4" contenteditable="true"><div style="text-align: center;"><b>APAC</b></div></td>
            </tr>
        </thead>
        <tbody class="bg-white text-gray-500 bg-[#FFFFFF] text-[#6b7280]" style="background-color: #FFFFFF; color: #6b7280;">
            <tr class="py-5">
                <td class="py-5 border text-center  p-4" contenteditable="true"><b>SME leads</b>
                </td>
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">Carlos Jenkins<br>Jesus Santaella  
                </td>
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">Karin Galli Bauza<br>Armia Endrawos<br>Ameer Ahmad  
                </td>   
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">Xinkun Yang<br>Joe Yang  
                </td>
            </tr> 
             <tr class="py-5">
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">SMEs</td>
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">Martin Kirtchayan<br>David Meza Umana<br>Manoj Kulkarni
                </td>
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">Ammar Tawabini<br>Jordi Segarra<br>Khalid Hussein
                </td>   
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">Conny Cao<br>Joe Yank<br>Gaurav Singh
                </td>
            </tr>            
    </table>
</div>

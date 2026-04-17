---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking for known solutions | tips/Emerging issues"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20for%20known%20solutions%20%7C%20tips%2FEmerging%20issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430170&Instance=430170&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430170&Instance=430170&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document outlines various issues and fixes related to Windows Hello for Business (WHfB). It includes links to detailed internal articles and provides a status update on whether the issues are emerging, pending a fix, or resolved.

[[_TOC_]]

# **Emerging issue**

## [IA-KISP-074919 ADDS: Security: Lanmanworkstation-BlockNTLM policy is set, File Share Access is failing upon WHfB or SmartCard Logon.](https://internal.evergreen.microsoft.com/en-us/topic/adds-security-lanmanworkstation-blockntlm-policy-is-set-file-share-access-is-failing-upon-whfb-or-smartcard-logon-4660206e-eece-3e5a-e937-6ac70966ecb0)

## [IA-KISP-110152 Servicing: 7B.25: KDC event ID 21 is logged on July 2025-patched DCs servicing logons using self-signed certificates with key trust (such as WHfB)](https://internal.evergreen.microsoft.com/en-us/topic/servicing-7b-25-kdc-event-id-21-is-logged-on-july-2025-patched-dcs-servicing-logons-using-self-signed-certificates-with-key-trust-such-as-whfb-7c2a7e34-0c36-28e1-c60b-5ed81d777032)

## [IA-KISP-165797 ADDS: Security: Third-party components disabling the WHfB virtual smartcard, making it disappear from the system](https://internal.evergreen.microsoft.com/en-us/topic/adds-security-third-party-components-disabling-the-whfb-virtual-smartcard-making-it-disappear-from-the-system-a52b47ad-4eaf-bce6-0793-ca296b11954b)

## ["Make sure your face is centered in the frame" on dell](https://microsoft.visualstudio.com/DefaultCollection/OS/_workitems/edit/59365099/) 

## [ADDS: Security: Sign-in fails with Something went wrong and your PIN isnt available (code: 0xd0000225) due to D-RTM initialization failure](https://internal.evergreen.microsoft.com/en-us/topic/adds-security-sign-in-fails-with-something-went-wrong-and-your-pin-isn-t-available-code-0xd0000225-due-to-d-rtm-initialization-failure-6ccf8fe3-4465-3ffb-d35d-88aba9249189)

## [ADDS: Security: Sign-in fails with Something went wrong and your PIN isnt available (code: 0xd0000225)](https://internal.evergreen.microsoft.com/en-us/topic/adds-whfb-sign-in-fails-with-something-went-wrong-and-your-pin-isn-t-available-code-0xd0000225-after-applying-an-lcu-d6734320-952f-e876-f266-88a83ab97b2d)

## [Servicing: 6B.25: Windows Hello Pin setup fails with error code 0x80090010 on Entra-joined, June -> July 2025-patched Windows 11 24H2 devices (ICM 657257124)](https://internal.evergreen.microsoft.com/en-us/topic/servicing-6b-25-windows-hello-pin-setup-fails-with-error-code-0x80090010-on-entra-joined-june-july-2025-patched-windows-11-24h2-devices-icm-657257124-8756bc36-81eb-74d2-4cc4-3d3b981ecfc5)

## [ADDS: LSASS crash (0xc0000005) after logging in with WHFB (pin, face or fingerprint) Kerberos Cloud trust against Windows Server 2025 DC](https://internal.evergreen.microsoft.com/en-us/topic/adds-lsass-crash-0xc0000005-after-logging-in-with-whfb-pin-face-or-fingerprint-kerberos-cloud-trust-against-windows-server-2025-dc-89e8a460-41f9-17ac-f5d1-46f57faaee41)

## [ADDS: WHFB: Signal rule failed by Couldn't verify additional factor](https://internal.evergreen.microsoft.com/en-us/topic/adds-whfb-signal-rule-failed-by-couldn-t-verify-additional-factor-8c5d55a7-098c-e500-6e8c-5b5d2ce9fbd5)

## [Servicing: 4B.25 ADDS: Event ID 45 or Event ID 21 is logged to the DC every time a user logs on to a device using Windows Hello for Business in a key trust environment](https://internal.evergreen.microsoft.com/en-us/topic/86a3c86e-2a41-e442-4981-af84bdc05e20)

## [ADDS: WHFB: Signal rule failed by Couldn't verify additional factor](https://internal.evergreen.microsoft.com/en-us/topic/adds-whfb-signal-rule-failed-by-couldn-t-verify-additional-factor-8c5d55a7-098c-e500-6e8c-5b5d2ce9fbd5)

## [Bug 57256639: [DCR] Improve user experience for Bio/WHfB enrollment when public Internet is not reachable - Boards](https://microsoft.visualstudio.com/OS/_workitems/edit/57256639)

>>corresponding KB [ADDS: WHfB: Biometry enrolment application unexpectedly closes when the PIN is expired](https://internal.evergreen.microsoft.com/en-us/topic/adds-whfb-biometry-enrolment-application-unexpectedly-closes-when-the-pin-is-expired-161d4df8-9295-dcef-21c8-944f01e46799)

##[ADDS: Windows Biometric Service crash on W1124H2 if user has enrolled with biometrics like fingerprint and hpa is enabled for svchost.exe](https://internal.evergreen.microsoft.com/en-us/topic/51882a20-5da7-bc63-c7b8-4a13da6ebfda)

---
##[Bug 55958863: [RFC] Windows Hello PIN broken in VSM mode after applying 2025.1B - Boards](https://microsoft.visualstudio.com/OS/_workitems/edit/55958863)

[ADDS: WHfB: Sign-in fails with Something went wrong and your PIN isnt available (code: 0xd0000225) after applying 1B](https://internal.evergreen.microsoft.com/en-us/topic/d6734320-952f-e876-f266-88a83ab97b2d)

---
## WHfB: User is requested to enter the PIN multiple times during the session.
[Link to topic](https://internal.evergreen.microsoft.com/topic/5c3dccda-3221-85df-36c8-a1b5b9b11990)

---

## ADDS: Security: Multi-factor Unlock prompts for PIN 2x then bypasses MFU after removing fingerprint reader
[Link to topic](https://internal.evergreen.microsoft.com/topic/fc23aeef-928a-733b-4eb8-48aa570e7753)

---

## BioEnrollmentHost.exe does not provide an actionable error for users when the Windows Hello PIN is expired
[Link to topic](https://microsoft.visualstudio.com/OS/_dashboards/dashboard/c3a12b22-113d-4da1-b67f-82df9744e40f)

---

## WHfB: 'I forgot my PIN' link to reset the WHfB PIN from LogonUI does nothing for hybrid devices scenarios
[Link to topic](https://internal.evergreen.microsoft.com/topic/78376209-ac55-4db2-236e-edf1c5fabbed)

---

## Talking Points for reported vulnerability in Surface fingerprint sensor
[Link to topic](https://microsoft.sharepoint.com/teams/talkingpoints/SitePages/2023-11-28.aspx?OR=Teams-HL&CT=1701297795534&xsdata=MDV8MDJ8Sm9zZXBoLkJlc2FuY29uQG1pY3Jvc29mdC5jb218MGRkMDM5ZWQwZjMyNDYxZWJmYWMwOGRiZjUzNTNlYTZ8NzJmOTg4YmY4NmYxNDFhZjkxYWIyZDdjZDAxMWRiNDd8MXwwfDYzODM3MzM4MTUwMzUwNjg1NHxVbmtub3dufFRXRnBiR1pzYjNkOGV5SldJam9pTUM0d0xqQXdNREFpTENKUUlqb2lWMmx1TXpJaUxDSkJUaUk2SWsxaGFXd2lMQ0pYVkNJNk1uMD18MzAwMHx8fA%3d%3d&sdata=R0NaK2hzTHQ5ZmVlTlRlZTNaNUtkbDYwVmp4VmtMTVBqSnROSUVQNUNpST0%3d&clickparams=eyAiWC1BcHBOYW1lIiA6ICJNaWNyb3NvZnQgT3V0bG9vayIsICJYLUFwcFZlcnNpb24iIDogIjE2LjAuMTcxMjYuMjAwMTQiLCAiT1MiIDogIldpbmRvd3MiIH0%3D)

---

## Win*: Security: Blackwing Intelligence compromise of Windows Hello authentication in the fall of CY 2023
[Link to topic](https://internal.evergreen.microsoft.com/topic/43a593bc-f744-4b94-e79d-1131524703bb)

---

## Servicing: 10D.23: Hello Enrollment is incorrectly skipped during Nth logon on KB5031445-patched Win10 22H2 devices (KIR)
[Link to topic](https://internal.evergreen.microsoft.com/topic/cfab0b48-1b71-2387-3a3c-780d660a15c0)

---

## CloudExperienceHost hanging during first sign-in on biometry enrollment
[Link to topic](https://internal.evergreen.microsoft.com/topic/2023-07d-cloudexperiencehost-hanging-during-first-sign-in-on-biometry-enrollment-4c914fb0-753c-b44f-209a-5461acd36f3d)

---

## ADDS: Security: WHFB provisioning fails
[Link to topic](https://internal.evergreen.microsoft.com/topic/adds-security-whfb-provisioning-fails-ea3ad884-0908-2055-5488-b160b87bc313)

---

## ADDS: Security: Sign-in to hybrid joined devices, in a WHFB cloud trust Hybrid deployment, fails when UPN credentials are supplied when the device is disconnected from the network
[Link to topic](https://internal.evergreen.microsoft.com/topic/1619e4c6-d683-e359-fe23-daf0720f2f03)

---

## ADDS: Security: Sign-in to hybrid joined devices fails when using WHFB PIN or WHFB Biometric credentials in a WHFB cloud trust deployment if the device is disconnected from internet
[Link to topic](https://internal.evergreen.microsoft.com/topic/1c2747c7-9f22-1b92-a7bb-60f188f1c7a6)

---

## ADDS: Security: WebAuthn via WAM does not support Window Hello-based authentication
[Link to topic](https://internal.evergreen.microsoft.com/topic/adds-security-webauthn-via-wam-does-not-support-window-hello-based-auth-6c4168f3-a1d3-a7ca-983f-099f7590bf64)

---

## 6B.23: Bio Data Storage consent message intentionally displayed on 11D.22-patched Win11 and ~6B.23-patch Windows 10 devices
[Link to topic](https://internal.evergreen.microsoft.com/topic/servicing-6b-23-bio-data-storage-consent-message-intentionally-displayed-on-11d-22-patched-win11-and-6b-23-patch-windows-10-devices-be053854-0f33-a466-3330-ab59d299ebbc)

---

## Users in a WHFB Cloud Trust deployment are unable to sign into Windows Hybrid joined devices when the device is not connected to the network
[Link to topic](https://internal.evergreen.microsoft.com/topic/1c2747c7-9f22-1b92-a7bb-60f188f1c7a6)

---

## WinX: Security: After WHfB requests users to change their password, the operation fails with 0xc000006d (STATUS_LOGON_FAILURE)
[Link to topic](https://internal.evergreen.microsoft.com/topic/servicing-2022-08b-winx-security-after-whfb-requests-users-to-change-their-password-the-operation-fails-with-0xc000006d-status-logon-failure-8f34be9c-c69a-73eb-7e55-b09e050bf87f)

---

## WinX: WHfB: Security: Wrong error message for PIN complexity rules for EN-GB localization
[Link to topic](https://internal.evergreen.microsoft.com/topic/361b0e13-63bb-f574-d2fa-7962a00e839b)

---

## WHFB: User interface prompting for the PIN appears unaligned when provisioning is launched through a script or the public API
[Link to topic](https://internal.evergreen.microsoft.com/topic/86147457-677b-24f3-808b-678f112172c2)

---

## ADDS: Kerberos: Intermittent failures kerberos failure to acquire CloudTgt in HAADJ environments
[Link to topic](https://internal.evergreen.microsoft.com/topic/adds-kerberos-intermittent-failures-kerberos-failure-to-acquire-cloudtgt-in-haadj-environments-0ba5775d-fd26-7ac4-311e-b43ad6796034)

---

## Cloud kerberos trust only STATUS_BAD_LOGON_SESSION_STATE
Its an intermittent issue that occurs on Windows 10 and Windows 11.  
It's resolved by simply waiting ~10 seconds post resume from sleep.  
Issue appears to be that we think we can see a DC, so we attempt logon without cached credentials, and then the network stack isn't ready so we fail (and prompt to setup PIN again, as opposed to falling back to cached credentials).  
**This is a known issue with Cloud Trust and FIDO2 sign-in**:  
we end up with a race condition between a backend PRT refresh and a user trying to authenticate.    
When this happens, the user will experience the issue.

![Description of the picture](/.attachments/image-f6d6ec43-c57b-4ce8-9b0d-d7edc05d5b02.png)  

![Description of the picture](/.attachments/image-d7ee0739-835f-400b-9335-85a2c69eb4d0.png)

0xC000006D, 0xC0000104 (status bad logon session state)

**Workaround:**  
The user can work around this by clicking on other user, inputting their UPN, then their PIN, and they should be able to sign-in from there.  
More details here:  
[Link to more details](https://microsoft.visualstudio.com/DefaultCollection/OS/_workitems/edit/40866644)  

Fixed in Copper

Release for win10 scheduled in 2023.07 D

---

## Azure AD joined Windows 10 devices cannot use Kerberos CEP CES to check if a hybrid user already has a certificate published in AD for a specific template
[Link to topic](https://internal.evergreen.microsoft.com/topic/99e3d0dc-ff17-eb12-c011-52d7561f5b14?app=casebuddy&search=%22access%20token%22)
[Link to more details](https://microsoft.visualstudio.com/OS/_workitems/edit/30162710)

---

## Servicing: 9B.21: Hello Fingerprint fails after installing September 14, 2021 Windows Updates (ICM 262628118)
[Link to topic](https://internal.evergreen.microsoft.com/topic/4646098)

---

# **Pending fix**

## Update other Cached Credentials on Password change to ensure cached logon works for WHFB and SmartCard Credentials
[Link to topic](https://microsoft.visualstudio.com/OS/_workitems/edit/23529534)

## Breaking News & Other limitations and bugs from AAD team
[Link to topic](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184008/Windows-Hello-for-Business?anchor=breaking-news)

---

# **Fixed**

## PIN complexity not honored on win11 22h2 workgroup device and convenience PIN
VNEXT \ Active Branch = Fixed  
Windows 11 22H2, Windows SV 21H2 = scheduled to 2023 3D

[Local Group Policy PIN Complexity policies are not followed with W11 22H2](https://microsoft.visualstudio.com/OS/_workitems/edit/41855041)

[KB850152 Win11: Security: PIN complexity policy doesn't take effect on fresh or upgrade install of 22H2](https://internal.evergreen.microsoft.com/topic/win11-security-pin-complexity-policy-doesn-t-take-effect-on-fresh-or-upgrade-install-of-22h2-273b4c9f-a22c-bb26-f7d2-61e7ed05b691)

---

## Cloud kerberos trust only dsregcmd /status display bug in October 2022 update
When we install the October 2022 cumulative update (KB5018410) we get some additional output from the dsregcmd /status which includes the display of OnPremTgt and CloudTgt.  
Unfortunately, this data appears incorrect on (at least) Win10 21H1 and 21H2.  We know the client does have a partial TGT because: 
 
- FIDO2 sign-in does work on a HAADJ device  
- Klist cloud_debug shows the client has a partial TGT:  
   ```
   Cloud Kerberos enabled by policy: 0  
   AS_REP callback received: 1  
   AS_REP callback used: 1  
   Cloud Referral TGT present in cache: 0  
   Cloud Primary (Hybrid logon) TGT available: 1  
   ```

While this does not seem to break sign-in or functionality, it will cause a lot of problems for engineers troubleshooting these issues as we have all been trained to rely on the OnPremTgt output when it is available.  
a.klist cloud_debug pulls info from CloudAPs cache. It indicates if the CloudAP cache is holding a TGT (doesnt look into the expiry of the TGT/PRT).  
b.dsregcmd /status is pulling info from AAD plugin. 

Bug:   
Backport [Post-Rel] [AVD] [InMarketOS] [ENS] [EO] TGT status in dsregcmd [Vb](https://microsoft.visualstudio.com/OS/_workitems/edit/41984131/)  

01/19/2023: fix included in 2023.01C

Already fixed in windows 11: [dsregcmd: show cloud and on-prem tgt status](https://microsoft.visualstudio.com/DefaultCollection/OS/_workitems/edit/31955630/)

---

## WHfB cannot use KDC proxy to get Kerberos tickets due to invalid flags being passed to DCLocator
[Link to topic](https://microsoft.visualstudio.com/OS/_workitems/edit/33254624)

---

## WHfB key trust.  
Event ID 21 flooding event log on DCs after applying September updates: "The client certificate for the user Domain\user is not valid, and resulted in a failed smartcard logon"  
The change was introduced in 8C where it attempts full cert chain validation on key trust certs and then if it fails, falls back to the less strict checks.  The event should be suppressed on the first check for Key Trust in my opinion.  
[750458 ADDS: Security: KDC event 21 with error ~"root certificate is not trusted by the trust provider" logged on 9b.21+ patched DCs](https://internal.evergreen.microsoft.com/topic/adds-security-kdc-event-21-with-error-root-certificate-is-not-trusted-by-the-trust-provider-logged-on-9b-21-patched-dcs-a0b717c5-a395-eaa6-90ba-913b35287e36)  
The issue has been fixed in the following updates:  
Windows SV 21H2: 2022 6C  
Windows Server 2022: RTM  
1809 \ RS5 \ Windows Server 2019: 2022 6C  
1607 \ RS1 \ Windows Server 2016: 2022 7B  

---

## WinX: AAD: 21H1 Azure AD joined machines cannot access on-prem resources or acquire a Kerberos ticket from an on-prem DC
[Link to topic](https://internal.evergreen.microsoft.com/topic/2a77003b-751d-7247-3783-36889865aeaf)  
The issue has been fixed in the following updates:  
[October 12, 2021KB5006670](https://support.microsoft.com/topic/october-12-2021-kb5006670-os-builds-19041-1288-19042-1288-and-19043-1288-8902fc49-af79-4b1a-99c4-f74ca886cd95)

---

## KB5011935: Servicing: 1B.22: Remote Credential Guard authentication may fail with c0030009 after applying 1B.22 to the client initiating the RDP connection
A new possible regression from the January 2022 update that causes Remote Credential Guard scenarios to fail.   
_Windows Hello for Business with a key, including cloud trust, does not support supplied credentials for RDP. RDP does not support authentication with a key or a self-signed certificate. RDP with Windows Hello for Business is supported with certificate-based deployments as a supplied credential. Windows Hello for Business with a key credential can be used with Windows Defender Remote Credential Guard._  
The issue has been fixed in the following updates:  
Windows Server 2022: 2022 4C  
Windows 11 (SV): 2022 4C  
2004 \ 20H1 \ 20H2 \ 21H1 \21H2: 2022 4C  

---

## Servicing: 1B.22: LSASS crashes with c0000374  / 255 + reboot loop on DCs (ICM 282863898)   
The issue has been fixed in the following updates:   
1B OOB (Out-of-band update for Windows Server January 17, 2022)

---

## SBSL: Slow logon or blackscreen on AAD-joined Clients with no connectivity to "login.microsoftonline.com" even after 2020.3C
[Link to topic](https://internal.evergreen.microsoft.com/topic/4575243)  
[Bug 27223919: Logon delayed due to cloudAP!InteractiveLogon waiting on the network while holding the UserCacheEntry lock exclusively](https://microsoft.visualstudio.com/OS/_workitems/edit/27223919)  
These issues have been fixed in the following updates:  
[2004 / 20H1 / 20H2](https://support.microsoft.com/topic/march-29-2021-kb5000842-os-builds-19041-906-and-19042-906-preview-1a58a276-6a0a-47a5-aa7d-97af2d10b16d)  
[1909 / 19H2](https://support.microsoft.com/topic/march-25-2021-kb5000850-os-build-18363-1474-preview-ffd0a98f-4114-4883-ab1f-8d0971f63978)  
[1809 \ RS5 \ Windows Server 2019](https://support.microsoft.com/topic/march-25-2021-kb5000854-os-build-17763-1852-preview-082d35a7-68dd-448a-bfea-03f038669b11)

---

## AMA feature is broken when user signs in with a WHfB certificate (certificate trust deployments)
[Link to topic](https://microsoft.visualstudio.com/DefaultCollection/OS/_workitems/edit/26004246)  
The issue has been fixedUpdates in the following versions:

Windows 2016  
Windows 2019

---

## Windows Hello for Business key-based authentication fails with only WS2019 Domain Controllers

Windows Hello for Business Hybrid Key Trust deployment  Sign-in fails with "That option is temporarily unavailable. For now, please use a different method to sign" if Windows 2019 Server Domain Controllers (DCs) are used for authentication.  
This issue was fixed. The fix was released as part of [KB4487044](https://support.microsoft.com/en-gb/help/4487044/windows-10-update-kb4487044).  
See: [Windows Hello for Business deployment issues](https://docs.microsoft.com/windows/security/identity-protection/hello-for-business/hello-deployment-issues)

---

## After installing the 2021 4B Windows Updates, users in an impacted organization that do not configure the new policy-based allowlist will notice a blocked navigation error while attempting Azure AD Web Sign-in and above-lock PIN reset scenarios.

See:  
[Servicing: 4b.21: Web Sign-in navigation endpoint to inbox restrictions + ConfigureWebSignInAllowedUrls Intune policy "allowlist" avoids "we can't open that page right now" error](https://internal.evergreen.microsoft.com/topic/4614145)

---

## Invoking "I forgot my PIN" from "Settings/Accounts/Sign-in options" fails on Windows 10 1903 and above devices, in a Windows Hello for Business "On-Premise" deployment.


The issue has been fixed in the following updates:  
**Windows 10 1809**  
**Windows 10 1903/1909**  
**Windows 10 2004**  
[**ADDS: WHFB: Invoking "I forgot my PIN" from either "systemsettings" or the "lock screen" may fail on Windows 10 1809 and above devices**](https://internal.evergreen.microsoft.com/topic/1ecafd6d-b66a-88d2-7322-ef3e23c8a910)

---

## Windows Hello For Business (WHFB) and Credential Roaming (CR) Interoperability Issues

The issue has been fixed in the following updates:  
**KB5000842**  
[Credential Roaming roams WHFB certificates into AD and breaks WHFB functionality [Vb/20H1/20H2]](https://microsoft.visualstudio.com/OS/_workitems/edit/31353355)

---

## Selecting "Sign-in options" on Windows 10 1903+ devices may result in long delays in a WHfB Certificate Trust deployment, where the customer has additional templates configured with a Certificate Practice Statement policy defined.

[Bug 26146331](https://microsoft.visualstudio.com/OS/_workitems/edit/26146331)  
The issue has been fixed in the following updates:  
**KB4601382**  
**KB4601380**

---

## NET: User Logon and device unlock are slow on AAD-joined devices without network connectivity to login.microsoftonline.com (SBSL: NET)

The issue has been fixed in the following updates:  
Install corrective or preventative OS versions or OS updates as they become available

![Description of the picture](/.attachments/image-defb82ee-11a9-494b-86f4-34c72b825b62.png)

---

## Computer certificates failed to migrate following an "in-place upgrade" of 1809 -> 1909 devices

See:  
[Servicing:10B.20: Machine, Personal, intermediate and Root certificates missing + AADJ fails after in-place if source OS patching newer than source OS (ICM 210670332)](https://internal.evergreen.microsoft.com/topic/4591070)  
The issue has been fixed in the following updates:  
[Resolved issues in Windows 10, version 20H2 and Windows Server, version 20H2](https://docs.microsoft.com/windows/release-health/resolved-issues-windows-10-20h2)

---

## SBSL: Slow logon on AAD-joined Clients if firewall drops packets to login.microsoftonline.com
[Link to topic](https://internal.evergreen.microsoft.com/topic/3218254)

---

# **Not Fixed**

## User not able to sign in using PIN after user accounts were re-created
Resolving as Won't Fix. The feature team has the bug and is considering a v-next fix.  
[Link to topic](https://microsoft.visualstudio.com/OS/_workitems/edit/29985153)


## Authentication to On-Prem resources may fail when WHFB credentials are collected from the CredUI prompt, on AAD or Hybrid joined Windows 10 devices in a WHFB Hybrid deployment
Resolving as Won't Fix.  
[Link to topic](https://microsoft.visualstudio.com/OS/_workitems/edit/30061301)

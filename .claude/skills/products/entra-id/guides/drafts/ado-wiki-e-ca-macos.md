---
source: ado-wiki
sourceRef: "Supportability\AzureAD\AzureAD;C:\Program Files\Git\GeneralPages\AAD\AAD Authentication\Azure AD Conditional Access Policy\Azure AD Conditional Access for macOS"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=C:/Program Files/Git/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Conditional%20Access%20Policy/Azure%20AD%20Conditional%20Access%20for%20macOS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- cw.macOS
- SCIM Identity
- Conditional Access
-  macOS
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Conditional-Access](/Tags/Conditional%2DAccess) 


[[_TOC_]]

## Summary

Organizations need to ensure users access Office 365 only from managed devices, on whatever platform they?re using.

Administrators can now restrict access to Intune-managed macOS devices using device-based conditional access according to their organization?s security guidelines.

The "**macOS**" conditional access Platform condition gives Administrators the ability to selectively target conditional access policies for macOS. Previously, to restrict access to applications in Azure AD from macOS devices, organizations had to create a blanket policy for "**All platforms (including unsupported**" to cover the macOS platform. The result was a generic restriction applied to multiple platforms, which lacked granular control over macOS devices.

## Restrict access to Azure AD applications for compliant macOS devices

Create a targeted conditional access policy for macOS to protect the Azure AD Applications. Go to conditional access under Azure AD service in Azure portal to create a new policy for macOS platform.

[![MacOSPlatform.jpg](/.attachments/27ab2c29-0bea-e643-cf5e-327cc15afe04625px-MacOSPlatform.jpg)](/.attachments/27ab2c29-0bea-e643-cf5e-327cc15afe04625px-MacOSPlatform.jpg)

## MSODS Objects

The policy object has an attribute called **PolicyDetail** that contains the JSON string for the policy. In this scenario the "DevicePlatforms" section should display "macOS".

```
    {"Version":0,"State":"Enabled","Conditions":{"Applications":{"Include":[{"Applications":["00000002-0000-0ff1-ce00-000000000000"]}]},"Users":{"Include":[{"Users":["All"]}]},"DevicePlatforms":{"Include":[{"DevicePlatforms":["macOS"]}]},"Locations":{"Include":[{"Locations":["36b7129d-547c-449e-8958-158285bdb8ed"]}]},"ClientTypes":{"Include":[{"ClientTypes":["Browser","Native"]}]},"SignInRisks":{"Include":[{"SignInRisks":["High","Medium","Low"]}]}},"Controls":[{"Control":["Block"]}]}
```

## Device Registration

A new version of Company Portal has been created for Mac OS. The Mac version of the Company Portal application is used as a Broker to first Workplace Join the Mac OS device into Azure AD through Azure AD Device Registration Service (DRS). Once it is Workplace Joined, a the device certificate is stored in the user's login context under the Apple KeyChain store, At this point Intune enrollment takes place where it is linked to the device in Azure AD.

  - A user who authenticates to an application using the macOS Conditional Access setting will be prompted to beef up their security by getting the Company Portal application.
  - The user provides their Azure AD Credentials and they are walked though Enrollment.
  - The user will then get a prompt for local Administrator credentials on the Mac OS in order to make changes to the System profile and to store the certificate in the Apple KeyChain.

## Registration Flow

The device registration flow for Mac OS:

[![MacOSRegistrationFlow.jpg](/.attachments/898d4d8e-8fd3-cb49-25bc-d04611737105757px-MacOSRegistrationFlow.jpg)](/.attachments/898d4d8e-8fd3-cb49-25bc-d04611737105757px-MacOSRegistrationFlow.jpg)

1.  The user attempts to authenticate to a service where the "**macOS**" conditional access Platform condition is selected.
2.  ESTS checks to see if a conditional access policy is linked to the service.
3.  If a conditional access policy is enabled, the device is denied and challenged for device authentication. If the device is not already authenticated an Access Remediation page is generated directing the user to download the EMS (Company Portal) application from the Mac store.
4.  The user clicks the link to download the Company Portal application from the Mac Company Portal
5.  The Mac is first registered with Azure AD Device Registration Service (DRS) where it gets a DeviceID and its DeviceTrustType is set to "Workplace Join".
6.  Azure AD DRS issues a device certificate which gets returned to the Mac device
7.  The device certificate then gets stored in the user's Apple "Login" KeyChain.
8.  Once the device certificate has been stored in the user's Apple Login KeyChain a parallel enrollment with Intune is triggered
9.  An internal Intune ID is generated which gets linked to the device object in Azure AD and starts stamping the device as Managed and Compliant.

## Obtaining Broker Logs

Device Registration in Azure AD and Intune is performed by Company Portal which acts as the Broker to register the device in AAD. Initially it is joined to Azure AD and it's DeviceTrustType is set to "Workplace Join". Once the device certificate is in the user's Apple "Login" KeyChain, enrollment into Intune takes place and then the device is marked as Managed. Once the device meats Compliance policies Intune marks the device as Compliant.

The Mac Company Portal will be available from Microsoft Download.

### Company Portal Logs

This is documented in Content Idea?[2999742](https://internal.evergreen.microsoft.com/topic/2999742).

  - Open the Company Portal application and tap the?**Help**?tab.
  - Tap **Send Diagnostic Report** (and have them emailed direct to you.

## Not Able to Enroll

Verify the User has an Intune License assigned to them.

They also need an Apple Push Notification Service (APNS) Enrollment Certificate configured in Intune. If assistance is needed send a Problem to Intune.

## Un-Enroll and Re-Enroll

If, for some reason, the certificate has been deleted from the Apple Login KeyChain they must Un-Enroll and Re-Enroll the device through Mac Company Portal.

  - In Mac Company Portal they must tap **Device** and then tap **Remove**.
  - Tap **Device** and **Enroll**.

## Mac OS Intune Compliance Policy

An Intune Administrator must create compliance policy for MacOS before creating a Conditional Access policy in order to ensure ONLY compliant macOS devices get access to protected applications. Failure to create a Mac OS Compliance Policy will result in the device being marked as Compliant automatically.

## Supported OS versions, applications, and browsers

At public preview, the following OS versions, applications, and browsers are supported on macOS:

### Operating Systems

  - macOS 10.11+

### Applications

The following Office 2016 for macOS applications are supported:

  - Outlook v15.34 and later
  - Word v15.34 and later
  - Excel v15.34 and later
  - PowerPoint v15.34 and later
  - OneNote v15.34 and later
  - Teams (by 8-30-2017)

### Browsers

  - Safari
  - Chrome (\~by 9-6-2017)

## Not Supported

  - Multi-user support
      - Only one user can enroll the device and only the user that enrolled the device can pass Conditional Access.
      - System Preferences on Mac only allows for one Management profile.
  - OneDrive for Business - This is expected towards the end of calendar year 2017
  - The OneDrive Sync client will not support conditional access
  - Native Mail client
      - Customers need to block this using legacy authentication in ADFS or by setting EWS restrictions in Exchange.

## Viewing Device Certificates

1.  Open the?**Keychain Access app**, which is in the the **Utilities** folder of your **Applications** folder.
2.  From the list of keychains on the left side of the window, select "**login**."
3.  Click **OK** when done, then quit Keychain Access.

## Filing an ESTS IcM for Conditional Access issues

In [Viewpoint](http://aka.ms/viewpoint) select "**ICM:\[ICM\_ESTS\] Authentication**" as the "**Engineering Team**"

[3053992](https://internal.evergreen.microsoft.com/topic/3053992)?- How to escalate change requests or bugs to EvoSTS feature team

## Public Preview

Azure AD and Intune now support macOS in conditional access\! (August 23, 2017)

<https://blogs.technet.microsoft.com/enterprisemobility/2017/08/23/azure-ad-and-intune-now-support-macos-in-conditional-access/>

## Resources

Public Preview Announcement: [Azure AD and Intune now support macOS in conditional access\!](https://blogs.technet.microsoft.com/enterprisemobility/2017/08/23/azure-ad-and-intune-now-support-macos-in-conditional-access/)

## Training

Intune FastTrack and Support (CSS): [Conditional Access Support for Mac (public preview)](https://learn.microsoft.com/activity/S1107002/launch#/)

For more details, go to <https://aka.ms/macoscompliancepolicy>.

[Keychain for Mac: Keychain Access overview](https://support.apple.com/kb/PH20093?locale=en_US)

---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: References/Implementation and Advantages/PIN RESET"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/WHfB/WHFB%3A%20References/Implementation%20and%20Advantages/PIN%20RESET"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430696&Instance=430696&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430696&Instance=430696&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides detailed instructions on resetting a PIN for Windows 10 devices, applicable to both hybrid and on-premises deployments. It includes requirements, configurations, and step-by-step guides for using the Microsoft PIN reset service.

[[_TOC_]]

# PIN reset service

Applies to: **Windows 10, version 1709 or later**  
[PIN Reset service article](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-feature-pin-reset)

Hybrid customers can onboard their Azure tenant to use the Windows Hello for Business personal identification number (PIN) reset service to reset their PINs without access to their corporate network. For on-premises deployments, devices must be well connected to their on-premises network (domain controllers and/or certificate authority) to reset their PINs.

## Hybrid deployments

**Requirements**:
- Azure Active Directory (AD)
- Hybrid Windows Hello for Business deployment
- Azure AD registered, Azure AD joined, and Hybrid Azure AD joined
- Windows 10, version 1709 to 1809, Enterprise Edition (no licensing requirement for this feature since version 1903)

The Microsoft PIN reset service enables you to help users recover who have forgotten their PIN. Using Group Policy, Microsoft Intune, or a compatible mobile device management (MDM), you can configure Windows 10 devices to securely use the Microsoft PIN reset service. This allows users to reset their forgotten PIN through settings or above the lock screen without requiring re-enrollment. Hybrid deployments support non-destructive PIN reset that works with both the certificate trust and key trust models.

Reset above lock screen (I forgot my PIN link) - Windows 10, version 1903

**Important**: The Microsoft PIN Reset service only works with Enterprise Edition for Windows 10, version 1709 to 1809. The feature works with Enterprise Edition and Pro edition with Windows 10, version 1903 and newer.

## Configure Windows devices to use PIN reset using Group Policy

You configure Windows 10 to use the Microsoft PIN Reset service using the computer configuration portion of a Group Policy object.

1. Using the Group Policy Management Console (GPMC), scope a domain-based Group Policy to computer accounts in Active Directory.
2. Edit the Group Policy object from step 1.
3. Enable the "Use PIN Recovery" policy setting located under `Computer Configuration->Administrative Templates->Windows Components->Windows Hello for Business`.
4. Close the Group Policy Management Editor to save the Group Policy object. Close the GPMC.

## On-premises deployments

**Requirements**:
- Active Directory
- On-premises Windows Hello for Business deployment
- Reset from settings - Windows 10, version 1703, Professional
- Reset above Lock - Windows 10, version 1709, Professional

On-premises deployments provide users with the ability to reset forgotten PINs either through the settings page or from above the user's lock screen. Users must know or be provided their password for authentication, perform a second factor of authentication, and then re-provision Windows Hello for Business. On-premises deployments support destructive PIN reset that works with both the certificate trust and key trust models.

Reset from settings - Windows 10, version 1703, Professional  
Reset above lock screen - Windows 10, version 1709, Professional  
Reset above lock screen (I forgot my PIN link) - Windows 10, version 1903

**Important**: Users must have corporate network connectivity to domain controllers and the federation service to reset their PINs.

### Reset PIN from Settings

1. Sign in to Windows 10, version 1703 or later using an alternate credential.
2. Open Settings, click Accounts, click Sign-in options.
3. Under PIN, click "I forgot my PIN" and follow the instructions.

### Reset PIN above the Lock Screen

1. On Windows 10, version 1709, click "I forgot my PIN" from the Windows Sign-in.
2. Enter your password and press enter.
3. Follow the instructions provided by the provisioning process.
4. When finished, unlock your desktop using your newly created PIN.

---

**NEXT STEP**: Based on the logs collected, and depending on the deployment model, you have to determine at which steps the problem is occurring.
- [WHFB:Provisioning](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430692/WHFB-Provisioning)
- [WHFB:Authentication](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430690/WHFB-Authentication)
- [WHFB:Pin Reset](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430689/Pin-Reset)

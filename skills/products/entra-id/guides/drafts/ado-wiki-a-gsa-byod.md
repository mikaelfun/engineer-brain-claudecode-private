---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA Bring Your Own Device (BYOD)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20Bring%20Your%20Own%20Device%20(BYOD)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA - Bring Your Own Device

## Summary

The Global Secure Access client supports bring your own device (BYOD) scenarios so users can access company resources. As a tenant administrator, enable Global Secure Access traffic profiles for members, including internal guests. The client supports automatic Microsoft Entra device registration.

## Prerequisites

- Tenant has GSA enabled
- Configure M365/IA and PA profile to the user and configure applications for access.
  - https://learn.microsoft.com/en-us/entra/architecture/gsa-deployment-guide-privateaccess
  - https://learn.microsoft.com/en-us/entra/architecture/gsa-deployment-guideinternet-access
  - [How to Enable and Manage the Microsoft Profile](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-manage-microsoft-profile)
- Windows device registered to a single tenant and not joined to any tenant
  - Windows Registration can be done in one of the following ways:
    a. By signing into a Microsoft account on Windows. Go to Settings->Accounts Access work or school->Add work or school account
    b. Clicking on "Allow my organization to manage my device" option when opening Office Pro plus app
    c. Adding a user into Edge Chromium
  - For a & b, its the app/broker which triggers the registration. You can register up to 3 accounts only.

## Windows

- Supports secure access on Microsoft Entra registered Windows devices (not domain-joined).
- Only private application traffic is supported. Enable Private Access traffic profiles for these users.
- If the device isn't registered or joined, the client registers the device to your tenant during first sign-in.
- If the device isn't joined and has multiple registrations, the user selects the tenant at sign-in with Microsoft Entra user of the tenant.

**Important:** On Windows devices that are Microsoft Entra joined or hybrid joined, the client always connects to the joined tenant.

## Android

- BYOD support without device enrollment is available using Microsoft Authenticator or the Microsoft Intune Company Portal through Microsoft Entra device registration.
- On the device:
  1. Install Microsoft Authenticator from the App Store and register the device to the tenant or install the Company Portal app (no device enrollment required).
  2. Install the Microsoft Defender app from Google Play and complete sign-in.
- Enable required traffic profiles for these users.
- A device-wide VPN profile is created. The Global Secure Access tile is off by default; the user must turn it on to send Private Access traffic.

## macOS

BYOD support without device enrollment is available through Microsoft Entra device registration.
- Install and register the device using the Company Portal (no device enrollment required).
- Enable required traffic profiles for these users.

## Tenant Selection and Switching (Preview)

### Platform Behavior

| Platform/device state | Connection target | All Traffic support | Private Access only support | Notes |
|:---|:---|---:|---:|:---|
| Windows | Always connects to joined tenant. For non-joined, user selects at first sign-in | From Entra Joined and Hybrid joined | From Entra Registered device | Multiple registrations allowed, no switching between registered tenants |
| macOS | User selects tenant at first sign-in | Entra Registered with/without enrollment | | Applies to enrolled and unmanaged devices with Company Portal |
| Android | User selects tenant at first sign-in | Entra Registered with/without enrollment | | Applies to enrolled devices with Company Portal and unmanaged devices |

### Key Rules
- Device join takes precedence on Windows; no tenant switching.
- Registered devices choose a tenant once at initial sign-in.

## Known Issues

- Multiple registered devices are not supported
- Registered and joined Windows devices are not supported. Client always connects to the joined tenant.
- Device registration during GSA client sign in is not supported. Register the device before starting the GSA client.
- B2B Guest access switch tenant option may not be visible sometimes. A restart of Windows should fix it.

## ICM Escalations

| Area | IcM Path |
|---|---|
| Private Access Data Path | Global Secure Access / GSA Datapath |
| Private Access Control Plane | Global Secure Access / GSA Control Plane |

# AutoPilot Azure AD Branding Configuration

Source: MCVKB/Intune/Windows/Windows AutoPilot Azure AD Branding.md

## Overview

Configure Azure AD company branding to customize the Windows AutoPilot OOBE experience.

## Configuration Steps

1. Sign into Azure Portal as tenant admin
2. Navigate to: Azure Active Directory > Company branding > Edit
3. Configure the following assets:

| Asset | Dimensions | Format | Max Size |
|-------|-----------|--------|----------|
| Square logo | 240x240 px | PNG/JPG | 10KB |
| Banner logo | 280x60 px | PNG/JPG | 10KB |
| Background image | 1920x1080 px | PNG/JPG | 300KB |

## Screen Mapping

- **(1)(5)** Square logo image (240x240) → shown on username and password screens
- **(2)(3)** Organization name → set in Azure AD tenant **Properties > Name** (not company branding)
- **(4)(6)** Sign-in page text (up to 256 chars) → shown below login fields

## Known Issues

- Special characters (e.g., accented characters) in tenant name may not display properly
- Sign-in page text wraps on username screen but not on password screen
- "User name hint" property in AAD is ignored during AutoPilot

## ADFS Considerations

If using ADFS, the password screen uses a web view with ADFS's own customization: [AD FS User Sign-in Customization](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/operations/ad-fs-user-sign-in-customization)

## Terms and Conditions

Intune can present a Terms and Conditions page during MDM enrollment: [Create T&C](https://learn.microsoft.com/en-us/intune/terms-and-conditions-create)

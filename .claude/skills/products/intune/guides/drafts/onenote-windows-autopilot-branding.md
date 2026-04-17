# Windows Autopilot Azure AD Branding Guide

> Source: MCVKB/Intune/Windows/Windows AutoPilot Azure AD Branding.md
> Status: draft (pending SYNTHESIZE)

## Overview
Customize the Windows Autopilot OOBE logon experience using Azure AD Premium company branding.

## Configuration Steps
1. Sign into Azure Portal as tenant admin
2. Navigate to Azure Active Directory > Company branding
3. Click Edit and configure:
   - Square logo: 240x240px, PNG/JPG, ≤10KB
   - Banner logo: 280x60px, PNG/JPG, ≤10KB
   - Background image: 1920x1080px, PNG/JPG, ≤300KB

## Element Mapping in Autopilot OOBE
| # | Element | Source |
|---|---------|--------|
| 1, 5 | Square logo | Company Branding > Square logo image |
| 2, 3 | Organization name | Azure AD > Tenant Properties > Name field |
| 4, 6 | Sign-in page text | Company Branding > Sign-in page text (≤256 chars) |

## Known Limitations
- Special/accented characters in tenant Name may not display properly
- User name hint from AAD is ignored in Autopilot OOBE
- Sign-in page text wraps on username screen but not on password screen
- ADFS users see web view for password (ADFS has its own customization)

## Related
- Intune Terms and Conditions can also be shown during MDM enrollment
- [Paint.NET](https://www.microsoft.com/en-us/store/p/paintnet/9nbhcs1lx4r0) for bitmap resizing

---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Microsoft Entra ID Company Branding"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FMicrosoft%20Entra%20ID%20Company%20Branding"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Microsoft Entra ID Company Branding

## Overview

Company Branding allows tenant admins with Azure AD Premium 1 to customize the user sign-in experience via Microsoft Graph Beta APIs. Organizations can add logos, custom colors, and manage URLs on sign-in pages.

## Key Features

- Customize sign-in page background and layout
- Manage all URLs inside SISU (Sign-In/Sign-Up) form including SSPR
- Manage footer URLs (Privacy & Cookies, Terms of Use)
- Remove/replace all Microsoft references from authentication pages
- "Keep me signed in" toggle property (moved from old blade)

## Microsoft Entra External ID (CIAM)

- Neutral default without Microsoft references
- Text customizations for local accounts and built-in attribute labels
- Docs: [Customize branding for customers](https://learn.microsoft.com/entra/external-id/customers/how-to-customize-branding-customers)

## API Details

- **New blade**: Powered by MS Graph API
- **Legacy blade (GA version)**: Powered by Azure Graph API
- Graph Beta APIs for loginPageLayoutConfiguration, loginPageTextVisibilitySettings

## Common Issues

- Inconsistency between new and legacy Company Branding blades
- CSS/styling not rendering correctly in certain browsers
- Custom branding not appearing for B2B guest users (by design - guest users see home tenant branding)
- Image size/format requirements not met

## Requirements

- Azure AD Premium P1 license
- Global Administrator or equivalent role

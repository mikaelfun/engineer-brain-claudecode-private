---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID for Customers (CIAM) - Custom App Branding For External ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20%28CIAM%29%2FEntra%20External%20ID%20for%20Customers%20%28CIAM%29%20-%20Custom%20App%20Branding%20For%20External%20ID"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Custom App Branding For Entra External ID

## Feature Overview

Allows admins to brand External ID applications separately from organizational branding. Each application can have its own theme with background image/color, favicon, layout, header, and footer.

## App Branding Themes Hierarchy

1. **Branding theme** - Per-app customization, overrides default branding
2. **Default branding (company branding)** - Tenant-wide, overrides neutral branding
3. **Neutral branding** - Initial branding for a tenant

## Key Notes

- Up to **5 branding themes per tenant**
- Live preview only shows Sign-in page, does not include custom text overrides
- Cannot use "Default theme" as branding theme name (reserved)
- Custom text changes limited to sign-in page only
- If banner logo not updated, Microsoft logo is displayed
- Image requirements: 245 x 36 px, max 10KB, PNG/JPG/JPEG

## Admin Role Requirements

- Organizational Branding Administrator
- Application Administrator

## Creating a Branding Theme

1. Entra Admin Center > Entra ID > Custom Branding
2. Select Branding Themes (Preview) > Themes tab
3. Create New Theme > enter Name
4. Apply theme to specific applications
5. Configure Layout (template, header, footer)
6. Configure Styling (background, favicon, logos, custom CSS)
7. Configure Custom text
8. Review and create

## Escalation Path

- ICM Service: **UMTE**
- ICM Team: **Company Branding**

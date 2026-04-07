---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra App Proxy -  Complex App Support"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20App%20Proxy%20-%20%20Complex%20App%20Support"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra App Proxy - Complex App Support

## Feature Overview

Public preview started 2 May 2022. Complex apps are a group of private apps that group together so that apps across different domains can securely call each other cross-domain (with app-specific CORS policies) and users can access all apps through a single token.

**Key concepts:**
- Each app URL pair (internal + external) is called an "app segment"
- Segments are non-overlapping with other private apps
- A complex app has a flat list of app segments (up to 500 pairs)
- All URLs in app segments must share a subdomain externally
- Complex app uses a wildcard certificate matching app segments
- All app settings are shared across segments; CORS settings are per-segment
- Link translation supported for all app segments (requires MyApps extension, except Edge mobile)

## Case Handling

Supported by Hybrid Auth Experiences (azidcomm-hyauthex@microsoft.com).

**Special handling:** Goldman Sachs has a special agreement — during weekday business hours exclusively supported by ACE Team. After ACE hours, create Sev 2 ICM: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=M1x3g3

## Licensing

- Single app segment: Entra Premium P1 or P2
- Multiple app segments (up to 500): Requires Premium SKU purchase (not yet available)
- Preview phase: More than one app segment requires PG outreach via AVA

## Limitations and Known Issues

- Only one application segment during public preview
- Out of scope:
  - Complex legacy auth scenarios with different CA policies or header configs per secondary resource
  - Multiple connector groups per application in V1
  - Token lifetime expiring after one hour

## ASC Support

In ASC, search by AppId in Applications > Application Proxy tab. The **ComplexAppData** field shows Complex App settings including app segments, frontend/backend URLs.

## Troubleshooting

See main App Proxy troubleshooting index: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/393136/Azure-AD-Application-Proxy

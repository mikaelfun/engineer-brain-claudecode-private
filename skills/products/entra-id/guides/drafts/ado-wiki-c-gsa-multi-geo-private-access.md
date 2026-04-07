---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA Multi Geo Capability for Entra Private Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20Multi%20Geo%20Capability%20for%20Entra%20Private%20Access"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA Multi-Geo Capability for Entra Private Access

## Summary

Optimizes traffic flow by assigning connector groups to preferred geo locations instead of tenant default. Supported regions: Asia, Australia, Europe, North America, Japan.

## Enable Multi-Geo

1. Entra admin center > Applications > Enterprise applications > Private Network connectors
2. Create connector groups with different regions (+ New Connector Group > Advanced settings > country/region)
3. Install connectors in each region
4. Add application segments to connector groups
5. Wait ~30 minutes for config to take effect

## Important Notes

- NOT available through Quick Access - only private enterprise apps
- Does NOT support DNS experience
- Japan region: set via Graph API only (not in UX):
  PATCH https://graph.microsoft.com/beta/onPremisesPublishingProfiles/applicationProxy/connectorGroups/{id} with body {"region": "japan"}

## Troubleshooting - Graph API

- Get app + connector group: GET /beta/applications/{id}?=onPremisesPublishing&=connectorGroup
- Get connector membership: GET /beta/onPremisesPublishingProfiles/applicationProxy/connectors/{id}/memberOf
- Get connector group details: GET /beta/onPremisesPublishingProfiles/applicationProxy/connectorGroups/{id}

## ICM Escalation

Path: AAD Application Proxy / Control Plane
Required: TenantID, ApplicationID, Destination Region, verify active connector in region

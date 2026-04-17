---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Tools/Powerlift"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTools%2FPowerlift"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Powerlift

Powerlift is a tool to access logs collected from some Microsoft products by end users. Products covered:
- Company Portal / Intune app / Tunnel VPN / Edge MAM / Outlook mobile / Authenticator / Defender ATP

## Company Portal, Intune, and Tunnel Server logs

Access via CoreIdentity groups (requires case number in justification). Permissions expire every 14 or 30 days.

| Domain | Entitlement |
| ------ | ----------- |
| Redmond | IntunePowerLiftRedmond |
| North America | IntunePowerLiftNorthAmerica |
| Europe | IntunePowerLiftEurope |
| Middle East | IntunePowerLiftMiddleEast |
| Far East | IntunePowerLiftFarEast |
| South Pacific | IntunePowerLiftSouthPacific |
| Africa | IntunePowerLiftAfrica |
| South America | IntunePowerLiftSouthAmerica |

All entitlements at: https://coreidentity.microsoft.com/manage/Entitlement

## Authenticator

Access via IDWeb group: authapplogs. Access does not expire.

## Defender for Endpoint/ATP (including Tunnel Client) logs

Access via IDWeb group: mde_css_powerlift. Access does not expire.

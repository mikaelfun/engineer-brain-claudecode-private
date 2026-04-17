---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Teams Devices/Android Based/Collecting Logs"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FTeams%20Devices%2FAndroid%20Based%2FCollecting%20Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Collecting Company Portal Logs from Android Teams Devices

Company Portal logs cannot be collected directly from Teams devices since CP is not accessible by users. Use Teams Admin Center.

**Note:** CP logs NOT included in TAC log collection prior to Teams app version 1449/1.0.94.2021101205. Some OEMs (e.g., Poly) offer own MDM portal for log collection.

## Steps
1. Go to Teams Admin Center: https://admin.teams.microsoft.com/dashboard
2. Teams devices > Select applicable type (panels, phones, displays, etc.)
3. Select display name > Download device logs
4. Get screenshot of software health tab
5. Click History tab > Download when ready
6. In ZIP, find "SessionID_For_Company_Portal_Logs.txt"
7. Take EasyID or GUID from file
8. Search in PowerLift (Intune app): https://powerlift.acompli.net/#/incidents
9. All Intune-related files on the Files tab

If device cannot upgrade to >1449 and has no OEM portal, CP logs cannot be collected and device is likely out of support.

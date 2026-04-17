---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Teams Devices"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FTeams%20Devices"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Teams Devices Overview

## What are Teams devices?

- **Phones (Teams Phones)**:
  - Android-based
  - Typically not integrated with Windows PC
  - Can be at a user's desk or in a common area

- **Teams Rooms**:
  - Android (AKA: MTR-A) or Windows based (AKA: MTR-W)
  - Used in conference rooms for Teams usage/integration
  - Can use common/resource/room account (recommended) or individual user sign-in (supported, not recommended)

- **Teams Displays and Panels**:
  - Usually posted outside meeting rooms for scheduling and room status
  - Generally not enrolled in Intune, but sometimes possible

- **Teams cameras, speakers, docks, lanyards, etc.**:
  - Not enrolled in Intune, not covered in this wiki

## Reference

- [Teams Rooms on Windows and Android feature comparison](https://learn.microsoft.com/en-us/microsoftteams/rooms/teams-devices-feature-comparison)

## Troubleshooting by device type

- All [Android-Based Teams devices] are generally troubleshot in the same manner. Device-dependent situations are noted.
- [Windows-Based Teams rooms devices] have their own flows due to OS differences.

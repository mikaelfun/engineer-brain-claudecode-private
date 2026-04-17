---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Teams Devices/Windows Based"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FTeams%20Devices%2FWindows%20Based"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Teams Devices - Windows Based (MTR-W)

## Enrolling Windows Teams Room devices

Currently, [this blog post](https://techcommunity.microsoft.com/t5/intune-customer-success/enrolling-microsoft-teams-rooms-on-windows-devices-with/ba-p/3246986) is the most up-to-date resource for enrolling Windows-based Teams devices.

## VM Testing

The Teams team published [a guide](https://dev.azure.com/Supportability/UC/_wiki/wikis/UC.wiki/712417/Setup-Guide-MTR-lab-in-Hyper-V) on building a VM to test Windows Teams Rooms devices in a test lab.

> **Important**: The need for a Teams device license has started being enforced. If your tenant isn't licensed, this process will not work.

## Log Collection

Users/admins on MTR-W's can leave the Teams application and get into a standard Windows desktop where they can collect logs as needed.

**Recommended**: A standard **One Data Collector (ODC)** is the best log collection method for troubleshooting issues on these devices.

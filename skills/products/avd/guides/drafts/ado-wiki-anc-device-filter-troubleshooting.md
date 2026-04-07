---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Azure Network Connection/Azure Network Connection Device Filter/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Azure%20Network%20Connection/Azure%20Network%20Connection%20Device%20Filter/Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ANC Device Filter Troubleshooting

**Note:** The release is hardcoded in the Intune Portal, reason why the Troubleshooting is limited to the visuals or outputs. In case the action plans below are exhausted, follow the ICM process to fix the behavior in the backend by PG.

## Device count doesn't load

### Customer experience:
- The "Cloud PCs" column in the Azure Connection list shows "--".
- Displays an error message:
  - "Failed to load data for Azure network connections. Please refresh or retry."

### Possible causes:
- API call failure.
- Pagination data retrieval error.
- Network connectivity issues.

## Device count for ANC is incorrect

### Customer experience:
- Displayed number doesn't match the actual device count.
- Clicking the link shows a device list inconsistent with the displayed number.

### Possible causes:
- Cached data is outdated.
- Concurrent updates (device state changes during data fetch).

## Redirect to All Cloud PCs doesn't happen

### Customer experience:
- Clicking the device count link does nothing; users remain on the current page instead of navigating to All Cloud PCs.

### Possible causes:
- Permission issues (user lacks access to All Cloud PCs page).
- Session storage failure.

## Customer doesn't see expected devices on Overview page

### Customer experience:
- Navigation to All Cloud PCs succeeds, but ANC filter isn't applied.
- All devices are shown instead of those for specific ANC.

### Possible causes:
- Filter application failure.
- Session storage data lost.
- User lacks permission to view specific devices.

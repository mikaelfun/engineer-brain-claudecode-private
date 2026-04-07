---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Frontline/Frontline Shared/Windows 365 Cloud Apps/Windows 365 CloudApps Troubleshooting Queries"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Frontline/Frontline%20Shared/Windows%20365%20Cloud%20Apps/Windows%20365%20CloudApps%20Troubleshooting%20Queries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Cloud Apps Kusto and CPCD Troubleshooting

## Overview

Use the [CPCD Dashboard](https://aka.ms/cpcd) which contains a dedicated page for Cloud Apps troubleshooting.

**Key principle:** Cloud Apps = Windows 365 Frontline Shared + AVD RAIL

- Issues with functionality of the Cloud App (e.g., bad rendering) → treat same as RAIL (AVD Remote Apps)
- Provisioning and connectivity issues → treat same as Windows 365 machine
- Related TSGs: [Frontline Shared](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/1928053/Frontline-Shared), [AVD RAIL (RemoteApps)](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/823641/RemoteApps)

## Important Warning: Activity ID (PublishAID)

The PublishAID is a **single variable used by ALL queries**. When using the tables, always make sure you understand the scenario (Publish, Unpublish, etc.) and focus only on the tables relevant to your scenario, even if other tables might show information about your Activity ID.

## CPCD Kusto Tables Workflow

### App Discovery & Configuration
1. **Table 1 (FTE Only):** Shows cloud apps per Tenant with details (requires Reporting Cluster access)
2. **Table 2:** Shows discovered apps when policy was created (data within 30 days). Col1 has information about the discovery flow
3. **Table 3:** Shows discovered app details with focus on app configuration (exe path, name, etc.)

### Publishing Flow
4. **Table 4:** When publishing an app, run this first to get the Activity ID
5. **Table 5:** With the Activity ID, check details on the publishing event
6. **Table 6:** Shows extended information about the app publish event in Col1

### Unpublishing Flow
7. **Table 7:** Get the Activity ID for the unpublish event
8. **Table 8:** With the Activity ID, check detailed events
9. **Table 9:** Shows full details based on the Cloud App ID

### Combo Actions (Reset+Publish, Update+Publish)
10. **Table 10:** Get the Activity ID for combo actions (Update+Publish = editing already published cloud app, e.g., change display name)
11. **Table 11:** Check details for the combo event using the activity ID from step 10
12. **Table 12:** Shows full events for all combo and single actions performed (uses Cloud App ID)

## Notes
- When doing **Unpublish**, you will see a **Patch event** because the app is also Reset to default state
- **Combo actions** always show the Reset/Update and the Patch event
- When checking the combo activity ID, also check the other Activity ID from the Patch event
- Internal service application names in Kusto columns are NOT Cloud App names - do not confuse

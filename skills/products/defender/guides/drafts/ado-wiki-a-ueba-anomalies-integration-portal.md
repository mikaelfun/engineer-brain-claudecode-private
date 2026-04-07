---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/UEBA/[TSG] - UEBA Anomalies Integration in the Portal"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FNext-Gen%20-%20Microsoft%20Sentinel%20(USX)%2FUEBA%2F%5BTSG%5D%20-%20UEBA%20Anomalies%20Integration%20in%20the%20Portal"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG: UEBA Anomalies Integration in the Portal

## Video training

[QA Platform](https://platform.qa.com/resource/new-ui-integrations-of-sentinel-ueba-to-defender-portal-1854/?context_id=12963&context_resource=lp)

## Troubleshooting Matrix

| **Feature/Area** | **Problem** | **Answer** | **Notes** |
| --- | --- | --- | --- |
| **User Side Pane & User Page Overview** | UEBA anomalies section is empty or missing | - Ensure you are a UEBA customer and have UEBA enabled. - Non-UEBA customers will see an empty state during private preview. | UEBA must be enabled and data sources onboarded. It takes 7-13 days after enabling UEBA for anomalies to appear. |
| **User Side Pane & User Page Overview** | No anomalies or tag shown for a user | - The user may not have more than one anomaly in the last 30 days. - Wait for baseline learning period (7-13 days after enabling UEBA). | Anomalies are shown only if detected. |
| **User Threat Section** | Anomalies count is zero | - The user has no detected anomalies in the last 30 days. - Confirm UEBA is enabled and data sources are connected. |  |
| **Sentinel UEBA Anomalies Section** | Top anomalies not displayed | - Only the top 3 anomalies (by score) are shown. - If none are present, the user may not have recent anomalies. |  |
| **Advanced Hunting Shortcuts** | 'All User anomalies in Advanced hunting' link not working | - Ensure you have the necessary permissions for advanced hunting. - Confirm UEBA is enabled and data sources are available. |  |
| **Incident Graph - Go Hunt Query** | 'All User anomalies' not showing results | - The user may not have anomalies in the last 30 days. - Confirm UEBA is enabled and baseline period has passed. |  |
| **Query Authoring** | No suggestion to join with Anomalies table | - Only tables supported by UEBA will trigger this suggestion. - Ensure you are querying a UEBA-eligible table. |  |
| **General Access** | UEBA anomalies not visible anywhere in the portal | - Confirm you're in the Defender portal and not the soon to be deprecated Azure portal. - Confirm UEBA is enabled and data sources are onboarded. - Wait 7-13 days after enabling for anomalies to appear. | This integration only works in the Defender portal |
| **General** | Anomalies data seems outdated or missing | - Anomalies are calculated based on up to 6 months of data. - Wait for the baseline learning period after enabling UEBA. - Check that data sources are continuously connected. |  |

## Additional Notes

- **Baseline Learning Period:** After enabling UEBA, allow 7-13 days for the system to build baselines and start generating high-confidence anomalies.
- **Permissions:** Advanced hunting and some features require appropriate permissions.
- **Feature Contacts:** For unresolved issues, raise a CRI.

---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Onboarding & Offboarding/[Product Knowledge] - Recovering Microsoft Sentinel"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Onboarding%20%26%20Offboarding/%5BProduct%20Knowledge%5D%20-%20Recovering%20Microsoft%20Sentinel"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [Product Knowledge] - Recovering Microsoft Sentinel

## Possible Scenarios
- The customer has accidentally deleted the SecurityInsights solution manually from the resource group housing Microsoft Sentinel.
- The customer has deleted the Log Analytics Workspace housing Microsoft Sentinel.
- The customer has offboarded Microsoft Sentinel via the Settings blade and wants to restore his Microsoft Sentinel instance.

## Recovering
1. Confirm if the Log Analytics Workspace is still present. If it's been deleted, follow the public doc to recover the workspace: [Recover a workspace in a soft-delete state](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/delete-workspace?tabs=azure-portal#recover-a-workspace-in-a-soft-delete-state). Seek the assistance of the Monitoring Team via a collab.
2. Confirm what date the customer removed Microsoft Sentinel or deleted the SecurityInsights solution. After you remove the service, there is a grace period of **30 days** to re-enable the solution. Data and analytics rules will be restored, but the configured connectors that were disconnected must be reconnected. Reference doc: [Implications of removing Microsoft Sentinel from your workspace](https://learn.microsoft.com/en-us/azure/sentinel/offboard-implications)
3. Re-enable the solution by re-adding Microsoft Sentinel to the Log Analytics Workspace by performing the standard onboarding process on our public doc: [Enable Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/quickstart-onboard#enable-microsoft-sentinel-)
    - If issues occur during this step obtain a HAR file and review. Follow standard escalation procedures.

## Advanced Recovery
If re-onboarding via the user interface does not result in a functioning Microsoft Sentinel instance, we will properly offboard and re-onboard Microsoft Sentinel to restore functionality.
1. Send a **DELETE** request using the following API: [Sentinel Onboarding States - Delete](https://learn.microsoft.com/en-us/rest/api/securityinsights/sentinel-onboarding-states/delete?view=rest-securityinsights-2024-03-01&tabs=HTTP).
```
https://management.azure.com/<WorkspaceResourceID>/providers/Microsoft.SecurityInsights/onboardingStates/default?api-version=2024-03-01
```
2. Check that the SecurityInsights solution has been removed from the Log Analytics Workspace via the **Legacy Solutions** blade in the Log Analytics Workspace portal. If it has not been removed, delete it manually by clicking on the solution, then selecting Overview, and then clicking Delete.
3. Send a **PUT** request using the following API making sure to include a request body: [Sentinel Onboarding States - Create](https://learn.microsoft.com/en-us/rest/api/securityinsights/sentinel-onboarding-states/create?view=rest-securityinsights-2024-03-01&tabs=HTTP)
```
https://management.azure.com/<WorkspaceResourceID>/providers/Microsoft.SecurityInsights/onboardingStates/default?api-version=2024-03-01
```
Request Body:
```json
{
  "properties": {
    "customerManagedKey": false
  }
}
```
4. If you get an error "CapacityReservation sku can be changed only after 31 days" during the PUT request, create an ICM (Example: ICM-651159139).
5. Confirm that the customer can access data connectors and other blades in Microsoft Sentinel after a successful PUT operation.

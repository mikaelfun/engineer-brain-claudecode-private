---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/Outbound provisioning/Troubleshooting Identity Provisioning issues/How to execute Microsoft Graph commands in Arlington when GraphExplorer is not available"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FOutbound%20provisioning%2FTroubleshooting%20Identity%20Provisioning%20issues%2FHow%20to%20execute%20Microsoft%20Graph%20commands%20in%20Arlington%20when%20GraphExplorer%20is%20not%20available"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to execute Microsoft Graph commands in Arlington when GraphExplorer is not available

## Steps

1. Ask the customer to navigate to enterprise application of choice inside Azure Portal
2. Open Developer Tools in the browser
3. Navigate to the Network tab inside Developer Tools
4. Refresh the page from the browser
5. Copy the Authorization header **without the Bearer string** for one of the server requests (e.g. /Properties)
6. Use the Postman collection (SyncFabric Arlington Requests) to:
   - Paste the information gathered from the portal (bearer token, service principal identifier, run profile identifier) inside the collection variables
   - Execute the requests the customer is interested in

## Available operations in the Postman collection

- Getting the job status
- Doing a full (including CDS) restart of the job

## Notes

- This workaround is specifically for Arlington (US Gov cloud) environments where Graph Explorer is not available
- The bearer token is obtained directly from the portal's own API calls via browser DevTools
- Token has the same permissions/scope as the portal session

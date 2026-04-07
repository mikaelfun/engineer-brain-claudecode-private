---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/Outbound provisioning/Administrator Operation Explorer - ASC"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FOutbound%20provisioning%2FAdministrator%20Operation%20Explorer%20-%20ASC"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Administrator Operation Explorer

The Administrator Operation Explorer is a tool within ASC (Azure Support Center) which exposes the UI events that have been executed for an Enterprise Application's provisioning configuration.

## Where to find the Administrator Operation Explorer tab

In the AAD Provisioning section in Tenant Explorer, select a specific application the customer has configured. Once selected, choose the **Administrator Operation Explorer** tab.

## Available data

- **Utc Operation Time** - Time (UTC) at which the request was made
- **Actor** - UPN of the initiator of the request
- **Http Method** - Http Method used (POST/PUT/DELETE)
- **Request ID** - Internal request ID used by SyncFabricManager
- **Request Uri** - The URI of the Graph request
- **Response Status Code** - HTTP response code
- **Message** - HTTP response message
- **Logs Url** - Link to the Jarvis logs for the request
- **Correlation Id**
- **Environment Cloud Location**
- **Slice Name**
- **Tenant Detail**

Columns can be added/removed on the right side of the table.

## Filtering Data

Default filter: past 24 hours. Time range limited to past 30 days, max 15-day span. Results can be filtered using column headers (e.g., filter Request URI containing "Post").

## Interpreting data

### Schema modifications

#### POST
A POST to the schema indicates a change was made:
- Scoping filter modifications
- Mapping modifications
- Adding/removing attributes from the schema

Sample Request URI:
```
POST https://syncfabric.windowsazure.com/api/servicePrincipals('{spId}')/synchronization/jobs('{jobId}')/schema/directories('{dirId}')/microsoft.synchronization.discover?api-version=2.0
```

#### DELETE
A DELETE indicates the custom schema was deleted. The runprofile will use the default schema. Customer can trigger this via Graph or "Reset default mappings" in portal.

Sample Request URI:
```
DELETE https://syncfabric.windowsazure.com/api/servicePrincipals('{spId}')/synchronization/jobs('{jobId}')/schema?api-version=2.0
```

### Test connection

When customer triggers Test Connection from portal, a validateCredentials request is sent.

When Test Connection fails, use the **Logs URL** column to access Jarvis logs for detailed investigation.

#### Test Connection - Initial Configuration Failures

For apps that haven't successfully configured provisioning yet, the default ServicePrincipal Identifier in ASC won't find them. Workaround:

1. Navigate to an application that already has provisioning enabled
2. Replace the ServicePrincipal Identifier with the Object ID of the failing app
3. Click "Run" to pull up the data

### Start/Pause/Reset Provisioning

#### Start
Triggers a start request:
```
POST .../microsoft.synchronization.start?api-version=2.0
```

#### Pause
Triggers a pause request:
```
POST .../microsoft.synchronization.pause?api-version=2.0
```

#### Restart (Clear current state / Restart Provisioning)
Triggers a restart request:
```
POST .../microsoft.synchronization.restart?api-version=2.0
```

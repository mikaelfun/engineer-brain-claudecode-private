---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Grafana/How-To/Query the Azure REST API with Managed Grafana"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FManaged%20Grafana%2FHow-To%2FQuery%20the%20Azure%20REST%20API%20with%20Managed%20Grafana"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Query the Azure REST API with Managed Grafana

## Overview

The Azure Monitor data source cannot create REST API queries. To query Azure REST APIs (billing info, service health, other REST APIs) from Grafana, use the **Infinity plugin**.

## Setup Steps

1. **Enable Infinity plugin**: In Azure Managed Grafana resource > Plugin management (Preview) > enable "Infinity" checkbox > Save

2. **Add as data source**: In Grafana instance > Home > Connections > Connect data > search "Infinity" > Create a Infinity data source

3. **Create a Service Principal** (for authentication):
   ```bash
   az ad sp create-for-rbac
   ```
   **Important**: Save the output (Client ID, Client Secret) immediately - it won't be shown again.

4. **Assign permissions**: Grant the Service Principal necessary permissions (e.g., Monitoring Reader at subscription level)

5. **Configure OAuth2 authentication** in Infinity data source settings:
   - Choose **OAuth2** under authentication
   - Enter **Client ID** and **Client Secret** from Step 3
   - **Token URL**: `https://login.microsoftonline.com/TENANTID/oauth2/token`
   - **Allowed hosts**: `https://management.azure.com/`
   - Add Endpoint param: name = `resource`, value = `https://management.azure.com/`

6. **Save & test**: A successful test produces a green checkmark

7. **Use Explore** to query Azure REST API endpoints. Ensure the SPN has permissions for the target API.

## Resources

- [Grafana | Infinity Data Source](https://github.com/grafana/grafana-infinity-datasource)
- [Infinity Data Source Documentation](https://grafana.github.io/grafana-infinity-datasource/)
- [Infinity Data Source Azure Auth](https://grafana.github.io/grafana-infinity-datasource/docs/azure-authentication)
- [Azure REST API Reference](https://learn.microsoft.com/rest/api/azure/)

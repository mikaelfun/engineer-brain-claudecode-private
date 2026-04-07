---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Grafana/How-To/How To Obtain Azure Managed Grafana Resource Details"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FManaged%20Grafana%2FHow-To%2FHow%20To%20Obtain%20Azure%20Managed%20Grafana%20Resource%20Details"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How To Obtain Azure Managed Grafana Resource Details

## Via Azure Support Center (ASC)

- **ARM Properties page**: Resource ID, Grafana endpoint (ends in `{region}.grafana.azure.com`), creation date, version
- **Workspace Metadata page**: Extended info including SKU (Standard/Enterprise), zone redundancy, API Key and Deterministic Outbound IP status
- **Operations tab**: Last 10 operations the Workspace completed
- **Grafana Container Errors page**: Issues with the container hosting Grafana

## Via Azure Portal

The Overview page provides the Grafana Endpoint, Version and other resource details. Key blades:

- **Activity log**: Operations (Create, Update, Delete) on the resource
- **Access control (IAM)**: Permissions, role assignments, deny assignments
- **Properties**: Basic details about the AMG resource
- **Locks**: Resource/resource group locks (prevent accidental deletion)
- **Identity**: Managed Identity setup confirmation
- **Configuration**: API keys, deterministic outbound IP, SMTP settings
- **Networking (Preview)**: Private Endpoint setup (inbound access control)
- **Grafana Enterprise (Preview)**: Enterprise enablement (caution with free trial expiry)
- **Alerts**: Alert rules and triggered alerts for this resource (Azure alerts, not Grafana alerts)
- **Metrics**: Standard Azure resource metrics
- **Diagnostic settings**: Setup diagnostic data collection
- **Logs**: Query diagnostic data in context of the resource

---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Collaboration Guides/Escalating to the Azure Log Analytics product group/Escalating to Azure Log Analytics Draft team"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FCollaboration%20Guides%2FEscalating%20to%20the%20Azure%20Log%20Analytics%20product%20group%2FEscalating%20to%20Azure%20Log%20Analytics%20Draft%20team"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Escalating to Azure Log Analytics Draft Team

## Pre-Escalation Checklist

### 1. Review Known Issues
Check the list of known issues first: e.g., "Invalid Payload error when deploying Container Insights DCR with transform KQL criteria"

### 2. Initial Validation Using ASC
Validate the customer's scenario using the "Query Customer Data" tab in ASC before initiating an escalation.

### 3. Data Collection Guidelines
When submitting an IcM, follow the procedure for providing product group access to customer data for IcM incidents.

### Recommended Information to Collect
- Query StartTime (within the last 30 days)
- Historical functionality (if applicable)
- Occurrence frequency (ask only if relevant)
- Request ID
- Examples of correct and problematic behaviors, including Running Time & Request ID
- Note: Default timeout for a query/function is 10 minutes

### Acquiring a Request ID
1. Execute a query in the Logs blade
2. Click "Query Details" link at the bottom of the query page
3. A sidebar opens displaying query details including the Request ID

## Draft CRI Template in ASC
Use the Draft CRI Template available in ASC for creating CRIs.

### Request ID Fields in ICM Template
- Both Request ID fields are mandatory
- If only one request ID is relevant, put "not applicable" in the second field
- Request IDs should show two different scenarios:
  - Workspace centric query vs Resource centric query
  - Query that yields results vs query without results
  - Query for user A vs query for user B (different results)

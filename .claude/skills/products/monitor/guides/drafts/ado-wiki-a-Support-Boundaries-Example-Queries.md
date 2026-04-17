---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Boundaries/Support Boundaries: Example queries"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/Support%20Boundaries/Support%20Boundaries%3A%20Example%20queries"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Support Boundaries: Example Queries in Log Analytics

## Overview

The Log Analytics Logs blade provides example queries for different data types. This guide defines who owns issues related to these queries.

## Boundary Rule

**Example queries are owned by the Resource Provider team that wrote them.**

- Issues or requests related to example queries → Route to corresponding RP CSS team
- **Exception**: If the query failure is NOT related to logic/syntax but is a Log Analytics engine issue → Start with Azure Monitor CSS

## Before Engaging RP CSS Team

1. Ensure the issue is NOT a Log Analytics engine issue (verify it's related to query logic/syntax)
2. Identify the correct RP CSS team by checking table ownership:
   - Reference: https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/tables-category
   - For AzureDiagnostics table: identify based on category

## Important Note

While we may be able to fix query logic/syntax ourselves, changes should be made by the owning team to:
- Preserve original logic
- Ensure changes propagate through appropriate channels
- Ensure example queries are consistent for all customers

For questions, engage Log Analytics SMEs/TAs/EE/EEE.

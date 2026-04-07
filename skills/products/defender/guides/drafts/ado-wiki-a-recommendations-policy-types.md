---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations Platform/[Product Knowledge] - Recommendations Policy types"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20Platform%2F%5BProduct%20Knowledge%5D%20-%20Recommendations%20Policy%20types"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Recommendations Policy Types

## Overview

MDC employs three types of policies that reflect as recommendations:
1. **Control Plane** - Policy defines logic, monitors resource, updates compliance status
2. **Data Plane** - MDC services assess and send compliance status to the mirrored policy
3. **Policy Data Plane** - Hybrid approach

## Key Difference

- **Control Plane**: Monitored and assessed by the policy; data does NOT go to the Modeler
- **Data Plane**: Data goes to a Modeler (recommendation engine) which streams to ARG and mirrored Policy compliance

Most MDC engineering recommendations are Data Plane assessments.

## Dashboards

| Dashboard | Notes |
|-----------|-------|
| [Infrastructure Solutions - Common Queries](https://dataexplorer.azure.com/dashboards/dee7f3f7-1f8c-4b09-9518-433be60836eb) | MDC-assessment Query-1&2 |
| [Recommendations info](https://dataexplorer.azure.com/dashboards/04220f16-28bf-4645-aaec-6c26981c585a) | General recommendations data |

Requires Read-Only access to `cluster('RomeCore.kusto.windows.net').database('Prod')`

## How to Identify Policy Type

### From Code
Check [RawBuiltInMetadata](https://msazure.visualstudio.com/One/_git/Rome-Core-AssessmentModeller?path=/src/Common/AssessmentMetadata/RawBuiltInMetadata) for `"sourceType":` field in assessment JSON definitions.

### From Policy Definition
- In each MDC recommendation, click "View policy definition"
- Data Plane policies will always query Microsoft.Security Resource Provider (RP)
- Control Plane policies query the actual resource provider directly

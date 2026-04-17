---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Group Management/Groups Graph API/Transfer incidents to Groups Graph API"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGroup%20Management%2FGroups%20Graph%20API%2FTransfer%20incidents%20to%20Groups%20Graph%20API"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Transfer incidents to the Groups Graph API team

## Overview of Microsoft Graph Escalation

Microsoft Graph serves as the gateway to data and intelligence within Microsoft cloud services. It forwards requests to various target workloads based on the request details. When investigating issues related to Microsoft Graph, it is often necessary to collaborate with the target workload team.

Common issues in MSGraph escalation:
1. MSGraph works as designed, but request URL/body/header has unexpected information. **A simple test in Graph Explorer might avoid further escalation.**
2. ICM transferred without necessary information.
3. ICM transferred to incorrect target workload team.

## Solution 1 - Test in Graph Explorer

Test the call in [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) to narrow down whether the issue originates from Microsoft Graph or a first-party/third-party service.

Steps:
1. Sign in to Graph Explorer
2. Modify HTTP method and request URL to match actual call (include body for POST/PATCH)
3. Analyze response

Alternatively, use Graph Explorer in ASC for GET requests.

## Solution 2 - Provide necessary information

Always include when transferring incidents:
- **Client request ID** of the Graph call
- **Timestamp** (within last **21 days**)
- **Request URL** including $filter, $search, parameters
- **Reason** why response is unexpected

### Getting client request ID:
- **From client trace**: Capture HAR/Fiddler, find request to `https://graph.microsoft.com`, check response headers for `client-request-id`
- **No direct client call**: Service API calls Graph internally; work with service team for backend logs

## Solution 3 - Identify target workload team

### Method 1: Microsoft Graph Request Debugging Tool
Use [Microsoft Graph Live Site](https://support.iam.ad.azure.com/livesite/msgraph):
1. Enter valid Graph request ID/correlation ID + timestamp
2. Tool searches backend logs and identifies escalation team

Example output:
- Target workload: Microsoft.DirectoryServices
- Escalation team: "IAM Services \ Groups Graph API"

### Method 2: Transfer to Microsoft Graph Aggregator (Less recommended)
Transfer to "Microsoft Graph Service/Microsoft Graph Aggregator" with valid client request ID and timestamp. Team has automation to forward to correct team.

## Groups Graph API Specific Endpoints

Requests to `https://graph.microsoft.com/v1.0/Groups` generally go to Groups Graph API.

**Exceptions** (different teams):
1. `/groups/{group-id}/sites` → **DevPlat / Vroom**
2. `/groups/{group-id}/calendar` → **Exchange / Groups911**

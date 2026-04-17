---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/Transfer incidents to Users Graph API"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20User%20Management%2FTransfer%20incidents%20to%20Users%20Graph%20API"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Transfer Incidents to Users Graph API

## Overview
Microsoft Graph serves as the gateway to data and intelligence within Microsoft cloud services. It forwards requests to various target workloads based on the request details. When investigating issues related to Microsoft Graph, it is often necessary to collaborate with the target workload team responsible for handling the specific request.

## Common Issues in Escalation
1. MSGraph works as designed but request URL/body/header has unexpected info (e.g., incorrect filter)
2. ICM transferred without necessary information to start investigation
3. ICM transferred to incorrect target workload team

## Step 1: Test in Graph Explorer First
Before escalating, test the call in [Graph Explorer](https://aka.ms/ge):
1. Sign in to Graph Explorer
2. Set HTTP method and URL to match actual call; include request body for POST/PATCH
3. Analyze the response to determine if it matches expectation
4. Can also test in ASC Graph Explorer for GET requests

## Step 2: Required Information for Transfer
Always include:
- **Client request ID** of the Microsoft Graph call
- **Timestamp** of the call (must be within last **21 days**)
- **Request URL** including $filter, $search and any parameters
- **Reason** why the response is unexpected

Incidents lacking required information may be returned without resolution.

### Getting client-request-id
- **From client trace**: capture HAR/Fiddler trace, locate request to https://graph.microsoft.com, check response headers for `client-request-id`
- **From first-party service**: work with service team for backend logs
- **From third-party APIs**: consult API owner for logging info
- Always ensure request ID is from the Graph URL or response header

## Step 3: Identify Target Workload Team

### Method 1: MS Graph Request Debugging Tool (Recommended)
Use [Microsoft Graph Live Site](https://support.iam.ad.azure.com/livesite/msgraph):
1. Enter valid Graph request ID or correlation ID + timestamp
2. Tool searches backend logs and identifies escalation team
3. Output shows target workload and escalation team path

### Method 2: Transfer to Microsoft Graph Aggregator
Transfer to **Microsoft Graph Service/Microsoft Graph Aggregator** with valid client request ID and timestamp. Automation identifies target workload team.

## Users Graph API Specific Routing

| Endpoint | Owning Team |
|----------|-------------|
| `/users`, `/me` (general) | **IAM Services \ Users Graph API** |
| `/users?$select=signInActivity` | **IDX \ Reporting and Audit Insights** |
| `/users/<id>/memberof`, `/GetMemberGroup` | **IAM Services \ Groups Graph API** |
| `/users/<id>/People` | **PeopleAPI team** |
| `/users/<id>/authentication/methods` | **Credential Enforcement and Provisioning** |

Not all requests to `/users` reach the Users Graph API - check the specific endpoint to determine the correct team.

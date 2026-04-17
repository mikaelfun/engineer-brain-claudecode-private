---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/RBAC permissions/How-to: Check which RBAC permissions are available for all Log Analytics operations"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FRBAC%20permissions%2FHow-to%3A%20Check%20which%20RBAC%20permissions%20are%20available%20for%20all%20Log%20Analytics%20operations"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Check Available RBAC Permissions for Log Analytics Operations

## Scenario

- Check which RBAC permissions can be used with Log Analytics
- Check what a given RBAC permission is used for

## Get All RBAC Permissions Available for Log Analytics Operations

Use the ARM API call named "Operations" to pull the most current permissions-operation manifest from the Log Analytics Control Plane service. This is what ARM runs in front of LA Control Plane to get the operations supported for RBAC.

**Note: Run this on your own internal workspace as it is expected to produce the same outcome as on customer's end.**

API Reference: https://learn.microsoft.com/rest/api/loganalytics/operations/list

Any permission which shows up here can be used in the context of Log Analytics. Each permission has a description to depict its goal and purpose.

## What If the Permission Asked for Does Not Exist?

1. Check similar discussions over Swarming Channel
2. Check the "What's new" page for any planned/upcoming change
3. Check for previous/ongoing similar CRIs
4. If above does not satisfy, reach out to LA SME/STA/EEE for further advice. Provide information on the business impact and the ask.

---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA Deployment Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20Deployment%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA Deployment Logs

## Summary

Global Secure Access (GSA) Deployment logs blade helps administrators manage and monitor configuration changes across Microsoft global network. Administrators can track whether configuration changes were successful or not, view deployment timelines, and see detailed information about changes. Deployment events are stored for one week.

## Case Handling

Route to: Azure/Global Secure Access (Microsoft Entra Internet and Private Access)/GSA Logs/Unable to view Alerts or Traffic logs in portal

## Troubleshooting Workflow

### 1. Identify the Deployment Event

- Help customer locate the relevant audit log entry using correlationId and date range
- Query via Graph Explorer: GET https://graph.microsoft.com/beta/networkaccess/deployments
- GET specific event: GET https://graph.microsoft.com/beta/networkaccess/deployments/{requestId}?=configuration/microsoft.graph.networkaccess.profileConfiguration/current

### 2. Find Audit Log Entry from Deployment Log Event

GSA Audit Logs do not support filtering by Request ID directly. Use Graph Explorer:
/auditLogs/directoryAudits?=correlationId+eq+{DeploymentLogRequestID}+and+activityDateTime+ge+YYYY-MM-DDTHH:MMZ+and+activityDateTime+le+YYYY-MM-DDTHH:MMZ&=50&=activityDateTime+desc (Version: beta)

### 3. Escalate if Needed

- Check if an ICM was automatically created for the error
- If no ICM exists: create new ICM with audit and deployment log details
- ICM Path: Owning Service: Global Secure Access | Owning Team: GSA Control Plane

## Error Handling

When a tenant encounters a deployment error, an ICM is automatically raised on engineering side. Once resolved, configuration is automatically redistributed. Each error creates a new entry in Deployment logs with the same request ID.

## Roles Required

- Global Secure Access Administrator or Security Administrator

## Deployment Stage Enums

| Enum | Description |
|------|-------------|
| pending | Deployment pending |
| inProgress | Deployment in progress |
| failed | Deployment failed |
| succeeded | Deployment succeeded |

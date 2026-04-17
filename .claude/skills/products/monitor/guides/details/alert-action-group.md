# Monitor 告警操作组与通知 - Comprehensive Troubleshooting Guide

**Entries**: 18 | **Drafts fused**: 7 | **Kusto queries**: 1
**Draft sources**: ado-wiki-a-Autoscale-Email-Notifications-TSG.md, ado-wiki-a-troubleshooting-email-notifications-not-received.md, ado-wiki-action-group-change-events-kusto.md, ado-wiki-action-group-details-asc.md, ado-wiki-notification-history-action-group-kusto.md, ado-wiki-trace-notification-asc.md, ado-wiki-trace-notification-jarvis.md
**Kusto references**: notification-service.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Alert fired but Logic App action group connector fails with 'connection removed' error in workflow run history output

**Solution**: Navigate to Logic App Designer, find the failed connector, click 'change connection' at the bottom, and follow the wizard to sign in to the proper account to recreate the connection

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Alert fired but Logic App workflow did not run at all - no execution appears in Logic App Run History, Action Group test returns 404 error

**Solution**: Compare the Callback URL in ASC (Action Group details) with the HTTP URL in the Logic App Designer's first connector ('When an HTTP request is received'). If mismatched, remove the Logic App action from the Action Group and re-add it to get the updated trigger URL

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: After May 17/18 2024, users who inherit RBAC roles through Azure AD group membership started receiving unexpected Email Resource Manager Role notification emails from Action Groups or Smart Detecti...

**Solution**: This is by-design behavior change. Verify user's RBAC assignment type (direct vs group inheritance) via Azure Support Center → Tenant Explorer → Resource Explorer → Access Control → Check Access. If customer wants to stop emails to group-inherited users, they need to change notification type or a...

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Azure Monitor alert notification not received - suspected rate limiting on action group notifications (email, SMS, voice, webhook)

**Solution**: 1) Get NotificationId. 2) Trace notification in ASC or Jarvis. 3) Search diagnostic log results where Message contains "need notify". 4) If matched with "Need Notify - False", rate limiting was applied and target receiver was suppressed. Reference: https://docs.microsoft.com/azure/azure-monitor/p...

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: Action Group runbook action may be using legacy built-in runbook (Run As Account) instead of updated V2 runbook (Managed Identities) - need to identify which version is in use

**Solution**: Three identification methods: 1) Check runbook Jobs in Automation Account - if name contains V2 (e.g. RestartAzureVMAlertGlobalRunbookV2), it is the updated version. 2) Use Get-AzAutomationWebhook to list webhooks and match to Action Group JSON view under automationRunbookReceivers. 3) As support...

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Alert fired but Logic App action group connector fails with 'connection remov... | The API connection for the Logic App connector (e.g., Office 365) has been re... | Navigate to Logic App Designer, find the failed connector, click 'change conn... | 8.5 | ADO Wiki |
| 2 | Alert fired but Logic App workflow did not run at all - no execution appears ... | The Logic App HTTP trigger URL (Callback URI) has changed or been regenerated... | Compare the Callback URL in ASC (Action Group details) with the HTTP URL in t... | 8.5 | ADO Wiki |
| 3 | After May 17/18 2024, users who inherit RBAC roles through Azure AD group mem... | Design change on May 17-18, 2024: Action Groups with Email Resource Manager R... | This is by-design behavior change. Verify user's RBAC assignment type (direct... | 8.5 | ADO Wiki |
| 4 | Azure Monitor alert notification not received - suspected rate limiting on ac... | Azure Notification Service applies rate limits to prevent notification floodi... | 1) Get NotificationId. 2) Trace notification in ASC or Jarvis. 3) Search diag... | 8.5 | ADO Wiki |
| 5 | Action Group runbook action may be using legacy built-in runbook (Run As Acco... | Action Groups with built-in runbook actions (e.g. RestartAzureVM) were origin... | Three identification methods: 1) Check runbook Jobs in Automation Account - i... | 8.5 | ADO Wiki |
| 6 | ITSM v1 action fails with 'No such host is known' or 'Web App - Unavailable' ... | Server error from ServiceNow side - ServiceNow instance is unavailable or sto... | Customer should reach out to ServiceNow support to investigate their instance... | 8.5 | ADO Wiki |
| 7 | ITSM v1 action fails with 'AccessToken and RefreshToken invalid. User needs t... | ITSM connector token expired or integration rights missing for OMS_App_User | 1. Re-enter credentials in ITSM connector configuration and re-sync. 2. Ensur... | 8.5 | ADO Wiki |
| 8 | ITSM v1 action fails with 'Failed to retrieve connection configuration' | Newly created ITSM Connector instance has not finished initial sync or connec... | Re-enter credentials in ITSM connector configuration and re-sync | 8.5 | ADO Wiki |
| 9 | ITSM v1 action fails with 'Target record not found. Operation against file in... | ServiceNow Business Rules (server-side logic) are rejecting/ignoring the inci... | Customer should reach out to ServiceNow support to review and update the busi... | 8.5 | ADO Wiki |
| 10 | ITSM v1 action fails with 'Target record not found. Row transform ignored by ... | Custom script deployed in ServiceNow or modified OMS Integrator app code is c... | Customer should reach out to ServiceNow support to disable or adjust the cust... | 8.5 | ADO Wiki |
| 11 | Alert email notification not received - email action was disabled/unsubscribe... | Someone with access to the email (especially distribution group members) clic... | Customer needs to remove and re-add the email action to the action group. Thi... | 8.5 | ADO Wiki |
| 12 | Alert email notification not received for Email Azure Resource Manager Role t... | ARM Role emails only sent to Azure AD users/groups directly assigned at subsc... | Verify: (1) User is directly assigned the role at subscription scope (not inh... | 8.5 | ADO Wiki |
| 13 | Service Health alert email shows NotificationState=Skipped in ASC notificatio... | Service Health alerts use a separate dial-tone pipeline. The normal AzNS pipe... | This is expected behavior for Service Health alerts. Use Kusto logs to get th... | 8.5 | ADO Wiki |
| 14 | ITSM secure webhook action failed — NotificationState is Failed in ASC fired ... | ITSM secure webhook not configured properly. Customer may have missed steps i... | Ensure customer followed all steps in 'Configure Azure to connect ITSM tools ... | 8.5 | ADO Wiki |
| 15 | Alert email notification not received - email action disabled/unsubscribed by... | Someone (especially DL member) clicked unsubscribe link in previous alert not... | Remove and re-add email action to action group. Warn customer to notify all D... | 8.5 | ADO Wiki |
| 16 | Alert email not received for Email Azure Resource Manager Role type - user ha... | ARM Role emails only sent to AAD users/groups directly assigned at subscripti... | Verify: (1) User directly assigned at subscription scope. (2) Email is Primar... | 8.5 | ADO Wiki |
| 17 | Need to retrieve action group configuration details for troubleshooting alert... | - | Use Jarvis "Get Resource" query with resource provider namespace "MICROSOFT.I... | 8.0 | OneNote |
| 18 | Event Hub action not triggered after alert fired; exception in notification t... | Target Event Hub configured in action group does not exist or namespace/name ... | Verify Event Hub name, namespace, and connection settings in the action group... | 7.0 | ADO Wiki |

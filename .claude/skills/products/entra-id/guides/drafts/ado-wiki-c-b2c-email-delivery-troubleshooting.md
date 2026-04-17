---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Troubleshooting/Azure AD B2C Email Delivery Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20B2C/Azure%20AD%20B2C%20Troubleshooting/Azure%20AD%20B2C%20Email%20Delivery%20Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD B2C Email Delivery Troubleshooting

## Overview
B2C Email OTP codes sent from msonlineservicesteam@microsoftonline.com flow through: B2C/CPIM -> SSPR -> IRIS/Exchange Online -> Target mailservice.

## Step 0 - Prerequisites
- Confirm customer uses default email verification provider (not 3rd party like SendGrid/Mailjet)
- Collect: original email file, B2C internalCorrelationID, timestamps (within 7-30 days, ideally 72hrs)

## Step 1 - Query B2C/CPIM Logs
- Cluster: idsharedneueudb.northeurope
- Table: AllIfxCPIMEmailValidationRequestEvent
- Filter by internalCorrelationId or timeframe + beginemailverification/endemailverification resourceId

## Step 2 - Query SSPR Logs
- Cluster: idsharedwus (EU: idsharedneu.northeurope), DB: aadssprprod
- Table: TraceEvent, filter by TrackingID = B2C internalCorrelationID
- Look for TraceEnumCode: IrisInstanceId, EmailServiceProvider, IrisEmailSendAttemptCompleted
- Success = request sent to IRIS. Failure = escalate to SSPR team.

## Step 3 - Query IRIS Logs
- Requires SCIM Identity - Internal entitlement + idslogread security group
- Jarvis query: https://portal.microsoftgeneva.com/s/EA6FDD90
- Events: IDSWorkerSubstrateBusSender, IDSTelemWorkerEventHubProcessingService
- Filter by IrisInstanceId from Step 2
- Check Event_EventStatus: DELIVER/FAIL/DELAY

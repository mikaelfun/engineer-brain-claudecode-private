---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Logs and Reporting/Azure AD Activity Logs in Azure Monitor/Frequently Asked Questions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Logs%20and%20Reporting%2FAzure%20AD%20Activity%20Logs%20in%20Azure%20Monitor%2FFrequently%20Asked%20Questions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Activity Logs in Azure Monitor - FAQ

## 1. Where to start?
Start with the Azure AD in Azure Monitor Diagnostics Planning Guide for prerequisites, then configure via Getting Started guide.

## 2. Which logs are included?
Both sign-in logs and Audit logs. **B2C related audit and sign-in events are currently NOT included.**

## 3. Event Hub latency?
Average 2-5 minutes from action time.

## 4. Storage account latency?
Average 5-15 minutes. **SLA is 2 hours** - any observed latency under 2 hours is by design.

## 5. Storage costs?
Depends on log size and retention period. See [Estimated Storage Usage](https://learn.microsoft.com/azure/azure-monitor/usage-estimated-costs) for cost estimation based on user count and daily log volume.

## 6. Event Hub streaming costs?
Depends on messages/minute. See Event hub messages for Audit Logs documentation for cost calculation.

## 7. Supported SIEM tools?
- **Splunk**: Integration complete, follow Splunk Integration guide
- **QRadar**: Supported
- **Sumologic**: Supported

All use Event Hub integration with Azure Monitor Diagnostics.

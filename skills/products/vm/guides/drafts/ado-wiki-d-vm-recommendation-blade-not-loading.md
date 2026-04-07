---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/TSGs/VM Recommendation Blade Is Not Loading_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Advisor%2FTSGs%2FVM%20Recommendation%20Blade%20Is%20Not%20Loading_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VM Recommendation Blade Is Not Loading - Troubleshooting Guide

## Summary

Troubleshooting when customers try to load the Azure Advisor blade and it is not loading, timing out, takes a long time, or returns errors.

## Possible Issues

- Issue with Azure Advisor service
- Issue with ARM
- Issue with specific API

## Prerequisites

Collect: Email address, Subscription ID, PUID, time of occurrence, HAR file, error screenshot, recommendation name.

## Troubleshooting Steps

### 1. Check Azure Status

Verify if Azure Advisor extension/service is experiencing any outages: [Azure Status](https://azure.microsoft.com/en-us/status/)

### 2. Investigate with Jarvis/MDM

#### Frontend Investigation (SysTrace)

1. Open Jarvis UI
2. Configuration:
   - Endpoint: Diagnostic Prod
   - Namespace: Azaprodwestus
   - Table: Systrace
   - Specify PUID
   - Specify the time range
3. Check and sort **Duration** column in descending order
4. Filter by `Level != Informational` to find error messages
5. Copy the **TrackingId** of the transaction with highest Duration or error message

#### Backend Investigation (SysTrace)

1. Open another Jarvis instance or switch namespace:
   - Namespace: Azaprodwestus
   - Table: systrace
   - Specify PUID
   - Specify TrackingID from frontend investigation
   - Specify the same timeline
2. Check:
   - Error messages in the **Message** column
   - **Duration** column for long-running execution

## Escalation

If root cause cannot be determined from Jarvis investigation, escalate to Advisor PG team.

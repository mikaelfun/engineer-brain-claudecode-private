---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/Automate Sync of ACI IP to backend pool of AppGw"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FAutomate%20Sync%20of%20ACI%20IP%20to%20backend%20pool%20of%20AppGw"
importDate: "2026-04-21"
type: guide-draft
---

# Automate Sync of ACI IP to Application Gateway Backend Pool

## Problem
ACI IP addresses are dynamic. When using Application Gateway in front of ACI, the backend pool IP must be updated whenever ACI restarts with a new IP.

## Solution Overview
Use Azure Automation with a PowerShell runbook triggered by ACI Activity Log alerts to automatically update the AppGw backend pool IP.

## Prerequisites
- Existing Application Gateway
- ACI deployment
- Azure Automation account

## Implementation Steps
1. Create Automation Account (if not exists)
2. Create PowerShell Runbook to update AppGw backend pool IP
3. Create Alert (triggered by ACI) with Action Group to start the Runbook
4. Enable ACI logs for monitoring

## Key Variables in Runbook
- Resource Group of AppGw and ACI
- AppGw name and backend pool name
- ACI name
- Subscription ID and Automation Account name

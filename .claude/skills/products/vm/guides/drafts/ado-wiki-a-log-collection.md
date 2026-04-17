---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/GA/Log Collection_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20%28AGEX%29%2FTSGs%2FGA%2FLog%20Collection_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Guest Agent Log Collection Guide

## Pre-requisite: Customer Permission

Check if customer gave permission to collect Guest Logs:
- Azure Support Center > Case Overview: `GrantPermission: True`
- Or ASC RE > VM card > Diagnostics tab

If no permission: send email requesting customer to grant diagnostic permission via portal.
If customer refuses: investigation will be limited and definitive RCA may not be possible.
Guest agent telemetry is still available in RDOS Kusto tables (GuestAgentGenericLogs, GuestAgentExtensionEvents) if the agent is healthy.

## Decision Tree: Which Collection Method to Use

### 1. InspectIaaSDisk (IID) - Primary Method
**Use when**: OS disk is NOT ephemeral AND NOT encrypted with Azure Disk Encryption (any Windows or Linux version)

Steps:
1. Azure Support Center > Resource Explorer > select VM
2. Diagnostics tab > Inspect IaaS Disk > Create Report
3. Wait for status "Succeeded", download ZIP

**Manifests documentation**: See [manifest_by_file](https://github.com/Azure/azure-diskinspect-service/blob/master/docs/manifest_by_file.md) and [manifest_content](https://github.com/Azure/azure-diskinspect-service/blob/master/docs/manifest_content.md)

**Customer Lockbox**: If enabled, click "Request Consent" first. Customer must approve in "Customer Lockbox for Microsoft Azure" portal.

### 2. Guest Agent VM Logs - Secondary Method
**Use when**: OS disk IS ephemeral or IS encrypted with ADE

| OS | Requirement |
|----|-------------|
| Windows 2012+ | VM agent installed* |
| Linux Ubuntu 16.04+ | VM agent 2.7+ installed** |

*If VM agent is installed but not healthy, try this first since not all health issues prevent hourly log emission.
**WALA v2.7 is the first version with hourly log collection enabled by default.

### 3. Manual Collection (Linux Fallback)
- **Linux, VM agent 2.2.54+**: Have customer run `waagent --collect-logs -full`
- **Linux, VM agent < 2.2.54**: Send customer list of specific files to collect manually

## Key Links
- Guest logs URL shortcut: https://aka.ms/azguestlogs
- IID service: Azure Support Center > Resource Explorer > Diagnostics tab
- WALA rollout progress: https://aka.ms/walinuxagentrollout

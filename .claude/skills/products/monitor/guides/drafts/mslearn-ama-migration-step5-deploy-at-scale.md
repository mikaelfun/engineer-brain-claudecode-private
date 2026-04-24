---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/migration/step-5-deploy-at-scale"
importDate: "2026-04-23"
type: guide-draft
---

# Step 5: Deploy Azure Monitor Agent at Scale

## Overview
Use Azure Policy to associate VMs with Data Collection Rules (DCR) for consistent and compliant data collection.

## Steps
1. Create DCR via Azure portal, PowerShell, or Azure CLI
2. Create policy definition - Use built-in or custom definition
3. Assign policy to subscription/resource group/management group scope
4. Set enforcement mode: Default (auto-deploy) or DoNotEnforce (report only)
5. Review compliance - Check policy compliance status and DCR association status in portal

## Key Points
- Built-in policy definitions available in Monitoring section of Azure Policy
- Default mode auto-deploys DCR association to existing and new matching VMs
- DoNotEnforce allows manual remediation via Azure Automation

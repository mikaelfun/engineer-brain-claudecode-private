---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/migration/step-3-configure-data-collections"
importDate: "2026-04-23"
type: guide-draft
---

# Step 3: Configure Data Collections for AMA Migration

## Overview
Data Collection Rules (DCR) represent the modern method for setting up data streams for Azure Monitor Agent. The DCR Config Generator is a PowerShell script to facilitate migration from legacy agents.

## Key Steps
1. Prerequisites: PowerShell 7.1.3+, Az PowerShell module, Read/Write workspace access
2. Download DCR Config Generator from GitHub (WorkspaceConfigToDCRMigrationTool.ps1)
3. Run the tool with parameters: SubscriptionID, ResourceGroupName, WorkspaceName, DcrName
4. Deploy DCR ARM templates to subscription

## Important Notes
- Create isolated dev/staging workspace first to avoid duplicate data in production
- Tool generates DCR ARM templates in JSON format saved locally
- Two post-generation options: reconnect DCRs to original workspace OR retire old workspace
- If reconnecting while legacy agent still connected, data duplication will occur until legacy agent removed

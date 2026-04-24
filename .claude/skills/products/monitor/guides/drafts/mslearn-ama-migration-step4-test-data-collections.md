---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/migration/step-4-test-data-collections-azure-monitor-agent"
importDate: "2026-04-23"
type: guide-draft
---

# Step 4: Test Data Collections in Azure Monitor Agent

## Overview
Methods for linking DCRs with existing VMs to begin gathering data for analysis in testing or production.

## Workflow
1. Deploy Log Analytics testing workspace - Create temporary workspace in same region as VMs
2. Swap production workspace with test workspace - In DCR > Configuration > Data Sources > Destination
3. Associate VMs to DCR - DCR > Configuration > Resources > Add VMs (AMA auto-deployed if not present)
4. Post validation - Switch DCR destination back to production workspace, remove legacy agent extension

## Troubleshooting
- Windows OS: Use Azure Monitor Agent Troubleshooter
- Linux OS: Use Azure Monitor Agent Troubleshooter
- Check AMA Migration Helper workbook for migration status

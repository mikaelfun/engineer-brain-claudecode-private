---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/windows-agents/ssl-connectivity-mma-windows-powershell"
importDate: "2026-04-23"
type: guide-draft
---

# Check SSL Connectivity for Microsoft Monitoring Agent on Windows

## Overview
PowerShell-based SSL connectivity checking for MMA endpoints. Complements TestCloudConnectivity tool.

## Steps
1. Implement CheckSSL function in PowerShell (tests FQDN connection, displays cert info)
2. Get workspace ID from Azure Portal > Log Analytics workspaces > Overview
3. Get Automation account ID and DNS regional code from Automation Accounts > Keys > URL
4. Test endpoints: ods.opinsights.azure.com, oms.opinsights.azure.com, agentsvc.azure-automation.net, api.monitor.azure.com, etc.
5. Review output: Check Issuer contains Microsoft

## Key Diagnostic Points
- Use Test-NetConnection for global.in.ai.monitor.azure.com (CheckSSL gives false error)
- SslProtocol should be Tls12
- Issuer must include Microsoft - otherwise HTTPS inspection is occurring
- If no SSL info returned, check TCP connectivity first

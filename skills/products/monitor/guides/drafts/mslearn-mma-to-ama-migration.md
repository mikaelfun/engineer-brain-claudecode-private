# Best Practices for Migrating from Log Analytics Agent to Azure Monitor Agent

> Sources:
> - [Best Practices](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/migration/best-practices-migrating-from-log-analytics-agent)
> - [Step 1](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/migration/step-1-plan-your-migration)
> - [Step 2](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/migration/step-2-understand-your-data-collection)
> - [Step 3](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/migration/step-3-configure-data-collections)
> - [Step 4](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/migration/step-4-test-data-collections-azure-monitor-agent)
> - [Step 5](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/migration/step-5-deploy-at-scale)
> - [Step 6](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/migration/step-6-configure-other-services)

## Overview
Guidance for migrating from legacy Log Analytics agent (MMA/OMS) to Azure Monitor Agent (AMA).

## Key Facts
- Log Analytics agent deprecated after August 31, 2024
- New data centers after Jan 1, 2024 don't support Log Analytics agent
- AMA uses Data Collection Rules (DCRs) instead of workspace-level configuration

## Migration Benefits
- Cost savings
- Simplified management experience
- Enhanced security and performance

## Step 1: Plan the Migration

### Use AMA Migration Helper Workbook
- Azure portal → Monitor → Workbooks → AMA Migration Helper
- **Subscriptions Overview tab**: view subscriptions, LA workspaces, VM counts
- **Migration Status**: per-subscription overview
- **Resource tabs** (Azure VMs, VMSS, Arc-Enabled, Hybrid):
  - MMA/OMS only → "Not Started"
  - MMA/OMS + AMA → "In Progress"
  - AMA only → "Completed"

### Prerequisites for Non-Azure VMs
- Install Azure Arc Connected Machine agent first
- Download from Azure portal, run installation script, register VM

## Step 2: Document Current Configuration

### Data Collections
1. Azure portal → Log Analytics workspaces → select workspace
2. Classic → Legacy agents management
3. Check tabs: Windows event logs, Windows perf counters, Linux perf counters, Syslog, IIS Logs
4. Document all enabled data sources and sample rates

### Legacy Solutions Migration Paths
| Service | Migration Path |
|---------|---------------|
| SCOM | Keep MMA for SCOM, install AMA separately side-by-side |
| Change Tracking | Remove legacy solution → install AMA → add current solution |
| Update Management | Remove legacy solution → install AMA → add current solution |
| Azure Security Center | Enable AMA data collection → install AMA → disable MMA |
| Hybrid Runbook Worker | Keep MMA for runbooks, install AMA separately |
| Microsoft Sentinel | Install AMA → configure connectors → remove MMA |

## Step 3: Configure Data Collection Rules (DCRs)

### DCR Config Generator Tool
- PowerShell script to auto-generate DCRs from existing workspace configuration
- **Prerequisites**: PowerShell 7.1.3+, Az PowerShell module, Read/Write workspace access
- **Source**: [GitHub - DCR Config Generator](https://github.com/microsoft/AzureMonitorCommunity/tree/master/Azure%20Services/Azure%20Monitor/Agents/Migration%20Tools/DCR%20Config%20Generator)

### Usage
1. Download `WorkspaceConfigToDCRMigrationTool.ps1`
2. Run with parameters: `SubscriptionID`, `ResourceGroupName`, `WorkspaceName`, `DcrName`
3. Tool generates DCR ARM templates in JSON format

### Important: Test in Isolated Environment
- Create a new dev/staging workspace first
- Avoid data duplication in production
- Options after validation:
  - Reconnect DCRs to original workspace (risk of duplication until legacy agent removed)
  - Retire old workspace, use new workspace

## Step 4: Test Data Collections

### Testing Workflow
1. Deploy a temporary Log Analytics workspace for testing
2. Swap DCR destination from production to test workspace
3. Associate VMs to DCR: DCR → Configuration → Resources → Add → Select VMs
4. AMA auto-deploys if not already on VM

### Post Validation
1. Switch DCR destination back to production workspace
2. Remove legacy agent extension from VM
3. Check migration status in AMA Migration Helper workbook

### Troubleshooting AMA
- Windows: [AMA Windows Troubleshooter](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/troubleshooter-ama-windows)
- Linux: [AMA Linux Troubleshooter](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/troubleshooter-ama-linux)

## Step 5: Deploy at Scale with Azure Policy

- Use built-in policy: "Deploy if not exists: Deploy Data Collection Rule association to Windows VMs"
- Parameters: DCR ID, assignment scope
- Enforcement modes:
  - **Default**: auto-deploys DCR association to matching VMs
  - **DoNotEnforce**: compliance reporting only, manual remediation
- Scope: subscription, resource group, or management group
- Monitor: policy compliance + DCR association status in portal

## Step 6: Configure Other Services

| Service | Guidance |
|---------|---------|
| Update Management | [Automation update management](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-migration-helper-workbook#automation-update-management) |
| Change Tracking | [Migration guidance](https://learn.microsoft.com/en-us/azure/automation/change-tracking/guidance-migration-log-analytics-monitoring-agent) |
| Defender for Cloud | [AMA in Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/auto-deploy-azure-monitoring-agent) |
| Microsoft Sentinel | [AMA migration for Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/ama-migrate) |

## 21V Applicability
Applicable - AMA supported in 21Vianet (Azure China).

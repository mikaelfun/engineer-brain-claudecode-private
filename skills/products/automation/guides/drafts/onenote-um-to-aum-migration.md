# Migration from Update Management (UMv1) to Azure Update Manager (AUMv2)

## Source
- OneNote: Mooncake POD Support Notebook > Azure Update Manager > Migrate to Azure Update Manager
- Case: 2407010040000797

## Step-by-Step

### 1. Start Migration
- Go to Automation Account > Update Management > Start migration wizard

### 2. Download and Run Prerequisites Script
- Reference: https://learn.microsoft.com/zh-cn/azure/update-manager/guidance-migration-automation-update-management-azure-update-manager?tabs=update-mgmt#prerequisite-1-onboard-non-azure-machines-to-arc

#### Mooncake-Specific Tips
- Run PowerShell as **Administrator**
- `AutomationAccountAzureEnvironment` parameter = **`AzureChinaCloud`** (NOT `AzureChina` as in some docs)
- Requires Az module **3.0+** for `Az.OperationalInsights`
- Must install and import: `Install-Module Az.OperationalInsights; Import-Module Az.OperationalInsights`
- Script generates a Managed Identity for the migration job

### 3. Click "Migrate Now"
- Generates a runbook named `MigrateToAzureUpdateManager`

### 4. Run Migration Runbook
- Executes VM and Schedule migration
- Old UM schedules are automatically **disabled** after migration

### 5. Verify in Azure Update Manager
- Check migrated VMs and schedules in AUM portal

## Key Notes
- Non-Azure machines must be onboarded to Arc first (prerequisite)
- Old schedules are disabled, not deleted
- Verify Az module versions before running script

## Applicability
- 21v (Mooncake): Yes — use AzureChinaCloud environment parameter

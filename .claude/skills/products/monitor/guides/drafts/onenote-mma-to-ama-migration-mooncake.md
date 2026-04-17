# MMA to AMA Migration Guide (Mooncake)

Source: Case 2404260030000745

## References
- [Migrate from legacy agents to Azure Monitor Agent](https://docs.azure.cn/en-us/azure-monitor/agents/azure-monitor-agent-migration)
- [Migration tools](https://docs.azure.cn/en-us/azure-monitor/agents/azure-monitor-agent-migration-tools)

## Prerequisites
- Azure Monitor Migration Helper to check current MMA/AMA status
- Access to Log Analytics workspace agent management configuration

## Steps

### 1. Check Current State
- Open Azure Monitor Migration Helper
- Verify which VMs have MMA only (no AMA)
- Review MMA agent management configuration (Performance Counters, Logs, etc.)

### 2. Generate DCR Templates
- Download `workspaceConfigToDCRMigrationTool`
- **Mooncake modification required**: The script targets Azure Global by default, must modify endpoints for Mooncake
- Create a Resource Group to hold the DCR
- Run script to generate DCR templates from existing MMA config

> **Note**: If no Performance Counters or Logs were ever enabled in the workspace, the script will output "No supported data type" and exit without generating templates. In this case, skip to manually creating DCR rules.

### 3. Deploy DCR
- Review generated DCR template matches MMA agent management config
- Deploy DCR via generated ARM template

### 4. Associate VMs with DCR
- Manually add VMs as resources in DCR
- This triggers AMA installation on the VMs
- AMA will coexist with MMA during transition

### 5. Verify
- Check Azure Monitor Migration Helper: VMs should show both MMA and AMA
- Wait 10-20 minutes for data to appear
- Verify AMA-exported logs appear in workspace (check `Category` field)
- Compare with MMA-exported logs to ensure parity

### 6. Decommission MMA (after verification)
- Once AMA data confirmed, uninstall MMA from VMs
- Remove legacy solutions from workspace if no longer needed

## Common Issues
- Script not generating templates → No Performance Counters/Logs enabled in workspace
- DCR Name parameter is just a prefix for generated DCR names
- Mooncake endpoint modifications are mandatory in migration script

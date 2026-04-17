---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/GA/Trigger New GoalState_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FTSGs%2FGA%2FTrigger%20New%20GoalState_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Trigger New GoalState

There are many troubleshooting scenarios for guest agent and extensions where the last step of the mitigation is to trigger a new goal state.

## Methods to Trigger a New GoalState

### 1. Reapply (Recommended)
The **Reapply** API (added in 2020) is the simplest way to trigger a new goal state.

**Important**: Reapply itself does not cause a VM reboot. However, there is a very small risk that some other pending update to the VM model gets applied, which could require a restart. Make the customer aware of this slight chance.

#### From Portal
1. Select the VM > Support + troubleshooting > Redeploy + reapply > Reapply

#### From PowerShell (Az 3.1.0+, Nov 2019)
```powershell
Set-AzVM -ResourceGroupName rg1 -Name vm1 -Reapply
```

#### From CLI (2.0.79+, Jan 2020)
```bash
az vm reapply -g rg1 -n vm1
```

#### From API
https://docs.microsoft.com/en-us/rest/api/compute/virtualmachines/reapply

### 2. Add Empty Data Disk (Legacy)
Adding an empty data disk to the VM will also trigger a new goal state. Same low reboot risk as Reapply. Can be detached after GoalState is triggered.

**Note**: If VM already has maximum data disks attached for its VM size, Reapply is the simpler option.

### Post-GoalState Steps
1. Retry the extension operation
2. If an empty data disk was attached, it can be detached at this point

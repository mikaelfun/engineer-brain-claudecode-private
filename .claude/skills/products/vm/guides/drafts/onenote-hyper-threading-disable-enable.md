# Disable / Re-enable Hyper-Threading for Azure VM

> Source: MCVKB 2.22 | Applies to: Mooncake & Global
> Wiki: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495546/Disable-Hyperthreading_Deploy

## Overview

Disabling Hyper-Threading requires subscription-level whitelisting via AFEC (Azure Feature Exposure Control), then tagging individual VMs and redeploying.

## For China (Mooncake) Members

JIT access is auto-rejected for China members. Use WADE (Escort team) instead:

1. **Raise ICM** via https://aka.ms/mooncaketask
   - Owning Service: Azure Incident Management China
   - Owning Team: WADE - Manual Tasks
   - Include detailed steps and parameters in the ICM
   - Sample ICM: Incident-640918114

2. WADE team operates 24/7 and will execute directly without your participation.

## For NOAM Members (JIT Access)

**Prerequisites**:
- Join **AFEC Team - 16355** security group via myAccess
- Pass CloudScreen (within previous 2 years)
- Use SAW in AME mode (tested working Jun 2025)

### Steps

1. **Submit IcM** and take ownership (Sample: Incident-283179556)

2. **Submit Escort request** at https://jitaccess.security.core.chinacloudapi.cn/
   - Work Item Source: ICM
   - Request Type: Escort
   - Resource Type: ACIS
   - Instance: Production
   - Scope: AFEC
   - Access Level: PlatformServiceOperator

3. Once approved, escort team contacts via Teams. Enter Jumpbox.

4. **Disable HT**: Navigate to Geneva action with escort member's CME account:
   - https://portal.microsoftgenva.com/FEC67846
   - Fill subscription ID and run
   - Supports batch mode for multiple subscriptions

## Post-Whitelisting: Customer Steps

### Tag VMs to Disable HT

```bash
# New VM
az vm create -g <rg> -n <vm> --image UbuntuLTS --tags "platformsettings.host_environment.disablehyperthreading=true"

# Existing VM
az resource tag --ids /subscriptions/{SubID}/resourceGroups/{RG}/providers/Microsoft.Compute/virtualMachines/{VM} \
  --tags platformsettings.host_environment.disablehyperthreading=true
```

### Redeploy VM (Required)
Redeploy via Azure Portal or CLI. In-guest reboot is NOT sufficient.

### Verify HT Status
- **Windows**: `wmic` > `CPU Get NumberOfCores,NumberOfLogicalProcessors /Format:List`
  - Logical > Physical = HT enabled
- **Linux**: `lscpu`
  - Thread(s) per core = 1 → HT disabled
  - Thread(s) per core = 2 → HT enabled

## Re-enable Hyper-Threading

Same JIT/WADE process, but use different Geneva action:
- https://portal.microsoftgeneva.com/7FE71866

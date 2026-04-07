---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/VM Watch_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FExtension%2FVM%20Watch_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VM Watch

## Summary

VMWatch is a standardized, lightweight, and extensible in-VM watchdog service that provides insight into guest VM health. It offers a unified model for sending health signals from both 1P and 3P customer guest VMs to the Azure platform, enabling engineering and downstream AIOps systems to quickly detect or prevent regressions and initiate repair or recovery.

## How it works

VMWatch runs as part of an Azure Extension that operates as a background process on customer virtual machines (VMs). It periodically executes lightweight tests and tracks system metrics and logs to monitor VM health, including network, disk, memory, and CPU availability. VMWatch is written in Go and leverages the open-source Telegraf component.

VMWatch is deployed as part of the AppHealth extension. The Guest Agent starts the AppHealth extension, which then starts VMWatch. Resource governance: CPU limit 1%, memory limit 80MB. If VMWatch exceeds these limits, it will be terminated and restarted up to three times. After the third failure, it will not attempt to restart for three hours.

### Existing Verifiers

| Verifier Name | Description |
|---|---|
| Network connectivity | Verifies outbound network connectivity from the Azure VM |
| Clock Skew | Verifies clock skew between remote NTP server and Azure VM |
| Azure Storage blob connectivity | Verifies connectivity to Azure Storage Blob |
| DNS Resolution | Verifies that DNS names can be resolved |
| Azure Disk I/O | Verifies file CRUD operations on each drive |
| Process Creation | Validates process creation is possible |
| Running Process(es) | Checks whether specific processes are running |

## How to onboard VMWatch

Register feature flag per subscription:

```bash
az feature register --name VMWatchPreview --namespace Microsoft.Compute --subscription <Sub-id>
az provider register --namespace Microsoft.Compute --subscription <Sub-id>
```

### Windows VM

```bash
az vm extension set --resource-group $rg --vm-name $vm --name ApplicationHealthWindows --publisher Microsoft.ManagedServices --version 2.0 --settings "<path>/win-default.json" --enable-auto-upgrade true
```

### Linux VM

```bash
az vm extension set --resource-group $rg --vm-name $vm --name ApplicationHealthLinux --publisher Microsoft.ManagedServices --version 2.0 --settings "<path>/linux-process-monitor.json" --enable-auto-upgrade true
```

### Disabling VMWatch

Set `"enabled": false` under `vmWatchSettings` in the settings JSON, then re-run `az vm extension set`.

## Support Boundaries

The VM Management Pod team supports scenarios where VMWatch is not generating metrics or fails to start. Issues related to EventHub integration, DNS failures, network connectivity, or storage test failures are outside scope.

## Troubleshooting

### Verify VMWatch is enabled

Check Azure Portal > Extensions and Applications > Application Health Extension > Detailed Settings, or:

```bash
az vm extension show --resource-group $rg --vm-name $vm --name ApplicationHealthWindows
```

### VMWatch Data Query (Kusto)

```kql
cluster("azcore.centralus").database("Fa").GuestAgentGenericLogs
| where TIMESTAMP > ago(1h)
| where SubscriptionId == "{SubId}"
| where ResourceGroupName == "{ResourceGroup}"
| where RoleName == "{VMname}"
| where TaskName == "VMWatch"
| project TIMESTAMP, EventName, VMWatchTimestamp = todatetime(Context2), Type=CapabilityUsed, Message=Context1, CohortId=tostring(Context3)
```

### Missing Telemetry

Review AppHealth extension logs for VMWatch startup failures:

- Look for: `VMWatch exited. Attempt: <N> PID: <PID> ExitCode: <ExitCode>`
- If restarts fail: `Leaving VMWatch in failed state. Exhausted retry limit of 3.`
- Check startup parameters: `Successfully setup VMWatch process: ProcessStartInfo Properties:`

### Escalation

- Sev1/Sev2 blocked: Engage VCPE Team Process
- Sev3/Sev4: Open IcM with EEE GA/PA (Service=Support, Team=EEE GA/PA), template: https://aka.ms/CRI-GAPA

# Collect Host Event Logs via Fcshell

**Source**: MCVKB 5.2 | **Product**: VM | **ID**: vm-onenote-140

## Fcshell Commands

```powershell
$n = (Get-Node -Fabric (Get-Fabric <FabricName>) -Id <NodeId>)
$n | Get-NodeAgentDiagnostics -DiagnosticType <Type> -DestinationPath <LocalPath>
```

## DiagnosticType Options

| Type | Contents |
|------|----------|
| AgentLogs | `\Logs\AgentLogs\RDAgent.exe-*.log` |
| AgentPersistedState | AgentState, ActiveBlobStore, BackupBlobStore |
| AgentCrashDump | RDAgent crash dumps |
| WindowsEventLogs | System.evtx, Application.evtx, Hyper-V event logs (Config, Hypervisor, VMMS, Worker, VmSwitch, etc.) |
| AgentConfigurationFiles | Config XML files, CCF files, plugin setup/specific configs |
| AgentAllDiagnostics | All agent diagnostic types combined |
| OSDiagnosticLogs | OS-level diagnostic logs |
| ABCPerfLogs | ABC performance logs |
| AllLogs | Everything: AgentLogs + WindowsEventLogs + AgentPersistedState + AgentCrashDump + AgentMemoryDump + AgentConfigurationFiles + AgentAllDiagnostics + OSDiagnosticLogs + ABCPerfLogs |

## Key Hyper-V Event Logs
- `Microsoft-Windows-Hyper-V-VMMS-Admin.evtx` - VM Management Service
- `Microsoft-Windows-Hyper-V-Worker-Admin.evtx` - Worker process events
- `Microsoft-Windows-Hyper-V-Hypervisor-Admin.evtx` - Hypervisor events
- `Microsoft-Windows-Hyper-V-SynthStor-*.evtx` - Synthetic storage events

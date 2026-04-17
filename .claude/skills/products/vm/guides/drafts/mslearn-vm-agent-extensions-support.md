# VM Agent Extensions Support Policy and Troubleshooting

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/support-agent-extensions

## Support Policy

- **First-party extensions** (developed by Microsoft): Supported by Microsoft Azure Support
- **Third-party extensions**: Supported by the respective vendor (Chef, Puppet, Symantec, Trend Micro, etc.)

## Agent vs Extension: How to Diagnose

### VM Agent Services (must all be running)

| Service | Purpose |
|---------|---------|
| RdAgent | Remote Desktop agent |
| Windows Azure Guest Agent | Core guest agent |
| Microsoft Azure Telemetry Service | Telemetry (merged into Guest Agent in v2.7.41491.971+) |

### Diagnosing Extension Failures

1. Check `C:\WindowsAzure\logs\WaAppAgent.log` for extension operation summary
2. Look for keywords: Enable, Install, Start, Disable, **error**
3. Extension-specific logs: `C:\WindowsAzure\Logs\Plugins\<ExtensionName>\`
   - `CommandExecution.log`
   - `CustomScriptHandler.log`
   - `IaaSBcdrExtension*.log`

### Key Extensions Support Matrix

| Extension | Supported By |
|-----------|-------------|
| DSC (Desired State Configuration) | Microsoft |
| BGInfo | Microsoft |
| VMAccessAgent | Microsoft |
| Chef Client | Chef Software |
| Puppet Enterprise Agent | PuppetLabs |
| Symantec EP | Symantec |
| Trend Micro Deep Security | Trend Micro |

## Guest Log Collection Tool

Run `CollectGuestLogs.exe` from:
- `C:\WindowsAzure\Packages`
- `C:\WindowsAzure\GuestAgent_<Version>_<Timestamp>`

## 21V Applicable: Yes

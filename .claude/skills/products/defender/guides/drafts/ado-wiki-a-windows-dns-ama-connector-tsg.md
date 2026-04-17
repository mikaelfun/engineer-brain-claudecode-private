---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Microsoft First Party Connectors/[TSG] - Windows DNS AMA Connector"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FMicrosoft%20First%20Party%20Connectors%2F%5BTSG%5D%20-%20Windows%20DNS%20AMA%20Connector"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Boundaries

Sentinel is responsible for the agent and the DCR (Data Collection Rule) including also the filtering inside.

# Introduction

The main TSG can be found in [Windows DNS AMA Connector | Azure Sentinel](https://eng.ms/docs/microsoft-security/microsoft-threat-protection-mtp/onesoc-1soc/siem/microsoft-azure-sentinel/azure-sentinel-operational-guides/helpguides/connectors/amaconnectors/windowsdnsama).

The DNS connector is a VM extension that collects [DNS analytical logs events](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/dn800669(v=ws.11)#audit-and-analytic-event-logging) (Event ID from 256 to 280) from ETW (Event Tracing for Windows) stream in windows and sends the data to AMA that sends the data to NS pipeline and then LA.

The Extension is only supported in Windows environments because the events are read from the ETW mechanism which is a windows feature. More specifically the extension is only supported from Windows Server 2012 R2 and forward.

As of July 2024, support for audit events is being built.

The DNS extension is like the SecurityCenter/ChangeTracking extensions. Data flows from the extension to AMA and then to the cloud.

## Required Kusto Access

| Cluster Path | Database | Permissions |
|--|--|--|
| https://azcore.centralus.kusto.windows.net/ (Public Cloud) | Fa | All Azure FTEs have access |

For other Azure clouds such as Fairfax and Mooncake, see [Guest Agent RDOS Telemetry Pipeline](https://msazure.visualstudio.com/One/_wiki/wikis/One.wiki/53761/Guest-Agent-RDOS-Telemetry-Pipeline) for access.

## Sentinel Contacts

- Eng: Yotam Ziv, Ido Klotz, Noam Landress
- Product: Shirley Kochavi

# Data Flow

For DNS Data to flow those things need to work together:

1. A domain controller machine.
2. Azure monitor agent / Arc Agent is installed and running on the machine and reporting healthy.
3. A DCR with the DNS stream downloaded to the machine.
4. DNS agent installed and reporting healthy.
5. The VM / on-prem Machine is a DNS server and creates events that can be seen in the windows event viewer.

# Manual Extension Deployment

The installation of the DNS agent happens only when doing the change from the Azure portal. Assigning the machine directly to the DCR won't trigger the extension installation.

Assuming the DNS DCR is already in place and the VM is already assigned, ask the customer to manually run 2 API requests:

1. **Install the AMA agent** (skip if already installed):
   - [Virtual Machine Extensions - Create Or Update](https://learn.microsoft.com/en-us/rest/api/compute/virtual-machine-extensions/create-or-update)
   - `vmExtensionName: AzureMonitorWindowsAgent`
   - Payload:
     ```json
     {
         "location": "<vm-location>",
         "properties": {
             "autoUpgradeMinorVersion": true,
             "publisher": "Microsoft.Azure.Monitor",
             "type": "AzureMonitorWindowsAgent",
             "typeHandlerVersion": "1.0"
         }
     }
     ```

2. **Install the DNS agent**:
   - `vmExtensionName: MicrosoftDnsAgent`
   - Payload:
     ```json
     {
         "location": "<vm-location>",
         "properties": {
             "autoUpgradeMinorVersion": true,
             "publisher": "Microsoft.Sentinel.AzureMonitorAgentExtensions",
             "type": "MicrosoftDnsAgent",
             "typeHandlerVersion": "1.4"
         }
     }
     ```

For ARC machines the API call is slightly different - see [Resource Manager template samples for agents](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/resource-manager-agent?tabs=json#azure-arc-enabled-windows-server).

# Extension Versioning

Always recommended to update to the latest version. Use [Virtual Machine Extension Images - List Versions](https://docs.microsoft.com/en-us/rest/api/compute/virtual-machine-extension-images/list-versions) API.

Publisher: `Microsoft.Sentinel.AzureMonitorAgentExtensions`, Type: `MicrosoftDnsAgent`

To get the customer's current version, use the [VM Extensions Get](https://docs.microsoft.com/en-us/rest/api/compute/virtual-machine-extensions/get) API with VmExtensionName `MicrosoftDnsAgent`, or check in the VM blade under extensions.

# Troubleshooting Stages

If steps 1 or 2 in the data flow section are problematic, check out the [Windows AMA connectors TSG](https://eng.ms/docs/security-compliance-identity-and-management-scim/modern-protection-soc-mps/sentinel/sentinel/microsoft-azure-sentinel/azure-sentinel-operational-guides/helpguides/connectors/amaconnectors/windowsama).

## Things to validate

1. AMA is sending heartbeat for that machine in the Heartbeat table in LA.
2. Check that the DCR was successfully downloaded and applied to the machine and formatted correctly.
3. Check that no filters are applied in the DCR. If the issue is about missing events this could explain the problem.
4. Check that AMA is healthy in the VM extension section (only works for non-ARC machines).
5. Check the MicrosoftDnsAgent extension status - if not `Provisioning succeeded`, there should be a message.

Use this Kusto query to check extension info without customer access (non-ARC only):

```kql
GuestAgentExtensionEvents
| where TIMESTAMP > ago(14d)
| where Name == "Microsoft.Sentinel.AzureMonitorAgentExtensions.MicrosoftDnsAgent"
| project TIMESTAMP, Region, Version, RoleName, Name, Operation, OperationSuccess, Duration, Message, SubscriptionId, ResourceGroupName, VMId, OSVersion
| where OperationSuccess != "True"
```

## Extension Error Messages

The expected status message is "Extension is running..". Error messages and their meanings:

- **FailedToConnectToPipe**: Problem connecting to AMA agent. Usually DCR formatted badly and AMA didn't open the named pipe.
- **FailedToGetConfiguration**: Configuration from AMA indicated failure. Check internal logs.
- **ConfigurationFormatError**: JSON serialization problem reading configuration from AMA, likely wrong extension settings.
- **UnknownConfigurationError**: Unknown error in configuration. Check internal logs.
- **UnknownStreamInConfiguration**: DCR contains unrecognized stream. Extension will ignore it. Remove the unknown stream.
- **MissingStreamInConfiguration**: DCR missing expected stream. Currently only supports: `Microsoft-ASimDnsActivityLogs`
- **MissingDnsManifestFile**: Manifest file for ETW events is missing. Reinstall extension via PUT request or uninstall/reinstall.
- **EventsListenerStopped**: Problem with ETW event listener. Restart agent to resolve.

## Advanced Troubleshooting (requires machine access)

1. Verify the machine is a DNS server sending DNS events in the ETW stream using [this guide](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/dn800669(v=ws.11)#to-enable-dns-diagnostic-logging).
2. Check logs at `C:\WindowsAzure\Logs\Plugins\Microsoft.Sentinel.AzureMonitorAgentExtensions.MicrosoftDnsAgent`.
3. Use [table2csv.exe](https://eng.ms/docs/security-compliance-identity-and-management-scim/modern-protection-soc-mps/sentinel/sentinel/microsoft-azure-sentinel/azure-sentinel-operational-guides/helpguides/connectors/amaconnectors/table2csv) to check MaQosEvent.tf file for DNS events reaching AMA.

## Restarting the DNS Agent

The extension runs under the **MicrosoftDnsAgent.exe** process from:
`C:\Packages\Plugins\Microsoft.Sentinel.AzureMonitorAgentExtensions.MicrosoftDnsAgent\<version>`

To restart:
1. Open elevated PowerShell
2. Navigate to `C:\Packages\Plugins\Microsoft.Sentinel.AzureMonitorAgentExtensions.MicrosoftDnsAgent\<version>\ManagementScripts`
3. Run `.\disableCommand.ps1` to stop
4. Run `.\enableCommand.ps1` to start

# Example DCR

```json
{
  "properties": {
    "dataSources": {
      "extensions": [
        {
          "streams": ["Microsoft-ASimDnsActivityLogs"],
          "extensionName": "MicrosoftDnsAgent",
          "extensionSettings": {
            "Filters": [
              {
                "FilterName": "SampleFilter",
                "Rules": [
                  {
                    "Field": "DnsQuery",
                    "FieldValues": ["example.com"]
                  }
                ]
              }
            ]
          },
          "name": "DnsAgent"
        }
      ]
    },
    "destinations": {
      "logAnalytics": [
        {
          "workspaceResourceId": "<workspace-resource-id>",
          "workspaceId": "<workspace-id>",
          "name": "DataCollectionEvent"
        }
      ]
    },
    "dataFlows": [
      {
        "streams": ["Microsoft-ASimDnsActivityLogs"],
        "destinations": ["DataCollectionEvent"]
      }
    ]
  },
  "location": "<region>",
  "kind": "Windows"
}
```

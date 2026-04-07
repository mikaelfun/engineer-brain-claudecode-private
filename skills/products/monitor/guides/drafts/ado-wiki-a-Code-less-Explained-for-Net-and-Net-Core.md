---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Concepts/Code-less Explained for .Net and .Net Core"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FConcepts%2FCode-less%20Explained%20for%20.Net%20and%20.Net%20Core"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Code-less Explained for .Net and .Net Core

## What is covered?
This covers the code-less attach scenarios specific to .Net and .Net core, it does not cover Java or Node or any other scenarios we support.

This material does not cover troubleshooting, troubleshooting is a topic for the wiki in general. The goal of this material is to provide better understanding of this functionality so troubleshooting is better understood.

## Terminology
Application Insights Agent, Codeless or codeless attach are the common terms for this technology, codeless is still used in the on-line documentation today in conjunction with code based. The term auto-enablement and auto-instrumentation are new terms surfacing that still mean the same. In all cases this means, Application Insights was not manually added to the source app by a developer.

The terms "Status Monitor" and "Status Monitor V2" used in this material mean the same thing for this conversation. Since Status Monitor aka V1 has been deprecated for so long this material does not touch on it. It is important you distinguish if the user is using V2 and this material will help determine the version.

## Explained
It is a means of injecting the Application Insight binaries into a process so telemetry collection can occur. The binaries injected into the process are from a version of the SDK. Yes, the same SDK used by someone when they on board the SDK to their app manually.

So, what is the Application Insights Agent then? It is a misnomer really, as we do not have an actual "agent" in the classic sense like Log Analytics but phrase "application Insight agent" is often used in place of Status Monitor(V2). The question then rises of how are these binaries injected into an app? If anything is the "agent" piece it is this part of the functionality. This is done by a configuration change to the IIS server upon installing Status Monitor V2. Once this configuration change is made the identified apps will get injected with the binaries upon startup.

What is the Extension then? The extension is not any agent either it is a management feature that allows one to communicate with our codeless attach functionality through the Windows Azure Guest Agent running on an Azure VM. The management feature today only really allows for one to push codeless attach functionality to an Azure VM. The net of using the extension is it installs a version of status monitor on the machine without you having to log onto the VM itself, unlike an on-prem machine where one logs onto the machine and installs Status Monitor.

Regardless of you are doing codeless or coded approach the end goal is to get the Application Insights binaries loaded into an application's process so telemetry collection can be achieved. The route one chooses to do this is either coded or codeless, the vehicle to achieve it can be Status Monitor V2 or via the Extension or manually instrumenting your app through a development tool like Visual Studio.

## Code-less on Azure VM with the Application Insights Extension

### Why Use the Extension?
- Extensions allow for auto-updates: updated SDK binaries are delivered automatically
- Remote Control: add/remove Application Insights functionality remotely without logging onto the VM

### Installing
PowerShell operation to push the extension:

```powershell
$publicCfgJsonString = '
{
  "redfieldConfiguration": {
    "instrumentationKeyMap": {
      "filters": [
        {
          "appFilter": ".*",
          "machineFilter": ".*",
          "virtualPathFilter": ".*",
          "instrumentationSettings" : {
            "connectionString": "InstrumentationKey=<subscription ID here>;IngestionEndpoint=https://southcentralus-0.in.applicationinsights.azure.com/"
          }
        }
      ]
    }
  }
}
';
$privateCfgJsonString = '{}';

Set-AzVMExtension -ResourceGroupName "<RG>" -VMName "<VM>" -Location "<location>" -Name "ApplicationMonitoring" -Publisher "Microsoft.Azure.Diagnostics" -Type "ApplicationMonitoringWindows" -Version "2.8" -SettingString $publicCfgJsonString -ProtectedSettingString $privateCfgJsonString
```

### Enabling
Installing the extension automatically enables full telemetry collection. This is different than the other code-less attach scenarios.

### Logs
```powershell
Get-AzVMExtension -ResourceGroupName "<RG>" -VMName "<VM>" -Name ApplicationMonitoring -Status
```

### Key References
- Windows VM Guest Agent: https://docs.microsoft.com/azure/virtual-machines/extensions/agent-windows
- Troubleshooting Guest Agent: https://docs.microsoft.com/troubleshoot/azure/virtual-machines/windows-azure-guest-agent
- Supported code-less scenarios matrix: https://docs.microsoft.com/azure/azure-monitor/app/codeless-overview#supported-environments-languages-and-resource-providers
- On-boarding via Extension: https://docs.microsoft.com/azure/azure-monitor/app/azure-vm-vmss-apps

> Note: An extension is not an agent. An extension can be non-functional and show an unhealthy status but the underlying functionality the extension pushes may still be healthy.

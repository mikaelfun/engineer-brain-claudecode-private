---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Pass-Through Authentication/Azure AD Pass-Through Authentication - Event Logs and Debug Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Pass-Through%20Authentication%2FAzure%20AD%20Pass-Through%20Authentication%20-%20Event%20Logs%20and%20Debug%20Logs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# PTA Event Logs and Debug Logs Reference

## Event Logs

Location: Event Viewer > Applications and Services Logs > Microsoft > AzureADConnect

### I. AuthenticationAgent > Admin
Provider: Microsoft-AzureADConnect-AuthenticationAgent
Shows: Agent service start/stop/errors, network connectivity warnings/errors.

### II. AgentUpdater > Admin
Provider: Microsoft-AzureADConnect-AgentUpdater
Shows: Agent update downloads and installation events.

### III. AuthenticationAgent > Sessions (Not enabled by default)
View > Show Analytic and Debug logs to see this.
Provides detailed insight into PTA agent service operations.

**Filter by Transaction ID:**
`*[EventData[Data[@Name="transactionID"] and (Data = "{TRANSACTION_ID}")]]`

### IV. AgentUpdater > Analytic (Not enabled by default)
Does not contain useful information.

## Exporting Event Provider Info

```powershell
(Get-WinEvent -ListProvider "PROVIDER_NAME").Events | %{
    $id = $_.Id; $desc = $_.Description
    $_.Level.DisplayName | % {
        New-Object -TypeName psobject -Property @{ Level = $_; ID = $id; Description = $desc }
    }
} | Export-Clixml PTAAgent.xml
```

**Important:**
- Installation/crash events are in the Application log
- Service start/stop events from SCM are in the System log

## Best Practice
To view customer PTA events in your Event Viewer, install the agent locally (silent, no registration):
`AADConnectAuthAgentSetup.exe REGISTERCONNECTOR="false" /q`

## Debug Logs (Traces)

### a) Default Trace Logs
Location: `%ProgramData%\Microsoft\Azure AD Connect Authentication Agent\Trace\`

File: `AzureADConnectAuthenticationAgent_GUID.log`
- New file per service startup
- Enabled by default
- Contains: exception call stacks, failed authentication requests with RequestId and error code

Example entry:
```
AzureADConnectAuthenticationAgentService.exe Error: 0 : Passthrough Authentication request failed.
RequestId: 'df63f4a4-68b9-44ae-8d81-6ad2d844d84e'. Reason: '1328'.
```

### b) Additional Service Tracing
Use `-ServiceTraceOn` switch with PTA Data Collector script for deeper insights.

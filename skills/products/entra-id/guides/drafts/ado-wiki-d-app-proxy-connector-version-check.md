---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - How to get the version of the connector"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20How%20to%20get%20the%20version%20of%20the%20connector"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - How to Get the Version of the Connector

In course of troubleshooting, it's important to ensure that the customer uses the latest version of the connector, as it contains new features, performance enhancements, and bug fixes.

Not all connector versions are released for auto upgrade (update), therefore an important step is to check the version of the connector(s).

Release history: [Microsoft Entra private network connector: version release history](https://learn.microsoft.com/entra/global-secure-access/reference-version-history)

## ASC

In ASC you can check the connectors, connector version, connector groups and more details about the connector.

## On the Connector Server

Use the following PS command to determine the version of connectors:

```powershell
[System.Diagnostics.FileVersionInfo]::GetVersionInfo("C:\Program Files\Microsoft Entra private network connector\MicrosoftEntraPrivateNetworkConnectorService.exe").FileVersion
```

> Note: The command above only works with the rebranded connector. For older connector versions, the full path + executable name must be adjusted.

## Data Collector Script

The Data Collector script collects this information and stores it in the file: `_COMPUTER_NAME_-ConnectorVersion.txt`

## Kusto

### Get the version of one specific connector

```kusto
BootstrapRootOperationEvent
| where env_time > ago(30m) and connectorId == "REPLACE_WITH_CONNECTORID"
| summarize by connectorId, connectorVersion, signalingListenerEndpointConnectorGroup
```

### Get the version of all connectors in a specific connector group

```kusto
BootstrapRootOperationEvent
| where env_time > ago(30m) and signalingListenerEndpointConnectorGroup == "REPLACE_WITH_CONNECTORGROUPID"
| summarize by connectorId, connectorVersion, signalingListenerEndpointConnectorGroup
```

### Get the version of all connectors in the tenant

```kusto
BootstrapRootOperationEvent
| where env_time > ago(30m) and subscriptionId == "REPLACE_WITH_TENANTID"
| summarize by connectorId, connectorVersion, signalingListenerEndpointConnectorGroup
```

> Note: Queries assume connector(s) bootstrapped at least once in the last 30 mins. If a connector appears more than once, it was updated or moved to a different connector group in that time window.

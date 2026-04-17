---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/VM Watch EventHub_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Agents%20%26%20Extensions%20(AGEX)/How%20Tos/Extension/VM%20Watch%20EventHub_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VM Watch Event Hub Integration

## Summary

By default, VMWatch outputs signal data as local files, which are picked up by the Guest Agent and piped to Microsoft's internal AzCore Kusto Cluster's Guest Agent logs. For third-party partners, VMWatch provides an optional output channel that directs signal data to a pre-configured Event Hub.

## Enabling Event Hub for VMWatch

### Prepare an Event Hub for VMWatch

- Deploy an Event Hub (https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-create)
- Authorize access to Azure Event Hubs. VMWatch supports multiple authentication methods: managed identity, SAS token, and connection string.

### Common Parameters

| Variable Name | Required | Description |
|---|---|---|
| `EVENT_HUB_OUTPUT_NAMESPACE` | Yes | Event Hub namespace (without ".servicebus.windows.net") |
| `EVENT_HUB_OUTPUT_NAME` | Yes | Event Hub name within the given namespace |
| `EVENT_HUB_OUTPUT_DOMAIN_NAME` | No | Event Hub domain name. Default: "servicebus.windows.net" |
| `EVENT_HUB_OUTPUT_CLOSE_TIMEOUT` | No | Client close timeout. Default: 30s |
| `EVENT_HUB_OUTPUT_PARTITION_ID` | No | Metric tag or field name for the event partition key. Default: null |
| `EVENT_HUB_OUTPUT_MAX_MESSAGE_SIZE` | No | Maximum batch message size in bytes. 0 = default (1,000,000 bytes) |
| `SEND_INTERNAL_TELEMETRY_TO_EVENT_HUB` | No | Set "true" to receive VMWatch internal metrics. Default: "false" |

### Case 1: Authenticate Using SAS Token

```json
{
    "vmWatchSettings": {
        "enabled": true,
        "parameterOverrides": {
            "EVENT_HUB_OUTPUT_NAMESPACE": "<event hub namespace>",
            "EVENT_HUB_OUTPUT_NAME": "<event hub name>",
            "EVENT_HUB_OUTPUT_SAS_TOKEN_BASE64": "<base64 encoded SAS token>"
        }
    }
}
```

### Case 2: Authenticate Using Connection String

```json
{
    "vmWatchSettings": {
        "enabled": true,
        "parameterOverrides": {
            "EVENT_HUB_OUTPUT_NAMESPACE": "<event hub namespace>",
            "EVENT_HUB_OUTPUT_NAME": "<event hub name>",
            "EVENT_HUB_OUTPUT_CONNECTION_STRING_BASE64": "<base64 encoded connection string>"
        }
    }
}
```

### Case 3: Authenticate Using Managed Identity

```json
{
    "vmWatchSettings": {
        "enabled": true,
        "parameterOverrides": {
            "EVENT_HUB_OUTPUT_NAMESPACE": "<event hub namespace>",
            "EVENT_HUB_OUTPUT_NAME": "<event hub name>",
            "EVENT_HUB_OUTPUT_USE_MANAGED_IDENTITY": "true"
        }
    }
}
```

For a specific managed identity, add `EVENT_HUB_OUTPUT_MANAGED_IDENTITY_CLIENT_ID`.

## Event Hub Event Schema

| Field Name | Data Type | Description |
|---|---|---|
| DateTime | time | The time this signal was emitted |
| SignalType | string | "StartUp", "Heartbeat", "Check", "Metric", or "EventLog" |
| SignalName | string | The name of this signal |

Once VMWatch settings are updated, VMWatch will restart and events will be sent to Event Hub within several minutes.

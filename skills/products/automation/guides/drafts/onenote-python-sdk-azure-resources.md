# Python SDK for Managing Azure Resources

> Source: MCVKB 16.8 | Product: automation | 21v Applicable: Yes

## Overview

How to find the specific Python SDK function to manage Azure resources (alert rules, monitors, etc.)

## Method: Find Functions via F12 Trace

1. Open Azure Portal, navigate to the resource
2. Press F12 to open browser dev tools, switch to Network tab
3. Perform the operation in portal
4. Look for the REST API method keyword in captured requests
5. Map the method to Python SDK function

## Alert Rule Types and Python SDK Functions

| Alert Type | Python SDK Function | PS Cmdlet |
|---|---|---|
| Metric alert rule | `client.metric_alerts.list_by_subscription()` | `Get-AzMetricAlertRuleV2` |
| Log alert rule | `client.scheduled_query_rules.list_by_subscription()` | `Get-AzScheduledQueryRule` |
| Activity log alert | `client.activity_log_alerts.list_by_subscription_id()` | `Get-AzActivityLogAlert` |
| Classic alert rule | `client.alert_rules.list_by_subscription()` | `Get-AzAlertRule` |

## Sample Code (Mooncake)

```python
from msrestazure.azure_cloud import AZURE_CHINA_CLOUD as CLOUD
from azure.identity import DefaultAzureCredential
from azure.mgmt.monitor import MonitorManagementClient

credential = DefaultAzureCredential(authority=CLOUD.endpoints.active_directory)

client = MonitorManagementClient(
    credential,
    subscription_id,
    base_url=CLOUD.endpoints.resource_manager,
    credential_scopes=[CLOUD.endpoints.resource_manager + "/.default"]
)

# List log search alerts
my_alerts = client.scheduled_query_rules.list_by_subscription()
for j in my_alerts:
    print(j)
```

## References

- [Azure SDK for Python samples](https://github.com/Azure/azure-sdk-for-python/tree/azure-monitor-query_1.0.1/sdk/monitor/azure-monitor-query/samples)
- [Azure Monitoring libraries for Python](https://docs.microsoft.com/en-us/python/api/overview/azure/mgmt-monitor)

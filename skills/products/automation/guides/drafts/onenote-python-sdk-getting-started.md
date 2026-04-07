# Python SDK Getting Started for Azure (Mooncake)

> Source: MCVKB 16.9 | Product: automation | 21v Applicable: Yes

## Setup

- **Install Python:** https://wiki.python.org/moin/BeginnersGuide/Download
- **IDE:** VS Code or PyCharm

## Key Resources

- [Azure Python SDK Samples](https://github.com/Azure-Samples/azure-samples-python-management/tree/main/samples)
- [Azure Python SDK Releases](https://azure.github.io/azure-sdk/releases/latest/all/python.html)
- [Azure Python SDK Docs](https://docs.microsoft.com/en-us/azure/developer/python/sdk/azure-sdk-overview)

## Authentication for Mooncake

By default, Azure libraries connect to global Azure cloud. For Mooncake, specify the China cloud endpoints.

See: [Connect to all regions - Multi-cloud](https://docs.microsoft.com/en-us/azure/developer/python/sdk/azure-sdk-sovereign-domain)

## Code Samples

### Query Log Analytics Workspace

```python
from msrestazure.azure_cloud import AZURE_CHINA_CLOUD as CLOUD
from azure.monitor.query import LogsQueryClient, LogsQueryStatus
from azure.identity import DefaultAzureCredential
import pandas as pd

credential = DefaultAzureCredential(authority=CLOUD.endpoints.active_directory)
client = LogsQueryClient(credential, endpoint="https://api.loganalytics.azure.cn")

query = """
Perf
| where Computer == "centos82"
| where CounterName contains "Available Memory"
| project TimeGenerated, CounterValue | take 5
"""

response = client.query_workspace('<workspace ID>', query, timespan=timedelta(hours=1))
if response.status == LogsQueryStatus.SUCCESS:
    for table in response.tables:
        df = pd.DataFrame(data=table.rows, columns=table.columns)
        print(df)
```

### Get Activity Logs

```python
from msrestazure.azure_cloud import AZURE_CHINA_CLOUD as CLOUD
from azure.identity import DefaultAzureCredential
from azure.mgmt.monitor import MonitorManagementClient

credential = DefaultAzureCredential(authority=CLOUD.endpoints.active_directory)
client = MonitorManagementClient(credential, subscription_id=SUBSCRIPTION_ID,
    base_url=CLOUD.endpoints.resource_manager,
    credential_scopes=[CLOUD.endpoints.resource_manager + "/.default"]
)

filter = "eventTimestamp ge '2022-06-16' and eventTimestamp le '2022-06-18'"
data = client.activity_logs.list(filter=filter)
for item in data:
    print(item)
```

### Get VM CPU Percentage (Metrics)

```python
from azure.monitor.query import MetricsQueryClient, MetricAggregationType
from msrestazure.azure_cloud import AZURE_CHINA_CLOUD as CLOUD

credential = DefaultAzureCredential(authority=CLOUD.endpoints.active_directory)
client = MetricsQueryClient(credential,
    audience=CLOUD.endpoints.resource_manager,
    endpoint=CLOUD.endpoints.resource_manager
)

response = client.query_resource(
    "<VM resource ID>",
    metric_names=["Percentage CPU"],
    timespan=timedelta(hours=20),
    granularity=timedelta(minutes=5),
    aggregations=[MetricAggregationType.AVERAGE]
)
```

## Finding Mooncake Endpoints in SDK Classes

1. Right-click class name in IDE > Go to Declaration
2. Check `__init__` method for parameters like `base_url`, `endpoint`, `credential_scopes`
3. If not specified, SDK defaults to public cloud endpoints

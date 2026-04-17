# Automation Python SDK & Runbook 代码样例 — 综合排查指南

**条目数**: 3 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-python-sdk-azure-resources.md](../drafts/onenote-python-sdk-azure-resources.md), [onenote-python-sdk-getting-started.md](../drafts/onenote-python-sdk-getting-started.md), [onenote-sql-azure-runbook.md](../drafts/onenote-sql-azure-runbook.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确定场景 — Python SDK vs PowerShell Runbook
> 来源: [onenote-python-sdk-getting-started.md](../drafts/onenote-python-sdk-getting-started.md) + [onenote-sql-azure-runbook.md](../drafts/onenote-sql-azure-runbook.md)

**判断逻辑**：
| 条件 | 场景 | 后续动作 |
|------|------|---------|
| 客户需要用 Python 管理 Azure 资源 | Python SDK | → Phase 2 |
| 客户需要从 Python SDK 查找特定 API 函数 | Python SDK 函数映射 | → Phase 3 |
| 客户需要从 Runbook 连接 SQL Azure | PowerShell Runbook + SQL | → Phase 4 |

### Phase 2: Python SDK 入门 (Mooncake)
> 来源: [onenote-python-sdk-getting-started.md](../drafts/onenote-python-sdk-getting-started.md)

#### 2.1 环境准备
- **安装 Python**: https://wiki.python.org/moin/BeginnersGuide/Download
- **IDE**: VS Code 或 PyCharm

#### 2.2 Mooncake 认证配置

> **关键点**: Azure SDK 默认连接 Global Azure。Mooncake 需指定 China Cloud endpoint。
> 参考: [Connect to all regions - Multi-cloud](https://docs.microsoft.com/en-us/azure/developer/python/sdk/azure-sdk-sovereign-domain)

```python
from msrestazure.azure_cloud import AZURE_CHINA_CLOUD as CLOUD
from azure.identity import DefaultAzureCredential

credential = DefaultAzureCredential(authority=CLOUD.endpoints.active_directory)
```

#### 2.3 查询 Log Analytics Workspace

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

> 注意 Mooncake LA 端点: `https://api.loganalytics.azure.cn`

#### 2.4 获取 Activity Logs

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

#### 2.5 获取 VM CPU Metrics

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

#### 2.6 查找 Mooncake 端点（通用方法）
1. 在 IDE 中右键 class name > Go to Declaration
2. 检查 `__init__` 方法中的参数: `base_url`, `endpoint`, `credential_scopes`
3. 如果未指定，SDK 默认使用 Public Cloud 端点

`[结论: 🟢 8.5/10 — OneNote MCVKB 来源，含完整代码示例，Mooncake 专属]`

### Phase 3: Python SDK 函数映射 — 通过 F12 查找
> 来源: [onenote-python-sdk-azure-resources.md](../drafts/onenote-python-sdk-azure-resources.md)

#### 3.1 方法: F12 Trace 反推 SDK 函数

1. 打开 Azure Portal，导航到目标资源
2. 按 F12 打开浏览器开发者工具 → Network 标签
3. 在 Portal 中执行目标操作
4. 从捕获的请求中找到 REST API method 关键词
5. 将 method 映射到 Python SDK 函数

#### 3.2 Alert Rule 类型与 SDK 函数对照

| Alert 类型 | Python SDK 函数 | PS Cmdlet |
|------------|-----------------|-----------|
| Metric alert rule | `client.metric_alerts.list_by_subscription()` | `Get-AzMetricAlertRuleV2` |
| Log alert rule | `client.scheduled_query_rules.list_by_subscription()` | `Get-AzScheduledQueryRule` |
| Activity log alert | `client.activity_log_alerts.list_by_subscription_id()` | `Get-AzActivityLogAlert` |
| Classic alert rule | `client.alert_rules.list_by_subscription()` | `Get-AzAlertRule` |

#### 3.3 Mooncake Monitor Client 代码示例

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

`[结论: 🟢 8/10 — OneNote MCVKB 来源，F12 方法实用]`

### Phase 4: PowerShell Runbook 连接 SQL Azure
> 来源: [onenote-sql-azure-runbook.md](../drafts/onenote-sql-azure-runbook.md)

#### 4.1 前置条件
- SQL Azure DB 已启用 SQL Authentication
- Automation Account 中配置了 Credential Asset（存储 SQL username/password）

#### 4.2 完整代码示例

```powershell
workflow SQLAzureExample {
    $creds = Get-AutomationPSCredential -Name "SQLAcct"

    inlinescript {
        $SqlUsername = $Using:creds.UserName
        $SqlPass = ($Using:creds).GetNetworkCredential().Password
        $SqlConn = New-Object System.Data.SqlClient.SqlConnection
        $SqlConn.ConnectionString = "Server=tcp:mysqldb.database.chinacloudapi.cn,1433;Initial Catalog=TestIT;Persist Security Info=False;User ID=$SqlUsername;Password=$SqlPass;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

        $SqlComm = New-Object System.Data.SqlClient.SqlCommand
        $SqlComm.CommandText = "SELECT 'test'"
        $SqlComm.Connection = $SqlConn
        $SqlConn.Open()
        Write-Output "After Open"
        $SqlComm.ExecuteNonQuery()

        $Results = $SqlComm.ExecuteReader()
        if ($Results.HasRows) {
            while ($Results.Read()) {
                Write-Output $Results[0]
            }
        }
    }
}
```

#### 4.3 注意事项
- ⚠️ Azure AD auth for SQL 在 Automation Runbook 中当时不支持 → 使用 SQL Auth
- Mooncake 服务器 FQDN: `*.database.chinacloudapi.cn`
- 凭据存放在 Automation Account Credential Asset（不要硬编码）
- 此示例使用 PowerShell Workflow；PS7 Runbook 使用 PowerShell 语法（无需 `inlinescript`）

`[结论: 🟢 8/10 — OneNote 来源，完整代码示例，Mooncake 专属]`

---

## 参考资源

| 资源 | URL |
|------|-----|
| Azure Python SDK Samples | https://github.com/Azure-Samples/azure-samples-python-management/tree/main/samples |
| Azure Python SDK Releases | https://azure.github.io/azure-sdk/releases/latest/all/python.html |
| Azure Python SDK Docs | https://docs.microsoft.com/en-us/azure/developer/python/sdk/azure-sdk-overview |
| Azure Monitor Python Samples | https://github.com/Azure/azure-sdk-for-python/tree/azure-monitor-query_1.0.1/sdk/monitor/azure-monitor-query/samples |
| Azure Monitor Python API | https://docs.microsoft.com/en-us/python/api/overview/azure/mgmt-monitor |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | 需要用 Python SDK 管理 Azure 资源 (alert rules, monitor) | — | F12 Trace 反推 + SDK 函数对照表，见 Phase 3 | 🟢 8 — OneNote MCVKB | [MCVKB/16.8](../drafts/onenote-python-sdk-azure-resources.md) |
| 2 📋 | Python SDK for Azure Mooncake 入门 | — | 认证配置 + 4 类代码示例，见 Phase 2 | 🟢 8.5 — OneNote MCVKB | [MCVKB/16.9](../drafts/onenote-python-sdk-getting-started.md) |
| 3 📋 | Runbook 连接 SQL Azure DB | — | SqlClient + Credential Asset 完整代码，见 Phase 4 | 🟢 8 — OneNote 代码示例 | [Mooncake POD/SQL Azure](../drafts/onenote-sql-azure-runbook.md) |

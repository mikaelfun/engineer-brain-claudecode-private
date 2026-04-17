# Defender Sentinel Data Lake 与存储 — 排查工作流

**来源草稿**: ado-wiki-a-sentinel-data-lake-data-management-tsg.md, ado-wiki-b-sentinel-data-lake-auditing-tsg.md, ado-wiki-b-sentinel-data-lake-kql-tsg.md, ado-wiki-b-sentinel-data-lake-notebooks-tsg.md, ado-wiki-b-sentinel-data-lake-onboarding-offboarding-tsg.md, ado-wiki-b-sentinel-data-lake-packaging-manifest-tsg.md, ado-wiki-b-sentinel-data-lake-rbac-tsg.md, ado-wiki-d-search-archive-restoration-preview.md
**场景数**: 7
**生成日期**: 2026-04-07

---

## Scenario 1: Sentinel Data Lake - Data Management TSG
> 来源: ado-wiki-a-sentinel-data-lake-data-management-tsg.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 2: Sentinel Data Lake Auditing TSG
> 来源: ado-wiki-b-sentinel-data-lake-auditing-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Navigate to purview.microsoft.com > Audit
2. On New Search page, filter activities, dates, users
3. Select Search
4. Export results to Excel for analysis

---

## Scenario 3: Training sessions
> 来源: ado-wiki-b-sentinel-data-lake-kql-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Make sure you select the proper workspace before running a query.
2. Executing KQL queries on the Microsoft Sentinel data lake incurs charges based on query billing meters. For more details, see [documentation link TBD].
3. Review data ingestion and table retention policy. Before setting query time range, be aware of data retention on your data lake tables and data is available for selected time range. (link to doc TBD)
4. KQL queries on Lake are generally low performant than queries on Analytics tier. Its recommended using KQL queries interactive queries only when exploration on historical data or tables stored in lake only mode is required.
5. The following KQL commands are currently supported:
6. Using out of the box or custom functions is not currently supported in KQL queries.
7. Calling external data via KQL query in Lake is not supported in public preview.
8. `Ingestion_time()` function is not currently supported on tables in lake. Lake tables are kusto external tables, therefore `ingestion_time()` function is not applicable.
9. Interactive queries may have 8 minutes timeout and 64MBof data size limit.
10. Interactive queries are limited to show up to 30,000 results. To obtain results beyond 30,000 rows, it is recommended to submit a KQL job.
11. If using Azure Data Explorer tool, Microsoft Sentinel data lake tables must be queried using `external_table()` function.
12. During public preview the scope of KQL interactive queries is single workspace.
13. Job name must be unique across all jobs in the tenant.
14. Job name can be up to 256 characters. Including any characters except `#`.
15. TimeGenerated will be overwritten if it is older that 2 days. To preserve the original event time, we recommend writing the source timestamp to a separate column before ingestion.
16. The following standard columns are not supported for export. These columns will be overwritten in the destination tier during the ingestion:
17. Job start time must be any time in future after 30 mins.
18. You can create up to 100 jobs in the tenant.
19. You can run up to 3 concurrent jobs in the tenant.
20. KQL jobs can run for up to 1 hour.To improve execution time and reduce query costs, it is recommended to apply filters, such as time range, to limit the scope of data scanned.

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 4: Training sessions
> 来源: ado-wiki-b-sentinel-data-lake-notebooks-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Tenant and workspace must be onboarded to Microsoft Sentinel data lake
2. Download Visual Studio Code (desktop app)
3. Download and install Microsoft Sentinel extension for Visual Studio Code (available in VS Code extensions marketplace)
4. GitHub copilot extension for Visual Studio Code (not mandatory to have, optional but recommended)
5. **Explore tables in the lake**: User can view tables in the lake organized by workspaces in the left table explorer pane
6. **View table schema**: User can click on a table and view the table schema
7. **Microsoft Sentinel Provider Library**: User can query the lake using the MSP library, details in the Microsoft Sentinel Provider Library section
8. **Libraries available**: Azure Synapse library is attached to the spark compute pools. Users cannot bring other libraries or files.
9. **Notebook editor**: User can open their previously saved notebooks, or start a new one to query the lake. To start a new one, press Ctrl+Shift+P>Create new Jupyter notebook. User can also save the output of their queries to custom table in lake or analytics tier using the MSP library.
10. **Compute pools**: User can select one of the three spark compute pools to run their interactive query, small, medium, large
11. **Session start up**: Spark compute session will start when a user clicks the play sign to execute the first query. It takes about 5 mins for the session to start. Once started, if there is no activity, the session will automatically time out in 20 mins.
12. **Session status**: User can view the connection status of their spark session. Each notebook tab has its own session.
13. Create notebook job: User can schedule their notebook as a job to run at specific times or intervals.
14. Job management: Users can edit, update, view job run details associated with the job. Specifically the below:
15. Job status:
16. Job run status:
17. Queued: Job has started to run, but it is queued to get allocated resources or due resource limitation.
18. Validate if the user has proper roles and permissions.
19. Make sure user is logged into the Microsoft Sentinel extension.
20. Make sure user has selected one of the Microsoft Sentinel compute pools

### Portal 导航路径
- their previously saved notebooks, or start a new one to query the lake
- in [[ADX Web](https://dataexplorer
- in [[ADX Web](https://dataexplorer

### Kusto 诊断查询
**查询 1:**
```kusto
2. If there are no CorrelationIDs, the below query can be run to check the reliability of most recent calls to notebook service from the reported customer/tenant

   Open in [[ADX Web](https://dataexplorer.azure.com/clusters/babylon.eastus2/databases/babylonMdsLogs?query=H4sIAAAAAAAAA0XKMQqDQBAF0D7gHQYJWOYEViLBLkU6STHufnBBZ2H2qwg5fEhl%2B3hPJQ49%2Bx3G6vaVY4ZDOl0W%2BBumxiFK28q92wrzeuGVX8pZQjZqsiL1IxnhGph21P%2BVPcJlOmVsmFY0H4ko4QchJNF3eQAAAA%3D%3D)] [[Kusto.Explorer](https://babylon.eastus2.kusto.windows.net/babylonMdsLogs?query=H4sIAAAAAAAAA0XKMQqDQBAF0D7gHQYJWOYEViLBLkU6STHufnBBZ2H2qwg5fEhl%2B3hPJQ49%2Bx3G6vaVY4ZDOl0W%2BBumxiFK28q92wrzeuGVX8pZQjZqsiL1IxnhGph21P%2BVPcJlOmVsmFY0H4ko4QchJNF3eQAAAA%3D%3D&web=0)] [[Fabric](https://msit.fabric.microsoft.com/groups/me/queryworkbenches/querydeeplink?cluster=https://babylon.eastus2.kusto.windows.net/&database=babylonMdsLogs&query=H4sIAAAAAAAAA0XKMQqDQBAF0D7gHQYJWOYEViLBLkU6STHufnBBZ2H2qwg5fEhl%2B3hPJQ49%2Bx3G6vaVY4ZDOl0W%2BBumxiFK28q92wrzeuGVX8pZQjZqsiL1IxnhGph21P%2BVPcJlOmVsmFY0H4ko4QchJNF3eQAAAA%3D%3D)] [[cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs')](https://dataexplorer.azure.com/clusters/babylon.eastus2/databases/babylonMdsLogs)]
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 5: Onboarding and Offboarding of Microsoft Sentinel to the data lake
> 来源: ado-wiki-b-sentinel-data-lake-onboarding-offboarding-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. A banner appears at the top of the page, indicating that you can onboard to the Microsoft Sentinel data lake. Select **Get started**.
2. If you don't have the correct role to set up the data lake, a side panel appears indicating that you do not have the required permissions. You will need to make a request to your administrator to set up the data lake.
3. If you have the required permissions, you will see a side panel that enables you to start Setup and understand the subsequent Benefits and impact. To begin the Setup, select the **Subscription** and **Resource group** to enable billing for the Microsoft Sentinel data lake.
4. The setup process begins. You will see a setup started panel followed by a setup complete panel. You can close the setup started panel while the setup process is running.
5. If you close the setup started panel you will see a setup in progress banner.

### Portal 导航路径
- the Sentinel lake explorer
- System Settings > Microsoft Sentinel > Data Lake in the Defender portal to initiate onboarding manually
- an ICM ticket in order to attach any remaining workspaces in the tenant home region to the data lake
- an ICM ticket to address this request

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 6: Troubleshooting Guide for Sentinel data lake - Packaging and Manifest Creation using the Visual Code Extension for Sentinel
> 来源: ado-wiki-b-sentinel-data-lake-packaging-manifest-tsg.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- <�>PackageManifest

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 7: Resolve Microsoft Sentinel Search and Restore issues
> 来源: ado-wiki-d-search-archive-restoration-preview.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

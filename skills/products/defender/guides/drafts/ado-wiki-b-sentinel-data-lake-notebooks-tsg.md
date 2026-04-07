---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel data lake/[TSG] - Sentinel data lake - Notebooks"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20data%20lake/%5BTSG%5D%20-%20Sentinel%20data%20lake%20-%20Notebooks"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Training sessions
|Date (DD/MM/YYYY)|Session Recording|Presenter|
|--|--|--|
|09/07/2025|[Sentinel data lake - Notebook Experience](https://platform.qa.com/resource/sentinel-data-lake-notebook-experience-1854/)|Vandana Mahtani|

# Required Kusto Access
| Cluster Path | Database | Permissions |
|--|--|--|
| https://babylon.eastus2.kusto.windows.net | babylonMdsLogs | [TM-AzurePurviewCSS](https://coreidentity.microsoft.com/manage/entitlement/entitlement/tmazurepurvi-xzw2) |

# Overview

Notebook on Microsoft Sentinel data lake: [Exploring and interacting with lake data using Jupyter Notebooks (Preview) - Microsoft Security | Microsoft Learn](https://review.learn.microsoft.com/en-us/azure/sentinel/graph/notebooks-overview?branch=pr-en-us-301045)

The Microsoft Sentinel data lake, available in the Microsoft Defender portal, is a centralized repository designed to store and manage vast amounts of security-related data from various sources. It enables your organization to collect, ingest, and analyze security data in a unified manner, providing a comprehensive view of your security landscape. Leveraging advanced analytics, machine learning, and artificial intelligence, the Microsoft Sentinel data lake helps in detecting threats, responding to incidents, investigating incidents, and improving overall security posture.

Jupyter notebooks are an integral part of the Microsoft Sentinel data lake ecosystem, offering powerful tools for data analysis and visualization. The notebooks are provided by the Microsoft Sentinel Visual Studio Code extension (preview) that allows you to interact with the data lake using Python. Notebooks enable you to perform complex data transformations, run machine learning models, and create visualizations directly within the notebook environment.

# User scenarios

| Interactive notebook querying| 1. As a user, I can query data in the lake by running interactive queries<br>2. As a user, I can use default compute pools (e.g. Microsoft Sentinel>Small, Medium, Large) to run my interactive notebook |
| --- | --- |
| Microsoft Sentinel Provider Library |3. As a user, I can use Microsoft Sentinel Provider library provided methods to interact with data in the lake (all methods enlisted in below section)|
| Schedule a notebook as a job| 4. As a user, I can schedule a notebook as a job |
| Job Management| 5. As a user, I can view list of all scheduled jobs<br>6. As a user, for a given job, I can view its job details, schedule config, view runs/logs, disable/re-enable a job, cancel a run instance, delete the job permanenetly<br>7. As a users, for a given job, I can download the notebook associated with a job |
| Write output to custom tables | 8. As a user, I can run interactive notebook that can create custom table in Lake or Analytics Tier to write my results to<br>9. As a user, I can schedule a job that can create a custom table in Lake or Analytics Tier to write my scheduled job results to |
| Session Info | 10. As a user, I can know when my kernel is active or not|

# prerequisites

1. Tenant and workspace must be onboarded to Microsoft Sentinel data lake
2. Download Visual Studio Code (desktop app)
3. Download and install Microsoft Sentinel extension for Visual Studio Code (available in VS Code extensions marketplace)
4. GitHub copilot extension for Visual Studio Code (not mandatory to have, optional but recommended)

Once the customer is onboarded to the Microsoft Sentinel data lakein Public Preview, they can log into the VS Code Microsoft Sentinel extension and also see the Jobs page in the Defender portal depending on their permissions.

# Permissions

Microsoft Entra ID roles provide broad access across all workspaces in the data lake. Alternatively you can grant access to individual workspaces using Azure RBAC roles. Users with Azure RBAC permissions to Microsoft Sentinel workspaces can run notebooks against those workspaces in the lake tier. For more information, see [Microsoft Sentinel data lake roles and permissions](https://review.learn.microsoft.com/en-us/azure/sentinel/roles#roles-and-permissions-for-the-microsoft-sentinel-data-lake-preview).

Note: To create a new custom table via Notebook you need access to Sentinel workspace.

# Feature description

## Notebook interactive queries

1. **Explore tables in the lake**: User can view tables in the lake organized by workspaces in the left table explorer pane
2. **View table schema**: User can click on a table and view the table schema
3. **Microsoft Sentinel Provider Library**: User can query the lake using the MSP library, details in the Microsoft Sentinel Provider Library section
4. **Libraries available**: [Azure Synapse library](https://github.com/microsoft/synapse-spark-runtime/blob/main/Synapse/spark3.4/Official-Spark3.4-Rel-2025-05-28.1-rc.1.md) is attached to the spark compute pools. Users cannot bring other libraries or files.
5. **Notebook editor**: User can open their previously saved notebooks, or start a new one to query the lake. To start a new one, press Ctrl+Shift+P>Create new Jupyter notebook. User can also save the output of their queries to custom table in lake or analytics tier using the MSP library.
6. **Compute pools**: User can select one of the three spark compute pools to run their interactive query, small, medium, large
7. **Session start up**: Spark compute session will start when a user clicks the play sign to execute the first query. It takes about 5 mins for the session to start. Once started, if there is no activity, the session will automatically time out in 20 mins.
8. **Session status**: User can view the connection status of their spark session. Each notebook tab has its own session.
 
![==image_0==.png](/.attachments/==image_0==-c94d6e06-b545-40b3-9c41-70327f4b33fc.png)

## Notebook Jobs

1. Create notebook job: User can schedule their notebook as a job to run at specific times or intervals.
2. Job management: Users can edit, update, view job run details associated with the job. Specifically the below:
   1. View all jobs: View all existing Notebook jobs in the tenant.
   2. View job details: View job name, description, schedule configuration
   3. View job run history: View previous runs and a notebook snapshot for that run. For failed runs, you can view an error message.
   4. Disable or Enable a notebook job
   5. Delete a notebook job: User can permanently delete a job
3. Job status:
   1. Enabled: Job is active.
   2. Disabled: Job is disabled and will not run based on schedule
4. Job run status:
   1. Succeeded: Job ran successfully.
   2. Failed: Job failed
   3. In progress: Job is running
4. Queued: Job has started to run, but it is queued to get allocated resources or due resource limitation.
    

Note: Jobs created from VS Code Notebook will appear in the Defender portal under Jobs page as read-only.

Microsoft Sentinel Provider Library

| Method| Description | Input Arguments| Return |
| --- | --- | --- | --- |
| list_databases | List all available databases (aka sentinel workspaces) | none | list[str]|
| list_tables | List all tables in a given database | database: str (optional)id: str (optional)| list[str] |
| read_table | Load a DataFrame from a table in Lake | table_name: strdatabase: str (optional)id:str (optional)| DataFrame |
| save_as_table | Write a DataFrame as a managed table to the Lake or to Analytics Tier| DataFrametable_name:strdatabase:str (optional)id: str (optional)WriteOptions : dict{mode: Append/Overwrite} (optional)| str (runId) |
| delete_table| Deletes the table from the schema | table_name: strdatabase: str (optional)id:str (optional) | dict () |

# Limits

Review [Notebook on lake limits](https://review.learn.microsoft.com/en-us/azure/sentinel/graph/notebooks?branch=pr-en-us-301045#service-limits-for-vs-code-notebooks) explained inMicrosoft Sentinel documentation.

# Common issues

1. Validate if the user has proper roles and permissions.
2. Make sure user is logged into the Microsoft Sentinel extension.
3. Make sure user has selected one of the Microsoft Sentinel compute pools
4. Make sure the query is using the Microsoft Sentinel Provider library, the correct arguments are passed in the methods
5. When viewing logs, validate that user is looking at the Microsoft Sentinel channel in the Output pane

# Error codes

Review [troubleshooting guide and error handling.](https://review.learn.microsoft.com/en-us/azure/sentinel/graph/notebooks?branch=pr-en-us-301045#troubleshooting)

# Searching for errors in Logs

1. The following query can be used to check if there are and errors reported in the logs. In the below query, you can use the CorrelationIDs from error messages reported in VS Code Output channel

   Open in [[ADX Web](https://dataexplorer.azure.com/clusters/babylon.eastus2/databases/babylonMdsLogs?query=H4sIAAAAAAAAA3NPLEktT6x0LUvNK%2BHlqlEoz0gtSlVwzi8qSs1JLMnMz%2FNMUbC1VVBBEQEADfNNxzUAAAA%3D)] [[Kusto.Explorer](https://babylon.eastus2.kusto.windows.net/babylonMdsLogs?query=H4sIAAAAAAAAA3NPLEktT6x0LUvNK%2BHlqlEoz0gtSlVwzi8qSs1JLMnMz%2FNMUbC1VVBBEQEADfNNxzUAAAA%3D&web=0)] [[Fabric](https://msit.fabric.microsoft.com/groups/me/queryworkbenches/querydeeplink?cluster=https://babylon.eastus2.kusto.windows.net/&database=babylonMdsLogs&query=H4sIAAAAAAAAA3NPLEktT6x0LUvNK%2BHlqlEoz0gtSlVwzi8qSs1JLMnMz%2FNMUbC1VVBBEQEADfNNxzUAAAA%3D)] [[cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs')](https://dataexplorer.azure.com/clusters/babylon.eastus2/databases/babylonMdsLogs)]

   ```q
   GatewayEvent
   | where CorrelationId == $CorrelationId
   ```

2. If there are no CorrelationIDs, the below query can be run to check the reliability of most recent calls to notebook service from the reported customer/tenant

   Open in [[ADX Web](https://dataexplorer.azure.com/clusters/babylon.eastus2/databases/babylonMdsLogs?query=H4sIAAAAAAAAA0XKMQqDQBAF0D7gHQYJWOYEViLBLkU6STHufnBBZ2H2qwg5fEhl%2B3hPJQ49%2Bx3G6vaVY4ZDOl0W%2BBumxiFK28q92wrzeuGVX8pZQjZqsiL1IxnhGph21P%2BVPcJlOmVsmFY0H4ko4QchJNF3eQAAAA%3D%3D)] [[Kusto.Explorer](https://babylon.eastus2.kusto.windows.net/babylonMdsLogs?query=H4sIAAAAAAAAA0XKMQqDQBAF0D7gHQYJWOYEViLBLkU6STHufnBBZ2H2qwg5fEhl%2B3hPJQ49%2Bx3G6vaVY4ZDOl0W%2BBumxiFK28q92wrzeuGVX8pZQjZqsiL1IxnhGph21P%2BVPcJlOmVsmFY0H4ko4QchJNF3eQAAAA%3D%3D&web=0)] [[Fabric](https://msit.fabric.microsoft.com/groups/me/queryworkbenches/querydeeplink?cluster=https://babylon.eastus2.kusto.windows.net/&database=babylonMdsLogs&query=H4sIAAAAAAAAA0XKMQqDQBAF0D7gHQYJWOYEViLBLkU6STHufnBBZ2H2qwg5fEhl%2B3hPJQ49%2Bx3G6vaVY4ZDOl0W%2BBumxiFK28q92wrzeuGVX8pZQjZqsiL1IxnhGph21P%2BVPcJlOmVsmFY0H4ko4QchJNF3eQAAAA%3D%3D)] [[cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs')](https://dataexplorer.azure.com/clusters/babylon.eastus2/databases/babylonMdsLogs)]

   ```q
   GatewayEvent| where CallerTenantId == $CustomerTenantId
   | where Path contains "/interactive"
   | order by ['time'] desc
   ```

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::

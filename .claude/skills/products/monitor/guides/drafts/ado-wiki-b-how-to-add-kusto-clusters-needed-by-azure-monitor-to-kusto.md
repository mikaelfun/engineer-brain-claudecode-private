---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Kusto/How to add Kusto clusters needed by Azure Monitor to Kusto Explorer"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/Kusto/How%20to%20add%20Kusto%20clusters%20needed%20by%20Azure%20Monitor%20to%20Kusto%20Explorer"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Introduction
---
Kusto / Azure Data Explorer is a big data analytics cloud service optimized for interactive ad-hoc queries over structured, semi-structured, and unstructured data. Kusto is the internal code name of the project in Microsoft. Externally, the cloud service is called [Azure Data Explorer](https://azure.microsoft.com/services/data-explorer/).

In the Azure Monitor space, Kusto / Azure Data Explorer is utilized to store various backend trace logging and telemetry data that can be used in troubleshooting customer issues.

For more information on Kusto / Azure Data Explorer, see the links below:

- [Kusto documentation](https://aka.ms/kusto).
- [Azure Data Explorer product documentation](https://aka.ms/adx.docs).

# Kusto Clusters Relevant to Azure Monitor
---
See the table below for Kusto cluster URIs along with permissions required to connect.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**

Connecting to clouds other than Public have special requirements where only Kusto Explorer can be used to connect using your Microsoft user account.  See [Add a Connection in Kusto Explorer](#add-a-connection-in-kusto-explorer) for details.
</div>

| Azure Monitor Feature Area | Cloud | Connection URI | Database(s) | Description | Permissions Required |
|:---------------------------|:------|:---------------|:------------|:------------|:---------------------|
| All | Public | https://armprodgbl.eastus.kusto.windows.net | ARMProd | Trace logging for all requests made by customers into Azure Resource Manager (ARM). | CoreIdentity: [ARM Logs](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/armlogs-pbfu) |
| All | US Government (Fairfax) | https://armff.kusto.usgovcloudapi.net/ | armff | Trace logging for all requests made by customers into Azure Resource Manager (ARM). | CoreIdentity: [ARM Logs](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/armlogs-pbfu)) |
| All | China (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn | armmc | Trace logging for all requests made by customers into Azure Resource Manager (ARM). | CoreIdentity: [ARM Logs](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/armlogs-pbfu) |
| | Public | https://icmcluster.kusto.windows.net | | | CoreIdentity: [IcM-Kusto-Access](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/icmkustoacce-ufk0) |
| Alerting | Public | https://aznscluster.southcentralus.kusto.windows.net | AzNSPROD | Azure notification service trace logging and telemetry. | IDWeb: [AzNS Kusto Viewers](https://idwebelements/GroupManagement.aspx?Group=AzNS%20Kusto%20Viewers&Operation=join) |
| Alerting | US Government (Fairfax) | https://aznsclusterff.usgovvirginia.kusto.usgovcloudapi.net  | AzNSPROD | Azure notification service trace logging and telemetry. | IDWeb: [AzNS Kusto Viewers](https://idwebelements/GroupManagement.aspx?Group=AzNS%20Kusto%20Viewers&Operation=join) |
| Alerting | China (Mooncake) | https://aznscluster.chinaeast2.kusto.chinacloudapi.cn | AzNSPROD | Azure notification service trace logging and telemetry. | IDWeb: [AzNS Kusto Viewers](https://idwebelements/GroupManagement.aspx?Group=AzNS%20Kusto%20Viewers&Operation=join) |
| Alerting | Public | https://azalertsprodweu.westeurope.kusto.windows.net | | Alerts service trace logging and telemetry. (Resource provider logs, Activity log and log search alerts evaluations, fired alerts telemetry and more). | CoreIdentity: [Azure Alerts Logs](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azurealertsl-xkhv) |
| Alerting | US Government (Fairfax) | https://azalertsffusgv.usgovvirginia.kusto.usgovcloudapi.net | | Alerts service trace logging and telemetry. (Resource provider logs, Activity log and log search alerts evaluations, fired alerts telemetry and more). | |
| Alerting | China (Mooncake) | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn | | Alerts service trace logging and telemetry. (Resource provider logs, Activity log and log search alerts evaluations, fired alerts telemetry and more). | |
| Alerting | Public | https://oibeftprdflwr.kusto.windows.net/ | IndexerTelemetry | Snapshot data of resources and the Log Analytics workspaces that are related for resource centric querying. | Membership to regional Azure Monitor security group. |
| Alerting | Public | https://icmbrain.kusto.windows.net | AzureResourceHealth | | |
| Alerting | Public | https://meoshared.westus.kusto.windows.net | AeoAnalytics | Telemetry for the sending of email notifications by MEO (formerly AEO) service. | Membership to regional Azure Monitor security group. |
| Application Insights | Public | https://aicontrolplane.eastus.kusto.windows.net | LogsCDS | Holds the control plane logs for App Insights resource provider to help troubleshoot any failing ARM calls into our resource provider | Join **Azure Log Analytics Control Plane Partners** security group in [IDWeb](https://idweb.microsoft.com/IdentityManagement/aspx/common/GlobalSearchResult.aspx?searchtype=e0c132db-08d8-4258-8bce-561687a8a51e&content=Azure%20Log%20Analytics%20Control%20Plane%20Partners) |
| Monitor Essentials | Public | https://azureinsights.kusto.windows.net | Insights | Trace logging and telemetry data for Activity Log, Autoscale, Resource Log and Diagnostic Settings and Metrics | CoreIdentity: [AzMon Essentials Logs](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azmonessenti-b503) |
| Monitor Essentials | US Government (Fairfax) | https://azureinsightsff.usgovtexas.kusto.usgovcloudapi.net/ | azureinsightsff | Trace logging and telemetry data for Activity Log, Autoscale, Resource Log and Diagnostic Settings and Metrics | Requires a SAW device.  Use AME domain account (youralias@ame.gbl) to join group AME\\TM-AzMonEssential-Logs group via https://aka.ms/oneidentity. |
| Monitor Essentials | China (Mooncake) | https://azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn | azureinsightsmc | Trace logging and telemetry data for Activity Log, Autoscale, Resource Log and Diagnostic Settings and Metrics |CoreIdentity: [AzMon Essentials Logs]Requires a SAW device.  Use AME domain account (youralias@ame.gbl) to join group AME\\TM-AzMonEssential-Logs group via https://aka.ms/oneidentity. |
| Log Analytics | Public | https://omsgenevatlm.kusto.windows.net | GenevaNSProd | Event, trace and telemetry logging for Log Analytics Northstar ingestion pipeline. | Membership to regional Azure Monitor security group. |
| Log Analytics | Public | https://omsgenevainmemprod.eastus.kusto.windows.net | OperationInsights_InMem_PROD | Event, trace and telemetry logging for Log Analytics InMem ingestion pipeline. | Membership to regional Azure Monitor security group. |
| Log Analytics | Public | https://omsgenevaodsprod.eastus.kusto.windows.net | OperationInsights_ODS_PROD | Event, trace and telemetry logging for Log Analytics ODS component (part of the ingestion pipeline). | Membership to regional Azure Monitor security group. |
| Log Analytics | Public | https://dataexplorer.azure.com/clusters/oibeftprdflwr | AMSTelemetry| Event, trace and telemetry logging for Log Analytics Control Plane service | Membership to regional Azure Monitor **FTE** security group. |
| Log Analytics | Public | https://lacontrolplane.eastus.kusto.windows.net | LogsDAS<br>LogsLACP | Event, trace and telemetry logging for Log Analytics Control Plane service | Membership to regional Azure Monitor **FTE** security group. |
| Log Analytics | Public | https://appinsightstlm.kusto.windows.net | AzureMonitorUsage | Azure Monitor billing telemetry | Membership to regional Azure Monitor **FTE** security group. |
| Log Analytics | Public | https://oiildc.kusto.windows.net'| AMBackend_PROD | Azure Monitor Logs backend telemetry | Access to the core identity group ALA_Telemetry [CoreIdentity - Manage Entitlement](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/alatelemetry-k2k1) |
| Log Analytics agent | Public |https://genevaagent.kusto.windows.net/  | Telemetry  |Agent Telemetry Data | CoreIdentity: [GenevaAgentTelemetry RO](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/genevaagentt-0ohd)|

# Using Kusto Explorer
---
## Install Kusto Explorer
To install Kusto Explorer, follow the steps below:

1. Open a web browser and navigate to https://aka.ms/ke.
1. Click **Install**.

   ![image.png](/.attachments/image-fb175333-a78a-48c9-a8b7-5b680d29d419.png)

1. Allow the installation to complete.  Once finished it will launch Kusto Explorer.

## Add a Connection in Kusto Explorer
To add connections to the various Kusto clusters that are needed by Azure Monitor follow the steps below:

1. Click **Add connection**.

   ![image.png](/.attachments/image-f28480d9-afc5-46f2-9716-52e1317bb0d1.png)

1. In the **Add connection** dialog, populate the following properties:

   | Property | Value |
   |----------|-------|
   | Cloud settings | Public cloud (windows.net) |
   | Cluster connection | https://CLUSTER.kusto.windows.net |
   | Connection Alias | Whatever name you want, defaults to the cluster name. |
   | Security | <ul><li>**Public Cloud:** Client Security: AAD-Federated</li><li>**Other Clouds:** Client Security: dSTS-Federated</li></ul> |

   **Example:**

   ![image.png](/.attachments/image-53203af5-40df-468d-924e-637105d504de.png) ![image.png](/.attachments/image-fd03ff4e-63d9-4a82-91a0-6076207762f4.png)

## Connecting to Fairfax
1. Make sure you are connected to **AZURE VPN** before connecting to Fairfax Kusto cluster.

   ![image.png](/.attachments/image-93466de0-bcc3-4785-970c-9bdf6978b9be.png)

1. This now requires a SAW machine. 

# Using Azure Data Explorer
---
## Launch Azure Data Explorer
To launch Azure Data Explorer, follow the steps below:

1. Open a web browser and navigate to https://aka.ms/kwe.

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">
   
   **Important**
   
   Azure Data Explorer has cloud specific endpoints and authenticating to other cloud endpoints (for example US Government) can't be done using your microsoft.com account, you cannot use Azure Data Explorer for clouds other than public.
   </div>
   
## Add a Connection in Azure Data Explorer
To add connections to the various Kusto clusters that are needed by Azure Monitor follow the steps below:

1. If not already expanded, click the **>>** button to expand the left navigation pane.

   ![image.png](/.attachments/image-ccee6ed0-24d6-4131-8c3a-a602464c5548.png)

1. Click **Add Cluster**.

   ![image.png](/.attachments/image-e8cca6eb-f0ca-45ed-b05c-dd6b9e5d2239.png)

1. In the **Add Cluster** dialog, populate the following properties, then click **Add**.

   | Property | Value |
   |----------|-------|
   | Connection URI | https://CLUSTER.kusto.windows.net |
   | Display Name | Whatever name you want, defaults to the cluster name. |

   **Example:**

   ![image.png](/.attachments/image-f9aae6db-3672-4afe-9043-bed3affa96fd.png)


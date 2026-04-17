---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/HT Check Container Insights Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/HT%20Check%20Container%20Insights%20Logs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

How to Check Container Insights Logs
====================================
[[_TOC_]]

Scenario
--------
Guidance to check container insights logs

Information you will need
-------------------------
The resource Id of the affected AKS cluster

Overview & Concepts
-------------------
For a deeper understanding of the Container Insights architecture, refer to the following resource: [https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1371324/Container-Insights-Architecture-For-Managed-Identity-Configuration](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1371324/Container-Insights-Architecture-For-Managed-Identity-Configuration)

How to check container insights logs
------------------------------------
We normally check the logs because we have an issue with Container Insights collection or because something might be happening with the AMA Pods.

To access logs from containers running inside pods, use the following command:
`kubectl logs PODNAME -n kube-system`

To check logs from the Container Insights Agent, use the following command:
`kubectl exec -it PODNAME -n kube-system -c ama-logs -- less <path of the logs>`

The following link [https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1648327/Container-Insights-Agent-Log-Locations?anchor=agent-components](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1648327/Container-Insights-Agent-Log-Locations?anchor=agent-components) provides details on two essential aspects:

*   The location of the log files
*   What log to focus on depending on the table that is missing logs

Next, there are more details about how and what to check in the logs in case there is missing data from a Container Insights table.

## Table: ContainerInventory
**Table Reference:** [https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/containerinventory](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/containerinventory)

**Data Source:** Fluentd in ama-logs POD 
**Log file:** `/var/opt/microsoft/docker-cimprov/log/fluentd.log` 
**Command:** `kubectl exec -it -n kube-system -c ama-logs -- less <log file>`

**What to check:**
*   Configuration file in use
![Screenshot 2025-09-03 104118.png](/.attachments/Screenshot%202025-09-03%20104118-721c321f-fd86-4c8c-9965-07e7c3c2cc03.png)
*   Fluentd startup and version
*   Match pattern with container inventory (host/port)
![Screenshot 2025-09-03 104235.png](/.attachments/Screenshot%202025-09-03%20104235-2c22483c-e3af-434e-b06c-bf337dd361e8.png)

Later we can see the following details:
*   Fluentd worker starts (pid)
*   Container inventory initiation
*   Authentication method
*   Data collection interval
*   Namespace filtering
*   Stream emission to MDSD
![Screenshot 2025-09-03 104353.png](/.attachments/Screenshot%202025-09-03%20104353-cf560f68-0288-4548-87f6-c8609dbcc586.png)

Once we confirm that everything is fine with the `fluentd.log` file, we can check the MDSD files to validate if we have issues. Use any of the below commands:

`kubectl exec -it <PODNAME> -n kube-system -c ama-logs -- less /var/opt/microsoft/linuxmonagent/log/mdsd.info`

`kubectl exec -it <PODNAME> -n kube-system -c ama-logs -- less /var/opt/microsoft/linuxmonagent/log/mdsd.err`

`kubectl exec -it <PODNAME> -n kube-system -c ama-logs -- less /var/opt/microsoft/linuxmonagent/log/mdsd.warn`

`kubectl exec -it <PODNAME> -n kube-system -c ama-logs -- less /var/opt/microsoft/linuxmonagent/log/mdsd.qos`

If there are no errors but still you don't see data in Log Analytics, start troubleshooting the Log Analytics pipeline to see if data is reaching the ODS endpoint: [https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750362/Data-ingestion-troubleshooting-flowchart](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750362/Data-ingestion-troubleshooting-flowchart)

## Table: InsightsMetrics
**Table Reference:** [https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/insightsmetrics](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/insightsmetrics)
**Data Source:** Telegraf  Fluent-bit 
**Log files:**
*   `/var/opt/microsoft/docker-cimprov/log/fluent-bit.log`
*   `/var/opt/microsoft/docker-cimprov/log/fluent-bit-out-oms-runtime.log`

**Command:** `kubectl exec -it -n kube-system -c ama-logs -- less <log file>`

**What to check:**
*   Endpoint in use
*   Authentication
*   Resource ID and Resource Name
*   VMSS name
*   MDSD client connection creation
![Screenshot 2025-09-03 104457.png](/.attachments/Screenshot%202025-09-03%20104457-738eef2a-ec2c-458f-aa1d-7731fc93eab0.png)
*   Telegraf sending metrics to mdsd/ama
![Screenshot 2025-09-03 104513.png](/.attachments/Screenshot%202025-09-03%20104513-2e08cabd-e5d3-4405-a228-2976622114a7.png)

If you don't have any errors here, also check the `fluent-bit.log` and the MDSD logs for further details. Use the commands above.

## Additional Tables and References
Tables:
*   [ContainerNodeInventory](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/containernodeinventory)
*   [KubeEvents](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/kubeevents)
*   [KubeNodeInventory](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/kubenodeinventory)
*   [KubePodInventory](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/kubepodinventory)
*   [KubePVInventory](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/kubepvinventory)
*   [KubeServices](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/kubeservices)

**Data Source:** Fluentd in ama-logs-rs 
**Log file:** `/var/opt/microsoft/docker-cimprov/log/fluentd.log` 
**Command:** `kubectl exec -it <PODNAME> -n kube-system -c ama-logs -- less <log file>`

**What to check:** Same procedure applies to all listed tables. For example, using KubeEvents as reference:
*   Configuration file in use
![Screenshot 2025-09-03 104610.png](/.attachments/Screenshot%202025-09-03%20104610-31f2d8fa-3ea6-4295-81de-1b041e1f8b67.png)
*   Fluentd startup and version
*   Match pattern with container inventory (host/port)
![Screenshot 2025-09-03 104631.png](/.attachments/Screenshot%202025-09-03%20104631-326713be-0df2-496b-8d95-b5af2052c849.png)

Later we can see the following details:
*   Kube events initiation
*   Authentication method
*   Namespace filtering
*   Data collection
*   Stream emission to MDSD
![Screenshot 2025-09-03 104705.png](/.attachments/Screenshot%202025-09-03%20104705-b63d9aaa-3408-4892-82e7-ec92740ca0f1.png)
![Screenshot 2025-09-03 104725.png](/.attachments/Screenshot%202025-09-03%20104725-f0e2aa39-e808-43de-af9a-53cfb4995e35.png)

If you don't have any errors here, also check the MDSD logs for further details. Use the commands above.

If there are no errors but still you don't see data in Log Analytics, start troubleshooting the Log Analytics pipeline to see if data is reaching the ODS endpoint: [https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750362/Data-ingestion-troubleshooting-flowchart](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750362/Data-ingestion-troubleshooting-flowchart)
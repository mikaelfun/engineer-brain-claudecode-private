---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/Troubleshooting Guides/Missing Data TSGs/TSG No Data in Log Analytics and Missing Logs in Container Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/Troubleshooting%20Guides/Missing%20Data%20TSGs/TSG%20No%20Data%20in%20Log%20Analytics%20and%20Missing%20Logs%20in%20Container%20Insights"
importDate: "2026-04-06"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
This troubleshooting guide helps you to investigate log missing related issues for Container Insights.

##Architecture
![image.png](/.attachments/image-b3a4b904-5a15-4256-88e7-ae82dbc1f9bc.png)

##Info
In general, the 'ama-logs' pod collects **Node level** logs while the 'ama-logs-rs' pod collects **Cluster level** logs.

- The AKS Node in this picture refers to the Virtual Machine Scale Set Instance.
- The Agent itself is made up of many parts such as Fluent Bit which tails the logs that go into the ContainerLog/ContainerLogV2 tables in Log Analytics. It also uses Fluentd to collect data that goes to other tables such as ContainerInventory, KubeEvents, KubeNodeInventory, etc. See this [article](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/923091/Helpful-Kubectl-Commands-for-Container-Insights) for more info.
- Container Insights collects the stdout and stderr streams from workloads running on the cluster.

##Important Logs & Troubleshooter

- For helpful kubectl commands to use to see data for AKS Clusters as well as locations of the logs for the agent see [here](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/923091/Helpful-Kubectl-Commands-for-Container-Insights)

- For a tutorial on how to use the tool to automatically gather logs for Container Insights see [here](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/614028/How-to-collect-logs-for-Container-Insights)

# Troubleshooting
---
## Preliminary Checks
- See this section to see some initial checks to perform on the AKS Cluster: https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/620133/TSG-Container-Insights?anchor=preliminary-checks

## Onboard/Offboard Failure Check
- Check through the previous sections to ensure everything is running correctly.
- Review the Log Analytics Workspace, if it has a daily cap set you can run the following query to determine if they are meeting this (customer might also say they are 'intermittently getting logs'):
    - `_LogOperation | where TimeGenerated >= ago(7d) | search 'OverQuota'`
    - If the above query produces results, then the customer workspace is meeting their daily cap and all other data ingested afterwards is dropped. In which case they'll either must remove or raise the cap.
<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
   **Note**
Please note that the __LogOperation_ function may not include all possible activities that affect the target Log Analytics workspace. For full visibility, refer to the [Operation](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/operation) table instead. For more details, please check - [Monitor operational issues in your Azure Monitor Log Analytics workspace](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/monitor-workspace)
</div>



## ConfigMap
- Container Insights utilizes a ConfigMap to determine what data to collect/not collect from where. Use this command `kubectl get configmaps container-azm-ms-agentconfig -o yaml -n kube-system` to see if the customer has any custom ConfigMap. If they do not this will not produce a result.

## Confirm ConfigMap is properly applied to the cluster
- To do this we'll run the command to get the ama-logs pods `kubectl get pods -n kube-system | grep ama-logs`
- Then we'll run `kubectl logs PODNAME -n kube-system -c ama-logs` which will produce logs and perform a few checks like attempting to reach the OMS endpoint, see below for sample output:
```
customResourceId:/subscriptions/SUBID/resourceGroups/RESOURCEGROUPNAME/providers/Microsoft.ContainerService/managedClusters/CLUSTERNAME
customRegion:centralus
****************Start Config Processing********************
****************Start NPM & subnet ip usage integrations Config Processing********************
config::integrations::Successfully substituted the placeholders for integrations into /etc/opt/microsoft/docker-cimprov/telegraf.conf file for DaemonSet
config::integrations::Successfully substituted the integrations placeholders into /etc/opt/microsoft/docker-cimprov/telegraf.conf file for DaemonSet
Making curl request to oms endpint with domain: opinsights.azure.com
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
curl request to oms endpoint succeeded.
Azure mdsd: 1.26.1-build.master.97
telegraf 1.26.0-2.cm2
DOCKER_CIMPROV_VERSION=18.0.1-0
Fluent Bit v2.0.9
Git commit: 
fluentd 1.14.6
****************Start Config Processing********************
Both stdout & stderr log collection are turned off for namespaces: '*_kube-system_*.log' 
****************End Config Processing********************
config::Starting to substitute the placeholders in fluent-bit.conf file for log collection
config::Successfully substituted the placeholders in fluent-bit.conf file
config::Starting to substitute the placeholders in fluent-bit-common.conf file for log collection
config::Successfully substituted the placeholders in fluent-bit-common.conf file
****************Start Agent Integrations Config Processing********************
****************Start Prometheus Config Processing********************
config::No configmap mounted for prometheus custom config, using defaults
****************End Prometheus Config Processing********************
****************Start MDM Metrics Config Processing********************
****************End MDM Metrics Config Processing********************
****************Start Metric Collection Settings Processing********************
****************End Metric Collection Settings Processing********************
MUTE_PROM_SIDECAR = false
Making wget request to cadvisor endpoint with port 10250
Using port 10250
Making curl request to cadvisor endpoint /pods with port 10250 to get the configured container runtime on kubelet
configured container runtime on kubelet is : containerd
set caps for ruby process to read container env from proc
aks-agentpool-21461466-vmss000001
*** setting up oneagent in aad auth msi mode ***
starting mdsd in main container...
setting up cronjob for ci agent log rotation
*** starting fluentd v1 in daemonset
starting fluent-bit and setting telegraf conf file for daemonset
using fluentbitconf file: fluent-bit.conf for fluent-bit
since container run time is containerd update the container log fluentbit Parser to cri from docker
nodename: aks-agentpool-21461466-vmss000001
replacing nodename in telegraf config
checking for listener on tcp #25226 and waiting for 45 secs if not..
File Doesnt Exist. Creating file...
Fluent Bit v2.0.9
* Copyright (C) 2015-2022 The Fluent Bit Authors
* Fluent Bit is a CNCF sub-project under the umbrella of Fluentd
* https://fluentbit.io

Routing container logs thru v2 route... 
waitforlisteneronTCPport found listener on port:25226 in 1 secs
checking for listener on tcp #25228 and waiting for 120 secs if not..
waitforlisteneronTCPport found listener on port:25228 in 33 secs
2023-06-19T14:15:14.1872450Z: Loaded data sources dcr-89f89a7af6fb42cba3583ae5b8b8dfa3
2023-06-19T14:15:14.1884090Z: Loaded data sources dcr-ad3270dd2b3e4c22a5a211994c5e7948
2023-06-19T14:15:14.1890240Z: Loaded data sources dcr-89f89a7af6fb42cba3583ae5b8b8dfa3
2023-06-19T14:15:14.1891760Z: Loaded data sources dcr-ad3270dd2b3e4c22a5a211994c5e7948
Onboarding success
startup script took: 36 seconds
2023-06-19T14:15:38Z I! Loading config file: /etc/opt/microsoft/docker-cimprov/telegraf.conf
```
- If there are errors present in the section up above, this may indicate that ConfigMap didn't apply correctly or some other issue is identified (for example, if curl request to oms fails might indicate network issue).

## Log Analysis
- Confirm with the customer what logs they show as missing, such as which table and the time. You can see this [doc](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/923091/Helpful-Kubectl-Commands-for-Container-Insights?anchor=helpful-data-related-to-container-insights-logs/metrics) which has details on each table and the source of the logs from the cluster. The first column will contain the Log Analytics table name, the second column indicates the source and component of the agent used to obtain the information.

- The table below contains the components as well as the important log locations for analysis. In the next section we'll use commands to review the logs:

## Reviewing Logs
### Login to a Pod
- After determining what data is missing (for this example we'll say 'KubePodInventory' table which is derived from fluentd in ama-logs-rs pod) we can drill down a bit into the logs.
- Run this command to start a bash session into the pod (replace pod name with own rs pod name): `kubectl exec -it ama-logs-rs-* -n kube-system -c ama-logs -- /bin/bash`
- From the table we can see that the component name fluentd logs are located at '/var/opt/microsoft/docker-cimprov/log' directory so we'll run a cd command to get to that directory.
- Running 'cat fluentd.log | grep podinventory' will net results such as the below to indicate success (HTTP 200 response):![image.png](/.attachments/image-f1d31620-7d73-43e4-a568-57d5f5bf7e53.png)
- You can do the same for other tables that use this as a data source as well like KubeServices by running 'cat fluentd.log | grep kubeservices' which will show entries for collection of that data.
- 'cat fluentd.log | grep perf' to check performance counter collection: ![image.png](/.attachments/image-a0124fb2-d1d5-49eb-b5c9-5c3092d3f12c.png)
- The same directory also contains the files 'fluent-bit.log' and 'fluent-bit-out-oms-runtime.log' which would have entries for ContainerLog and ContainerLogV2 entries.
-The MDSD component is responsible for sending the data to Log Analytics and is located under the '/var/opt/microsoft/linuxmonagent/log' directory. You can check for errors in the mdsd.err file and check if MDSD is sending data with the mdsd.qos file.

- If there are still issues, please run the [troubleshooting script](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/614028/How-to-collect-logs-for-Container-Insights) to gather the logs for further analysis

Note: If there is error especially on certain pod like ama-logs-rs, try to restart pod by command: `kubectl delete pod PODNAME -n kube-system`

# Additional resources
- [Common scenarios with mitigations](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/486909/Troubleshooting-Insights-for-Containers)
- [Support boundaries](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480532/Support-Boundaries?anchor=insights-(aka-azure-monitor-insights%2C-resource-insights))
- [Container Insights troubleshoot doc](https://docs.microsoft.com/azure/azure-monitor/containers/container-insights-troubleshoot)
- [Container Insights FAQ](https://docs.microsoft.com/azure/azure-monitor/faq#container-insights)
- [Useful kubectl commands](https://supportability.visualstudio.com/AzureContainers/_wiki/wikis/Containers%20Wiki/431128/Kubectl)
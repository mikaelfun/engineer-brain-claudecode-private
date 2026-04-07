---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/How to collect logs for Container Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/How%20to%20collect%20logs%20for%20Container%20Insights"
importDate: "2026-04-06"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

[[_TOC_]]
# Introduction
---
This article introduces two different methods for collecting data related to Container Insights.

# Prerequisites
---
- kubectl: az aks install-cli
- tar (installed by default)
- OpenShift CLI (For ARO Clusters Only) [Install OpenShift CLI](https://learn.microsoft.com/azure/openshift/tutorial-connect-cluster#install-the-openshift-cli) 
- Container Insights are enabled: https://docs.microsoft.com/azure/azure-monitor/containers/container-insights-onboard
- **Note:** Script can collect logs from both AKS Clusters as well as ARO Clusters

Otherwise, the script will report error message and exit.

# 1. Log Collection Tool
---
This tool will collect:
- Agent logs from Linux daemonset 'ama-logs-' and replicaset 'ama-logs-rs-' pods
- Agent logs from Windows pod if enabled
- Cluster/node info, pod deployment, configMap, process logs, etc.

How to run:

You will need to connect to the cluster.
https://learn.microsoft.com/azure/aks/tutorial-kubernetes-deploy-cluster?tabs=azure-cli#connect-to-cluster-using-kubectl
 
if you don't have kubectl on your machine you can install it by running the az cli command
az aks install-cli
 
then you run
wget https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/scripts/troubleshoot/LogCollection/AgentLogCollection.sh && bash ./AgentLogCollection.sh
 
Here are the steps breakdown:
1. Open a terminal or command prompt on your local machine.
2. copy and paste the command:
wget  https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/scripts/troubleshoot/LogCollection/AgentLogCollection.sh && bash ./AgentLogCollection.sh
3. Then press Enter to execute the command.
wget retrieves the script file (AgentLogCollection.sh) from the specified URL and saves it locally on your machine.
4. Once the download is complete, bash ./AgentLogCollection.sh executes the script, running the commands contained within it on your local machine.
```
wget https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/scripts/troubleshoot/LogCollection/AgentLogCollection.sh && bash ./AgentLogCollection.sh
```

Sample Output (other results will be in the folder name in last log line):
```
Preparing for log collection...
Prerequisites check complete!
Saving cluster information...
cluster info saved to Tool.log
Collecting logs from ama-logs-99rhd...
Defaulted container "ama-logs" out of: ama-logs, ama-logs-prometheus
Collecting the following logs from ama-logs-99rhd:
/var/opt/microsoft/docker-cimprov/log | Containers ama-logs, ama-logs-prometheus
/var/opt/microsoft/linuxmonagent/log | Containers ama-logs, ama-logs-prometheus
/etc/mdsd.d/config-cache/configchunks/ | Data Collection Rule Config
Collecting the following logs from ama-logs-99rhd:
/etc/fluent/container.conf | Containers ama-logs, ama-logs-prometheus
Collecting the following logs from ama-logs-99rhd:
/etc/opt/microsoft/docker-cimprov/fluent-bit.conf | Containers ama-logs, ama-logs-prometheus
/etc/opt/microsoft/docker-cimprov/telegraf.conf | Containers ama-logs, ama-logs-prometheus
Complete log collection from ama-logs-99rhd!
Windows agent pod does not exist, skipping log collection for windows agent pod 
Collecting logs from ama-logs-rs-7b9c559789-l76fc...
Collecting the following logs from ama-logs-rs-7b9c559789-l76fc:
/var/opt/microsoft/docker-cimprov/log
/var/opt/microsoft/linuxmonagent/log
Collecting the following logs from ama-logs-rs-7b9c559789-l76fc:
/etc/fluent/kube.conf
Collecting the following logs from ama-logs-rs-7b9c559789-l76fc:
/etc/opt/microsoft/docker-cimprov/fluent-bit-rs.conf
/etc/opt/microsoft/docker-cimprov/telegraf-rs.conf
Complete log collection from ama-logs-rs-7b9c559789-l76fc!
Collecting onboarding logs...
Collecting deployment info...
Collecting container-azm-ms-configmap configmap...
Collecting container-azm-ms-aks-k8scluster configmap...
Collecting ama-logs-rs-config configmap...
If syslog collection is enabled please make sure that the node pool image is Nov 2022 or later.        To check current version and upgrade: https://learn.microsoft.com/azure/aks/node-image-upgrade
Complete onboarding log collection!

Archiving logs...
log files have been written to AKSInsights-logs.1682355841.cc-8aa16642-67bbbcbbd8-zrbf9.tgz in current folder
```
**Note**: If the log size is too large, the tool may take too long to complete. In this case you can delete the pods before log collection, and they will be recreated automatically: `kubectl delete pod PODNAME -n kube-system`

- After running the above command, can run the tool again to collect the logs.

# 2. Manual Log Collection
---
If the tool fails due to some reason, please check reported error message to continue, or you can manually collect all logs.

1. Connect to AKS cluster: az aks get-credentials --resource-group myResourceGroup --name myAKSCluster
2. If it's an ARO Cluster, to connect via CLI: 
```
#Retrieve server API address
apiServer=$(az aro show -g $RESOURCEGROUP -n $CLUSTER --query apiserverProfile.url -o tsv)
#login
oc login $apiServer -u kubeadmin -p <kubeadmin password>
wget https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/scripts/troubleshoot/LogCollection/AgentLogCollection.sh && bash ./AgentLogCollection.sh
```
3. Find ds and rs pod name: kubectl get pods -n kube-system -o custom-columns=NAME:.metadata.name | grep -E ama-logs
4. Use [kubectl cp command](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#cp) to save all logs: 
```
kubectl cp <pod name>:<folder or file full path> <destination file or folder path> --namespace=kube-system
```
- Note: in general, you can only select one ds pod to collect logs if there are multiple ds pods
- The Logs list is located here [Logs/Metrics File Locations](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1648327/Container-Insights-Agent-Log-Locations)

4. Use kubectl command to save deployment logs:
```
kubectl describe pod <pod name> --namespace=kube-system
kubectl logs <pod name> --container ama-logs --namespace=kube-system
kubectl get deployment <pod name> --namespace=kube-system -o yaml
kubectl get configmaps container-azm-ms-agentconfig --namespace=kube-system -o yaml
```

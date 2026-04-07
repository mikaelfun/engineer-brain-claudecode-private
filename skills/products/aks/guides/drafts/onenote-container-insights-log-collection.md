# Container Insights Log Collection Procedure

> Source: OneNote — How to collect logs for Container Insights
> Status: guide-draft (pending SYNTHESIZE review)

## Purpose

Collect Container Insights agent (ama-logs) logs for troubleshooting monitoring issues.

## What the Tool Collects

- Agent logs from Linux daemonset `ama-logs-*` and replicaset `ama-logs-rs-*` pods
- Agent logs from Windows pod (if enabled)
- Cluster/node info, pod deployment, configMap, process logs

## Steps

### English Version

1. Open a terminal connected to the AKS cluster
2. Download and run the log collection script:
   ```bash
   wget https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/scripts/troubleshoot/LogCollection/AgentLogCollection.sh && bash ./AgentLogCollection.sh
   ```

### Chinese Version (客户沟通用)

1. 使用 Linux 机器或 Windows bash 环境，连接到集群
2. 确认拥有 kube-system 命名空间的权限：
   - [Connect to cluster using kubectl](https://learn.microsoft.com/en-us/azure/aks/tutorial-kubernetes-deploy-cluster?tabs=azure-cli#connect-to-cluster-using-kubectl)
   - 如果没有 kubectl：`az aks install-cli`
3. 下载并执行脚本：
   ```bash
   wget https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/scripts/troubleshoot/LogCollection/AgentLogCollection.sh
   bash ./AgentLogCollection.sh
   ```
4. 命令完成后日志保存在当前目录

## Collected Log Files

```
Tool.log
ama-logs-daemonset/
ama-logs-daemonset-dcr/
ama-logs-daemonset-mdsd/
ama-logs-prom-daemonset/
ama-logs-prom-daemonset-mdsd/
ama-logs-replicaset/
ama-logs-rs-config.yaml
container-azm-ms-aks-k8scluster.yaml
containerID_ama-logs-*.txt
deployment_ama-logs-rs.txt
describe_ama-logs-*.txt
logs_ama-logs-*.txt
node-detailed.json
node.txt
process_ama-logs-*.txt
```

## Reference

- [ADO Wiki: How to collect logs for Container Insights](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/614028/How-to-collect-logs-for-Container-Insights)

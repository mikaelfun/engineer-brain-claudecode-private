---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/Concepts/Container Insights Agent Log Locations"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/Concepts/Container%20Insights%20Agent%20Log%20Locations"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Container Insights Agent Log Locations

## Agent Components
- **Fluentd**: Collects AKS Cluster inventory, events and services
- **Fluent Bit**: Collects Container Logs from applications and agent events
- **Telegraf**: Collects performance data related to the cluster
- **MDSD**: Ships collected data to Log Analytics (last stop before data leaves the cluster)

## Linux Log Locations

| Component | daemonset pod (ama-logs-*) Config | replicaset pod (ama-logs-rs-*) Config | Log Path | Description |
|--|--|--|--|--|
| Fluentd | /etc/fluent/container.conf | /etc/fluent/kube.conf | /var/opt/microsoft/docker-cimprov/log/fluentd.log | Container inventory, K8s resources -> MDSD |
| Fluent Bit | /etc/opt/microsoft/docker-cimprov/td-agent-bit.conf | /etc/opt/microsoft/docker-cimprov/td-agent-bit-rs.conf | /var/opt/microsoft/docker-cimprov/log/fluent-bit.log, fluent-bit-out-oms-runtime.log | Container logs -> MDSD |
| Telegraf | /etc/opt/microsoft/docker-cimprov/telegraf.conf | /etc/opt/microsoft/docker-cimprov/telegraf-rs.conf | No log file (stderr) | Insight metrics -> fluent-bit/fluentd |
| MDSD | - | - | /var/opt/microsoft/linuxmonagent/log/mdsd.{err,warn,info,qos} | Sending data to LA workspace |

## Windows Log Locations

| Component | Config/Log Path (under C:) |
|--|--|
| cAdvisor | /etc/amalogswindows/kubernetes_perf_log.txt |
| cAdvisor2 MDM | /etc/amalogswindows/filter_cadvisor2mdm.log |
| Fluent bit | /etc/amalogswindows/fluent-bit-out-oms-runtime.log, /etc/fluent-bit/fluent-bit.conf, /etc/fluent-bit/fluent-bit.log |
| Telegraf | No log, config: /etc/telegraf/telegraf.conf |

## Log Analytics Table Mappings

| Table | Data Source |
|--|--|
| ContainerInventory | Fluentd in ama-logs |
| ContainerNodeInventory | Fluentd in ama-logs-rs |
| KubeEvents | Fluentd in ama-logs-rs |
| KubeNodeInventory | Fluentd in ama-logs-rs |
| KubePodInventory | Fluentd in ama-logs-rs |
| KubePVInventory | Fluentd in ama-logs-rs |
| KubeServices | Fluentd in ama-logs-rs |
| ContainerLog | Fluent Bit |
| ContainerLogV2 | Fluent Bit |
| kubeMonAgentEvents | Fluent Bit |
| InsightsMetrics | Telegraf -> fluent-bit |
| Perf | CAdvisor/Docker daemon -> fluentd |

## Metrics Collection
- Cadvisor/KubeAPI -> fluentd -> node/pods metrics to MDM
- Container status/Telegraf -> fluent bit -> Telegraf metrics, alerting metrics (memoryRss) to MDM
- Custom (Log-based) metrics are transmitted from logs before sending to MDM

## Linux Metrics Log Paths

| Component | Log Path |
|--|--|
| cAdvisor | /var/opt/microsoft/docker-cimprov/log/kubernetes_perf_log.txt |
| cAdvisor2 MDM | /var/opt/microsoft/docker-cimprov/log/filter_cadvisor2mdm.log |
| Telegraf2 MDM | /var/opt/microsoft/docker-cimprov/log/filter_telegraf2mdm.log |
| Inventory2MDM | /var/opt/microsoft/docker-cimprov/log/filter_inventory2mdm.log |
| Fluentd | /var/opt/microsoft/docker-cimprov/log/fluentd.log |
| Fluent bit | /var/opt/microsoft/docker-cimprov/log/fluent-bit.log, fluent-bit-out-oms-runtime.log |
| Alerting metric | configmap: `kubectl get configmaps container-azm-ms-agentconfig -o yaml -n kube-system` |

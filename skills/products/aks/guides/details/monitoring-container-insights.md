# AKS Container Insights 与 Log Analytics -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 1 | **Kusto queries**: 1
**Source drafts**: onenote-container-insights-log-collection.md
**Kusto references**: blackbox-monitoring.md
**Generated**: 2026-04-07

---

## Phase 1: ama-logs pods (daemonset or replicaset) not runnin

### aks-695: Container Insights tables (ContainerInventory, ContainerLog, InsightsMetrics, et...

**Root Cause**: ama-logs pods (daemonset or replicaset) not running, or component failures in the data pipeline: Fluentd (container/K8s inventory), Fluent-bit (container logs), Telegraf (metrics), or MDSD (data export to LA). Also requires cluster to use managed identity (not service principal) - AMA only supports MSI for token/data send.

**Solution**:
1) Verify ama-logs pods running (daemonset + deployment). 2) Confirm cluster uses managed identity, not service principal. 3) Check component logs by table: ContainerInventory->Fluentd (/var/opt/microsoft/docker-cimprov/log/fluentd.log), ContainerLog->Fluent-bit (/var/opt/microsoft/docker-cimprov/log/fluent-bit.log), InsightsMetrics->Telegraf (stderr), all->MDSD (/var/opt/microsoft/linuxmonagent/log/mdsd.*). 4) For Azure Managed Prometheus (ama-metrics pods): check ama-metrics daemonset and deployments in kube-system.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FContainer%20Insights)]`

## Phase 2: Default Fluent-bit config has conservative memory 

### aks-048: Container Insights logs incomplete with high latency (38min-2h50min); fluent-bit...

**Root Cause**: Default Fluent-bit config has conservative memory buffer (tail_mem_buf_limit=10MB). High-volume log workloads fill buffer causing tail input pause, log gaps and high ingestion latency.

**Solution**:
1) Deploy configmap (aka.ms/container-azm-ms-agentconfig) to tune: log_flush_interval_secs=1, increase tail_mem_buf_limit, tail_buf_chunksize, tail_buf_maxsize. 2) WARNING: higher settings increase ama pod CPU/memory, may cause OOM. 3) Increase ama pod resource limits if needed. 4) Internal: PG can increase limits from backend.

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: Mooncake Portal had not updated AKS resource provi

### aks-232: Azure Portal cannot enable Container Insights (Monitoring addon) for AKS cluster...

**Root Cause**: Mooncake Portal had not updated AKS resource provider API version; Portal uses api-version=2019-11-01 while CLI uses 2021-03-01. The older API version does not expose monitoring addon configuration

**Solution**:
Use Azure CLI to enable Container Insights: 'az aks enable-addons -a monitoring -n <cluster> -g <rg>'. CLI uses newer API versions that support the addon. Portal fix requires Mooncake Portal team to update AKS blade API version

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Container Insights tables (ContainerInventory, ContainerLog, InsightsMetrics, et... | ama-logs pods (daemonset or replicaset) not running, or comp... | 1) Verify ama-logs pods running (daemonset + deployment). 2)... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FContainer%20Insights) |
| 2 | Container Insights logs incomplete with high latency (38min-2h50min); fluent-bit... | Default Fluent-bit config has conservative memory buffer (ta... | 1) Deploy configmap (aka.ms/container-azm-ms-agentconfig) to... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Azure Portal cannot enable Container Insights (Monitoring addon) for AKS cluster... | Mooncake Portal had not updated AKS resource provider API ve... | Use Azure CLI to enable Container Insights: 'az aks enable-a... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

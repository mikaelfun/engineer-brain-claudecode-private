# Monitor 容器监控与 Container Insights - Comprehensive Troubleshooting Guide

**Entries**: 42 | **Drafts fused**: 16 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-azure-container-apps.md, ado-wiki-a-Enabling-SSH-access-to-an-App-Service-container-app.md, ado-wiki-a-profiler-for-container-apps.md, ado-wiki-b-prometheus-architecture.md, ado-wiki-b-tsg-container-insights-general.md, ado-wiki-b-tsg-container-insights-missing-logs.md, ado-wiki-b-TSG-Requests-to-Increase-Managed-Prometheus-Limits.md, ado-wiki-c-check-container-insights-logs.md, ado-wiki-c-collect-prometheus-logs.md, ado-wiki-c-filter-container-insights-tables.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Deleting the Log Analytics workspace linked to AKS Defender sensor, then restarting the AKS cluster causes the cluster to report ARM resource not found error, unable to connect to API server. Clust...

**Solution**: If AKS has NOT been restarted after workspace deletion: (1) For Monitor addon: disable monitoring addon or recreate the exact same Log Analytics workspace. (2) For Defender: run 'az aks update --disable-defender' then 'az aks update --enable-defender'. To change Defender workspace: use --defender...

`[Source: OneNote, Score: 9.0]`

### Step 2: Container Insights logs incomplete with high ingestion latency. fluent-bit.log shows '[warn] [input] tail.0 paused(mem buf overlimit)' warnings repeatedly. E2E ingestion delay can reach hours.

**Solution**: Deploy container-azm-ms-agentconfig ConfigMap with adjusted fluent-bit parameters: log_flush_interval_secs=1 (default 15), tail_mem_buf_limit_megabytes=10, tail_buf_chunksize_megabytes=1, tail_buf_maxsize_megabytes=1, tail_ignore_older=5m. Warning: increasing limits raises ama pod CPU/memory usag...

`[Source: OneNote, Score: 9.0]`

### Step 3: ama-logs daemonset/replicaset pods experiencing OOMKill and frequent restarts in AKS Container Insights.

**Solution**: Apply container-azm-ms-agentconfig ConfigMap with tuned mdsd_config settings: monitoring_max_event_rate=50000 (default 20K eps), backpressure_memory_threshold_in_mb=1500 (default 3500MB), upload_max_size_in_mb=10 (default 2MB), upload_frequency_seconds=1 (default 60), compression_level=0. Steps: ...

`[Source: OneNote, Score: 9.0]`

### Step 4: Need to collect Container Insights agent logs for troubleshooting ama-logs issues (missing data, high latency, pod crashes).

**Solution**: Use official log collection tool: wget https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/scripts/troubleshoot/LogCollection/AgentLogCollection.sh && bash ./AgentLogCollection.sh. Prerequisites: Linux/bash environment connected to AKS cluster with kube-system namespace permission...

`[Source: OneNote, Score: 9.0]`

### Step 5: Container Insights shows no data or incorrect metrics in AKS Insights blade. ama-logs pods show connection errors in fluentd.log.

**Solution**: Check live data vs kubectl. Login to ama-logs-rs pod, check fluentd.log. Test endpoint: curl -v global.handler.control.monitor.azure.cn. Configure firewall/DNS to allow AMA endpoints. Collect logs via kubectl cp.

`[Source: OneNote, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Deleting the Log Analytics workspace linked to AKS Defender sensor, then rest... | AKS has two types of linked Log Analytics workspaces: Monitor addon and Defen... | If AKS has NOT been restarted after workspace deletion: (1) For Monitor addon... | 9.0 | OneNote |
| 2 | Container Insights logs incomplete with high ingestion latency. fluent-bit.lo... | Default fluent-bit configuration in ama-logs agent has conservative memory bu... | Deploy container-azm-ms-agentconfig ConfigMap with adjusted fluent-bit parame... | 9.0 | OneNote |
| 3 | ama-logs daemonset/replicaset pods experiencing OOMKill and frequent restarts... | Default ama-logs pod resource limits are insufficient for high-volume log col... | Apply container-azm-ms-agentconfig ConfigMap with tuned mdsd_config settings:... | 9.0 | OneNote |
| 4 | Need to collect Container Insights agent logs for troubleshooting ama-logs is... | - | Use official log collection tool: wget https://raw.githubusercontent.com/micr... | 9.0 | OneNote |
| 5 | Container Insights shows no data or incorrect metrics in AKS Insights blade. ... | Firewall or private DNS blocking AMA/Container Insights required endpoints (g... | Check live data vs kubectl. Login to ama-logs-rs pod, check fluentd.log. Test... | 9.0 | OneNote |
| 6 | Customer using Log Analytics workspace to monitor AKS wants to know how much ... | Standard Usage table shows total workspace-level data but does not break down... | Use KQL: (1) Usage table for total billable GB: Usage / where IsBillable == t... | 9.0 | OneNote |
| 7 | Prometheus rule group updates not taking effect after modification - changes ... | Synchronizer component (ModifiedRuleGroupIdsSynchronizerRunner / RuleGroupsSy... | 1) Query AlertRuleTelemtry in Azalertsprodweu/Insights with RuleArmId to get ... | 8.5 | ADO Wiki |
| 8 | Prometheus/PromQL-based metric alert fired but expression returns no data whe... | Data latency issue — at evaluation time, delayed data satisfied the alert con... | Customer can add an offset modifier of 1-2 minutes to their PromQL rule query... | 8.5 | ADO Wiki |
| 9 | Prometheus/Query-based Metric alert didn't fire when it should have (missed a... | Data latency issue: at evaluation time, Prometheus metric store returned 0 ti... | Customer can add offset modifier (1-2 minutes) to the PromQL expression per P... | 8.5 | ADO Wiki |
| 10 | Prometheus rule group creation fails with 'Resource not found' or 'Target sco... | Azure Monitor workspace (monitoring account) does not exist, was moved to a d... | Verify: (1) Target Azure Monitor workspace exists and use the correct resourc... | 8.5 | ADO Wiki |
| 11 | Prometheus rule group creation/update fails with expression syntax error or p... | Invalid PromQL expression syntax or rule group property values outside allowe... | For syntax errors: refer customer to Prometheus.io querying/basics documentat... | 8.5 | ADO Wiki |
| 12 | Prometheus alert didn't fire — PromQL expression returns no data in the value... | The PromQL expression's comparator condition is not met by the actual metric ... | Remove the comparator from the expression and re-run to see raw values. Compa... | 8.5 | ADO Wiki |
| 13 | Prometheus alert didn't fire — expression returns data but Execution History ... | Data latency issue: at the time of evaluation, the Prometheus engine received... | Customer can add an offset modifier of 1-2 minutes to the rule query (see Pro... | 8.5 | ADO Wiki |
| 14 | Prometheus/Query Metric alert missed - expression returns data later but aler... | Data latency: at evaluation time Prometheus metric store returned 0 timeserie... | Add offset modifier (1-2 min) to PromQL expression: rate(metric[5m] offset 2m... | 8.5 | ADO Wiki |
| 15 | Prometheus rule group creation fails with Resource not found or Target scope ... | Azure Monitor workspace does not exist, was moved, or is in a different regio... | Verify: (1) Target AMW exists with correct resource ID. (2) Rule group and AM... | 8.5 | ADO Wiki |
| 16 | Container Insights with Managed Identity on a Private AKS cluster has DCR and... | Private Link is not properly configured for the private AKS cluster. The agen... | Verify and configure Private Link setup for the private AKS cluster following... | 8.5 | ADO Wiki |
| 17 | Container Insights agent not sending data; curl to monitoring endpoints (*.od... | Network appliance or proxy is performing HTTP/SSL inspection on Container Ins... | Configure network firewall/proxy to exempt Container Insights endpoints from ... | 8.5 | ADO Wiki |
| 18 | Container Insights agent processes (fluentd, fluent-bit, or mdsd) not running... | One or more Container Insights agent component processes (fluentd, fluent-bit... | Delete the affected ama-logs pod to trigger recreation: kubectl delete pod am... | 8.5 | ADO Wiki |
| 19 | "NO DATA" displayed on Azure Managed Grafana dashboard using Managed Promethe... | Azure Monitor Workspace (AMW) has public network access disabled, blocking Gr... | Enable private access via Private Endpoint between Grafana and AMW, or change... | 8.5 | ADO Wiki |
| 20 | "NO DATA" on Azure Managed Grafana dashboard; Managed Prometheus data source ... | Browser ad blocker extension blocks API calls from Grafana UI to Azure Monito... | Pause or disable the ad blocker extension in the browser, then refresh the Gr... | 8.5 | ADO Wiki |
| 21 | Container Insights ama-logs pods experiencing high CPU or memory usage exceed... | Current workload (log volume, InsightsMetrics scale) exceeded default memory/... | Query Log Analytics to verify CPU/memory usage against default limits using P... | 8.5 | ADO Wiki |
| 22 | Fluent-bit built-in multiline Java parser does not support custom exceptions ... | Known limitation - Fluent-bit built-in multiline Java parser only supports st... | This is a known limitation (by design). Custom Java exceptions are not suppor... | 8.5 | ADO Wiki |
| 23 | Container Insights multiline logging does not stitch arbitrary log lines toge... | By design - multiline logging feature only stitches exception call stack trac... | This is by design. Multiline logging only supports stitching exception call s... | 8.5 | ADO Wiki |
| 24 | Container Insights identified as root cause for high data ingestion into Log ... | By default Container Insights collects all logs (stdout, stderr, environment ... | Multiple mitigation options: 1) Use cost optimization feature (requires Manag... | 8.5 | ADO Wiki |
| 25 | Container Insights Insights page in Azure Portal shows no data but Log Analyt... | Network isolation settings on the Log Analytics Workspace have public access ... | Check the network isolation settings on the Log Analytics Workspace and enabl... | 8.5 | ADO Wiki |
| 26 | Container Insights logs appear intermittently or stop being collected; some t... | Log Analytics Workspace has a daily cap (daily ingestion limit) configured; o... | Run query: _LogOperation / where TimeGenerated >= ago(7d) / search 'OverQuota... | 8.5 | ADO Wiki |
| 27 | Azure Managed Grafana cannot connect to MySQL or PostgreSQL databases running... | Services running inside AKS pods are not directly accessible from Azure Manag... | Deploy a Kubernetes Service with type LoadBalancer and azure-pls annotations ... | 8.5 | ADO Wiki |
| 28 | Container Insights data missing from ContainerLog/ContainerLogV2 or KubeMonAg... | Fluent-Bit memory buffer limit is too low for the volume of logs being genera... | Increase Fluent-Bit memory buffer limit via ConfigMap (agent_settings.fbit_co... | 8.5 | ADO Wiki |
| 29 | ama-logs pods in CrashLoopBackOff with no ContainerLogV2 logs ingested. Fluen... | Node file descriptor limit (fs.file-max or inotify) is too low for the number... | For AKS clusters: create new node pool with custom kernel parameters to incre... | 8.5 | ADO Wiki |
| 30 | Annotation fluentbit.io/exclude true is present on pods but Container Insight... | Container Insights agent does not follow Fluent Bit annotations by default. A... | Enable annotation filtering in ConfigMap: set [log_collection_settings.filter... | 8.5 | ADO Wiki |
| 31 | Missing data or gaps in KubePodInventory, KubeNodeInventory, KubeEvents, Cont... | Known issue in the ruby plugin (Fluentd in ama-logs-rs) parsing large JSON pa... | Configure smaller PODS_CHUNK_SIZE in container-azm-ms-agentconfig ConfigMap: ... | 8.5 | ADO Wiki |
| 32 | Missing logs, InsightsMetrics, and Prometheus metrics in Container Insights f... | Firewall rules blocking outbound connections from AKS cluster to required Azu... | Add firewall rules (Azure Firewall Application Rule Collection or on-premise)... | 8.5 | ADO Wiki |
| 33 | Container Insights data missing on AKS cluster configured with HTTP Proxy. am... | HTTP Proxy configuration on AKS cluster interfering with Container Insights a... | Apply ConfigMap for CI Agent to ignore proxy configuration: download containe... | 8.5 | ADO Wiki |
| 34 | Missing logs and metrics in Container Insights and Prometheus on AKS cluster ... | AMPLS misconfiguration for Container Insights and Managed Prometheus - missin... | Reconfigure AMPLS: create private link connection through Azure portal, ensur... | 8.5 | ADO Wiki |
| 35 | Intermittent or missing Container Insights data in Log Analytics workspace. C... | Log Analytics workspace daily cap is being reached, causing all subsequent da... | Query: _LogOperation / where TimeGenerated >= ago(7d) / search OverQuota to c... | 8.5 | ADO Wiki |
| 36 | IIS logs not appearing in ContainerLogV2 in Log Analytics for IIS deployed in... | IIS writes W3C access logs to files inside the container (e.g. C:\\inetpub\\l... | Use Microsoft-supported LogMonitor (Windows Container Tools) to forward IIS W... | 8.5 | ADO Wiki |
| 37 | Azure Managed Grafana cannot connect to MySQL or PostgreSQL databases running... | Services running inside AKS pods are not directly accessible from Azure Manag... | Deploy a Kubernetes Service with type LoadBalancer and azure-pls annotations ... | 8.5 | ADO Wiki |
| 38 | Managed Prometheus no longer reports metric labels from kube-state-metrics jo... | The metricLabelsAllowlist in the AKS cluster azureMonitorProfile is empty or ... | Run az aks show to check azureMonitorProfile.metricLabelsAllowlist. If empty,... | 8.5 | ADO Wiki |
| 39 | All Managed Prometheus scrape jobs succeed except the node job which shows fa... | The node-exporter service is not running on AKS cluster nodes. Typically caus... | 1) Check VMSS Extensions tab for AKSLinuxExtension - if missing engage AKS te... | 8.5 | ADO Wiki |
| 40 | Need guidance on proper alerting thresholds for AKS ETCD database size to pre... | - | Set alert when ETCD DB size exceeds 2GiB (indicates room for optimization and... | 8.0 | OneNote |
| 41 | "NO DATA" on Azure Managed Grafana dashboard with Managed Prometheus; AMW res... | The Azure Monitor Workspace subscription is not included in the user default ... | Add the AMW subscription to the default subscriptions list in Azure portal (S... | 7.5 | ADO Wiki |
| 42 | Syslog data not appearing in Log Analytics after enabling syslog collection i... | HostPort functionality is not enabled by default when using Cilium enterprise... | Verify HostPort status: exec into ama-logs pod, run netstat -a / grep 28330 a... | 7.5 | ADO Wiki |

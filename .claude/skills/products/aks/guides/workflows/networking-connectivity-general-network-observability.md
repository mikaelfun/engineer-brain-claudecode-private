# AKS 网络连通性通用 — network-observability — 排查工作流

**来源草稿**: ado-wiki-a-Network-Observability-Kappie.md, ado-wiki-aks-network-observability-byo-prometheus-grafana.md, ado-wiki-b-Planned-Maintenance-Windows.md, ado-wiki-collecting-procdumps-from-windows-pods.md, ado-wiki-d-Retina-Operator.md, ado-wiki-windows-host-process-container.md, mslearn-capture-container-dump-windows.md
**Kusto 引用**: 无
**场景数**: 7
**生成日期**: 2026-04-07

---

## Scenario 1: Network Observability (Kappie)
> 来源: ado-wiki-a-Network-Observability-Kappie.md | 适用: 适用范围未明确

### 排查步骤

#### Network Observability (Kappie)


#### Overview

Network Observability (Previously called Kappie internally) is an interface to kubernetes cluster network traffic. It generates additional metrics that can then be ingested into other tooling. Right now, it will be scraped by Managed Prometheus and shown by Managed Graphana (Owned by the Monitoring team). However, it is intended for the metrics to be accessible by any monitoring solution/tooling.  It can also be used to run packet captures on clusters.

#### Pre-requisites

To determine if a cluster as Network Observability enabled, check the following property in ASI.

#### Scenarios

##### **I'm not seeing any metrics shown in Azure Monitor**

Refer to the metrics troubleshooting guide for more information.

##### **I'm having trouble running a network capture**

Refer to the capture troubleshooting guide for more information.

#### Escalation Paths

The path we would go depends on the type of issue seen.

- Extension addition/removal issues - AKS EEE/PG ICM (our normal process)
- Metrics collection, ACNS/kappie pod issues - ICM to Cloudnet/containernetworking
- Metric scraping for Managed Prometheus/Graphana - Collab to Monitoring team

---

## Scenario 2: AKS Network Observability - BYO Prometheus and Grafana example
> 来源: ado-wiki-aks-network-observability-byo-prometheus-grafana.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Network Observability - BYO Prometheus and Grafana example

#### Summary

AKS Network Observability addon has two options:
- Azure managed Prometheus and Grafana
- **BYO Prometheus and Grafana** (customer-managed, outside support scope, best-effort assistance)

This guide covers setup using kube-prometheus-stack helm chart.

#### Prerequisites

- Enable `aks-preview` CLI extension
- Register `NetworkObservabilityPreview` feature flag
- An existing AKS cluster

#### Setup Steps

##### 1. Enable Network Observability

Follow official docs: https://learn.microsoft.com/en-us/azure/aks/network-observability-byo-cli

##### 2. Install kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

Check status:
```bash
kubectl -n monitoring get all
```

##### 3. Add Custom Scrape Configs for Kappie Pods

Create `prom-custom-values.yaml`:

```yaml
prometheus:
  prometheusSpec:
    additionalScrapeConfigs:
      - job_name: "network-obs-pods"
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_container_name]
            action: keep
            regex: kappie(.*)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            separator: ":"
            regex: ([^:]+)(?::\d+)?
            target_label: __address__
            replacement: ${1}:${2}
            action: replace
          - source_labels: [__meta_kubernetes_pod_node_name]
            action: replace
            target_label: instance
        metric_relabel_configs:
          - source_labels: [__name__]
            action: keep
            regex: (.*)
```

Upgrade release:
```bash
helm upgrade prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f prom-custom-values.yaml
```

##### 4. Verify Prometheus Targets

```bash
kubectl port-forward -n monitoring prometheus-prometheus-kube-prometheus-prometheus-0 9090
```
Open http://localhost:9090 -> Status -> Targets -> verify `network-obs-pods` targets exist for each node.

##### 5. Configure Grafana Dashboard

```bash
GRAFANA_POD=$(kubectl -n monitoring get po -l app.kubernetes.io/name=grafana -o=jsonpath='{.items..metadata.name}')
kubectl port-forward -n monitoring $GRAFANA_POD 3000
```

- Default credentials: admin / prom-operator
- Import dashboard JSON from: https://raw.githubusercontent.com/Azure/azure-container-networking/master/cns/doc/examples/metrics/grafana.json
- Go to Home -> Dashboard -> Import

---

## Scenario 3: Planned Maintenance Configuration for AKS Clusters
> 来源: ado-wiki-b-Planned-Maintenance-Windows.md | 适用: 适用范围未明确

### 排查步骤

#### Planned Maintenance Configuration for AKS Clusters

#### Overview

Azure periodically performs updates to improve reliability, performance, and security of AKS cluster host infrastructure. The pre-created public maintenance configurations are provisioned using Maintenance Resource Provider (MRP) and can be assigned to AKS clusters as maintenance windows for weekly maintenance.

- Canary region clusters can only use canary region maintenance configurations
- Prod region clusters should use prod region maintenance configurations

#### Types of Maintenance

1. Maintenance that doesn't require a reboot
2. Maintenance that requires a reboot

##### Pre-created Public Maintenance Configurations

Two general kinds:

1. **Weekday** (Mon-Thu), from 10 pm to 6 am next morning
2. **Weekend** (Fri-Sun), from 10 pm to 6 am next morning

Naming convention:
- Prod: `aks-mrp-cfg-weekday_utc{offset}` / `aks-mrp-cfg-weekend_utc{offset}`
- Canary: `aks-mrp-cfg-weekday_utc{offset}-estus2euap`

#### How-To: Assign/List/Delete Maintenance Configuration

##### Assign

1. Find public maintenance config ID:
   ```bash
   az maintenance public-configuration show --resource-name "aks-mrp-cfg-weekday_utc8"
   ```

2. Assign to AKS cluster:
   ```bash
   az maintenance assignment create \
     --maintenance-configuration-id "{configId}" \
     --name assignmentName \
     --provider-name "Microsoft.ContainerService" \
     --resource-group resourceGroupName \
     --resource-name resourceName \
     --resource-type "managedClusters"
   ```

##### List
```bash
az maintenance assignment list \
  --provider-name "Microsoft.ContainerService" \
  --resource-group resourceGroupName \
  --resource-name resourceName \
  --resource-type "managedClusters"
```

##### Delete
```bash
az maintenance assignment delete \
  --name assignmentName \
  --provider-name "Microsoft.ContainerService" \
  --resource-group resourceGroupName \
  --resource-name resourceName \
  --resource-type "managedClusters"
```

#### Investigation Kusto Queries

##### Find Maintenance Configuration operations

```kusto
union cluster('aks').database('AKSprod').FrontEndContextActivity, cluster('aks').database('AKSprod').AsyncContextActivity
| where PreciseTimeStamp between (datetime(startDate)..datetime(endDate))
| where subscriptionID has "{SUBID}"
| extend Message = parse_json(msg)
| where Message contains "maintenance configuration request body"
| project PreciseTimeStamp, level, msg, namespace, correlationID, operationID
| take 10
```

##### Match auto-upgrade execution times

```kusto
cluster('aks.kusto.windows.net').database('AKSprod').AutoUpgraderEvents
| where PreciseTimeStamp between (datetime(startDate)..datetime(endDate))
| where subscriptionID has "{SUBID}"
| where msg !contains "Is upgrader running: true"
  and msg !contains "Is operation count cache running: true"
  and msg !contains "upgrader healthz returns: true"
  and msg !contains "auto-upgrade-operation-count-cache-sync-interval"
```

##### Check MRP assignment/deletion events

```kusto
cluster('Aks').database('AKSprod').MaintenanceConfigEvent
| where msg contains "ARN" and msg contains "has been handled"
  and msg contains "{AKS Cluster URI}"
| project TIMESTAMP, msg
```

- Assignment: event type `Microsoft.Maintenance/configurationAssignments/write`
- Deletion: event type `Microsoft.Maintenance/configurationAssignments/delete`

Also check `OverlaymgrEvents` for overlay manager MRP consumption: search "MRP maintenance configuration" in logs.

#### References

- https://docs.microsoft.com/en-us/azure/aks/planned-maintenance
- https://docs.microsoft.com/en-us/azure/aks/auto-upgrade-cluster

---

## Scenario 4: Troubleshooting Flow
> 来源: ado-wiki-collecting-procdumps-from-windows-pods.md | 适用: 适用范围未明确

### 排查步骤

1. **Exec into the Windows pod**:
   ```ps
   kubectl exec -it [WINDOWS-POD-NAME] -- powershell
   ```

2. **Create a temp folder**:
   ```ps
   cd\
   md temp
   ```

3. **Download and extract Procdump**:
   ```ps
   Invoke-WebRequest -UseBasicParsing -Uri https://download.sysinternals.com/files/Procdump.zip -OutFile C:\temp\procdump.zip
   cd temp
   Expand-Archive .\procdump.zip
   cd .\procdump\
   ```

4. **List processes**:
   ```ps
   Get-Process
   ```

5. **Run procdump** (3 dumps at 5s intervals):
   ```ps
   .\procdump.exe -ma PROCESS_ID -s 5 -n 3 -64 -accepteula
   ```

6. **Copy dump off the pod**:
   ```ps
   kubectl cp namespace/podName:/temp/procdump/filename.dmp /folder/filename.dmp
   ```

Reference: https://kubernetes.io/docs/reference/kubectl/cheatsheet/#copying-files-and-directories-to-and-from-containers

---

## Scenario 5: Retina Operator TSG
> 来源: ado-wiki-d-Retina-Operator.md | 适用: 适用范围未明确

### 排查步骤

#### Retina Operator TSG

#### Known Issues

##### Pod Restarts

Restarting due to failure to acquire lease. This seems to always be infrequent. It is harmless so long as the Pod is not in CrashLoop:

```shell
level=error msg="error retrieving resource lock kube-system/cilium-operator-resource-lock
```

Full logs:

```shell
2024-05-04T05:49:27.229369172Z level=info msg="Reusing existing global key" key="k8s:app.kubernetes.io/name=hubble-relay;k8s:app.kubernetes.io/part-of=retina;k8s:io.cilium.k8s.namespace.labels.addonmanager.kubernetes.io/mode=Reconcile;k8s:io.cilium.k8s.namespace.labels.control-plane=true;k8s:io.cilium.k8s.namespace.labels.kubernetes.azure.com/managedby=aks;k8s:io.cilium.k8s.namespace.labels.kubernetes.io/cluster-service=true;k8s:io.cilium.k8s.namespace.labels.kubernetes.io/metadata.name=kube-system;k8s:io.cilium.k8s.policy.cluster=default;k8s:io.cilium.k8s.policy.serviceaccount=hubble-relay;k8s:io.kubernetes.pod.namespace=kube-system;k8s:k8s-app=hubble-relay;k8s:kubernetes.azure.com/managedby=aks;k8s:pod-template-hash=6c6879b456;" subsys=allocator
2024-05-04T05:49:30.029587250Z level=info msg="Reusing existing global key" key="k8s:io.cilium.k8s.namespace.labels.addonmanager.kubernetes.io/mode=Reconcile;k8s:io.cilium.k8s.namespace.labels.control-plane=true;k8s:io.cilium.k8s.namespace.labels.kubernetes.azure.com/managedby=aks;k8s:io.cilium.k8s.namespace.labels.kubernetes.io/cluster-service=true;k8s:io.cilium.k8s.namespace.labels.kubernetes.io/metadata.name=kube-system;k8s:io.cilium.k8s.policy.cluster=default;k8s:io.cilium.k8s.policy.serviceaccount=ama-metrics-serviceaccount;k8s:io.kubernetes.pod.namespace=kube-system;k8s:kubernetes.azure.com/managedby=aks;k8s:pod-template-hash=9f5b8b46f;k8s:rsName=ama-metrics;" subsys=allocator
2024-05-04T07:02:17.939757274Z level=info msg="Trace[1299586499]: \"Reflector ListAndWatch\" name:github.com/cilium/cilium/pkg/k8s/resource/resource.go:725 (04-May-2024 07:02:05.907) (total time: 12032ms):" subsys=klog
2024-05-04T07:02:17.939793875Z level=info msg="Trace[1299586499]: ---\"Objects listed\" error:<nil> 12031ms (07:02:17.939)" subsys=klog
2024-05-04T07:02:17.939799375Z level=info msg="Trace[1299586499]: [12.032055312s] [12.032055312s] END" subsys=klog
2024-05-04T07:02:38.035220989Z level=info msg="Trace[1835175822]: \"Reflector ListAndWatch\" name:github.com/cilium/cilium/pkg/k8s/resource/resource.go:725 (04-May-2024 07:02:21.999) (total time: 16035ms):" subsys=klog
2024-05-04T07:02:38.035258589Z level=info msg="Trace[1835175822]: ---\"Objects listed\" error:<nil> 16035ms (07:02:38.034)" subsys=klog
2024-05-04T07:02:38.035365291Z level=info msg="Trace[1835175822]: [16.035742871s] [16.035742871s] END" subsys=klog
2024-05-04T10:37:51.503433177Z error retrieving resource lock kube-system/cilium-operator-resource-lock: Get "https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s": net/http: request canceled (Client.Timeout exceeded while awaiting headers)
2024-05-04T10:37:51.503483278Z level=error msg="error retrieving resource lock kube-system/cilium-operator-resource-lock: Get \"https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s\": net/http: request canceled (Client.Timeout exceeded while awaiting headers)" subsys=klog
2024-05-04T11:06:38.019564121Z error retrieving resource lock kube-system/cilium-operator-resource-lock: Get "https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s": net/http: request canceled (Client.Timeout exceeded while awaiting headers)
2024-05-04T11:06:38.019834825Z level=error msg="error retrieving resource lock kube-system/cilium-operator-resource-lock: Get \"https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s\": net/http: request canceled (Client.Timeout exceeded while awaiting headers)" subsys=klog
2024-05-04T15:09:31.968717505Z error retrieving resource lock kube-system/cilium-operator-resource-lock: Get "https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s": net/http: request canceled (Client.Timeout exceeded while awaiting headers)
2024-05-04T15:09:31.968752906Z level=error msg="error retrieving resource lock kube-system/cilium-operator-resource-lock: Get \"https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s\": net/http: request canceled (Client.Timeout exceeded while awaiting headers)" subsys=klog
2024-05-04T19:19:32.145507192Z error retrieving resource lock kube-system/cilium-operator-resource-lock: Get "https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s": context deadline exceeded (Client.Timeout exceeded while awaiting headers)
2024-05-04T19:19:32.145636194Z level=error msg="error retrieving resource lock kube-system/cilium-operator-resource-lock: Get \"https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s\": context deadline exceeded (Client.Timeout exceeded while awaiting headers)" subsys=klog
2024-05-04T23:21:54.531129412Z Failed to update lock: Put "https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s": net/http: request canceled (Client.Timeout exceeded while awaiting headers)
2024-05-04T23:21:54.531333315Z level=error msg="Failed to update lock: Put \"https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s\": net/http: request canceled (Client.Timeout exceeded while awaiting headers)" subsys=klog
2024-05-05T00:59:12.180751591Z Failed to update lock: Put "https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s": net/http: request canceled (Client.Timeout exceeded while awaiting headers)
2024-05-05T00:59:12.180816992Z level=error msg="Failed to update lock: Put \"https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s\": net/http: request canceled (Client.Timeout exceeded while awaiting headers)" subsys=klog
2024-05-05T02:04:40.467455983Z error retrieving resource lock kube-system/cilium-operator-resource-lock: Get "https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s": net/http: request canceled (Client.Timeout exceeded while awaiting headers)
2024-05-05T02:04:40.467500083Z level=error msg="error retrieving resource lock kube-system/cilium-operator-resource-lock: Get \"https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s\": net/http: request canceled (Client.Timeout exceeded while awaiting headers)" subsys=klog
2024-05-05T02:04:45.467415511Z error retrieving resource lock kube-system/cilium-operator-resource-lock: Get "https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s": context deadline exceeded
2024-05-05T02:04:45.467438311Z level=error msg="error retrieving resource lock kube-system/cilium-operator-resource-lock: Get \"https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s\": context deadline exceeded" subsys=klog
2024-05-05T02:04:45.467453212Z level=info msg="failed to renew lease kube-system/cilium-operator-resource-lock: timed out waiting for the condition" subsys=klog
2024-05-05T02:04:50.468397192Z Failed to release lock: Put "https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s": net/http: request canceled (Client.Timeout exceeded while awaiting headers)
2024-05-05T02:04:50.468421492Z level=error msg="Failed to release lock: Put \"https://hgregory-04-30-hgregory-04-30-9b8218-jgfgne74.hcp.eastus2euap.azmk8s.io:443/apis/coordination.k8s.io/v1/namespaces/kube-system/leases/cilium-operator-resource-lock?timeout=5s\": net/http: request canceled (Client.Timeout exceeded while awaiting headers)" subsys=klog
2024-05-05T02:04:50.468426992Z level=info msg="Leader election lost" operator-id=retina-operator-9dc666d85-c5whz-SJHHZtUhQP subsys=retina-operator
2024-05-05T02:04:50.468529993Z level=info msg=Stopping subsys=hive
2024-05-05T02:04:50.468688595Z level=info msg="Stop hook executed" duration="19.4�s" function="*endpointgc.GC.Stop" subsys=hive
2024-05-05T02:04:50.468909298Z level=info msg="Stop hook executed" duration="187.503�s" function="*resource.resource[*v1.Pod].Stop" subsys=hive
2024-05-05T02:04:50.469139300Z level=info msg="Stop hook executed" duration="156.502�s" function="*resource.resource[*cilium.io/v2.CiliumNode].Stop" subsys=hive
2024-05-05T02:04:50.469277702Z level=info msg="Stop hook executed" duration="34.001�s" function="identitygc.registerGC.func2 (workspace/vendor/github.com/cilium/cilium/operator/identitygc/gc.go:135)" subsys=hive
2024-05-05T02:04:50.469294902Z level=info msg="Stop hook executed" duration="4.1�s" function="*resource.resource[*cilium.io/v2alpha1.CiliumEndpointSlice].Stop" subsys=hive
2024-05-05T02:04:50.469469504Z level=info msg="Stop hook executed" duration="154.402�s" function="*resource.resource[*cilium.io/v2.CiliumIdentity].Stop" subsys=hive
2024-05-05T02:04:50.469487904Z level=info msg="stop reconciling Pods for CiliumEndpoints" component=endpointcontroller subsys=endpointcontroller
2024-05-05T02:04:50.469497804Z level=info msg="Stop hook executed" duration="37.401�s" function="*endpointcontroller.endpointReconciler.Stop" subsys=hive
2024-05-05T02:04:50.469677306Z level=info msg="Stop hook executed" duration="117.101�s" function="*resource.resource[*cilium.io/v2.CiliumEndpoint].Stop" subsys=hive
2024-05-05T02:04:50.469748807Z {"level":"info","ts":"2024-05-05T02:04:50Z","msg":"Stopping and waiting for non leader election runnables"}
2024-05-05T02:04:50.469762707Z {"level":"info","ts":"2024-05-05T02:04:50Z","msg":"Stopping and waiting for leader election runnables"}
2024-05-05T02:04:50.469767707Z {"level":"info","ts":"2024-05-05T02:04:50Z","msg":"Shutdown signal received, waiting for all workers to finish","controller":"pod","controllerGroup":"","controllerKind":"Pod"}
2024-05-05T02:04:50.469772507Z {"level":"info","ts":"2024-05-05T02:04:50Z","msg":"All workers finished","controller":"pod","controllerGroup":"","controllerKind":"Pod"}
2024-05-05T02:04:50.469780907Z {"level":"info","ts":"2024-05-05T02:04:50Z","msg":"Stopping and waiting for caches"}
2024-05-05T02:04:50.469900708Z {"level":"info","ts":"2024-05-05T02:04:50Z","msg":"Stopping and waiting for webhooks"}
2024-05-05T02:04:50.469908608Z {"level":"info","ts":"2024-05-05T02:04:50Z","msg":"Stopping and waiting for HTTP servers"}
2024-05-05T02:04:50.469913209Z {"level":"info","ts":"2024-05-05T02:04:50Z","logger":"controller-runtime.metrics","msg":"Shutting down metrics server with timeout of 1 minute"}
2024-05-05T02:04:50.469998209Z {"level":"info","ts":"2024-05-05T02:04:50Z","msg":"Wait completed, proceeding to shutdown the manager"}
2024-05-05T02:04:50.470076710Z level=info msg="Stop hook executed" duration="331.004�s" function="github.com/Azure/retina-enterprise/pkg/controllers/operator/pod.glob..func2.2 (pkg/controllers/operator/pod/cell.go:32)" subsys=hive
2024-05-05T02:04:50.470085010Z level=info msg="Stop hook executed" duration=1.459916ms function="github.com/Azure/retina-enterprise/operator/cmd.registerOperatorHooks.func2 (cmd/root.go:353)" subsys=hive
2024-05-05T02:04:50.470091711Z level=info msg="Stop hook executed" duration="10.7�s" function="client.(*compositeClientset).onStop" subsys=hive
2024-05-05T02:04:50.470095111Z level=info msg="Stopped pprof server" ip=127.0.0.1 port=6060 subsys=pprof
2024-05-05T02:04:50.470161711Z level=info msg="Stop hook executed" duration="47.901�s" function="*pprof.server.Stop" subsys=hive
2024-05-05T02:04:50.470169711Z level=fatal msg="Leader election lost" subsys=retina-operator
```

#### Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Vijay Rodrigues (VIJAYROD) <vijayrod@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>
- Jeff Martin <jemartin@microsoft.com>

---

## Scenario 6: Windows HostProcess Containers in AKS: Concepts, Use Cases, and Practical Example
> 来源: ado-wiki-windows-host-process-container.md | 适用: 适用范围未明确

### 排查步骤

#### Windows HostProcess Containers in AKS: Concepts, Use Cases, and Practical Example

#### Overview

Windows HostProcess containers run directly in the Windows node's process and filesystem namespace (not inside container isolation). They are the Windows equivalent of privileged DaemonSets on Linux.

Capabilities:
- Access host filesystem
- Use Windows inbox binaries and modules
- Run with SYSTEM privileges
- Modify node-level configuration

#### Implementation Patterns

| Pattern | Use Case |
|---------|----------|
| Pod | One-off troubleshooting/testing |
| DaemonSet | Continuous node agents (monitoring, networking, logging) |
| Job | One-time cluster-wide operations |
| CronJob | Periodic compliance checks, auto-configure new nodes |

#### Required Configuration

```yaml
spec:
  hostNetwork: true
  nodeSelector:
    kubernetes.io/os: windows
  securityContext:
    windowsOptions:
      hostProcess: true
      runAsUserName: "NT AUTHORITY\\SYSTEM"
```

#### Image Selection

- **Server Core** (`mcr.microsoft.com/windows/servercore:ltsc2022`): Includes Windows inbox modules (SmbShare, etc.). Use when interacting with Windows system components.
- **NanoServer**: Smaller but missing inbox modules. Not suitable for admin tasks requiring modules like SmbShare.

#### Practical Example: SMB Client Configuration via CronJob

##### Problem
SMB metadata caching (`DirectoryCacheLifetime`, `FileNotFoundCacheLifetime`) at Windows node level causes stale/inconsistent file visibility when using Azure File shares.

##### Solution
CronJob with HostProcess container to enforce `DirectoryCacheLifetime=0`, `FileNotFoundCacheLifetime=0`:

1. ConfigMap stores idempotent PowerShell script
2. CronJob runs hourly on all Windows nodes
3. Script checks current values before applying changes
4. Logs commands and results for auditability

##### Key Benefits
- Auto-covers new Windows nodes joining the cluster
- No long-running privileged containers
- Simple auditability through pod logs
- Periodic compliance enforcement

#### Key Takeaways

- HostProcess = Windows equivalent of Linux privileged DaemonSet
- Use for OS-level config, not app workloads
- Some cmdlets only in Windows PowerShell 5.1 (not pwsh)
- Scripts should be idempotent
- CronJob preferred over DaemonSet for short-lived admin tasks

#### Reference
- https://learn.microsoft.com/azure/aks/use-windows-hpc

---

## Scenario 7: Troubleshooting Flow
> 来源: mslearn-capture-container-dump-windows.md | 适用: 适用范围未明确

### 排查步骤

##### 1. Add Annotations to Deployment

```yaml
metadata:
  annotations:
    "io.microsoft.container.processdumplocation": "C:\\CrashDumps\\{container_id}"
    "io.microsoft.wcow.processdumptype": "mini"
    "io.microsoft.wcow.processdumpcount": "10"
spec:
  containers:
  - name: containername
    volumeMounts:
      - mountPath: C:\CrashDumps
        name: local-dumps
  volumes:
  - name: local-dumps
    hostPath:
      path: C:\k\containerdumps
      type: DirectoryOrCreate
```

##### 2. Reproduce Issue & Identify Node

```bash
kubectl describe pod -n [NAMESPACE] [POD-NAME]
```

##### 3. Connect to Windows Node (SSH or RDP)

##### 4. Transfer Dump File

- SSH: `scp` via node-debugger proxy
- RDP: `net use z: \\tsclient\c` then copy from `C:\k\containerdumps\`

---

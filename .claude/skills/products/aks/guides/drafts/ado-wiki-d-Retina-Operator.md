---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Monitoring/Network Observability (Kappie)/Advanced/Non-Cilium/Retina Operator"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20%28Kappie%29/Advanced/Non-Cilium/Retina%20Operator"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Retina Operator TSG

## Known Issues

### Pod Restarts

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

## Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Vijay Rodrigues (VIJAYROD) <vijayrod@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>
- Jeff Martin <jemartin@microsoft.com>

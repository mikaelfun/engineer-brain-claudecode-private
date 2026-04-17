# AKS Cilium 网络策略与可观测性 -- Comprehensive Troubleshooting Guide

**Entries**: 15 | **Draft sources**: 5 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Cilium-L3-L4-Network-Policies.md, ado-wiki-a-Cilium-L7-Network-Policies.md, ado-wiki-a-cilium-fqdn-policy.md, ado-wiki-acr-tasks-network-bypass-policy.md, ado-wiki-intro-to-cilium-and-aks.md
**Generated**: 2026-04-07

---

## Phase 1: Calico network policy must be uninstalled before m

### aks-465: AKS migration from kubenet to Azure CNI Overlay fails when networkPolicy=calico ...

**Root Cause**: Calico network policy must be uninstalled before migrating network plugin from kubenet to Azure CNI Overlay; attempting migration with Calico enabled causes error

**Solution**:
1) Disable Calico first: az aks update --network-policy none. 2) Manually delete remaining Calico/tigera-operator CRDs if they persist. 3) Then migrate: az aks update --network-plugin azure --network-plugin-mode overlay. 4) Optionally enable Cilium: az aks update --network-policy cilium.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Cluster%20Management/How%20tomigrate%20from%20kubenet%20to%20AzurecniOverlay%20withCilium)]`

## Phase 2: Calico network policy must be disabled before migr

### aks-468: AKS cluster migration from kubenet to Azure CNI Overlay fails with error when Ca...

**Root Cause**: Calico network policy must be disabled before migrating network plugin from kubenet to Azure CNI Overlay; attempting migration with networkPolicy=calico causes failure

**Solution**:
1) Disable Calico: az aks update --network-policy none. 2) Manually delete remaining Calico/tigera-operator CRDs if they persist. 3) Migrate: az aks update --network-plugin azure --network-plugin-mode overlay. 4) Optionally enable Cilium: az aks update --network-policy cilium

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FHow%20tomigrate%20from%20kubenet%20to%20AzurecniOverlay%20withCilium)]`

## Phase 3: Azure CNI Powered by Cilium 是托管集成方案，仅支持 L3/L4 网络策略

### aks-512: AKS Azure CNI Powered by Cilium 不支持 L7（Layer 7）高级网络策略，CiliumNetworkPolicy 的 HTTP...

**Root Cause**: Azure CNI Powered by Cilium 是托管集成方案，仅支持 L3/L4 网络策略，L7 策略需要完整 Cilium datapath（BYOCNI 模式）

**Solution**:
如需 L7 网络策略（如限制特定 HTTP path），使用 AKS BYOCNI + Cilium 部署方式：1) 创建 --network-plugin none 集群并禁用 kube-proxy；2) 手动安装 Cilium CLI 并部署；3) 使用 CiliumNetworkPolicy 配置 L7 规则

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FIntro%20to%20Cilium%20and%20AKS)]`

## Phase 4: NPM has inherent scaling limitations (250 nodes ma

### aks-557: Azure NPM being retired — Linux support ends Sept 2028, Windows support ends Sep...

**Root Cause**: NPM has inherent scaling limitations (250 nodes max), security gaps (cannot enforce policies on LB/NodePort services), and lacks FQDN/L7/cluster-wide policy features

**Solution**:
Migrate to Cilium Network Policies (Linux): https://learn.microsoft.com/en-us/azure/aks/migrate-from-npm-to-cilium-network-policy. For Windows: switch to Calico or use NSGs on nodes.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Azure%20Network%20Policy%20Manager)]`

## Phase 5: NPM has fundamental scaling, security, and feature

### aks-629: Azure Network Policy Manager (NPM) is being deprecated. NPM has scaling limitati...

**Root Cause**: NPM has fundamental scaling, security, and feature limitations. Upstream is transitioning to Cilium as default CNI for AKS.

**Solution**:
For Linux nodes: migrate to Cilium Network Policies (scales to 3000+ nodes). Use migration guide: https://learn.microsoft.com/en-us/azure/aks/migrate-from-npm-to-cilium-network-policy. For Windows nodes: switch to Calico or use NSGs. Linux NPM support ends Sept 2028, Windows NPM support ends Sept 2026.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAKS%20Network%20Policy)]`

## Phase 6: Connection tracking (CT) table is filling up due t

### aks-933: AKS Cilium CNI: cilium monitor shows CT: Map insertion failed - connection track...

**Root Cause**: Connection tracking (CT) table is filling up due to too many connections within a 5-minute period from pods on the node.

**Solution**:
Schedule fewer pods per node, or investigate if application workload is creating excessive connections. NOTE: Cilium docs suggest adjusting CT GC interval or map size, but this is NOT currently configurable in AKS.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI)]`

## Phase 7: Customer likely created cluster with single node t

### aks-935: AKS Cilium CNI: cluster has multiple nodes but only one cilium-operator pod runn...

**Root Cause**: Customer likely created cluster with single node then scaled up. Cilium operator replica count was not reconciled.

**Solution**:
Reconcile the cluster (e.g. az aks update or trigger a no-op operation). After reconcile, should see two cilium-operator replicas.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI)]`

## Phase 8: Customer created cluster with multiple nodes then 

### aks-937: AKS Cilium CNI: single node cluster has two cilium-operator pods with one stuck ...

**Root Cause**: Customer created cluster with multiple nodes then scaled down to single node. Cilium operator still expects 2 replicas.

**Solution**:
Reconcile the cluster to adjust cilium-operator replica count to 1 for single-node cluster.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI)]`

## Phase 9: Known display issue in ASI. Cilium CNI is installe

### aks-939: AKS Cilium CNI: ASI shows Cluster Degraded with CustomerNodesNotReadyCNI even th...

**Root Cause**: Known display issue in ASI. Cilium CNI is installed via daemonset at node startup and ASI detects the brief initial NotReady state, showing Degraded even after CNI installation completes.

**Solution**:
Verify actual node status in ASI Node Pools tab. If nodes show Ready, cluster is healthy - this is an ASI display issue. Fix expected in the new monitoring stack.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI)]`

## Phase 10: Known issue affecting both BYO CNI + Cilium and AK

### aks-941: AKS Cilium CNI: Unattended Upgrades on Ubuntu 22.04 leaves nodes in NotReady sta...

**Root Cause**: Known issue affecting both BYO CNI + Cilium and AKS-managed Cilium on Ubuntu 22.04. Unattended OS upgrades break Cilium networking.

**Solution**:
Manually mitigate by restarting affected nodes. Track repair: https://msazure.visualstudio.com/CloudNativeCompute/_workitems/edit/17508542

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI)]`

## Phase 11: Known bug with aad-pod-identity on Cilium clusters

### aks-943: AKS Cilium CNI: aad-pod-identity pods experience i/o timeout connecting to 169.2...

**Root Cause**: Known bug with aad-pod-identity on Cilium clusters. aad-pod-identity is deprecated since Oct 2023.

**Solution**:
Migrate to Azure Workload Identity: https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview. aad-pod-identity is no longer maintained.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI)]`

## Phase 12: ContainerNetworkMetric CRD not installed. Possible

### aks-988: kubectl get containernetworkmetric fails with 'resource not found'. CRD creation...

**Root Cause**: ContainerNetworkMetric CRD not installed. Possible causes: AdvancedNetworkingDynamicMetricsPreview feature flag not enabled, cilium-operator not running, or incorrect CRD schema (must use apiVersion acn.azure.com/v1alpha1).

**Solution**:
1) Verify CRD: kubectl get crd | grep containernetworkmetric. 2) Check cilium-operator: kubectl get pods -n kube-system -l name=cilium-operator. 3) Verify feature flag enabled for subscription. 4) Use correct CRD schema with acn.azure.com/v1alpha1. Prerequisites: K8s >= 1.32, Cilium dataplane, retina-operator >= 0.1.12.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Container%20Network%20Metrics%20Filtering-Dynamic%20Metrics)]`

## Phase 13: Cilium pods have not reloaded the new dynamic metr

### aks-990: Dynamic metrics ConfigMap (cilium-dynamic-metrics-config) updated correctly and ...

**Root Cause**: Cilium pods have not reloaded the new dynamic metrics configuration. Possible causes: incorrect filter configuration syntax, Cilium agent not healthy, or no network traffic matching the configured filters.

**Solution**:
1) Restart Cilium: kubectl rollout restart daemonset/cilium -n kube-system. 2) Verify filter syntax matches schema. 3) Generate traffic matching filters. 4) Check cilium-config for hubble-dynamic-metrics-config-path. 5) Verify metrics endpoints accessible.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Container%20Network%20Metrics%20Filtering-Dynamic%20Metrics)]`

## Phase 14: Hubble events queue full causing dropped messages.

### aks-1088: AKS network observability metrics inaccurate on Cilium cluster - some traffic no...

**Root Cause**: Hubble events queue full causing dropped messages. Log: hubble events queue is full: dropping messages.

**Solution**:
1) Find cilium pod on node: kubectl get pods -n kube-system -l k8s-app=cilium -owide. 2) Check logs for queue full. 3) Check cilium-config ConfigMap hubble-event-buffer-capacity (default 4095). 4) Involve ACN DRI.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Advanced/Cilium/Lost%20Packets)]`

## Phase 15: Hubble events queue full in Retina pods. Same as C

### aks-1089: AKS network observability metrics inaccurate on non-Cilium (Retina) cluster - so...

**Root Cause**: Hubble events queue full in Retina pods. Same as Cilium variant but uses retina-config ConfigMap.

**Solution**:
1) Find retina pod: kubectl get pods -n kube-system -l k8s-app=retina -owide. 2) Check logs for queue full. 3) Check retina-config hubble-event-queue-size (default 16383). 4) Involve ACN DRI.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Advanced/Non-Cilium/Lost%20Packets)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS migration from kubenet to Azure CNI Overlay fails when networkPolicy=calico ... | Calico network policy must be uninstalled before migrating n... | 1) Disable Calico first: az aks update --network-policy none... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Cluster%20Management/How%20tomigrate%20from%20kubenet%20to%20AzurecniOverlay%20withCilium) |
| 2 | AKS cluster migration from kubenet to Azure CNI Overlay fails with error when Ca... | Calico network policy must be disabled before migrating netw... | 1) Disable Calico: az aks update --network-policy none. 2) M... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FHow%20tomigrate%20from%20kubenet%20to%20AzurecniOverlay%20withCilium) |
| 3 | AKS Azure CNI Powered by Cilium 不支持 L7（Layer 7）高级网络策略，CiliumNetworkPolicy 的 HTTP... | Azure CNI Powered by Cilium 是托管集成方案，仅支持 L3/L4 网络策略，L7 策略需要完整... | 如需 L7 网络策略（如限制特定 HTTP path），使用 AKS BYOCNI + Cilium 部署方式：1) 创... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FIntro%20to%20Cilium%20and%20AKS) |
| 4 | Azure NPM being retired — Linux support ends Sept 2028, Windows support ends Sep... | NPM has inherent scaling limitations (250 nodes max), securi... | Migrate to Cilium Network Policies (Linux): https://learn.mi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Azure%20Network%20Policy%20Manager) |
| 5 | Azure Network Policy Manager (NPM) is being deprecated. NPM has scaling limitati... | NPM has fundamental scaling, security, and feature limitatio... | For Linux nodes: migrate to Cilium Network Policies (scales ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAKS%20Network%20Policy) |
| 6 | AKS Cilium CNI: cilium monitor shows CT: Map insertion failed - connection track... | Connection tracking (CT) table is filling up due to too many... | Schedule fewer pods per node, or investigate if application ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI) |
| 7 | AKS Cilium CNI: cluster has multiple nodes but only one cilium-operator pod runn... | Customer likely created cluster with single node then scaled... | Reconcile the cluster (e.g. az aks update or trigger a no-op... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI) |
| 8 | AKS Cilium CNI: single node cluster has two cilium-operator pods with one stuck ... | Customer created cluster with multiple nodes then scaled dow... | Reconcile the cluster to adjust cilium-operator replica coun... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI) |
| 9 | AKS Cilium CNI: ASI shows Cluster Degraded with CustomerNodesNotReadyCNI even th... | Known display issue in ASI. Cilium CNI is installed via daem... | Verify actual node status in ASI Node Pools tab. If nodes sh... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI) |
| 10 | AKS Cilium CNI: Unattended Upgrades on Ubuntu 22.04 leaves nodes in NotReady sta... | Known issue affecting both BYO CNI + Cilium and AKS-managed ... | Manually mitigate by restarting affected nodes. Track repair... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI) |
| 11 | AKS Cilium CNI: aad-pod-identity pods experience i/o timeout connecting to 169.2... | Known bug with aad-pod-identity on Cilium clusters. aad-pod-... | Migrate to Azure Workload Identity: https://learn.microsoft.... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Cilium%20CNI) |
| 12 | kubectl get containernetworkmetric fails with 'resource not found'. CRD creation... | ContainerNetworkMetric CRD not installed. Possible causes: A... | 1) Verify CRD: kubectl get crd \| grep containernetworkmetri... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Container%20Network%20Metrics%20Filtering-Dynamic%20Metrics) |
| 13 | Dynamic metrics ConfigMap (cilium-dynamic-metrics-config) updated correctly and ... | Cilium pods have not reloaded the new dynamic metrics config... | 1) Restart Cilium: kubectl rollout restart daemonset/cilium ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Container%20Network%20Metrics%20Filtering-Dynamic%20Metrics) |
| 14 | AKS network observability metrics inaccurate on Cilium cluster - some traffic no... | Hubble events queue full causing dropped messages. Log: hubb... | 1) Find cilium pod on node: kubectl get pods -n kube-system ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Advanced/Cilium/Lost%20Packets) |
| 15 | AKS network observability metrics inaccurate on non-Cilium (Retina) cluster - so... | Hubble events queue full in Retina pods. Same as Cilium vari... | 1) Find retina pod: kubectl get pods -n kube-system -l k8s-a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Advanced/Non-Cilium/Lost%20Packets) |

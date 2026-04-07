# AKS 网络连通性通用 — network-observability -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 7 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Network-Observability-Kappie.md, ado-wiki-aks-network-observability-byo-prometheus-grafana.md, ado-wiki-b-Planned-Maintenance-Windows.md, ado-wiki-collecting-procdumps-from-windows-pods.md, ado-wiki-d-Retina-Operator.md, ado-wiki-windows-host-process-container.md, mslearn-capture-container-dump-windows.md
**Generated**: 2026-04-07

---

## Phase 1: Hubble UI is NOT officially supported by AKS. User

### aks-515: Hubble UI not working in AKS with Network Observability / ACNS

**Root Cause**: Hubble UI is NOT officially supported by AKS. Users can set it up manually following public documentation but it is not a managed component.

**Solution**:
Follow Hubble CLI TSG steps 0 and 1 to verify underlying connectivity. Customer must ensure UI pod is running and configured per documentation at aka.ms/acns.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FNetwork%20Observability%20(Kappie)%2FAdvanced%2FHubble%20UI)]`

## Phase 2: Retina agent hubble events queue full, dropping me

### aks-516: Network observability metrics (hubble_flows_processed_total) showing fewer packe...

**Root Cause**: Retina agent hubble events queue full, dropping messages due to insufficient buffer size or CPU. Log shows: 'hubble events queue is full: dropping messages; consider increasing the queue size (hubble-event-queue-size) or provisioning more CPU'

**Solution**:
1) Identify the node where affected pod runs. 2) Get Retina pod on that node: kubectl get pods -n kube-system -l k8s-app=retina -owide. 3) Check logs for 'hubble events queue is full' warning. 4) If found, check retina-config ConfigMap hubble-event-queue-size value, involve ACN DRI. 5) If no lost packets, refer to metrics TSG for further diagnosis.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FNetwork%20Observability%20(Kappie)%2FAdvanced%2FNon-Cilium%2FLost%20Packets)]`

## Phase 3: Retina Capture uses netsh trace on Windows. Only o

### aks-987: Creating a Retina network capture on a Windows node fails with error when anothe...

**Root Cause**: Retina Capture uses netsh trace on Windows. Only one netsh trace session is allowed per Windows node. A pending or running capture pod already occupies the session.

**Solution**:
1) List capture pods on the Windows node: kubectl get pod -A -o wide | grep <WindowsNodeName>. 2) Get capture name: kubectl describe pod <capturePod> | grep capture-name | awk -F '=' '{print $2}'. 3) Delete existing capture: kubectl retina capture delete --namespace <ns> --name <captureName>. Then retry.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Capture%20TSG)]`

## Phase 4: Reconciliation timing delay (normal up to 2 minute

### aks-989: ContainerNetworkMetric CR created successfully but cilium-dynamic-metrics-config...

**Root Cause**: Reconciliation timing delay (normal up to 2 minutes), retina-crd-operator processing errors, or ConfigMap RBAC permission issues preventing cilium-operator from updating the ConfigMap.

**Solution**:
1) Check CR status: kubectl describe containernetworkmetric <name>. 2) Check ConfigMap: kubectl get cm cilium-dynamic-metrics-config -n kube-system -o yaml. 3) Check operator logs: kubectl logs deployment/cilium-operator -n kube-system | grep containernetworkmetric. 4) Wait 2 min for reconciliation. 5) If stuck: kubectl rollout restart deployment/cilium-operator -n kube-system.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Container%20Network%20Metrics%20Filtering-Dynamic%20Metrics)]`

## Phase 5: Known non-issue. The 'unsupported value type' log 

### aks-991: Retina/Network Observability pod logs show 'unsupported value type' error, e.g. ...

**Root Cause**: Known non-issue. The 'unsupported value type' log message is caused by a Go code library limitation in the logger. It does not affect functionality.

**Solution**:
Inform customer this is a known cosmetic log issue and NOT an actual error. No action required. The Retina team is working on fixing the log message.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Errors)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Hubble UI not working in AKS with Network Observability / ACNS | Hubble UI is NOT officially supported by AKS. Users can set ... | Follow Hubble CLI TSG steps 0 and 1 to verify underlying con... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FNetwork%20Observability%20(Kappie)%2FAdvanced%2FHubble%20UI) |
| 2 | Network observability metrics (hubble_flows_processed_total) showing fewer packe... | Retina agent hubble events queue full, dropping messages due... | 1) Identify the node where affected pod runs. 2) Get Retina ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FNetwork%20Observability%20(Kappie)%2FAdvanced%2FNon-Cilium%2FLost%20Packets) |
| 3 | Creating a Retina network capture on a Windows node fails with error when anothe... | Retina Capture uses netsh trace on Windows. Only one netsh t... | 1) List capture pods on the Windows node: kubectl get pod -A... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Capture%20TSG) |
| 4 | ContainerNetworkMetric CR created successfully but cilium-dynamic-metrics-config... | Reconciliation timing delay (normal up to 2 minutes), retina... | 1) Check CR status: kubectl describe containernetworkmetric ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Container%20Network%20Metrics%20Filtering-Dynamic%20Metrics) |
| 5 | Retina/Network Observability pod logs show 'unsupported value type' error, e.g. ... | Known non-issue. The 'unsupported value type' log message is... | Inform customer this is a known cosmetic log issue and NOT a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Errors) |

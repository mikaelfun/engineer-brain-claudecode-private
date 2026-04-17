# Synthesize Log -- aks -- 2026-04-07

## Mode
Full (all 5 sources exhausted)

## Statistics
- Total entries processed: 1324
- Topics generated: 187
- Fusion topics: 135
- Compact (quick) topics: 52
- Discarded entries: 2
- Draft files mapped: 369
- Kusto query files mapped: 18

## Discarded Entries
| ID | Reason |
|----|--------|
| aks-1320 | 半成品（无根因无方案） |
| aks-1321 | 半成品（无根因无方案） |

## Fusion Statistics
| Topic | Type | Entries | Drafts | Kusto |
|-------|------|---------|--------|-------|
| aci-networking-general | Fusion | 47 | 3 | 0 |
| acr-authentication-rbac-general | Fusion | 42 | 2 | 0 |
| networking-connectivity-general-general | Fusion | 39 | 4 | 1 |
| networking-dns-resolution-dns | Fusion | 35 | 6 | 0 |
| acr-authentication-rbac-image-pull | Fusion | 27 | 16 | 1 |
| upgrade-cluster-version-general | Fusion | 26 | 0 | 3 |
| general-troubleshooting-general | Fusion | 24 | 1 | 0 |
| networking-udr-routing-general | Fusion | 22 | 3 | 0 |
| storage-pv-pvc-general | Fusion | 18 | 2 | 0 |
| crud-reconcile-failedstate-general | Quick | 17 | 0 | 0 |
| networking-connectivity-general-networking | Fusion | 16 | 4 | 0 |
| networking-firewall-proxy-general | Fusion | 16 | 1 | 0 |
| scale-nodepool-general | Fusion | 16 | 0 | 1 |
| apiserver-connectivity | Fusion | 15 | 3 | 0 |
| cilium-network-policy | Fusion | 15 | 5 | 0 |
| ingress-tls-cert | Fusion | 15 | 4 | 0 |
| aci-provisioning-lifecycle | Quick | 14 | 0 | 0 |
| upgrade-cluster-version-crud | Fusion | 14 | 1 | 3 |
| upgrade-node-image-general | Fusion | 14 | 0 | 5 |
| networking-lb-external-general | Fusion | 13 | 7 | 0 |
| security-azure-policy-general | Quick | 13 | 0 | 0 |
| identity-workload-identity | Fusion | 12 | 38 | 1 |
| networking-dns-resolution-general | Fusion | 12 | 33 | 0 |
| networking-dns-resolution-private-cluster | Fusion | 12 | 1 | 1 |
| storage-pv-pvc-storage | Quick | 12 | 0 | 0 |
| aci-networking-vnet | Fusion | 11 | 11 | 0 |
| networking-lb-internal-general | Fusion | 11 | 2 | 0 |
| networking-nsg-rules-general | Quick | 11 | 0 | 0 |
| storage-acstor-general | Fusion | 11 | 1 | 0 |
| storage-azure-disk-general | Quick | 11 | 0 | 0 |
| storage-azure-files-smb-general | Quick | 11 | 0 | 0 |
| aci-networking-managed-identity | Fusion | 10 | 1 | 0 |
| agic-http-errors-general | Quick | 10 | 0 | 0 |
| identity-aad-integration-aad | Fusion | 10 | 1 | 0 |
| istio-installation-general | Fusion | 10 | 1 | 0 |
| scale-cluster-autoscaler-vmss | Fusion | 10 | 5 | 3 |
| security-defender | Fusion | 10 | 2 | 0 |
| storage-azure-disk-storage | Fusion | 10 | 3 | 0 |
| upgrade-cluster-version-pdb | Fusion | 10 | 1 | 3 |
| acr-authentication-rbac-soft-delete | Fusion | 9 | 1 | 0 |
| crud-reconcile-failedstate-failed-state | Fusion | 9 | 4 | 0 |
| networking-cni-overlay-azure-cni | Fusion | 9 | 17 | 0 |
| networking-private-cluster | Fusion | 9 | 8 | 1 |
| node-vmss-cse-extension | Fusion | 9 | 3 | 2 |
| pod-scheduling-eviction | Fusion | 9 | 0 | 2 |
| storage-azure-files-smb-storage | Fusion | 9 | 1 | 0 |
| storage-blob-blobfuse-blobfuse | Fusion | 9 | 2 | 0 |
| aci-networking-confidential-containers | Fusion | 8 | 4 | 1 |
| agic-http-errors-ingress | Fusion | 8 | 4 | 0 |
| cluster-creation-config | Fusion | 8 | 0 | 1 |
| ingress-nginx | Fusion | 8 | 3 | 0 |
| networking-egress-outbound | Quick | 8 | 0 | 0 |
| node-performance-resource-general | Fusion | 8 | 0 | 1 |
| node-vmss-cse-general | Fusion | 8 | 0 | 1 |
| aci-networking-deployment-failure | Fusion | 7 | 4 | 0 |
| acr-authentication-rbac-notation | Quick | 7 | 0 | 0 |
| istio-installation-gateway-api | Fusion | 7 | 15 | 1 |
| networking-dns-resolution-coredns | Fusion | 7 | 1 | 0 |
| networking-lb-external-networking | Fusion | 7 | 3 | 0 |
| networking-nsg-rules-firewall | Quick | 7 | 0 | 0 |
| networking-udr-routing-ossku | Fusion | 7 | 1 | 0 |
| node-not-ready | Fusion | 7 | 2 | 1 |
| scale-cluster-autoscaler-general | Fusion | 7 | 2 | 3 |
| security-rbac-authz-general | Quick | 7 | 0 | 0 |
| acr-authentication-rbac-unauthorized | Quick | 6 | 0 | 0 |
| networking-connectivity-general-api-server | Fusion | 6 | 7 | 1 |
| networking-firewall-proxy-http-proxy | Fusion | 6 | 4 | 0 |
| networking-lb-external-image-pull | Fusion | 6 | 2 | 1 |
| networking-lb-internal-networking | Quick | 6 | 0 | 0 |
| networking-udr-routing-authentication | Quick | 6 | 0 | 0 |
| node-performance-resource-memory | Fusion | 6 | 5 | 1 |
| pod-crashloop-restart | Fusion | 6 | 0 | 2 |
| scale-cluster-autoscaler-cluster-autoscaler | Fusion | 6 | 0 | 3 |
| scale-karpenter-nap | Fusion | 6 | 0 | 1 |
| scale-nodepool-scale | Fusion | 6 | 0 | 1 |
| security-azure-policy-gatekeeper | Fusion | 6 | 4 | 0 |
| security-rbac-authz-rbac | Quick | 6 | 0 | 0 |
| storage-azure-files-nfs | Fusion | 6 | 1 | 0 |
| storage-pv-pvc-csi | Quick | 6 | 0 | 0 |
| upgrade-node-image-node-image | Fusion | 6 | 2 | 4 |
| windows-nodes-general | Fusion | 6 | 3 | 0 |
| aci-networking-escalation | Fusion | 5 | 2 | 0 |
| aci-networking-subnet | Fusion | 5 | 0 | 1 |
| acr-authentication-rbac-kusto | Fusion | 5 | 4 | 0 |
| agic-http-errors-networking | Fusion | 5 | 1 | 0 |
| crud-reconcile-failedstate-reconcile | Fusion | 5 | 1 | 0 |
| icm-escalation | Fusion | 5 | 1 | 0 |
| identity-aad-integration-general | Fusion | 5 | 2 | 0 |
| identity-managed-identity | Quick | 5 | 0 | 0 |
| identity-service-principal | Quick | 5 | 0 | 0 |
| istio-installation-meshconfig | Quick | 5 | 0 | 0 |
| networking-connectivity-general-network-observability | Fusion | 5 | 7 | 0 |
| networking-connectivity-general-vmss | Fusion | 5 | 10 | 0 |
| networking-lb-external-aks | Fusion | 5 | 2 | 0 |
| networking-nsg-rules-networking | Quick | 5 | 0 | 0 |
| networking-udr-routing-scale | Fusion | 5 | 0 | 1 |
| networking-udr-routing-udr | Fusion | 5 | 1 | 0 |
| node-provisioning-errors | Fusion | 5 | 9 | 1 |
| portal-cli-tools | Quick | 5 | 0 | 0 |
| scale-cluster-autoscaler-autoscaler | Fusion | 5 | 2 | 3 |
| scale-nodepool-vmss | Fusion | 5 | 0 | 1 |
| scale-nodepool-windows | Fusion | 5 | 0 | 1 |
| storage-acstor-21v-unsupported | Fusion | 5 | 6 | 0 |
| storage-azure-files-smb-smb | Quick | 5 | 0 | 0 |
| upgrade-cluster-version-scale | Fusion | 5 | 0 | 3 |
| acr-authentication-rbac-connected-registry | Fusion | 4 | 2 | 0 |
| acr-authentication-rbac-private-endpoint | Fusion | 4 | 2 | 0 |
| agic-http-errors-managed-identity | Quick | 4 | 0 | 0 |
| general-troubleshooting-api | Fusion | 4 | 0 | 1 |
| identity-aad-integration-authentication | Quick | 4 | 0 | 0 |
| istio-installation-key-vault | Quick | 4 | 0 | 0 |
| istio-installation-service-mesh | Fusion | 4 | 4 | 0 |
| mooncake-21v-gaps | Fusion | 4 | 1 | 0 |
| networking-cni-overlay-general | Quick | 4 | 0 | 0 |
| networking-connectivity-general-mooncake | Quick | 4 | 0 | 0 |
| networking-dns-resolution-dns-resolution | Fusion | 4 | 1 | 0 |
| networking-firewall-proxy-mcr | Fusion | 4 | 1 | 0 |
| networking-lb-internal-health-probe | Fusion | 4 | 2 | 0 |
| networking-lb-internal-internal-lb | Quick | 4 | 0 | 0 |
| networking-lb-internal-snat | Fusion | 4 | 1 | 0 |
| node-performance-resource-oom | Fusion | 4 | 0 | 1 |
| node-vmss-cse-vmss | Fusion | 4 | 0 | 1 |
| scale-nodepool-vm-size | Fusion | 4 | 1 | 1 |
| storage-azure-files-smb-csi-driver | Fusion | 4 | 1 | 0 |
| storage-blob-blobfuse-blobfuse2 | Quick | 4 | 0 | 0 |
| storage-blob-blobfuse-general | Quick | 4 | 0 | 0 |
| storage-pv-pvc-csi-driver | Fusion | 4 | 1 | 0 |
| upgrade-cluster-version-dotnet | Fusion | 4 | 0 | 3 |
| upgrade-cluster-version-scheduling | Fusion | 4 | 0 | 3 |
| upgrade-cluster-version-vmss | Fusion | 4 | 0 | 3 |
| upgrade-general | Fusion | 4 | 0 | 2 |
| aci-networking-acr | Quick | 3 | 0 | 0 |
| aci-networking-networking | Quick | 3 | 0 | 0 |
| acr-authentication-rbac-aks | Fusion | 3 | 7 | 0 |
| agic-http-errors-service-principal | Quick | 3 | 0 | 0 |
| agic-http-errors-upgrade | Fusion | 3 | 0 | 2 |
| crud-reconcile-failedstate-cluster-creation | Fusion | 3 | 2 | 1 |
| extension-general | Fusion | 3 | 0 | 1 |
| general-troubleshooting-agentic-cli | Quick | 3 | 0 | 0 |
| general-troubleshooting-dfm | Quick | 3 | 0 | 0 |
| general-troubleshooting-pod-sandboxing | Fusion | 3 | 2 | 2 |
| general-troubleshooting-ssh | Quick | 3 | 0 | 0 |
| internal-ops | Quick | 3 | 0 | 0 |
| istio-installation-upgrade | Fusion | 3 | 1 | 2 |
| monitoring-container-insights | Fusion | 3 | 1 | 1 |
| networking-cni-overlay-cni-overlay | Fusion | 3 | 2 | 0 |
| networking-cni-overlay-upgrade | Fusion | 3 | 2 | 2 |
| networking-connectivity-general-kubectl | Quick | 3 | 0 | 0 |
| networking-connectivity-general-upgrade | Fusion | 3 | 0 | 2 |
| networking-connectivity-general-vnet | Fusion | 3 | 3 | 0 |
| networking-firewall-proxy-api-server | Fusion | 3 | 0 | 1 |
| networking-firewall-proxy-networking | Fusion | 3 | 1 | 0 |
| networking-lb-internal-cloud-controller-manager | Fusion | 3 | 0 | 1 |
| networking-lb-internal-cluster-delete | Fusion | 3 | 0 | 1 |
| networking-lb-internal-external-ip | Fusion | 3 | 2 | 0 |
| networking-nsg-rules-vmss | Quick | 3 | 0 | 0 |
| networking-udr-routing-route-table | Fusion | 3 | 1 | 0 |
| networking-udr-routing-service-principal | Quick | 3 | 0 | 0 |
| node-os-kernel | Fusion | 3 | 0 | 1 |
| node-performance-resource-vpa | Fusion | 3 | 0 | 1 |
| pod-containerd | Fusion | 3 | 0 | 2 |
| scale-nodepool-fips | Fusion | 3 | 0 | 1 |
| security-azure-policy-failed-state | Quick | 3 | 0 | 0 |
| security-rbac-authz-authorization | Fusion | 3 | 1 | 0 |
| storage-acstor-nvme | Quick | 3 | 0 | 0 |
| storage-azure-disk-csi | Fusion | 3 | 1 | 0 |
| storage-blob-blobfuse-blob-csi | Quick | 3 | 0 | 0 |
| storage-pv-pvc-configmap | Quick | 3 | 0 | 0 |
| storage-pv-pvc-contentidea-kb | Quick | 3 | 0 | 0 |
| storage-pv-pvc-daemonset | Fusion | 3 | 2 | 0 |
| storage-pv-pvc-networking | Quick | 3 | 0 | 0 |
| upgrade-cluster-version-auto-upgrade | Fusion | 3 | 0 | 4 |
| upgrade-cluster-version-deprecated-api | Fusion | 3 | 0 | 5 |
| backup-migration | Quick | 2 | 0 | 0 |
| capacity-allocation | Fusion | 2 | 3 | 0 |
| extension-arc | Fusion | 2 | 0 | 1 |
| gpu-workloads | Quick | 2 | 0 | 0 |
| monitoring-diagnostic | Fusion | 2 | 0 | 1 |
| mooncake-operations | Fusion | 2 | 0 | 1 |
| outage-incident | Quick | 2 | 0 | 0 |
| pod-image-pull-errors | Fusion | 2 | 0 | 3 |
| acr-replication-geo | Quick | 1 | 0 | 0 |
| extension-flux-gitops | Fusion | 1 | 1 | 1 |
| fleet-manager | Fusion | 1 | 6 | 1 |
| istio-networking | Quick | 1 | 0 | 0 |
| throttling-quota | Fusion | 1 | 0 | 1 |
| upgrade-auto-maintenance | Fusion | 1 | 1 | 3 |

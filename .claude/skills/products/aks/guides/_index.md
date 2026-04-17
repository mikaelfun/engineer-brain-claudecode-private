# AKS Troubleshooting Guide Index

| Guide | Type | Kusto | Keywords | Sources | Entries | Confidence |
|-------|------|-------|----------|---------|---------|------------|
| [ACI 网络与 DNS — general](aci-networking-general.md) | Fusion | 0 | aci, kusto, icm, byovnet, service-fabric | 3 | 47 | high |
| [ACR 认证与 RBAC — general](acr-authentication-rbac-general.md) | Fusion | 0 | acr, cache-rule, slow, push, icm | 2 | 42 | medium |
| [网络连通性通用 — general](networking-connectivity-general-general.md) | Fusion | 1 | oom, notready, vmsscse, cni-overlay, cse | 4 | 39 | high |
| [DNS 解析排查 — dns](networking-dns-resolution-dns.md) | Fusion | 0 | dns, private-cluster, coredns, custom-dns, api-server | 3 | 35 | high |
| [ACR 认证与 RBAC — image-pull](acr-authentication-rbac-image-pull.md) | Fusion | 1 | image-pull, acr, networking, private-endpoint, firewall | 3 | 27 | high |
| [集群版本升级 — general](upgrade-cluster-version-general.md) | Fusion | 3 | upgrade, arm-template, surge-node, race-condition, linuxprofile | 3 | 26 | high |
| [通用排查 — general](general-troubleshooting-general.md) | Fusion | 0 | timezone, pod-configuration, hostpath, advisory, security | 3 | 24 | high |
| [UDR 与路由 — general](networking-udr-routing-general.md) | Fusion | 0 | api-version, vmss, addon, gpu, api | 3 | 22 | high |
| [PV/PVC 与卷管理 — general](storage-pv-pvc-general.md) | Fusion | 0 | ephemeral-disk, no-space-left, kubelet, nodepool, node-registration | 3 | 18 | high |
| [CRUD 操作与 Failed State 恢复 — general](crud-reconcile-failedstate-general.md) | Quick | 0 | support-policy, log-analytics, provisioning-state, kube-system, user-workload | 3 | 17 | high |
| [网络连通性通用 — networking](networking-connectivity-general-networking.md) | Fusion | 0 | networking, vnet, tcp, keepalive, timeout | 3 | 16 | high |
| [防火墙与代理 — general](networking-firewall-proxy-general.md) | Fusion | 0 | firewall, upgrade, egress, network, image-pull | 3 | 16 | high |
| [节点池扩缩容 — general](scale-nodepool-general.md) | Fusion | 1 | mooncake, portal, node-pool, disable, omsagent | 3 | 16 | high |
| [API Server 连接与隧道](apiserver-connectivity.md) | Fusion | 0 | api-server, konnectivity, kubectl-logs, kubectl, etcd | 3 | 15 | high |
| [Cilium 网络策略与可观测性](cilium-network-policy.md) | Fusion | 0 | cilium, aks, network-policy, migration, network-observability | 1 | 15 | low |
| [TLS 证书与 Cert-Manager](ingress-tls-cert.md) | Fusion | 0 | certificate, x509, expired, certificate-rotation, rotate-certs | 4 | 15 | high |
| [ACI 部署与生命周期](aci-provisioning-lifecycle.md) | Quick | 0 | capacity, nap, ea-subscription, crg, capacity-reservation | 4 | 14 | high |
| [集群版本升级 — crud](upgrade-cluster-version-crud.md) | Fusion | 3 | crud, upgrade, scale, resource-lock, reconcile | 1 | 14 | low |
| [节点镜像升级 — general](upgrade-node-image-general.md) | Fusion | 5 | remediator, node-auto-repair, reimage, gpu, node-upgrade | 3 | 14 | high |
| [外部负载均衡器与 SNAT — general](networking-lb-external-general.md) | Fusion | 0 | imagepullbackoff, mooncake, vmss, public-ip, kube-proxy | 2 | 13 | medium |
| [Azure Policy — general](security-azure-policy-general.md) | Quick | 0 | azure-policy, upgrade, custom-policy, portal, mooncake | 4 | 13 | high |
| [Workload Identity / OIDC](identity-workload-identity.md) | Fusion | 1 | workload-identity, oidc, mooncake, authentication, aad | 4 | 12 | high |
| [DNS 解析排查 — general](networking-dns-resolution-general.md) | Fusion | 0 | azure-firewall, vmsscse, fqdn, extension, version | 3 | 12 | high |
| [DNS 解析排查 — private-cluster](networking-dns-resolution-private-cluster.md) | Fusion | 1 | private-cluster, private-dns, vnet-link, upgrade, private-dns-zone | 3 | 12 | high |
| [PV/PVC 与卷管理 — storage](storage-pv-pvc-storage.md) | Quick | 0 | storage, rbac, csi, timeout, vmss | 2 | 12 | medium |
| [ACI 网络与 DNS — vnet](aci-networking-vnet.md) | Fusion | 0 | aci, vnet, subnet, service-association-link, delete-failure | 1 | 11 | low |
| [内部负载均衡器 — general](networking-lb-internal-general.md) | Fusion | 0 | load-balancer, kube-proxy, managed-tags, node-resource-group, ip-lease | 3 | 11 | high |
| [NSG 规则排查 — general](networking-nsg-rules-general.md) | Quick | 0 | nsg, subnet, cluster-delete, kubenet, custom-vnet | 3 | 11 | high |
| [Azure Container Storage — general](storage-acstor-general.md) | Fusion | 0 | acstor, data-integrity, diskpool, deletion, pvc | 2 | 11 | medium |
| [Azure Disk CSI — general](storage-azure-disk-general.md) | Quick | 0 | azure-disk, ephemeral-disk, node-pool, pv, rbac | 3 | 11 | high |
| [Azure Files SMB — general](storage-azure-files-smb-general.md) | Quick | 0 | azure-files, csi, permission-denied, key-rotation, kubernetes-secret | 3 | 11 | high |
| [ACI 网络与 DNS — managed-identity](aci-networking-managed-identity.md) | Fusion | 0 | managed-identity, aci, acr, image-pull, deployment-failure | 1 | 10 | low |
| [AGIC HTTP 错误码排查 — general](agic-http-errors-general.md) | Quick | 0 | application-gateway, agic, arm, operational-state, egress | 2 | 10 | medium |
| [AAD 集成与认证 — aad](identity-aad-integration-aad.md) | Fusion | 0 | aad, kubelogin, authentication, permissions, rbac | 3 | 10 | high |
| [Istio 安装与配置 — general](istio-installation-general.md) | Fusion | 0 | istio, sidecar, azure-policy, non-compliant, cni | 2 | 10 | medium |
| [Cluster Autoscaler — vmss](scale-cluster-autoscaler-vmss.md) | Fusion | 3 | vmss, cluster-autoscaler, autoscaler, scale-down, mooncake | 3 | 10 | high |
| [Microsoft Defender](security-defender.md) | Fusion | 0 | defender, log-analytics, mooncake, monitoring-addon, security | 3 | 10 | high |
| [Azure Disk CSI — storage](storage-azure-disk-storage.md) | Fusion | 0 | storage, azure-disk, availability-zone, backup, 4tib | 2 | 10 | medium |
| [集群版本升级 — pdb](upgrade-cluster-version-pdb.md) | Fusion | 3 | pdb, upgrade, pod-disruption-budget, drain, node-drain | 3 | 10 | high |
| [ACR 认证与 RBAC — soft-delete](acr-authentication-rbac-soft-delete.md) | Fusion | 0 | acr, soft-delete, cli, manifest-restore, geo-replication | 1 | 9 | low |
| [CRUD 操作与 Failed State 恢复 — failed-state](crud-reconcile-failedstate-failed-state.md) | Fusion | 0 | failed-state, monitoring, log-analytics, container-insights, reconcile | 2 | 9 | medium |
| [CNI 与 Overlay 网络 — azure-cni](networking-cni-overlay-azure-cni.md) | Fusion | 0 | azure-cni, ip-exhaustion, networking, upgrade, subnet | 3 | 9 | high |
| [私有集群网络](networking-private-cluster.md) | Fusion | 1 | private-cluster, api-server, private-endpoint, command-invoke, vnet-integration | 4 | 9 | high |
| [VMSS CSE 与节点启动 — extension](node-vmss-cse-extension.md) | Fusion | 2 | extension, dapr, mooncake, app-configuration, helm | 3 | 9 | high |
| [Pod 调度与驱逐](pod-scheduling-eviction.md) | Fusion | 2 | taint, aks, kube-scheduler, control-plane, node-scheduling | 3 | 9 | high |
| [Azure Files SMB — storage](storage-azure-files-smb-storage.md) | Fusion | 0 | storage, azure-files, smb, csi-driver, cifs | 3 | 9 | high |
| [Blob CSI / BlobFuse — blobfuse](storage-blob-blobfuse-blobfuse.md) | Fusion | 0 | blobfuse, storage, cache, pvc, azure-blob | 3 | 9 | high |
| [ACI 网络与 DNS — confidential-containers](aci-networking-confidential-containers.md) | Fusion | 1 | aci, confidential-containers, cce-policy, device-hash, cached-image | 1 | 8 | low |
| [AGIC HTTP 错误码排查 — ingress](agic-http-errors-ingress.md) | Fusion | 0 | agic, ingress, application-gateway, addon, 404 | 3 | 8 | high |
| [集群创建与初始配置](cluster-creation-config.md) | Fusion | 1 | managed-namespaces, preview, cluster-creation, terraform, kubedashboard | 3 | 8 | high |
| [Nginx Ingress Controller](ingress-nginx.md) | Fusion | 0 | nginx-ingress, ingress, mooncake, app-routing, nginx | 3 | 8 | high |
| [出站连接](networking-egress-outbound.md) | Quick | 0 | vmextensionerror, oraspull, network-isolated, cve, openssh | 3 | 8 | high |
| [节点性能与资源管理 — general](node-performance-resource-general.md) | Fusion | 1 | throttling, pending, exit-code-137, mlocate, updatedb | 3 | 8 | high |
| [VMSS CSE 与节点启动 — general](node-vmss-cse-general.md) | Fusion | 1 | vmsscse, cluster-extension, byok, key-vault, diskencryptionset | 3 | 8 | high |
| [ACI 网络与 DNS — deployment-failure](aci-networking-deployment-failure.md) | Fusion | 0 | aci, deployment-failure, confidential-containers, cce-policy, fraud-detection | 1 | 7 | low |
| [ACR 认证与 RBAC — notation](acr-authentication-rbac-notation.md) | Quick | 0 | acr, notation, verification, signing, certificate | 1 | 7 | low |
| [Istio 安装与配置 — gateway-api](istio-installation-gateway-api.md) | Fusion | 1 | gateway-api, istio, app-routing, migration, certificate | 3 | 7 | high |
| [DNS 解析排查 — coredns](networking-dns-resolution-coredns.md) | Fusion | 0 | coredns, upgrade, 403, networking, scale-down | 3 | 7 | high |
| [外部负载均衡器与 SNAT — networking](networking-lb-external-networking.md) | Fusion | 0 | networking, snat, outbound, basic-lb, multiple-nodepools | 2 | 7 | medium |
| [NSG 规则排查 — firewall](networking-nsg-rules-firewall.md) | Quick | 0 | firewall, nsg, egress, outbound-connectivity, mcr | 2 | 7 | medium |
| [UDR 与路由 — ossku](networking-udr-routing-ossku.md) | Fusion | 0 | ossku, cvm, flatcar, fips, ubuntu | 1 | 7 | low |
| [节点 NotReady](node-not-ready.md) | Fusion | 1 | pthread_create, node-not-ready, pid-exhaustion, eviction, containerd | 3 | 7 | high |
| [Cluster Autoscaler — general](scale-cluster-autoscaler-general.md) | Fusion | 3 | node-bootstrap, control-plane, scale-up, service-bug, backend-restart | 2 | 7 | medium |
| [RBAC 与授权 — general](security-rbac-authz-general.md) | Quick | 0 | mooncake, vmss, reconciliation, scaling, jit-access | 2 | 7 | medium |
| [ACR 认证与 RBAC — unauthorized](acr-authentication-rbac-unauthorized.md) | Quick | 0 | acr, unauthorized, connected-registry, arc-extension, connection-string | 2 | 6 | medium |
| [网络连通性通用 — api-server](networking-connectivity-general-api-server.md) | Fusion | 1 | api-server, authorized-ip, i/o-timeout, connectivity, tls-handshake | 2 | 6 | medium |
| [防火墙与代理 — http-proxy](networking-firewall-proxy-http-proxy.md) | Fusion | 0 | http-proxy, windows, cse, certificate, provisioning | 1 | 6 | low |
| [外部负载均衡器与 SNAT — image-pull](networking-lb-external-image-pull.md) | Fusion | 1 | image-pull, x509, kube-proxy, ssl-inspection, firewall | 2 | 6 | medium |
| [内部负载均衡器 — networking](networking-lb-internal-networking.md) | Quick | 0 | load-balancer, networking, snat, slb, outbound-pool | 2 | 6 | medium |
| [UDR 与路由 — authentication](networking-udr-routing-authentication.md) | Quick | 0 | authentication, jwt, claim-mapping, cel, agentic-cli | 2 | 6 | medium |
| [节点性能与资源管理 — memory](node-performance-resource-memory.md) | Fusion | 1 | memory, oom-kill, cgroup, exit-code-137, journalctl | 2 | 6 | medium |
| [Pod CrashLoopBackOff / 重启](pod-crashloop-restart.md) | Fusion | 2 | crashloopbackoff, api-server, product-issue, restart, metrics-server | 3 | 6 | high |
| [Cluster Autoscaler — cluster-autoscaler](scale-cluster-autoscaler-cluster-autoscaler.md) | Fusion | 3 | cluster-autoscaler, scale-down, min-count, scale-up, pending-pods | 3 | 6 | high |
| [Karpenter / NAP](scale-karpenter-nap.md) | Fusion | 1 | karpenter, nap, node-autoprovision, stuck, provisioning | 2 | 6 | medium |
| [节点池扩缩容 — scale](scale-nodepool-scale.md) | Fusion | 1 | scale, subscription-limit, controlplaneaddonsnotready, kube-system, user-pods | 1 | 6 | low |
| [Azure Policy — gatekeeper](security-azure-policy-gatekeeper.md) | Fusion | 0 | gatekeeper, azure-policy, image-integrity, ratify, security | 2 | 6 | medium |
| [RBAC 与授权 — rbac](security-rbac-authz-rbac.md) | Quick | 0 | rbac, forbidden, authorization, azure-rbac, kubernetes-rbac | 3 | 6 | high |
| [Azure Files NFS](storage-azure-files-nfs.md) | Fusion | 0 | nfs, storage, azure-blob, blob-nfs, nfs3 | 3 | 6 | high |
| [PV/PVC 与卷管理 — csi](storage-pv-pvc-csi.md) | Quick | 0 | csi, key-vault, secrets-store, secretproviderclass, azure-file | 2 | 6 | medium |
| [节点镜像升级 — node-image](upgrade-node-image-node-image.md) | Fusion | 4 | node-image, cve, security, ubuntu-1804, retirement | 2 | 6 | medium |
| [Windows 节点通用](windows-nodes-general.md) | Fusion | 0 | windows, containerd, docker-deprecation, contentidea-kb, agentic-cli | 2 | 6 | medium |
| [ACI 网络与 DNS — escalation](aci-networking-escalation.md) | Fusion | 0 | aci, escalation, icm, asc, cri | 1 | 5 | low |
| [ACI 网络与 DNS — subnet](aci-networking-subnet.md) | Fusion | 1 | subnet, networking, ip-exhaustion, failed-state, subnetisfull | 2 | 5 | medium |
| [ACR 认证与 RBAC — kusto](acr-authentication-rbac-kusto.md) | Fusion | 0 | acr, kusto, icm, acr-tasks, buildhosttrace | 1 | 5 | low |
| [AGIC HTTP 错误码排查 — networking](agic-http-errors-networking.md) | Fusion | 0 | networking, agic, application-gateway, arm-connectivity, egress | 1 | 5 | low |
| [CRUD 操作与 Failed State 恢复 — reconcile](crud-reconcile-failedstate-reconcile.md) | Fusion | 0 | reconcile, update, delete, concurrent-operation, addon-manager | 2 | 5 | medium |
| [ICM 与升级](icm-escalation.md) | Fusion | 0 | icm, ephemeral-disk, remediator, node-recovery, os-disk | 2 | 5 | medium |
| [AAD 集成与认证 — general](identity-aad-integration-general.md) | Fusion | 0 | defender, jit, access, customerdataadministrator, saw | 4 | 5 | high |
| [托管标识 (MSI)](identity-managed-identity.md) | Quick | 0 | managed-identity, kms, etcd-encryption, conditional-access, service-principal | 1 | 5 | low |
| [服务主体](identity-service-principal.md) | Quick | 0 | service-principal, reset-sp, node-image, latest-mode, portal | 2 | 5 | medium |
| [Istio 安装与配置 — meshconfig](istio-installation-meshconfig.md) | Quick | 0 | istio, meshconfig, envoy, sidecar, redis | 2 | 5 | medium |
| [网络连通性通用 — network-observability](networking-connectivity-general-network-observability.md) | Fusion | 0 | network-observability, acns, retina, hubble-ui, unsupported | 1 | 5 | low |
| [网络连通性通用 — vmss](networking-connectivity-general-vmss.md) | Fusion | 0 | vmss, certificate-expiry, x509, cert-rotation, tls-bootstrapping | 2 | 5 | medium |
| [外部负载均衡器与 SNAT — aks](networking-lb-external-aks.md) | Fusion | 0 | aks, agentpool, rollback, blue-green, upgrade | 1 | 5 | low |
| [NSG 规则排查 — networking](networking-nsg-rules-networking.md) | Quick | 0 | nsg, networking, loadbalancer, loadbalancersourceranges, service-tags | 1 | 5 | low |
| [UDR 与路由 — scale](networking-udr-routing-scale.md) | Fusion | 1 | scale, crud, upgrade, image-not-found, invalidauthenticationtoken | 1 | 5 | low |
| [UDR 与路由 — udr](networking-udr-routing-udr.md) | Fusion | 0 | udr, kubenet, bgp, azure-policy, route-table | 2 | 5 | medium |
| [节点配置错误](node-provisioning-errors.md) | Fusion | 1 | kaito, gpu, node-provisioning, prometheus, grafana | 3 | 5 | high |
| [Portal CLI 与工具](portal-cli-tools.md) | Quick | 0 | portal, role-assignment, 409, alerting, asc | 3 | 5 | high |
| [Cluster Autoscaler — autoscaler](scale-cluster-autoscaler-autoscaler.md) | Fusion | 3 | autoscaler, node-pool, vms, snapshot, 21v-gap | 4 | 5 | high |
| [节点池扩缩容 — vmss](scale-nodepool-vmss.md) | Fusion | 1 | vmss, 429, scaling, throttling, arm | 2 | 5 | medium |
| [节点池扩缩容 — windows](scale-nodepool-windows.md) | Fusion | 1 | windows, windows2025, nodepool, nodepool-creation, arm64 | 1 | 5 | low |
| [Azure Container Storage — 21v-unsupported](storage-acstor-21v-unsupported.md) | Fusion | 0 | acstor, 21v-unsupported, persistent-volume, storage-pool, container-storage | 2 | 5 | medium |
| [Azure Files SMB — smb](storage-azure-files-smb-smb.md) | Quick | 0 | azure-files, smb, port-445, nsg, dns | 3 | 5 | high |
| [集群版本升级 — scale](upgrade-cluster-version-scale.md) | Fusion | 3 | scale, upgrade, getsurgedvms_countnotmatch, autoscaler, surge-node | 2 | 5 | medium |
| [ACR 认证与 RBAC — connected-registry](acr-authentication-rbac-connected-registry.md) | Fusion | 0 | acr, connected-registry, already-activated, deactivate, arc-extension | 1 | 4 | low |
| [ACR 认证与 RBAC — private-endpoint](acr-authentication-rbac-private-endpoint.md) | Fusion | 0 | acr, private-endpoint, dns, virtual-wan, 403 | 2 | 4 | medium |
| [AGIC HTTP 错误码排查 — managed-identity](agic-http-errors-managed-identity.md) | Quick | 0 | agic, rbac, authorization, managed-identity, application-gateway | 1 | 4 | low |
| [通用排查 — api](general-troubleshooting-api.md) | Fusion | 1 | api, etag, client-error, if-match, if-none-match | 1 | 4 | low |
| [AAD 集成与认证 — authentication](identity-aad-integration-authentication.md) | Quick | 0 | authentication, aks-dashboard, aad-integration, unauthorized, dashboard | 2 | 4 | medium |
| [Istio 安装与配置 — key-vault](istio-installation-key-vault.md) | Quick | 0 | istio, key-vault, plug-in-ca, ingress-gateway, tls | 1 | 4 | low |
| [Istio 安装与配置 — service-mesh](istio-installation-service-mesh.md) | Fusion | 0 | istio, service-mesh, addon, 21v-gap, mtls | 3 | 4 | high |
| [Mooncake 21V 功能差异](mooncake-21v-gaps.md) | Fusion | 0 | 21v-unsupported, fleet-manager, multi-cluster, kms, encryption | 2 | 4 | medium |
| [CNI 与 Overlay 网络 — general](networking-cni-overlay-general.md) | Quick | 0 | kubenet, cni, pod-cidr, insufficient-pod-cidr, networking | 2 | 4 | medium |
| [网络连通性通用 — mooncake](networking-connectivity-general-mooncake.md) | Quick | 0 | mooncake, ubuntu, daily-update, auto-upgrade, connection-timeout | 1 | 4 | low |
| [DNS 解析排查 — dns-resolution](networking-dns-resolution-dns-resolution.md) | Fusion | 0 | dns-resolution, node-notready, api-server, fqdn, custom-dns | 2 | 4 | medium |
| [防火墙与代理 — mcr](networking-firewall-proxy-mcr.md) | Fusion | 0 | mcr, firewall, mooncake, image-pull, endpoint-change | 2 | 4 | medium |
| [内部负载均衡器 — health-probe](networking-lb-internal-health-probe.md) | Fusion | 0 | health-probe, load-balancer, upgrade, nginx-ingress, 1.24 | 3 | 4 | high |
| [内部负载均衡器 — internal-lb](networking-lb-internal-internal-lb.md) | Quick | 0 | internal-lb, timeout, nginx-ingress, ilb, azure-cni | 3 | 4 | high |
| [内部负载均衡器 — snat](networking-lb-internal-snat.md) | Fusion | 0 | load-balancer, snat, outbound-ports, scale, invalidloadbalancerprofileallocatedoutboundports | 2 | 4 | medium |
| [节点性能与资源管理 — oom](node-performance-resource-oom.md) | Fusion | 1 | oom, kube-state-metrics, ksm, crashloopbackoff, v1beta1 | 2 | 4 | medium |
| [VMSS CSE 与节点启动 — vmss](node-vmss-cse-vmss.md) | Fusion | 1 | vmss, troubleshooting, node-access, ssh, kubectl | 2 | 4 | medium |
| [节点池扩缩容 — vm-size](scale-nodepool-vm-size.md) | Fusion | 1 | vm-size, capacity, azsm, allocation-failure, ephemeral-disk | 2 | 4 | medium |
| [Azure Files SMB — csi-driver](storage-azure-files-smb-csi-driver.md) | Fusion | 0 | azure-files, csi-driver, managed-identity, mooncake, storage-account | 1 | 4 | low |
| [Blob CSI / BlobFuse — blobfuse2](storage-blob-blobfuse-blobfuse2.md) | Quick | 0 | blobfuse2, hns, storage, upgrade, blob-csi | 2 | 4 | medium |
| [Blob CSI / BlobFuse — general](storage-blob-blobfuse-general.md) | Quick | 0 | blob-storage, private-endpoint, firewall, nodepool-delete, vmss | 1 | 4 | low |
| [PV/PVC 与卷管理 — csi-driver](storage-pv-pvc-csi-driver.md) | Fusion | 0 | csi-driver, mooncake, cve, kube-system, mcr | 2 | 4 | medium |
| [集群版本升级 — dotnet](upgrade-cluster-version-dotnet.md) | Fusion | 3 | dotnet, upgrade, cgroups-v2, 1.25, memory-saturation | 3 | 4 | high |
| [集群版本升级 — scheduling](upgrade-cluster-version-scheduling.md) | Fusion | 3 | upgrade, scheduling, taint, node-pool, node-selector | 1 | 4 | low |
| [集群版本升级 — vmss](upgrade-cluster-version-vmss.md) | Fusion | 3 | upgrade, vmss, disk-size, os-disk, availability-zone | 2 | 4 | medium |
| [升级通用问题](upgrade-general.md) | Fusion | 2 | docker-in-docker, dind, containerd, runtime, 1.19 | 3 | 4 | high |
| [ACI 网络与 DNS — acr](aci-networking-acr.md) | Quick | 0 | aci, acr, rate-limit, toomanyrequests, docker-hub | 1 | 3 | low |
| [ACI 网络与 DNS — networking](aci-networking-networking.md) | Quick | 0 | networking, virtual-node, aci, udr, swift | 1 | 3 | low |
| [ACR 认证与 RBAC — aks](acr-authentication-rbac-aks.md) | Fusion | 0 | acr, aks, service-principal, role-assignment, authorization | 1 | 3 | low |
| [AGIC HTTP 错误码排查 — service-principal](agic-http-errors-service-principal.md) | Quick | 0 | agic, service-principal, application-gateway, authentication, secret-expired | 1 | 3 | low |
| [AGIC HTTP 错误码排查 — upgrade](agic-http-errors-upgrade.md) | Fusion | 2 | upgrade, overlay, agic, oec, finalizer | 1 | 3 | low |
| [CRUD 操作与 Failed State 恢复 — cluster-creation](crud-reconcile-failedstate-cluster-creation.md) | Fusion | 1 | cluster-creation, crud, quotaexceeded, managedclustercountexceedsquotalimit, cluster-quota | 2 | 3 | medium |
| [扩展与插件通用](extension-general.md) | Fusion | 1 | osba, open-service-broker, mooncake, environment-config, helm | 3 | 3 | high |
| [通用排查 — agentic-cli](general-troubleshooting-agentic-cli.md) | Quick | 0 | agentic-cli, az-aks-agent, llm, context-window, azure-openai | 1 | 3 | low |
| [通用排查 — dfm](general-troubleshooting-dfm.md) | Quick | 0 | dfm, email, access-denied, workaround, dynamics-365 | 1 | 3 | low |
| [通用排查 — pod-sandboxing](general-troubleshooting-pod-sandboxing.md) | Fusion | 2 | pod-sandboxing, kata, arm64, cvm, trusted-launch | 1 | 3 | low |
| [通用排查 — ssh](general-troubleshooting-ssh.md) | Quick | 0 | ssh, vmas, agent-pool, feature-limitation, security | 2 | 3 | medium |
| [内部运维流程](internal-ops.md) | Quick | 0 | jit, jarvis, saw, lockbox, customer-data-access | 1 | 3 | low |
| [Istio 安装与配置 — upgrade](istio-installation-upgrade.md) | Fusion | 2 | istio, upgrade, crashloopbackoff, third-party, helm-chart | 2 | 3 | medium |
| [Container Insights 与 Log Analytics](monitoring-container-insights.md) | Fusion | 1 | container-insights, fluent-bit, monitoring, missing-logs, latency | 2 | 3 | medium |
| [CNI 与 Overlay 网络 — cni-overlay](networking-cni-overlay-cni-overlay.md) | Fusion | 0 | cni-overlay, subnet, vnet, getvneterror, node-pool | 2 | 3 | medium |
| [CNI 与 Overlay 网络 — upgrade](networking-cni-overlay-upgrade.md) | Fusion | 2 | overlaymgr, upgrade, kyverno, webhook, crud | 1 | 3 | low |
| [网络连通性通用 — kubectl](networking-connectivity-general-kubectl.md) | Quick | 0 | kubectl, mirror, mooncake, install-cli, 404 | 3 | 3 | high |
| [网络连通性通用 — upgrade](networking-connectivity-general-upgrade.md) | Fusion | 2 | upgrade, pdb, operation-timeout, reconcile, 2h40m | 2 | 3 | medium |
| [网络连通性通用 — vnet](networking-connectivity-general-vnet.md) | Fusion | 0 | vnet, subnet, cidr, ip-address, workaround | 2 | 3 | medium |
| [防火墙与代理 — api-server](networking-firewall-proxy-api-server.md) | Fusion | 1 | api-server, firewall, authorized-ip, connection-failure, exit-51 | 1 | 3 | low |
| [防火墙与代理 — networking](networking-firewall-proxy-networking.md) | Fusion | 0 | firewall, networking, authorized-ip-ranges, service-cidr, subnet-conflict | 2 | 3 | medium |
| [内部负载均衡器 — cloud-controller-manager](networking-lb-internal-cloud-controller-manager.md) | Fusion | 1 | load-balancer, cloud-controller-manager, umi, managed-identity, rbac | 2 | 3 | medium |
| [内部负载均衡器 — cluster-delete](networking-lb-internal-cluster-delete.md) | Fusion | 1 | cluster-delete, load-balancer, public-ip, arm-cache, arm-sync | 2 | 3 | medium |
| [内部负载均衡器 — external-ip](networking-lb-internal-external-ip.md) | Fusion | 0 | load-balancer, external-ip, pending, authentication, service-principal | 1 | 3 | low |
| [NSG 规则排查 — vmss](networking-nsg-rules-vmss.md) | Quick | 0 | nsg, vmss, host-network, asg, cleanup | 2 | 3 | medium |
| [UDR 与路由 — route-table](networking-udr-routing-route-table.md) | Fusion | 0 | route-table, networking, vnet, resource-group, move | 3 | 3 | high |
| [UDR 与路由 — service-principal](networking-udr-routing-service-principal.md) | Quick | 0 | service-principal, cluster-creation, aadsts7000222, expired-secret, managed-identity | 1 | 3 | low |
| [节点 OS 与内核](node-os-kernel.md) | Fusion | 1 | kernel-parameters, sysctl, by-design, node-config, ubuntu-24.04 | 2 | 3 | medium |
| [节点性能与资源管理 — vpa](node-performance-resource-vpa.md) | Fusion | 1 | vpa, metrics-server, monitoring, cpu-throttling, addon-resizer | 2 | 3 | medium |
| [containerd 运行时](pod-containerd.md) | Fusion | 2 | containerd, docker, crictl, nsenter, packet-capture | 1 | 3 | low |
| [节点池扩缩容 — fips](scale-nodepool-fips.md) | Fusion | 1 | fips, arm64, azure-linux, azurelinux, os-sku | 1 | 3 | low |
| [Azure Policy — failed-state](security-azure-policy-failed-state.md) | Quick | 0 | failed-state, azure-policy, requestdisallowedbypolicy, governance, crud | 1 | 3 | low |
| [RBAC 与授权 — authorization](security-rbac-authz-authorization.md) | Fusion | 0 | authorization, resource-provider, flux, subscription, cluster-management | 2 | 3 | medium |
| [Azure Container Storage — nvme](storage-acstor-nvme.md) | Quick | 0 | acstor, nvme, storage-pool, ephemeral-disk, vm-size | 1 | 3 | low |
| [Azure Disk CSI — csi](storage-azure-disk-csi.md) | Fusion | 0 | azure-disk, csi, snapshot, pvc, cmk | 2 | 3 | medium |
| [Blob CSI / BlobFuse — blob-csi](storage-blob-blobfuse-blob-csi.md) | Quick | 0 | blob-csi, storage, blobfuse-proxy, crashloopbackoff, open-source-driver | 2 | 3 | medium |
| [PV/PVC 与卷管理 — configmap](storage-pv-pvc-configmap.md) | Quick | 0 | configmap, container-insights, log-analytics, omsagent, stdout | 2 | 3 | medium |
| [PV/PVC 与卷管理 — contentidea-kb](storage-pv-pvc-contentidea-kb.md) | Quick | 0 | contentidea-kb | 1 | 3 | low |
| [PV/PVC 与卷管理 — daemonset](storage-pv-pvc-daemonset.md) | Fusion | 0 | daemonset, sysctl, omsagent, pod-not-running, volume-mount | 2 | 3 | medium |
| [PV/PVC 与卷管理 — networking](storage-pv-pvc-networking.md) | Quick | 0 | networking, azure-firewall, snat-port-reuse, connectivity, application-rules | 1 | 3 | low |
| [集群版本升级 — auto-upgrade](upgrade-cluster-version-auto-upgrade.md) | Fusion | 4 | auto-upgrade, platform-support, k8s-version, maintenance-window, node-os-upgrade | 2 | 3 | medium |
| [集群版本升级 — deprecated-api](upgrade-cluster-version-deprecated-api.md) | Fusion | 5 | upgrade, deprecated-api, kube-audit, validation-error, force-upgrade | 2 | 3 | medium |
| [备份恢复与迁移](backup-migration.md) | Quick | 0 | region-retirement, migration, ce1, cn1, china-north-3 | 2 | 2 | medium |
| [容量与可用性区域](capacity-allocation.md) | Fusion | 0 | aks, host-ports, allocation-failed, port-exhaustion, availability-zone | 2 | 2 | medium |
| [Azure Arc](extension-arc.md) | Fusion | 1 | contentidea-kb | 1 | 2 | low |
| [GPU 工作负载](gpu-workloads.md) | Quick | 0 | mixed-sku, virtual-machines, vm-size, validation, kaito | 2 | 2 | medium |
| [诊断与日志收集](monitoring-diagnostic.md) | Fusion | 1 | monitoring, insightsmetrics, mooncake, feature-gap, azure-monitor | 2 | 2 | medium |
| [Mooncake 运维特殊处理](mooncake-operations.md) | Fusion | 1 | lts, long-term-support, premium-tier, pricing, kubernetes-version | 1 | 2 | low |
| [故障与事件](outage-incident.md) | Quick | 0 | rca, best-effort, support-scope, case-handling, third-party-scanner | 2 | 2 | medium |
| [镜像拉取失败](pod-image-pull-errors.md) | Fusion | 3 | kaito, image-pull, inference, gpu, inference-image | 2 | 2 | medium |
| [ACR 复制与地理分布](acr-replication-geo.md) | Quick | 0 | networking, packet-capture, multi-node, diagnostics, linux | 1 | 1 | low |
| [Flux / GitOps](extension-flux-gitops.md) | Fusion | 1 | flux, fluxconfiguration, crd, gitops, cluster-management | 1 | 1 | low |
| [Fleet Manager](fleet-manager.md) | Fusion | 1 | aks-fleet-manager, gates, approvals, update-run, async | 1 | 1 | low |
| [Istio 网络与流量管理](istio-networking.md) | Quick | 0 | support-scope, third-party, oss, best-effort, unsupported | 1 | 1 | low |
| [限流与配额](throttling-quota.md) | Fusion | 1 | api-throttling, 429, token-bucket, rate-limiting, put-agentpool | 1 | 1 | low |
| [自动升级与维护窗口](upgrade-auto-maintenance.md) | Fusion | 3 | auto-upgrade, maintenance-window, planned-maintenance, node-surge, upgrade-channel | 1 | 1 | low |

Last updated: 2026-04-07

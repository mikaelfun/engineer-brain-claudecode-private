# ARM Azure Arc Kubernetes — 排查速查

**来源数**: 9 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Kusto telemetry is not available for Azure Arc-enabled Kubernetes in Mooncake. Engineer cannot quer… | Arc-enabled K8s Kusto integration has not been deployed to the Mooncake environment. | Use Jarvis (Geneva monitoring portal) as the alternative diagnostic tool. Jarvis link: https://port… | 🔵 7.5 — onenote+21V适用 | [MCVKB/#kusto&jarvis.md] |
| 2 | After connecting K8S cluster to Winfield, pods in azure-arc namespace are not in running state. clu… | K8S cluster CoreDNS does not have entries for Winfield private DNS names (his.autonomous.cloud.priv… | Step 1: SSH into master node, create corefile.yaml with custom CoreDNS ConfigMap adding hosts entri… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Cannot connect Kubernetes cluster to Winfield - pods in azure-arc namespace not running, clusteride… | CoreDNS in the K8S cluster does not have host entries for Winfield's private domain names (his.auto… | Update CoreDNS ConfigMap to add Winfield host entries: 1) Create corefile.yaml with a ConfigMap tha… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Monitor extension deploy fails on Arc-enabled K8s cluster in Mooncake. S500 customer (Siemens… | Arc-enabled K8s extension deployment issues in Mooncake, potentially related to endpoint availabili… | Check extension compatibility for Mooncake. Verify Arc K8s agent connectivity. Confirm agent versio… | 🔵 7.0 — onenote+21V适用 | [MCVKB/#Cusotmer_siemens.md] |
| 5 | AkvSecretProviderExtension v1.4.2 fails to install on Arc-enabled K8s cluster in Mooncake | Extension version compatibility or endpoint issue in Mooncake sovereign cloud. Part of broader Arc … | Verify AkvSecretProviderExtension version availability in Mooncake. Check if newer version resolves… | 🔵 7.0 — onenote+21V适用 | [MCVKB/#Cusotmer_siemens.md] |
| 6 | AKS/Arc Kubernetes 的 Policy 合规数据更新缓慢或显示陈旧结果 | K8s Policy 合规数据经过多层异步管道：Policy pod 每 10 分钟拉取策略 + Gatekeeper 每 10 分钟扫描 + Policy pod 每 15 分钟上报数据至 Dat… | 告知客户 K8s 策略合规数据最长有 ~55 分钟延迟，属正常行为。排查步骤：1) 检查 Policy pod 日志（Azure Policy addon pod 归属 AKS/Arc 团队）；2)… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure Arc K8s cluster onboard Helm timeout: UPGRADE Failed time out waiting for the condition | Arc agent pods fail to start: missing azure-identity-certificate, pod security policies, slow netwo… | Check pod status: kubectl get pods -n azure-arc. If CrashLoopBackOff check azure-identity-certifica… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 8 | Azure Arc K8s connect fails: Cannot load native module Crypto.Hash._MD5 | Azure CLI extensions (connectedk8s, k8s-configuration) downloaded/installed incorrectly, missing cr… | Remove and re-add CLI extensions: az extension remove --name connectedk8s and k8s-configuration, th… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 9 | Azure Arc K8s proxy fails: Cannot connect to hybrid connection because no agent is connected in tar… | Cluster connect feature is disabled; clusterconnect-agent and kube-aad-proxy pods missing. | Enable cluster connect: az connectedk8s enable-features --features cluster-connect -n NAME -g RG. V… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |

## 快速排查路径
1. Use Jarvis (Geneva monitoring portal) as the alternative diagnostic tool. Jarvi… `[来源: onenote]`
2. Step 1: SSH into master node, create corefile.yaml with custom CoreDNS ConfigMa… `[来源: ado-wiki]`
3. Update CoreDNS ConfigMap to add Winfield host entries: 1) Create corefile.yaml … `[来源: ado-wiki]`

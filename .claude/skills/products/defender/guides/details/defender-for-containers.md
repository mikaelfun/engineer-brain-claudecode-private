# DEFENDER Defender for Containers — Comprehensive Troubleshooting Guide

**Entries**: 58 | **Draft sources**: 7 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-defender-sensor-antimalware-detection-prevention.md, ado-wiki-b-defender-pods-crashing-oom.md, ado-wiki-c-containers-va-one-queue.md, ado-wiki-d-arc-enabled-kubernetes-product-knowledge.md, ado-wiki-d-containers-plan-security-findings.md, ado-wiki-e-enabling-containers-at-scale.md, onenote-aks-workload-protection.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Defender For Containers
> Sources: ado-wiki, mslearn, onenote

**1. After removing Defender sensor from AKS cluster, CustomResourceDefinitions (policies.defender.microsoft.com and runtimepolicies.defender.microsoft.com) still remain in the cluster**

- **Root Cause**: CLI removal process does not clean up Defender CRDs. Known issue tracked by ICM 555510090.
- **Solution**: Manually delete the CRDs using 'kubectl delete crd policies.defender.microsoft.com runtimepolicies.defender.microsoft.com'. Safe to do so per PG confirmation. PG working on fixing CLI to auto-delete CRDs.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

**2. Defender for Containers gated deployment not active after enabling plan - container images not being blocked at deploy time despite enabling Defender for Containers**

- **Root Cause**: Required plan extensions (Defender Sensor, Security Gating, Registry Access, Security Findings) are disabled, or Kubernetes cluster version is earlier than 1.31, or kubelet identity federated credentials not configured for AKS
- **Solution**: Enable all required toggles in Defender for Containers plan (Defender Sensor, Security Gating, Registry Access, Security Findings). Ensure K8s cluster version >= 1.31. For AKS, verify kubelet identity and admission controller pod service account federated credentials.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. Defender for Containers security gating rule does not trigger - container images with vulnerabilities deployed without being blocked**

- **Root Cause**: Rule scope does not match deployed resource, CVE conditions not met, or image deploys before Defender for Cloud scan results are available (scan takes a few hours after initial push)
- **Solution**: Check rule scope and matching criteria. Ensure image is in a supported container registry with Registry Access and Security Findings enabled. Wait for Defender for Cloud to complete image scan before deployment. Images are scanned within a few hours after initial push.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. Defender for Containers gated deployment shows No valid reports found on ratify response - Unscanned images are not allowed by policy error when deploying container images**

- **Root Cause**: The container image has not been scanned by Defender for Cloud yet. Gating requires scan results to be available before deployment.
- **Solution**: Push the image to a supported container registry and wait for Defender for Cloud to complete the vulnerability scan (can take a few hours). Use audit mode during initial rollout to monitor impact without blocking. Scan images in CI/CD pipeline before deployment.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**5. Defender for Cloud Containers sensor pods not running on AKS - microsoft-defender-collector-ds DaemonSet shows pods not in Running state**

- **Root Cause**: Insufficient node resources (CPU/memory), network policies blocking egress to Azure endpoints, RBAC issues, or organization tag policies blocking sensor installation during resource group or workspace creation
- **Solution**: Check pod events: kubectl get ds microsoft-defender-collector-ds -n kube-system. Verify resource availability: kubectl top nodes. Ensure network egress to Azure endpoints is allowed. Check RBAC. If org requires tags, assign a custom workspace with required tags or exclude DefaultResourceGroup and DefaultWorkspace from tag policy.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**6. Customer reports CVE vulnerabilities found in Microsoft Defender for Containers pod images (pod-collector, low-level-collector, security-publisher) by vulnerability scanners running on the cluster. Cu**

- **Root Cause**: Defender container images on AKS are managed by the AKS Resource Provider with gradual rollout across regions and deployment rings (canary > early > broad). The customer cluster is in a ring that has not yet received the latest version. Rollout from one version to the next can take days to weeks across the full fleet. This is expected behavior.
- **Solution**: 1) Check latest available image version in MCR status portal (e.g. status-portal.mscr.io for azuredefender/stable/pod-collector) 2) Query K8S_Heartbeat on rome.kusto.windows.net/DetectionLogs by AzureResourceId to get current ComponentVersion 3) Compare against fleet-wide version distribution by querying K8S_Heartbeat for all AKS clusters grouped by ComponentVersion - if customer version has thousands of clusters it is normal rollout 4) If cluster appears stuck (<50 clusters on same version), check K8S_Logs for error/fatal/panic messages and version history over 30d 5) For AKS: images are fully managed, customer cannot manually upgrade; For Arc: verify auto-upgrade is enabled on microsoft.azuredefender.kubernetes extension; For manual Helm: customer must run helm upgrade
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**7. Customer reports high CPU or memory consumption in Microsoft Defender for Containers pods. Monitoring dashboard shows 100% CPU usage on defender pods. Customer concerned defender agent is consuming ex**

- **Root Cause**: The 100% CPU usage shown is relative to the allocated container limit, not the node total. Defender agent CPU limit is 150m (15% of one core). On a typical 16-core node, this equals less than 1% of total node CPU. High usage within the allocated limit is normal behavior and does not indicate a problem unless accompanied by pod restarts or missing security values.
- **Solution**: 1) Confirm whether pods have >5 restarts (restarts indicate a real problem) 2) Run Eicar alert validation to verify defender agent is operational 3) In AKS > Insights > Containers, check microsoft-defender-low-lev-collector and microsoft-defender-publisher metrics - note the % is of allocated limit, not node total 4) Check daemon set YAML under AKS > Workloads for actual Limits configuration (lowLevelCollector: 150m CPU/128Mi mem) 5) Query K8S_Logs on rome.kusto.windows.net for memory usage trends over 30d using Heartbeat Performance.Memory 6) Increasing nodes will NOT help - defender runs as DaemonSet on every node
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**8. Defender sensor pods fail to start on private AKS cluster with certificate registration failure; microsoft-defender-* pods not in Running state**

- **Root Cause**: Log Analytics workspace is not connected through Azure Monitor Private Link Scope (AMPLS) for private link AKS clusters, causing the sensor to fail certificate registration over private network
- **Solution**: Create an AMPLS resource, connect the Log Analytics workspace (found in AKS JSON view under logAnalyticsWorkspaceResourceId) to the AMPLS, create a Private Endpoint in the same region as the workspace + VNet, integrate with DNS, and validate microsoft-defender-* pods are successfully running
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**9. Defender publisher pod CrashLoopBackOff with no such host error when connecting to Log Analytics workspace (e.g., dial tcp: lookup <wsid>.oms.opinsights.azure.com: no such host)**

- **Root Cause**: Defender sensor still references an old/deleted Log Analytics workspace; customer deleted the workspace or wants to switch to a centralized workspace, but the sensor config was not updated
- **Solution**: 1) Disable defender sensors: az aks update --disable-defender --resource-group <rg> --name <cluster>. 2) Confirm pods removed: kubectl get pods -n kube-system | grep microsoft-defender. 3) Re-enable with new workspace: az aks update --enable-defender --defender-config <json-file> where JSON contains logAnalyticsWorkspaceResourceId set to the new workspace full resource ID
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**10. Defender publisher pod fails with failed to register a new certificate, status code: 403 and enters CrashLoopBackOff**

- **Root Cause**: Log Analytics workspace keys were rotated, workspace was deleted and recreated (new keys), or private link scope is blocking data ingestion from public networks not connected through a Private Link Scope
- **Solution**: Debug into publisher pod (kubectl debug), check /proc/<pid>/root/etc/omsagent-secret/WSID and KEY, cross-check with actual LA workspace values. If private link issue: go to LA workspace > Network Isolation > set Accept data ingestion from public networks not connected through a Private Link Scope to Yes. For private clusters, configure AMPLS connection
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**11. Defender publisher pod DNS resolution failure on Azure CNI network cluster with error dial tcp: lookup <wsid>.oms.opinsights.azure.com on <ip>:53: no such host**

- **Root Cause**: Azure CNI network clusters having issues performing DNS queries, preventing publisher pod from resolving the Log Analytics workspace OMS endpoint
- **Solution**: Debug into publisher pod (kubectl debug with ubuntu image). Test: wget google.com and nslookup <wsid>.oms.opinsights.azure.com. If DNS fails entirely, escalate to AKS support for DNS resolution investigation. If DNS works but LA endpoint fails, check LA workspace Network Isolation tab for private link scope blocking traffic
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**12. Defender for Cloud Extension installation fails on AKS hybrid clusters, blocked by Policy extension (Gatekeeper)**

- **Root Cause**: Gatekeeper webhook service (Azure Policy extension) is blocking the Defender extension installation on the AKS hybrid cluster
- **Solution**: Check if Gatekeeper exists: AKS cluster > Services and ingresses > gatekeeper-webhook-service. Also check resource locks: Get-AzResourceLock. Disable the Gatekeeper service until a permanent fix is available, then retry Defender extension installation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**13. microsoft-defender-publisher CrashLoopBackOff with panic: Error encountered during client initialization failed to registry a new certificate, status code: 403 on AKS**

- **Root Cause**: Tivan agent crash due to the referenced Log Analytics workspace being deleted or no longer existing; the logAnalyticsWorkspaceResourceID in the cluster config points to a non-existent workspace
- **Solution**: Verify workspace: Resource Explorer > expand [Microsoft.ContainerService/managedClusters] > search logAnalyticsWorkspaceResourceID > confirm workspace exists. If workspace is missing: 1) Delete the extension (https://learn.microsoft.com/azure/azure-arc/kubernetes/extensions#delete-extension-instance) 2) Re-install microsoft.azuredefender extension using Azure CLI
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**14. Defender Sensor Helm deployment status not deployed; conflicting defender for containers addon/extension already exists in the cluster**

- **Root Cause**: Another defender for containers addon or arc extension is already deployed in the cluster namespace, conflicting with the new Helm-based sensor installation
- **Solution**: For GKE/EKS: run helm list --namespace mdc, if multiple releases listed, disable conflicting sensor per Helm install docs. For AKS: run kubectl get pods -n kube-system | grep microsoft-defender, if pods exist, disable the existing addon. Then follow Automatic installation of the Defender Sensor in the Helm install documentation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**15. microsoft-defender-publisher-ds in Error or CrashLoop state after Helm-based Defender sensor installation**

- **Root Cause**: WS_GUID or PRIMARY_KEY environment variables were not set correctly during Helm install, causing publisher pod to fail authentication to Log Analytics workspace
- **Solution**: Verify WS_GUID: az monitor log-analytics workspace show --ids <resource_id> --query customerId -o tsv. Verify PRIMARY_KEY: az monitor log-analytics workspace get-shared-keys --name <name> --resource-group <rg> --query primarySharedKey -o tsv. If values mismatch, set variables correctly and re-run helm install with --debug flag
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**16. Defender sensor Helm installation fails or produces errors due to incorrect Azure Resource ID format for the cluster**

- **Root Cause**: Azure cluster ResourceId was set with an incorrect value or wrong ARM format during Helm install configuration
- **Solution**: Verify ResourceId: run helm get values microsoft-defender-for-container-sensor -n mdc | grep ResourceId or use jq: helm get values azuredefenderdebug -n mdc -o json | jq -r .Azure.Cluster.ResourceId. Ensure the ResourceId follows the correct ARM format as described in the Helm install documentation, then re-run helm install
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**17. Microsoft Defender pods experiencing multiple restarts or OOM (Out of Memory, exit code 137) on AKS or Arc-enabled Kubernetes clusters. Pods in kube-system (AKS) or mdc (Arc) namespace are crash-loopi**

- **Root Cause**: Three common causes: 1) Container memory limit reached due to higher than normal load (e.g. too many pods per node exceeding defender pod capacity) 2) Application memory leak causing OOM kills 3) Node overcommitment where total memory used by all pods exceeds node memory, causing defender pods with explicit limits to be evicted first.
- **Solution**: 1) Query K8S_Pods on romeeus/romeuksouth Kusto to identify restarting defender pods and restart counts by PodName/ContainerName/NodeName 2) For OOM (code 137): a) High pod count per node -> engage PG via ICM to increase defender pod limit b) Other pods also OOM -> likely application issue, customer should add resource limits c) Node overcommitted -> customer should scale up nodes or add limits to unlimited pods 3) Note: failed liveness probe errors are symptoms not root cause 4) Collect kubectl describe pod and kubectl logs from affected namespace 5) For AKS additionally check Azure Service Insights > Pods and Restarts 6) Escalate to Defender for Containers sensor on-call if component-specific wiki unavailable
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🟡 4.0/10 — ADO Wiki]`

### Phase 2: Containers
> Sources: ado-wiki, mslearn

**1. 无法查看或编辑 Defender for Cloud 中的 Gated Deployment Policy（Kubernetes 容器部署策略），API 返回 403 Forbidden**

- **Root Cause**: 用户缺少 Entra 级别的 Global Administrator 或 Security Administrator 权限；该策略在 tenant 级别配置，需要相应的 Entra 角色
- **Solution**: 在 Microsoft Entra 中为用户分配 Global Administrator 或 Security Administrator 角色
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Gated Deployment Policy 配置后无 admission events 产生，Admission Monitoring 中无数据**

- **Root Cause**: 可能原因：(1) Containers plan 下 Security findings (preview) 扩展未启用；(2) AKS 集群版本低于 1.31；(3) Admission controller agent 未安装或未正常运行
- **Solution**: (1) 在 Containers plan 下启用 Security findings (preview) 扩展；(2) 确认集群版本 ≥ 1.31（在 AKS cluster overview 中查看）；(3) 执行命令验证 admission controller 安装状态，检查 logs 中是否出现 'Serving webhook server' 日志行（端口 8443）
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. 无法查看或编辑 Defender for Cloud 中的 Binary Drift Policy（Kubernetes 二进制漂移策略），API 返回 403 Forbidden**

- **Root Cause**: 用户缺少 Entra 级别的 Global Administrator 或 Security Administrator 权限；该策略在 tenant 级别配置
- **Solution**: 在 Microsoft Entra 中为用户分配 Global Administrator 或 Security Administrator 角色
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Kubernetes 集群上发生 binary drift 后未收到告警**

- **Root Cause**: 可能原因：(1) drift 事件发生后不足 1 小时；(2) 未真正发生 drift 事件；(3) 存在更高优先级的 policy rule 设置为 Ignore drift；(4) 集群所在订阅/connector 的 Defender Sensor plan 未启用；(5) 集群版本不满足要求（AKS < 1.29，EKS < 1.23）
- **Solution**: (1) 等待至少 1 小时；(2) 用 kubectl 创建测试 drift 事件：`kubectl run ubuntu-pod --image=ubuntu --restart=Never -- /bin/bash -c 'cp /bin/echo /bin/echod; /bin/echod test'`；(3) 执行 `kubectl get policies mdc-policy -o=yaml` 检查规则优先级；(4) Azure 订阅在 Environment Settings → Containers plan 启用 Defender sensor；AWS/GCP connector 启用 Auto provision Defender sensor for Azure Arc；(5) 升级集群到 AKS ≥ 1.29 / EKS ≥ 1.23
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. AKS resources flagged unhealthy for "Container images should be deployed from trusted registries only"**

- **Root Cause**: Allowed container images regex not configured or does not match all running container images in the cluster
- **Solution**: Update regex in ASC Default initiative Parameters > Allowed container images regex. Verify with kubectl get pods -o jsonpath to list all images, test regex at regex101.com. If still unhealthy, check policy compliance status and run on-demand scan with Start-AzPolicyComplianceScan
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. MDC recommendation "Container with privilege escalation should be avoided" showing pods as unhealthy**

- **Root Cause**: Pod/container securityContext does not have AllowPrivilegeEscalation set to false. Policy evaluates Kubernetes data plane YAML template
- **Solution**: Set securityContext.allowPrivilegeEscalation: false in pod/container spec. Must set individually for each container in multi-container pods. Recreate pods to apply changes. MDC updates within 30 minutes via policy refresh
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. MDC recommendation "Running containers as root user should be avoided" showing pods as unhealthy**

- **Root Cause**: Pod/container securityContext does not have runAsNonRoot set to true
- **Solution**: Add securityContext with runAsNonRoot: true to pod/container spec. For multi-container pods, apply to all containers including InitContainers. Recreate pods. Warning: some containers require root - changing may cause CrashLoopBack
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. Defender for Containers auto-provisioning (DINE policy) fails to deploy security profile on AKS clusters when customer has organization-level Resource Tagging policy**

- **Root Cause**: Defender auto-provisioning creates DefaultResourceGroup-<RegionShortCode> and DefaultWorkspace-<sub-id>-<RegionShortCode>. If customer has an Org policy for Resource Tagging, these resource creations will be blocked by the tagging policy.
- **Solution**: Set a pre-defined workspace override for SecurityProfile DINE policy (see User Story 1936743), or exclude DefaultResourceGroup-<RegionShortCode> and DefaultWorkspace-<sub-id>-<RegionShortCode> from the Resource Tagging Org policy.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**9. After disabling Defender for Containers plan from Azure portal UI, security profile and defender components (agents, extensions) remain deployed on AKS clusters**

- **Root Cause**: Disabling the Containers plan from the UI stops monitoring, assessing, and alerting but does not change auto-provisioning settings and does not remove already deployed components (security profile, extensions).
- **Solution**: 1) Manually disable auto-provisioning of Defender for Containers components in Environment Settings. 2) Remove the Security Profile using REST API: PUT https://management.azure.com/subscriptions/{SubId}/resourcegroups/{RG}/providers/Microsoft.ContainerService/managedClusters/{ClusterName}?api-version=2021-07-01 with body setting securityProfile.azureDefender.enabled to false.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**10. AKS Low-Level Collector image (version 1.3.81) reports security vulnerabilities detected by Defender for Containers**

- **Root Cause**: Old Low-Level Collector image version (<2.X) has known security issues. AKS versions below 1.29 ship with the vulnerable image.
- **Solution**: Upgrade AKS to version 1.29 or higher to auto-deploy the latest patched image. If upgrade is not possible, open a CRI ticket to the Defender team specifying the image version and detected vulnerabilities.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**11. Customer uses latest Microsoft image from MCR (Microsoft Container Registry/Artifact Registry) and Defender for Containers VA detects multiple vulnerabilities. Customer asks Microsoft to remediate or **

- **Root Cause**: Microsoft container images (e.g. Azure Functions, .NET) are owned by their respective product teams, not by Defender for Cloud. Defender for Containers only detects findings but does not own, maintain, or patch any images.
- **Solution**: 1) Confirm the exact MCR image customer is using (get MCR link like mcr.microsoft.com/en-us/artifact/mar/azure-functions/dotnet/tags). 2) Use the Help links on MCR page to identify the owning product team. 3) Transfer the case to the owning product team for image remediation guidance. 4) Optionally suggest customer create a GitHub issue on the image repo.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**12. ECR images with at least one layer over 2GB are not being scanned by Defender for Containers ECR VA. No vulnerability assessment results appear for these images.**

- **Root Cause**: Design limitation of ECR VA solution. Images with any layer exceeding 2GB are explicitly not supported and will not be scanned.
- **Solution**: Inform customer this is a known platform limitation. If VA scanning is required, recommend restructuring image layers to keep each layer below 2GB.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**13. Public ECR repositories and manifest lists do not show vulnerability assessment results in Defender for Containers.**

- **Root Cause**: ECR VA does not support scanning public repositories or manifest lists. Only private ECR repositories are in scope.
- **Solution**: Inform customer that VA scanning is only available for private ECR repositories. Public repos and manifest lists are not supported. If needed, suggest moving images to a private repository.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**14. Defender for Containers sensor pods not running on AKS**

- **Root Cause**: Insufficient resources, network policies blocking egress, RBAC issues
- **Solution**: Check pod events and node resources; increase nodes; allow Azure egress; verify permissions
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**15. Defender for Containers sensor installation fails due to organization resource tagging policy**

- **Root Cause**: Azure Policy requiring specific tags prevents sensor from creating DefaultResourceGroup and DefaultWorkspace
- **Solution**: Assign custom workspace with required tags, or exclude DefaultResourceGroup and DefaultWorkspace from tagging policy
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**16. Defender for Containers vulnerability scan no results for AKS Ephemeral OS disks or Windows nodes**

- **Root Cause**: Container images from AKS Ephemeral OS disk nodes or Windows nodes cannot be scanned by design
- **Solution**: Known limitation; use non-ephemeral OS disks for Linux nodes; scan via registry instead of runtime for Windows nodes
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 3: Aks
> Sources: ado-wiki, onenote

**1. AKS Defender Profile (SecurityProfile) not available in Mooncake - cannot enable Defender for Containers runtime protection on AKS clusters**

- **Root Cause**: AKS Defender Profile feature not deployed to Mooncake (21Vianet) environment
- **Solution**: Feature gap - AKS Defender Profile is not available in Mooncake. Inform customer this is a known limitation of the 21Vianet environment.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

**2. Defender for Cloud extension installation fails on AKS hybrid clusters; blocked by policy extension (Gatekeeper OPA webhook)**

- **Root Cause**: Gatekeeper (OPA) webhook service on the AKS cluster enforces admission policies that block the Defender extension installation. Resource locks may also interfere.
- **Solution**: Check if Gatekeeper exists: AKS cluster > Services and ingresses > gatekeeper-webhook-service. Check resource locks: Get-AzResourceLock. Disable Gatekeeper temporarily until permanent fix available. Related CRI: #364031691.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. microsoft-defender-publisher pod is in CrashLoopBackOff state on AKS; Tivan agent crash due to missing Log Analytics workspace**

- **Root Cause**: The Log Analytics workspace configured for Defender reporting (logAnalyticsWorkspaceResourceID) no longer exists or was deleted, causing the Tivan agent to crash during initialization.
- **Solution**: Check workspace via Resource Explorer: expand [Microsoft.ContainerService/managedClusters] > search logAnalyticsWorkspaceResourceID. Verify workspace exists; if deleted, reconfigure to valid workspace. See TSG: Publisher pod is restarting. Related CRI: #349423087.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Defender publisher pods continuously restarting on AKS cluster with errors reaching Log Analytics workspace**

- **Root Cause**: Local authentication for the Log Analytics agent is disabled on the workspace, preventing the Defender publisher pod from authenticating.
- **Solution**: Enable local authentication for Log Analytics. See: https://learn.microsoft.com/en-us/azure/azure-monitor/logs/azure-ad-authentication-logs. Related ICM: #553435740.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. AKS recommendation "Azure Kubernetes Service clusters should have Defender profile enabled" showing unhealthy**

- **Root Cause**: Defender security profile not enabled or Defender pods (microsoft-defender-*) not running/healthy on the AKS cluster
- **Solution**: Enable auto-provisioning for Defender profile in MDC Environment Settings. Verify pods with kubectl get pods --all-namespaces | grep defender. Pods should show Running 1/1 and 2/2. If failed, run kubectl describe pods to check Events. For Arc clusters verify Defender extension is succeeded. Allow 24-48h for recommendation update
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. AKS Security Insights (AKS Attach Blade) 中 Owner 分配按钮不可见，或所有推荐的 Risk factor 显示为 NA**

- **Root Cause**: Defender CSPM 在该订阅上未启用；Owner assignment 和 Risk factor 功能依赖 Defender CSPM 计划
- **Solution**: 通过 MDC 环境设置启用 Defender CSPM（可从 Settings 直接进入或通过 MDC portal）；所需角色：Subscription owner / contributor / security admin
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 4: K8S Proxy
> Sources: ado-wiki

**1. K8s Proxy service fails to collect Kubernetes inventory from AKS cluster, error indicates Kubernetes version not supported by AKS**

- **Root Cause**: Customer is using a Kubernetes version not supported by AKS (strict version support policy applies)
- **Solution**: Advise customer to update AKS cluster to a supported Kubernetes version. Ref: https://learn.microsoft.com/en-us/azure/aks/supported-kubernetes-versions
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. K8s Proxy service fails with KubernetesNotRunningException, no Kubernetes inventory data collected from AKS cluster**

- **Root Cause**: Customer's AKS cluster is in stopped state — provisioned to zero nodes, no data collection possible
- **Solution**: Data is not collected from stopped AKS clusters. Customer must start the cluster to resume data collection. Ref: https://learn.microsoft.com/en-us/azure/aks/start-stop-cluster
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. K8sProxy missingPermission error for GKE cluster (GCP), Kubernetes inventory not collected, agentless discovery fails for Google Cloud**

- **Root Cause**: MDC service account 'mdc-containers-k8s-operator' missing 'Kubernetes Engine Viewer' role in GCP IAM, or Workload Identity Federation 'Containers' pool not configured
- **Solution**: GCP: (1) Verify 'mdc-containers-k8s-operator' service account has 'Kubernetes Engine Viewer' role in GCP IAM > IAM window. (2) Verify Workload Identity Federation has 'Containers' pool. Check custom names if customer used non-default names during connector creation. If all configured, open CRI to 'Cloud/Protectors - Shilo's Team'.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**4. K8sProxy missingPermission error for EKS cluster (AWS), Kubernetes inventory not collected, agentless discovery fails for Amazon Web Services**

- **Root Cause**: MDCContainersAgentlessDiscoveryK8sRole IAM Role not found in AWS account, or role not mapped in EKS cluster's aws-auth ConfigMap
- **Solution**: AWS: (1) Verify 'MDCContainersAgentlessDiscoveryK8sRole' Role exists in IAM Roles. (2) Verify role is in EKS aws-auth ConfigMap: run `kubectl describe -n kube-system configmap/aws-auth` or use eksctl iamidentity-mapping. If all verified, open CRI to 'Cloud/Protectors - Shilo's Team'.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 5: Permission Binder
> Sources: ado-wiki

**1. AKS Permission Binder service fails to setup Trusted Access, result description shows Kubernetes version not supported by AKS**

- **Root Cause**: Customer's AKS cluster is running a Kubernetes version not supported by AKS
- **Solution**: Advise customer to update AKS cluster to a supported Kubernetes version. Ref: https://learn.microsoft.com/en-us/azure/aks/supported-kubernetes-versions
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. AKS Permission Binder service fails with ClusterInStopState error, Trusted Access setup not performed, no K8s data collected**

- **Root Cause**: Customer's AKS cluster is in stopped state (provisioned to zero nodes)
- **Solution**: Data is not collected from stopped AKS clusters. Customer must start the cluster. Ref: https://learn.microsoft.com/en-us/azure/aks/start-stop-cluster
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. AKS Permission Binder service fails with FeaturePreviewScopeLocked or TrustedAccessScopeLocked error, AKS Trusted Access feature not enabled**

- **Root Cause**: Customer has a read-only scope lock on Azure resources, blocking the two write operations needed: enabling Trusted Access feature flag and performing TA bind operation
- **Solution**: Customer must temporarily remove the resource scope lock for 6 hours to allow Permission Binder to complete environment setup, then can re-create the read-only lock. Ref: https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 6: Response Action
> Sources: ado-wiki

**1. MDC Cloud-Native Response Action on K8s pod fails during execution with authentication error in agentless platform (AgentlessMessageHandler.HandleMessageAsync failure)**

- **Root Cause**: Customer cluster does not have the correct role/permissions configured for the agentless platform to perform response operations. For non-AKS clusters, the security connector scripts may need to be re-run.
- **Solution**: 1. Use MDC Response Platform Dashboard with env_dt_traceId to trace the execution chain. 2. For AKS clusters: escalate to engineering team. 3. For non-AKS clusters: ask customer to re-run the scripts provided in the security connectors pane for the connector(s) created for the cloud account where the impacted cluster resides.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. MDC Cloud-Native Response Action on K8s pod fails with unsupported Kubernetes version error**

- **Root Cause**: The customer AKS cluster is running a Kubernetes version that is no longer supported by AKS, which prevents response actions from executing.
- **Solution**: Ask customer to check supported AKS versions by running: az aks get-versions --location [location] --output table. Advise upgrading the cluster to a supported Kubernetes version.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. MDC Cloud-Native Response Action Isolate/Unisolate pod network fails on K8s cluster due to missing network enforcer**

- **Root Cause**: The customer Kubernetes cluster does not have a network plugin/enforcer enabled, which is a prerequisite for network isolation response actions on pods.
- **Solution**: Verify that the customer has a network plugin/enforcer enabled on their K8s cluster. This is a prerequisite for isolate/unisolate pod network actions. Ask the customer to enable the network plugin if missing.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 7: Dcspm
> Sources: ado-wiki

**1. missingPermission error by AksPermissionBinder service when setting up AKS Trusted Access for DCSPM agentless scanning; agentless scanning cannot obtain permissions on AKS clusters**

- **Root Cause**: CloudPosture/securityOperators/DefenderCSPMSecurityOperator identity missing Kubernetes Agentless operator role assignment in subscription IAM, typically lost after manual deletion or plan reconfiguration
- **Solution**: 1. In Azure portal, subscription IAM > Role Assignments > search for DefenderCSPMSecurityOperator with Kubernetes Agentless operator role. 2. If role exists but error persists -> CRI to Cloud/Protectors - Shilo's Team. 3. If role missing -> disable DCSPM plan, wait 5 min, re-enable (auto-recovers). 4. If still missing -> CRI.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. DCSPM Agentless Discovery function fails to list AKS clusters with SubscriptionNotAuthorized error in logs, AKS clusters not discovered**

- **Root Cause**: Role assignment 'Kubernetes Agentless operator' for identity 'CloudPosture/securityOperators/DefenderCSPMSecurityOperator' is missing from subscription IAM — often occurs during or after DCSPM plan onboarding
- **Solution**: 1. Check discovery logs in cluster('rome').database('DetectionLogs').FunctionOperationEvent for 'AksClusterDiscovery.GetAksClustersBySubscription' with subscription ID. 2. If SubscriptionNotAuthorized: navigate to Azure portal > subscription > Access control (IAM) > Role Assignments, search for 'CloudPosture/securityOperators/DefenderCSPMSecurityOperator' and verify 'Kubernetes Agentless operator' role exists. 3. If role missing: disable DCSPM plan, wait 5 minutes, re-enable — this restores identity/role assignment. If still missing, open CRI for Defender team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 8: Defender Sensor
> Sources: ado-wiki

**1. High-latency ICM alert firing on Defender for Cloud data ingestion pipeline EventHub processor — alerts taking >7.5 minutes to generate, potential undetected data loss indicated**

- **Root Cause**: High load on CIENG data ingestion services causing throttled pods or KEDA scaling failures, or a recent deployment reaching the incident region caused the regression
- **Solution**: 1. Check CIENG dashboard for throttled pods/KEDA failures: https://mdcdev-anhxf7bsc6eugea5.weu.grafana.azure.com/goto/3a7w9BZDR. 2. Check recent Rome-Detection-DataIngestion pipeline deployments. 3. If throttled by CIENG: contact CIENG oncall team. 4. If caused by recent deployment: revert the deployment.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Defender for Containers Binary Drift Detection 'block' action rule defined in policy but external processes in containers are detected but not blocked**

- **Root Cause**: Defender Sensor version on the cluster is older than 0.10, which does not support the block/prevention action — only detection is available below v0.10
- **Solution**: Upgrade the Defender Sensor on the cluster to version 0.10 or greater to enable block/prevention support for binary drift detection rules.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 9: Admission Controller
> Sources: ado-wiki

**1. Defender for Cloud admission controller not installed on AKS cluster despite Defender for Containers plan being enabled**

- **Root Cause**: The cluster resource security profile does not have securityGating enabled, or the API version is below 2025-01-02-preview. The securityGating.enabled field must be true under the defender security profile.
- **Solution**: View the cluster resource JSON, verify API version is at least 2025-01-02-preview, and check that securityProfile.defender.securityGating.enabled is true. Run: kubectl get deployments -n kube-system defender-admission-controller to verify installation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Vulnerability assessment policy not enforced for specific namespace or cluster despite VA policy being defined in Defender for Cloud portal**

- **Root Cause**: Policy scope mismatch - the policy scope defined in the portal does not cover the target cluster or namespace where the deployment is occurring
- **Solution**: Compare the policy scope defined in the portal with the actual cluster/namespace of the deployment. Verify the policy has been deployed to the cluster by running: kubectl get the admission controller policy dump. Only rules whose scope matches the current cluster and subscription will appear.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 10: Defender For Container
> Sources: onenote

**1. Defender for Container features (runtime protection, auto-provisioning policy) not available in Mooncake portal despite plan being visible**

- **Root Cause**: Backend services and partner backends not deployed in Mooncake; built-in Azure Policy for AKS SecurityProfile auto-provisioning (ASC_Azure_Defender_Kubernetes_AKS_SecurityProfile_Deploy) missing in Mooncake
- **Solution**: Feature gap - PG confirmed backend deployment planned for end of H1 2022. Preview features are not available in Mooncake. Check ICM-278946645 for tracking.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.0/10 — OneNote]`

### Phase 11: Phoenix
> Sources: ado-wiki

**1. Phoenix OCI monitor triggered for long dequeue latency - messages waiting too long in the incoming queue of the OciArtifactPublisher component in Defender for Containers admission controller**

- **Root Cause**: Either increased message processing times in the OciArtifactPublisher component, or increased volume of incoming messages from the Assessor into the publish queue
- **Solution**: 1) Check if root cause is longer message processing times - follow TSG for 'Phoenix OCI - Message processing takes too long' monitor (check CPU load, pod count, Kusto for slow operations). 2) Check if cause is rise in incoming message volume - review Phoenix dashboards for Assessor publish graphs. Contact Vasili Galka for further assistance.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 12: Agentless
> Sources: ado-wiki

**1. AKS managed node vulnerability flagged by agentless K8s node VA but cannot be remediated - no patched node image available**

- **Root Cause**: For AKS managed nodes, vulnerability remediation depends on the availability of a patched node image from the AKS team. Even the latest cluster or node pool versions may not remediate every CVE immediately.
- **Solution**: Wait for AKS team to release a patched node image. Ensure VMSS nodes are restarted or rescaled periodically so they fetch the latest image once released. If urgent, raise a request with the AKS team for the specific CVE. Use the K8s node VA Jarvis dashboard to track scan status.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After removing Defender sensor from AKS cluster, CustomResourceDefinitions (policies.defender.mic... | CLI removal process does not clean up Defender CRDs. Known issue tracked by ICM 555510090. | Manually delete the CRDs using 'kubectl delete crd policies.defender.microsoft.com runtimepolicie... | 🟢 9.0 | OneNote |
| 2 | AKS Defender Profile (SecurityProfile) not available in Mooncake - cannot enable Defender for Con... | AKS Defender Profile feature not deployed to Mooncake (21Vianet) environment | Feature gap - AKS Defender Profile is not available in Mooncake. Inform customer this is a known ... | 🟢 9.0 | OneNote |
| 3 | 无法查看或编辑 Defender for Cloud 中的 Gated Deployment Policy（Kubernetes 容器部署策略），API 返回 403 Forbidden | 用户缺少 Entra 级别的 Global Administrator 或 Security Administrator 权限；该策略在 tenant 级别配置，需要相应的 Entra 角色 | 在 Microsoft Entra 中为用户分配 Global Administrator 或 Security Administrator 角色 | 🟢 8.5 | ADO Wiki |
| 4 | Gated Deployment Policy 配置后无 admission events 产生，Admission Monitoring 中无数据 | 可能原因：(1) Containers plan 下 Security findings (preview) 扩展未启用；(2) AKS 集群版本低于 1.31；(3) Admission co... | (1) 在 Containers plan 下启用 Security findings (preview) 扩展；(2) 确认集群版本 ≥ 1.31（在 AKS cluster overview... | 🟢 8.5 | ADO Wiki |
| 5 | 无法查看或编辑 Defender for Cloud 中的 Binary Drift Policy（Kubernetes 二进制漂移策略），API 返回 403 Forbidden | 用户缺少 Entra 级别的 Global Administrator 或 Security Administrator 权限；该策略在 tenant 级别配置 | 在 Microsoft Entra 中为用户分配 Global Administrator 或 Security Administrator 角色 | 🟢 8.5 | ADO Wiki |
| 6 | Kubernetes 集群上发生 binary drift 后未收到告警 | 可能原因：(1) drift 事件发生后不足 1 小时；(2) 未真正发生 drift 事件；(3) 存在更高优先级的 policy rule 设置为 Ignore drift；(4) 集群所在... | (1) 等待至少 1 小时；(2) 用 kubectl 创建测试 drift 事件：`kubectl run ubuntu-pod --image=ubuntu --restart=Never ... | 🟢 8.5 | ADO Wiki |
| 7 | Defender for Cloud extension installation fails on AKS hybrid clusters; blocked by policy extensi... | Gatekeeper (OPA) webhook service on the AKS cluster enforces admission policies that block the De... | Check if Gatekeeper exists: AKS cluster > Services and ingresses > gatekeeper-webhook-service. Ch... | 🟢 8.5 | ADO Wiki |
| 8 | microsoft-defender-publisher pod is in CrashLoopBackOff state on AKS; Tivan agent crash due to mi... | The Log Analytics workspace configured for Defender reporting (logAnalyticsWorkspaceResourceID) n... | Check workspace via Resource Explorer: expand [Microsoft.ContainerService/managedClusters] > sear... | 🟢 8.5 | ADO Wiki |
| 9 | Defender publisher pods continuously restarting on AKS cluster with errors reaching Log Analytics... | Local authentication for the Log Analytics agent is disabled on the workspace, preventing the Def... | Enable local authentication for Log Analytics. See: https://learn.microsoft.com/en-us/azure/azure... | 🟢 8.5 | ADO Wiki |
| 10 | AKS recommendation "Azure Kubernetes Service clusters should have Defender profile enabled" showi... | Defender security profile not enabled or Defender pods (microsoft-defender-*) not running/healthy... | Enable auto-provisioning for Defender profile in MDC Environment Settings. Verify pods with kubec... | 🟢 8.5 | ADO Wiki |
| 11 | AKS resources flagged unhealthy for "Container images should be deployed from trusted registries ... | Allowed container images regex not configured or does not match all running container images in t... | Update regex in ASC Default initiative Parameters > Allowed container images regex. Verify with k... | 🟢 8.5 | ADO Wiki |
| 12 | MDC recommendation "Container with privilege escalation should be avoided" showing pods as unhealthy | Pod/container securityContext does not have AllowPrivilegeEscalation set to false. Policy evaluat... | Set securityContext.allowPrivilegeEscalation: false in pod/container spec. Must set individually ... | 🟢 8.5 | ADO Wiki |
| 13 | MDC recommendation "Running containers as root user should be avoided" showing pods as unhealthy | Pod/container securityContext does not have runAsNonRoot set to true | Add securityContext with runAsNonRoot: true to pod/container spec. For multi-container pods, appl... | 🟢 8.5 | ADO Wiki |
| 14 | missingPermission error by AksPermissionBinder service when setting up AKS Trusted Access for DCS... | CloudPosture/securityOperators/DefenderCSPMSecurityOperator identity missing Kubernetes Agentless... | 1. In Azure portal, subscription IAM > Role Assignments > search for DefenderCSPMSecurityOperator... | 🟢 8.5 | ADO Wiki |
| 15 | K8s Proxy service fails to collect Kubernetes inventory from AKS cluster, error indicates Kuberne... | Customer is using a Kubernetes version not supported by AKS (strict version support policy applies) | Advise customer to update AKS cluster to a supported Kubernetes version. Ref: https://learn.micro... | 🟢 8.5 | ADO Wiki |
| 16 | K8s Proxy service fails with KubernetesNotRunningException, no Kubernetes inventory data collecte... | Customer's AKS cluster is in stopped state — provisioned to zero nodes, no data collection possible | Data is not collected from stopped AKS clusters. Customer must start the cluster to resume data c... | 🟢 8.5 | ADO Wiki |
| 17 | AKS Permission Binder service fails to setup Trusted Access, result description shows Kubernetes ... | Customer's AKS cluster is running a Kubernetes version not supported by AKS | Advise customer to update AKS cluster to a supported Kubernetes version. Ref: https://learn.micro... | 🟢 8.5 | ADO Wiki |
| 18 | AKS Permission Binder service fails with ClusterInStopState error, Trusted Access setup not perfo... | Customer's AKS cluster is in stopped state (provisioned to zero nodes) | Data is not collected from stopped AKS clusters. Customer must start the cluster. Ref: https://le... | 🟢 8.5 | ADO Wiki |
| 19 | AKS Permission Binder service fails with FeaturePreviewScopeLocked or TrustedAccessScopeLocked er... | Customer has a read-only scope lock on Azure resources, blocking the two write operations needed:... | Customer must temporarily remove the resource scope lock for 6 hours to allow Permission Binder t... | 🟢 8.5 | ADO Wiki |
| 20 | DCSPM Agentless Discovery function fails to list AKS clusters with SubscriptionNotAuthorized erro... | Role assignment 'Kubernetes Agentless operator' for identity 'CloudPosture/securityOperators/Defe... | 1. Check discovery logs in cluster('rome').database('DetectionLogs').FunctionOperationEvent for '... | 🟢 8.5 | ADO Wiki |
| 21 | High-latency ICM alert firing on Defender for Cloud data ingestion pipeline EventHub processor — ... | High load on CIENG data ingestion services causing throttled pods or KEDA scaling failures, or a ... | 1. Check CIENG dashboard for throttled pods/KEDA failures: https://mdcdev-anhxf7bsc6eugea5.weu.gr... | 🟢 8.5 | ADO Wiki |
| 22 | Defender for Containers Binary Drift Detection 'block' action rule defined in policy but external... | Defender Sensor version on the cluster is older than 0.10, which does not support the block/preve... | Upgrade the Defender Sensor on the cluster to version 0.10 or greater to enable block/prevention ... | 🟢 8.5 | ADO Wiki |
| 23 | Defender for Cloud admission controller not installed on AKS cluster despite Defender for Contain... | The cluster resource security profile does not have securityGating enabled, or the API version is... | View the cluster resource JSON, verify API version is at least 2025-01-02-preview, and check that... | 🟢 8.5 | ADO Wiki |
| 24 | Vulnerability assessment policy not enforced for specific namespace or cluster despite VA policy ... | Policy scope mismatch - the policy scope defined in the portal does not cover the target cluster ... | Compare the policy scope defined in the portal with the actual cluster/namespace of the deploymen... | 🟢 8.5 | ADO Wiki |
| 25 | Defender for Containers auto-provisioning (DINE policy) fails to deploy security profile on AKS c... | Defender auto-provisioning creates DefaultResourceGroup-<RegionShortCode> and DefaultWorkspace-<s... | Set a pre-defined workspace override for SecurityProfile DINE policy (see User Story 1936743), or... | 🟢 8.5 | ADO Wiki |
| 26 | After disabling Defender for Containers plan from Azure portal UI, security profile and defender ... | Disabling the Containers plan from the UI stops monitoring, assessing, and alerting but does not ... | 1) Manually disable auto-provisioning of Defender for Containers components in Environment Settin... | 🟢 8.5 | ADO Wiki |
| 27 | AKS Low-Level Collector image (version 1.3.81) reports security vulnerabilities detected by Defen... | Old Low-Level Collector image version (<2.X) has known security issues. AKS versions below 1.29 s... | Upgrade AKS to version 1.29 or higher to auto-deploy the latest patched image. If upgrade is not ... | 🟢 8.5 | ADO Wiki |
| 28 | Customer uses latest Microsoft image from MCR (Microsoft Container Registry/Artifact Registry) an... | Microsoft container images (e.g. Azure Functions, .NET) are owned by their respective product tea... | 1) Confirm the exact MCR image customer is using (get MCR link like mcr.microsoft.com/en-us/artif... | 🟢 8.5 | ADO Wiki |
| 29 | MDC Cloud-Native Response Action on K8s pod fails during execution with authentication error in a... | Customer cluster does not have the correct role/permissions configured for the agentless platform... | 1. Use MDC Response Platform Dashboard with env_dt_traceId to trace the execution chain. 2. For A... | 🟢 8.5 | ADO Wiki |
| 30 | MDC Cloud-Native Response Action on K8s pod fails with unsupported Kubernetes version error | The customer AKS cluster is running a Kubernetes version that is no longer supported by AKS, whic... | Ask customer to check supported AKS versions by running: az aks get-versions --location [location... | 🟢 8.5 | ADO Wiki |
| 31 | MDC Cloud-Native Response Action Isolate/Unisolate pod network fails on K8s cluster due to missin... | The customer Kubernetes cluster does not have a network plugin/enforcer enabled, which is a prere... | Verify that the customer has a network plugin/enforcer enabled on their K8s cluster. This is a pr... | 🟢 8.5 | ADO Wiki |
| 32 | Defender for Container features (runtime protection, auto-provisioning policy) not available in M... | Backend services and partner backends not deployed in Mooncake; built-in Azure Policy for AKS Sec... | Feature gap - PG confirmed backend deployment planned for end of H1 2022. Preview features are no... | 🟢 8.0 | OneNote |
| 33 | Phoenix OCI monitor triggered for long dequeue latency - messages waiting too long in the incomin... | Either increased message processing times in the OciArtifactPublisher component, or increased vol... | 1) Check if root cause is longer message processing times - follow TSG for 'Phoenix OCI - Message... | 🔵 7.5 | ADO Wiki |
| 34 ⚠️ | AKS Security Insights (AKS Attach Blade) 中 Owner 分配按钮不可见，或所有推荐的 Risk factor 显示为 NA | Defender CSPM 在该订阅上未启用；Owner assignment 和 Risk factor 功能依赖 Defender CSPM 计划 | 通过 MDC 环境设置启用 Defender CSPM（可从 Settings 直接进入或通过 MDC portal）；所需角色：Subscription owner / contributor... | 🔵 7.0 | ADO Wiki |
| 35 ⚠️ | K8sProxy missingPermission error for GKE cluster (GCP), Kubernetes inventory not collected, agent... | MDC service account 'mdc-containers-k8s-operator' missing 'Kubernetes Engine Viewer' role in GCP ... | GCP: (1) Verify 'mdc-containers-k8s-operator' service account has 'Kubernetes Engine Viewer' role... | 🔵 7.0 | ADO Wiki |
| 36 ⚠️ | K8sProxy missingPermission error for EKS cluster (AWS), Kubernetes inventory not collected, agent... | MDCContainersAgentlessDiscoveryK8sRole IAM Role not found in AWS account, or role not mapped in E... | AWS: (1) Verify 'MDCContainersAgentlessDiscoveryK8sRole' Role exists in IAM Roles. (2) Verify rol... | 🔵 7.0 | ADO Wiki |
| 37 ⚠️ | ECR images with at least one layer over 2GB are not being scanned by Defender for Containers ECR ... | Design limitation of ECR VA solution. Images with any layer exceeding 2GB are explicitly not supp... | Inform customer this is a known platform limitation. If VA scanning is required, recommend restru... | 🔵 7.0 | ADO Wiki |
| 38 ⚠️ | Public ECR repositories and manifest lists do not show vulnerability assessment results in Defend... | ECR VA does not support scanning public repositories or manifest lists. Only private ECR reposito... | Inform customer that VA scanning is only available for private ECR repositories. Public repos and... | 🔵 7.0 | ADO Wiki |
| 39 ⚠️ | Defender for Containers gated deployment not active after enabling plan - container images not be... | Required plan extensions (Defender Sensor, Security Gating, Registry Access, Security Findings) a... | Enable all required toggles in Defender for Containers plan (Defender Sensor, Security Gating, Re... | 🔵 6.0 | MS Learn |
| 40 ⚠️ | Defender for Containers security gating rule does not trigger - container images with vulnerabili... | Rule scope does not match deployed resource, CVE conditions not met, or image deploys before Defe... | Check rule scope and matching criteria. Ensure image is in a supported container registry with Re... | 🔵 6.0 | MS Learn |
| 41 ⚠️ | Defender for Containers gated deployment shows No valid reports found on ratify response - Unscan... | The container image has not been scanned by Defender for Cloud yet. Gating requires scan results ... | Push the image to a supported container registry and wait for Defender for Cloud to complete the ... | 🔵 6.0 | MS Learn |
| 42 ⚠️ | Defender for Cloud Containers sensor pods not running on AKS - microsoft-defender-collector-ds Da... | Insufficient node resources (CPU/memory), network policies blocking egress to Azure endpoints, RB... | Check pod events: kubectl get ds microsoft-defender-collector-ds -n kube-system. Verify resource ... | 🔵 6.0 | MS Learn |
| 43 ⚠️ | Defender for Containers sensor pods not running on AKS | Insufficient resources, network policies blocking egress, RBAC issues | Check pod events and node resources; increase nodes; allow Azure egress; verify permissions | 🔵 6.0 | MS Learn |
| 44 ⚠️ | Defender for Containers sensor installation fails due to organization resource tagging policy | Azure Policy requiring specific tags prevents sensor from creating DefaultResourceGroup and Defau... | Assign custom workspace with required tags, or exclude DefaultResourceGroup and DefaultWorkspace ... | 🔵 6.0 | MS Learn |
| 45 ⚠️ | Defender for Containers vulnerability scan no results for AKS Ephemeral OS disks or Windows nodes | Container images from AKS Ephemeral OS disk nodes or Windows nodes cannot be scanned by design | Known limitation; use non-ephemeral OS disks for Linux nodes; scan via registry instead of runtim... | 🔵 6.0 | MS Learn |
| 46 | Customer reports CVE vulnerabilities found in Microsoft Defender for Containers pod images (pod-c... | Defender container images on AKS are managed by the AKS Resource Provider with gradual rollout ac... | 1) Check latest available image version in MCR status portal (e.g. status-portal.mscr.io for azur... | 🔵 5.5 | ADO Wiki |
| 47 | Customer reports high CPU or memory consumption in Microsoft Defender for Containers pods. Monito... | The 100% CPU usage shown is relative to the allocated container limit, not the node total. Defend... | 1) Confirm whether pods have >5 restarts (restarts indicate a real problem) 2) Run Eicar alert va... | 🔵 5.5 | ADO Wiki |
| 48 | Defender sensor pods fail to start on private AKS cluster with certificate registration failure; ... | Log Analytics workspace is not connected through Azure Monitor Private Link Scope (AMPLS) for pri... | Create an AMPLS resource, connect the Log Analytics workspace (found in AKS JSON view under logAn... | 🔵 5.5 | ADO Wiki |
| 49 | Defender publisher pod CrashLoopBackOff with no such host error when connecting to Log Analytics ... | Defender sensor still references an old/deleted Log Analytics workspace; customer deleted the wor... | 1) Disable defender sensors: az aks update --disable-defender --resource-group <rg> --name <clust... | 🔵 5.5 | ADO Wiki |
| 50 | Defender publisher pod fails with failed to register a new certificate, status code: 403 and ente... | Log Analytics workspace keys were rotated, workspace was deleted and recreated (new keys), or pri... | Debug into publisher pod (kubectl debug), check /proc/<pid>/root/etc/omsagent-secret/WSID and KEY... | 🔵 5.5 | ADO Wiki |
| 51 | Defender publisher pod DNS resolution failure on Azure CNI network cluster with error dial tcp: l... | Azure CNI network clusters having issues performing DNS queries, preventing publisher pod from re... | Debug into publisher pod (kubectl debug with ubuntu image). Test: wget google.com and nslookup <w... | 🔵 5.5 | ADO Wiki |
| 52 | Defender for Cloud Extension installation fails on AKS hybrid clusters, blocked by Policy extensi... | Gatekeeper webhook service (Azure Policy extension) is blocking the Defender extension installati... | Check if Gatekeeper exists: AKS cluster > Services and ingresses > gatekeeper-webhook-service. Al... | 🔵 5.5 | ADO Wiki |
| 53 | microsoft-defender-publisher CrashLoopBackOff with panic: Error encountered during client initial... | Tivan agent crash due to the referenced Log Analytics workspace being deleted or no longer existi... | Verify workspace: Resource Explorer > expand [Microsoft.ContainerService/managedClusters] > searc... | 🔵 5.5 | ADO Wiki |
| 54 | Defender Sensor Helm deployment status not deployed; conflicting defender for containers addon/ex... | Another defender for containers addon or arc extension is already deployed in the cluster namespa... | For GKE/EKS: run helm list --namespace mdc, if multiple releases listed, disable conflicting sens... | 🔵 5.5 | ADO Wiki |
| 55 | microsoft-defender-publisher-ds in Error or CrashLoop state after Helm-based Defender sensor inst... | WS_GUID or PRIMARY_KEY environment variables were not set correctly during Helm install, causing ... | Verify WS_GUID: az monitor log-analytics workspace show --ids <resource_id> --query customerId -o... | 🔵 5.5 | ADO Wiki |
| 56 | Defender sensor Helm installation fails or produces errors due to incorrect Azure Resource ID for... | Azure cluster ResourceId was set with an incorrect value or wrong ARM format during Helm install ... | Verify ResourceId: run helm get values microsoft-defender-for-container-sensor -n mdc / grep Reso... | 🔵 5.5 | ADO Wiki |
| 57 | AKS managed node vulnerability flagged by agentless K8s node VA but cannot be remediated - no pat... | For AKS managed nodes, vulnerability remediation depends on the availability of a patched node im... | Wait for AKS team to release a patched node image. Ensure VMSS nodes are restarted or rescaled pe... | 🔵 5.5 | ADO Wiki |
| 58 ⚠️ | Microsoft Defender pods experiencing multiple restarts or OOM (Out of Memory, exit code 137) on A... | Three common causes: 1) Container memory limit reached due to higher than normal load (e.g. too m... | 1) Query K8S_Pods on romeeus/romeuksouth Kusto to identify restarting defender pods and restart c... | 🟡 4.0 | ADO Wiki |

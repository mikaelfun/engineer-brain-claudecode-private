# AKS 私有集群网络 — 排查工作流

**来源草稿**: ado-wiki-a-AzureML-AKS-Extension.md, ado-wiki-a-Dapr-AKS-Extension.md, ado-wiki-a-aks-private-cluster.md, ado-wiki-aks-private-cluster-jumpbox-managed-identity.md, ado-wiki-c-Check-cluster-diagnostic-settings.md, ado-wiki-c-VM-Guest-Agent-and-Extension-Troubleshooting-guideline.md, ado-wiki-multiple-apps-multiple-appgws-1-cluster.md, onenote-aks-workload-protection-defender.md
**Kusto 引用**: cluster-snapshot.md
**场景数**: 8
**生成日期**: 2026-04-07

---

## Scenario 1: AzureML AKS Extension
> 来源: ado-wiki-a-AzureML-AKS-Extension.md | 适用: 适用范围未明确

### 排查步骤

#### AzureML AKS Extension


#### Summary

AzureML extension extends Azure ML service capabilities seamlessly to Kubernetes clusters and enables customer to train and deploy models on Kubernetes anywhere at scale. With a simple AzureML extension deployment, customers can instantly onboard their data science team with productivity tools for full ML lifecycle, and have access to both Azure managed compute and customer managed Kubernetes anywhere. Customer is flexible to train and deploy models wherever and whenever business requires so. With built-in AzureML pipeline and MLOps support for Kubernetes, customers can scale machine learning adoption in their organization easily.

#### Support Boundary

##### AKS side

- Extension Deployed correctly
- Pods running
  - If the pods are not running under azureml namespace, follow the TSG . If you can fix the issue, great, if not escalate!
- Follow [TSG](https://github.com/Azure/AML-Kubernetes/blob/master/docs/troubleshooting.md).
- Anything else related to the ML workload or pods are owned by the ML support team
- If you are not able to solve the issue yourself or feel you need more assistance, escalate to the appropriate team listed below

#### Basic Flow

::: mermaid
 graph TD;
 A[AzureML Extension Installed?] --> |Yes| B[Installed Failed?];
A --> |No| Z[<a href="https://learn.microsoft.com/en-us/azure/machine-learning/how-to-deploy-kubernetes-extension?view=azureml-api-2&tabs=deploy-extension-with-cli">Follow Docs</a>];
B --> |Yes| Y[Escalate AKS RP];
B --> |No| X[Pods Running?];
X --> |Yes| W[Escalate to AzureML];
X --> |No| V[Follow TSG];
V --> |After TSG| U[Pods Running];
U --> |Yes| T[Still an Issue?];
T --> |Yes| S[Escalate to AzureML];
:::

#### Escalation Paths

Filing ICMs for Extension related issues go to AKS RP:
[AKS RP Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=K2i1zh)

Filing ICMs for AzureML related issues:
[AzureML Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=x26Ojq)

#### Verified Learning Resources

Resource | Description
------ | ------
[AzureML Troubleshooting Guide](https://github.com/Azure/AML-Kubernetes/blob/master/docs/troubleshooting.md) | AzureML documentation and troubleshooting guide
[AzureML Docs](https://github.com/Azure/AML-Kubernetes/) | AKS AzureML Extension doc

#### Basic TSG

Here is the troubleshooting guidance for AzureML reference.

1. AzureML Troubleshooting Guide: <https://github.com/Azure/AML-Kubernetes/blob/master/docs/troubleshooting.md>
2. [AKS-ML Troubleshooting Guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-ML(Azure-Machine-Learning)-TSG.md)

#### Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

- Adam Margherio <amargherio@microsoft.com>
- Chris Luo <soluo@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
- Youhua Tu <youhuatu@microsoft.com>

---

## Scenario 2: Summary
> 来源: ado-wiki-a-Dapr-AKS-Extension.md | 适用: 适用范围未明确

### 排查步骤


#### Summary

Dapr is a portable, event-driven runtime that makes it easy for any developer to build resilient, stateless and stateful applications that run on the cloud and edge and embraces the diversity of languages and developer frameworks. The Dapr AKS Extension provisions Dapr (creates the Dapr control plane) on an AKS cluster. This extension is useful because it eliminates the overhead and requirements of having to download any Dapr tooling and manually installing the runtime on AKS. Additionally, the extension offers support for all native Dapr configuration capabilities through simple command-line arguments.

#### Support Boundary

- Extension Deployed correctly
- Control Plane Running
  - Should be a deployed namespace that contains all the pods, will update when we have more info.
- Pods running
  - If the pods are not running, follow the [TSG](https://eng.ms/docs/cloud-ai-platform/azure/azure-core-compute/control-plane-bburns/azure-kubernetes-service/azure-kubernetes-service/doc/tsg/dapr-aks-extension). If you can fix the issue, great, if not escalate!
- Follow TSG
- If you are not able to solve the issue yourself or feel you need more assistance, escalate to the appropriate team listed below

##### Basic Flow

::: mermaid
 graph TD;
 A[DAPR Extension Deployed?] --> |Yes| B[Deployment Failed?];
A --> |No| Z[https://docs.microsoft.com/en-us/azure/aks/dapr];
B --> |Yes| Y[Escalate AKS RP];
B --> |No| X[Pods Running?];
X --> |Yes| W[Escalate to Dapr];
X --> |No| V[Follow TSG];
V --> |After TSG| U[Pods Running];
U --> |Yes| T[Still an Issue?];
T --> |Yes| S[Escalate to Dapr];
:::

#### Escalation Paths

Filing ICMs for Dapr related issues:
[Dapr Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=W2Y2G3)

Filing ICMs for Extension related issues go to AKS RP:
[AKS RP Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=M3Q2u0)

#### Verified Learning Resources

Resource | Description
------ | ------
[AKS Extension TSG](https://eng.ms/docs/cloud-ai-platform/azure/azure-core-compute/control-plane-bburns/azure-kubernetes-service/azure-kubernetes-service/doc/tsg/dapr-aks-extension) | AKS PG TSG
[Dapr Troubleshooting Guide](https://docs.dapr.io/operations/troubleshooting/) | Dapr source documentation and troubleshooting guide
[Use Dapr MS Docs](https://docs.microsoft.com/en-us/azure/aks/dapr?branch=pr-en-us-177959) | AKS Dapr Extension doc

#### Basic TSG

1. **Extension deployed and pods are running**
2. **Check Kusto Query for extension errors:**

```
let start=datetime(2021-10-01T00:00:00Z);
let end=datetime(2021-10-02T00:00:00Z);
cluster('Aks').database('AKSprod').AsyncQoSEvents
| where TIMESTAMP between (start..end)
| where resourceGroupName == "{RG_Name}"
| where resourceName == "{Resource_Name}"
| sort by PreciseTimeStamp desc
| project TIMESTAMP, propertiesBag
```

3. **Get Pod logs from customer**

Here is the upstream troubleshooting guidance for reference.

<https://docs.dapr.io/operations/troubleshooting/>

4. **Escalate**

#### ICMs

_None yet!_

#### Known issues

_None yet!_

#### Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Chase Overmire <chover@microsoft.com>
- Ben Parker <bparke@microsoft.com>

---

## Scenario 3: AKS Private Clusters
> 来源: ado-wiki-a-aks-private-cluster.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Private Clusters


#### Public Docs

<https://docs.microsoft.com/en-us/azure/aks/private-clusters>

#### PG Brown Bag

Click [here](https://msit.microsoftstream.com/video/4bee433c-1211-454a-8d7e-fd5a8c411273) to access it.

#### Deck Slides

Click [here](https://microsoftapc-my.sharepoint.com/:p:/r/personal/peni_microsoft_com/_layouts/15/guestaccess.aspx?e=tAmOqm&share=EdffwdwxAetEhFs9T5nR_AQBFmpY55VwkE3RUHV_yKEwhg) to access this resource.

#### Private Cluster

Private Cluster is mainly designed only for simple goal that Kube-apiServer IP should be Private and Shouldn't be Public.

Please make sure that even Private Cluster is Enabled , AKS Cluster still need Standard Public IP as requirement and this will be eliminated by new Feature **[UserSet Outbound Type](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/34763/OutboundType-UDR-SLB-no-PIP-)**

Private Link is Implemented using Azure Networking feature called [Azure Private Link](https://docs.microsoft.com/en-us/azure/private-link/private-link-overview) which allows Service Provider to provide their service endpoint (as Private Endpoint) in a completely different VNET. Using this approach, One way connectivity can be initiated from the Private endpoint to the backing Private link Service . In case of AKS , Private Endpoint is created in Customer AKS VNET and Private Link Service is created at Control Plane. As communication is only allowed from Private Endpoint to Private Link Service only which is one way, API-Server will still require tunnel to talk to nodes, pools, and K8s services in overlay.

Diagram Representation from PG Brown Bag:

![image.png](/.attachments/image-4b871880-f147-4446-857d-47234a4e3ff9.png)

For PG Documentation Which is Only for Internal Use only, Please refer [Internal PG Private Link Doc](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/27060/Private-Cluster)

#### Owner and Contributors

**Owner:** Enrique Lobo Breckenridge <enriquelo@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Walter Lopez <walter.lopez@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>
- Sunil Immadi <suimma@microsoft.com>

---

## Scenario 4: Troubleshooting Flow
> 来源: ado-wiki-aks-private-cluster-jumpbox-managed-identity.md | 适用: 适用范围未明确

### 排查步骤

| Problem | Cause | Solution |
|---|---|---|
| SSH Connection Times Out | Outbound port 22 blocked by corporate network/VPN | Use `az vm run-command`, Serial Console, or Azure Bastion |
| MI Login Fails with `--username` | Flag deprecated in newer Azure CLI | Use `--client-id`, `--object-id`, or `--resource-id` |
| kubectl Cannot Reach API Server | Jumpbox not in same/peered VNet as AKS cluster | Ensure proper VNet placement; verify DNS resolution of private FQDN |
| CA Blocks Service Principal | Organization CA policies block non-compliant devices/locations | Switch to Managed Identity (this guide) |

---

---

## Scenario 5: Troubleshooting Flow
> 来源: ado-wiki-c-Check-cluster-diagnostic-settings.md | 适用: 适用范围未明确

### 排查步骤

1. From Geneva Actions, navigate to `MonitoringService > Power user monitoring operations > Perform Get`.

2. Fill in the following parameters:
   - **Endpoint**: Put the cluster location here
   - **Path**: The resource ID of the cluster with `/providers/microsoft.insights/diagnosticSettings` appended.
     Example: `/subscriptions/{subId}/resourcegroups/{rg}/providers/Microsoft.ContainerService/managedClusters/{clusterName}/providers/microsoft.insights/diagnosticSettings`
   - **Query Parameters**: A supported Azure API version, e.g., `api-version=2023-05-01`

3. Click Run. The output is a JSON object containing the diagnostic settings:

```json
{
  "value": [
    {
      "name": "AKS_Master_logging",
      "properties": {
        "workspaceId": "/subscriptions/.../workspaces/ammaninternal",
        "logs": [
          {"category": "kube-apiserver", "enabled": false},
          {"category": "kube-controller-manager", "enabled": true},
          {"category": "kube-scheduler", "enabled": false},
          {"category": "kube-audit", "enabled": false},
          {"category": "cluster-autoscaler", "enabled": false}
        ]
      }
    }
  ]
}
```

The output shows which log categories are enabled and the target workspace.

---

## Scenario 6: Troubleshooting Flow
> 来源: ado-wiki-c-VM-Guest-Agent-and-Extension-Troubleshooting-guideline.md | 适用: 适用范围未明确

### 排查步骤

**1.** Check which node(s) the customer is complaining about.

**2.** Search for the node on ASC.

**3.** Check Guest Agent Status on Properties Blade.

   - If everything shows as N/A and the State of server is Seeking, wait 90 minutes for the problematic extension/guest agent to give timeout since last start/restart.

**4.** Select Extensions blade to see vmssCSE extension health status.

   - If Guest Agent is reporting (not N/A), you should see errors directly on the blade.
   - If Guest Agent has N/A values, try other steps:
     - a) Click on Subscription ID and select Operations blade. Within State column type "Client Error".
     - b) Check if you have output for the impacted resource.
     - Check the TSG for [Operations Fail with code VMAgentStatusCommunicationError or VMExtensionProvisioningTimeout](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Operations-Fail-with-code-VMAgentStatusCommunicationError-or-VMExtensionProvisioningTimeout) to understand error codes.

**5.** Usually these errors are related with DNS/Connectivity issues. Do basic network troubleshooting:

   - a) Go to Diagnostic blade and Test Traffic section.
   - b) Put a public IP as destination and click RUN.
   - c) Check NIC Effective Routes for 0.0.0.0/0.
   - d) If `NextHopType: IPV4_CA`, it's related to customer Virtual Appliance Firewall — ask customer to review their rules.
   - e) If customer states everything is OK, ask them to create a normal VM inside same subnet and verify SSH access. Use Azure Portal Serial Console for basic troubleshooting: `telnet microsoft.com 443`, `nslookup mcr.microsoft.com`.

**6.** If you see other errors not related with connectivity, engage your TA and check if a collab should be opened with Azure VM team.

**7.** If problem is not related with previous steps but node is still NotReady and State is different from Converged, check [VM Availability TSG](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Virtual-Machine-TSGs/VM-Availability-Guide.md).

---

## Scenario 7: Two or more app gateway ingress, one cluster, 2 or more apps
> 来源: ado-wiki-multiple-apps-multiple-appgws-1-cluster.md | 适用: 适用范围未明确

### 排查步骤

#### Two or more app gateway ingress, one cluster, 2 or more apps

The scope of this document is to provide some more specific instructions for creating and using multiple application gateway ingress for multiple applications in the same AKS cluster. The below instructions will be for HTTP only, not HTTPS.

#### Prerequisites

- One AKS cluster, created using Azure cli or using the Azure portal
- Two or more Application Gateways (in the example below we will use 2, one for DEV and one for UAT)
- Inside the cluster create 2 namespaces (UAT and DEV). App1 will be in UAT, and App2 will be in DEV.

#### Instructions

##### 1. Create the AAD pod Identity deployment

AAD Pod Identity consists of the Managed Identity Controller (MIC) deployment, the Node Managed Identity (NMI) daemon set, and several standard and custom resources.

RBAC-enabled cluster:
```bash
kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/deployment-rbac.yaml
```

Non-RBAC cluster:
```bash
kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/deployment.yaml
```

##### 2. Create Azure Identities (one per app)

```bash
az identity create -g <resourcegroup> -n <app1id> -o json
```

Save the `clientId` and `id` values for later use.

##### 3. Install Azure Identity (repeat per app)

```yaml
apiVersion: "aadpodidentity.k8s.io/v1"
kind: AzureIdentity
metadata:
  name: <app1id>
spec:
  type: 0
  ResourceID: /subscriptions/<subid>/resourcegroups/<resourcegroup>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/app1id
  ClientID: <clientId>
```

```bash
kubectl apply -f aadpodidentity.yaml
```

##### 4. Install Azure Identity Binding (repeat per app)

```yaml
apiVersion: "aadpodidentity.k8s.io/v1"
kind: AzureIdentityBinding
metadata:
  name: <app1-azure-identity-binding>
spec:
  AzureIdentity: <app1id>
  Selector: <app1id>
```

Pods need label `aadpodidbinding=<selector>` to match.

##### 5. Set Permissions for MIC

Get the service principal:
```bash
az aks show -g <resourcegroup> -n <name> --query servicePrincipalProfile.clientId -o tsv
```

Assign Managed Identity Operator role:
```bash
az role assignment create --role "Managed Identity Operator" --assignee <sp id> --scope <full id of the managed identity>
```

##### 6. Install Helm and AGIC repo

```bash
helm repo add application-gateway-kubernetes-ingress https://appgwingress.blob.core.windows.net/ingress-azure-helm-package/
helm repo update
```

##### 7. Set up AAD Pod Identity permissions on App Gateway

Give Contributor access to each App Gateway:
```bash
az role assignment create --role Contributor --assignee <clientId> --scope <App-Gateway-ID>
```

Give Reader access to the resource group:
```bash
az role assignment create --role Reader --assignee <clientId> --scope <App-Gateway-Resource-Group-ID>
```

##### 8. Install AGIC Helm charts (one per app, different namespace + gateway)

Key helm-config differences per app:
- `appgw.name`: different gateway per app
- `kubernetes.watchNamespace`: different namespace per app
- `armAuth.identityResourceID` and `identityClientID`: different identity per app

```bash
helm install app1-ingress -f helm1-config.yaml application-gateway-kubernetes-ingress/ingress-azure
helm install app2-ingress -f helm2-config.yaml application-gateway-kubernetes-ingress/ingress-azure
```

##### 9. Deploy applications with Ingress resources

Each app's Ingress resource should:
- Be in its respective namespace
- Use annotation `kubernetes.io/ingress.class: azure/application-gateway`
- Use DNS hostname-based routing (e.g., via nip.io for testing)

##### Verification

After deployment, check:
- Backend pools created in both App Gateways
- HTTP listeners configured
- Backend health is green
- Apps accessible through configured hostnames

---

## Scenario 8: AKS Workload Protection with Defender for Containers
> 来源: onenote-aks-workload-protection-defender.md | 适用: Mooncake ✅

### 排查步骤

#### AKS Workload Protection with Defender for Containers

> Source: OneNote - Mooncake POD Support Notebook / AKS / Troubleshooting / Defender for Container / AKS workload protection
> Status: guide-draft (pending SYNTHESIZE review)

#### Overview

AKS workload protection has 3 pillars:

##### 1. Cluster Audit Log (Azure Defender for AKS - paid)
- Detects suspicious behavior from cluster audit logs

##### 2. Container Host Node (Azure Defender for AKS - paid)
- Raw security event monitoring
- Auto-provisioning of OMS agent for VMSS still doesn't work - must manually click 'quick fix'
- Short-term fix: VMSS OMS agent auto-provisioning solution (Iron FY21)
- Long-term: Kubernetes native agent (2021Q2)

##### 3. Gatekeeper Pod (Azure Policy - free)
- One Gatekeeper pod per cluster
- Monitors every request to AKS API Server before being persisted to cluster
- Deny option to mandate recommendations, ensuring workloads are secure by default

#### Enable Azure Policy Add-on

```bash
az aks enable-addons --addons azure-policy --name MyAKSCluster --resource-group MyResourceGroup
```

#### Key Notes for Mooncake

- AKS Defender Profile is NOT available in Mooncake (feature gap)
- ASC treats VMSS (IaaS) and AKS (PaaS) as separate resources
- Some VMSS recommendations are filtered out for AKS VMSS (appear under "Unavailable assessments")

#### References

- [Workload protections for Kubernetes workloads](https://docs.microsoft.com/en-us/azure/security-center/kubernetes-workload-protections)
- [Azure Policy for Kubernetes](https://docs.microsoft.com/en-gb/azure/governance/policy/concepts/policy-for-kubernetes)
- [Gatekeeper GitHub](https://github.com/open-policy-agent/gatekeeper)

---

## 附录: Kusto 诊断查询

### 来源: cluster-snapshot.md

# 集群快照查询

## 用途

获取 AKS 集群的基础信息、CCP Namespace、FQDN、Underlay Name 等关键信息。

## 查询 1: 获取集群基础信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscription} | 是 | 订阅 ID |
| {resourceGroup} | 是 | 资源组名称 |
| {cluster} | 是 | 集群名称 |

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where customerResourceGroup == "{resourceGroup}"
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project namespace, apiServerServiceAccountIssuerFQDN, UnderlayName, provisioningState, powerState, clusterNodeCount
| take 1
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| namespace | CCP 命名空间（用于控制平面日志查询） |
| apiServerServiceAccountIssuerFQDN | API Server FQDN |
| UnderlayName | Underlay 名称 |
| provisioningState | 预配状态 |
| powerState | 电源状态 |
| clusterNodeCount | 节点数量 |

---

## 查询 2: 查询集群状态历史

### 查询语句

```kql
let _fqdn = cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where customerResourceGroup == "{resourceGroup}"
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project apiServerServiceAccountIssuerFQDN
| take 1;
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(90d)
| where apiServerServiceAccountIssuerFQDN in (_fqdn)
| project apiServerServiceAccountIssuerFQDN, PreciseTimeStamp, name, provisioningState, powerState, clusterNodeCount, UnderlayName
| order by PreciseTimeStamp asc
```

---

## 查询 3: 检查集群异常状态

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where TIMESTAMP > ago(3d)
| where clusterName contains "{cluster}" and subscription == "{subscription}"
| where ['state'] contains "degraded" or ['state'] == 'Unhealthy'
| project PreciseTimeStamp, provisionInfo, provisioningState, powerState, clusterNodeCount,
         autoUpgradeProfile, clusterName, resourceState
| sort by PreciseTimeStamp desc
```

---

## 查询 4: 检查 Extension Addon Profiles (如 Flux)

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {ccpNamespace} | 是 | CCP 命名空间 |

### 查询语句

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
ManagedClusterSnapshot
| where PreciseTimeStamp between(queryFrom..queryTo)
| where ['cluster_id'] == queryCcpNamespace
| summarize arg_max(PreciseTimeStamp, clusterName, extensionAddonProfiles) by cluster_id
| extend extensionAddonProfiles = parse_json(extensionAddonProfiles)
| mv-apply extensionAddonProfiles on (
    project extAddonName = tostring(extensionAddonProfiles.name),
            ProvisionStatus = tostring(extensionAddonProfiles.provisioningState)
)
| extend flux_enabled = tobool(iff(extAddonName=='flux', True, False))
| project extAddonName, flux_enabled, ProvisionStatus
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 追踪操作详情
- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志

---

# AKS TLS 证书与 Cert-Manager — 排查工作流

**来源草稿**: ado-wiki-b-aci-standby-pools-error-guide.md, ado-wiki-b-automatic-cert-rotation.md, ado-wiki-c-Lets-Encrypt-Cert-Manager-Ingress.md, onenote-nginx-ingress-kv-cert-autorotation.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-b-aci-standby-pools-error-guide.md | 适用: 适用范围未明确

### 排查步骤

TBD

---

## Scenario 2: Confirming if Certificate Auto-Rotation Occurred
> 来源: ado-wiki-b-automatic-cert-rotation.md | 适用: 适用范围未明确

### 排查步骤

#### Confirming if Certificate Auto-Rotation Occurred

#### Summary

AKS platform automatically rotates cluster certificates (not customer TLS certificates) to reduce operational overhead. This can surprise customers.

#### Investigation Flow

##### Step 1: Identify if a cert rotation occurred

Query AsyncQoSEvents. The `operationName` is `RotateClusterCertificatesHandler.POST` and `correlationID` is `00000000-0000-0000-0000-000000000000` (indicates system-initiated).

```kusto
cluster('Aks').database('AKSprod').AsyncQoSEvents
| where subscriptionID has '{subID}'
| where PreciseTimeStamp >= ago(10d)
| where resourceName == '{resource_Name}'
| project PreciseTimeStamp, resourceName, agentPoolName, subscriptionID, correlationID, operationID, operationName, suboperationName, result, errorDetails, propertiesBag, resourceGroupName
```

Add `UserAgent` column to identify which component triggered it. Example:
`UserAgent = Go/go1.18 (amd64-linux) go-autorest/v14.2.1 AKS-regionallooper`

##### Step 2: Track down the reason in Regional Looper logs

```kusto
cluster("Aks").database("AKSprod").RegionalLooperEvents
| where TIMESTAMP > ago(3d)
| where msg contains "{SubID}" or "{CCP_ID}"
```

See also: [PG Rotate certs TSG](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/aks-troubleshooting-guide/240790/Rotate-certs-TSG)

##### Step 3: Fallback - Using Kusto Search++

If nothing found in RegionalLooper:
1. Go to Kusto Home menu > "Search++"
2. Select AKS cluster and AKSProd database
3. Select all tables
4. Search with SubID and/or OperationID, or keywords "certificate", "rotate"
5. Click result squares in the timeline to drill into specific tables

Example follow-up query:
```kusto
cluster('Aks').database('AKSprod').AKSAlertmanager
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where (* has @'{subID}' and * has @'certificate')
| limit 10000
```

Common finding: `EtcdCertificatesExpireSoon` alert - ETCD client certificate was going to expire soon, triggering auto-rotation.

---

## Scenario 3: Troubleshooting Flow
> 来源: ado-wiki-c-Lets-Encrypt-Cert-Manager-Ingress.md | 适用: 适用范围未明确

### 排查步骤

1. Verify the cert-manager pods are up and running, if applicable: `kubectl get po -A | grep -i cert-manager`
2. Verify ClusterIssuer details and make sure ClusterIssuer  has been registered successfully with the ACME server:

   ```bash
   kubectl get clusterissuer
   kubectl get clusterissuer <clusterissuer-name> -o yaml
   ```

3. In the ingress route, make sure correct ClusterIssuer has been referenced in annotation. Ex: `cert-manager.io/cluster-issuer: letsencrypt-production`:
4. Verify any errors recorded in TLS certificate: `kubectl describe certificate <certificate-name> --namespace <namespace-name>`
5. Also check the status of below objects and describe to capture the errors.

   ```bash
   kubectl get order -A
   kubectl get challenge -A
   ```

6. Collect cert-manager logs for any failure to generate TLS certificate at the time of issue: `k logs -l app.kubernetes.io/instance=cert-manager -n cert-manager -f --timestamps`
7. Validate the ingress configured with Lets Encrypt from below links:

   - <https://docs.microsoft.com/en-us/azure/aks/ingress-tls?tabs=azure-cli>
   - <https://docs.microsoft.com/en-us/azure/aks/ingress-static-ip>

---

## Scenario 4: AKS Nginx Ingress 证书 KV CSI Driver 自动轮转配置指南（Mooncake）
> 来源: onenote-nginx-ingress-kv-cert-autorotation.md | 适用: Mooncake ✅

### 排查步骤

#### AKS Nginx Ingress 证书 KV CSI Driver 自动轮转配置指南（Mooncake）

在 Azure China (21V) 环境下，使用 Key Vault CSI Driver + User-Assigned Managed Identity 实现 Nginx Ingress TLS 证书自动轮转的完整配置步骤。

#### 前置条件

- AKS 集群已创建
- Azure Key Vault 已创建
- `cloudName: AzureChinaCloud` 需在所有 SecretProviderClass 中明确指定

#### 步骤 1：启用 Key Vault Secrets Provider Addon

```bash
az aks enable-addons --addons azure-keyvault-secrets-provider --name <cluster> --resource-group <rg>

#### 验证
kubectl get pods -n kube-system -l 'app in (secrets-store-csi-driver,secrets-store-provider-azure)'
```

#### 步骤 2：获取 Addon 默认 Managed Identity 的 Client ID

```bash
az aks show -g <rg> -n <cluster> --query addonProfiles.azureKeyvaultSecretsProvider.identity.clientId -o tsv
```

#### 步骤 3：给 Identity 授权访问 Key Vault

```bash
export IDENTITY_CLIENT_ID="<clientId>"
export KEYVAULT_SCOPE=$(az keyvault show --name <kv-name> --query id -o tsv)
az role assignment create --role "Key Vault Administrator" --assignee $IDENTITY_CLIENT_ID --scope $KEYVAULT_SCOPE
```

#### 步骤 4：创建 SecretProviderClass（Mooncake 需指定 cloudName）

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: azure-tls
spec:
  provider: azure
  secretObjects:
    - secretName: ingress-tls-csi
      type: kubernetes.io/tls
      data:
        - objectName: aks-ingress-cert
          key: tls.key
        - objectName: aks-ingress-cert
          key: tls.crt
  parameters:
    usePodIdentity: "false"
    useVMManagedIdentity: "true"
    userAssignedIdentityID: "<clientId>"
    keyvaultName: "<kv-name>"
    cloudName: "AzureChinaCloud"   # 21V 必须指定
    objects: |
      array:
        - |
          objectName: aks-ingress-cert
          objectType: secret
    tenantId: "<tenantId>"
```

#### 步骤 5：部署 Nginx Ingress Controller（挂载 CSI Volume）

Mooncake 使用的镜像仓库：`k8sgcr.azk8s.cn`

```bash
helm install my-ingress ingress-nginx/ingress-nginx --version 4.1.3 \
  --namespace ingress-basic \
  --set controller.image.repository=k8sgcr.azk8s.cn/ingress-nginx/controller \
  --set defaultBackend.image.repository=k8sgcr.azk8s.cn/defaultbackend-amd64 \
  --set controller.admissionWebhooks.patch.image.registry=k8sgcr.azk8s.cn \
  -f - <<EOF
controller:
  extraVolumes:
    - name: secrets-store-inline
      csi:
        driver: secrets-store.csi.k8s.io
        readOnly: true
        volumeAttributes:
          secretProviderClass: "azure-tls"
  extraVolumeMounts:
    - name: secrets-store-inline
      mountPath: "/mnt/secrets-store"
      readOnly: true
EOF
```

#### 步骤 6：启用证书自动轮转

```bash
az aks addon update -n <cluster> -g <rg> -a azure-keyvault-secrets-provider --enable-secret-rotation
```

默认 pull 间隔为 2 分钟，可自定义。

#### 注意事项

- Nginx Ingress Controller 无需 Reloader 即可自动更新证书
- Secret 更新后，Nginx 会自动热更新（无需重启 Pod）
- `autorotation` 仅保证 Secret 同步，应用侧需要能监测 volume 变化（Nginx Ingress 已支持）
- Mooncake 中 `cloudName: "AzureChinaCloud"` 是必填项，遗漏会导致 KV 访问失败

---

---
source: onenote
sourceRef: "MCVKB/Net/=======8.AKS=======/8.7 [AKS] Nginx ingress cert auto-rotation with kv.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# AKS Nginx Ingress 证书 KV CSI Driver 自动轮转配置指南（Mooncake）

在 Azure China (21V) 环境下，使用 Key Vault CSI Driver + User-Assigned Managed Identity 实现 Nginx Ingress TLS 证书自动轮转的完整配置步骤。

## 前置条件

- AKS 集群已创建
- Azure Key Vault 已创建
- `cloudName: AzureChinaCloud` 需在所有 SecretProviderClass 中明确指定

## 步骤 1：启用 Key Vault Secrets Provider Addon

```bash
az aks enable-addons --addons azure-keyvault-secrets-provider --name <cluster> --resource-group <rg>

# 验证
kubectl get pods -n kube-system -l 'app in (secrets-store-csi-driver,secrets-store-provider-azure)'
```

## 步骤 2：获取 Addon 默认 Managed Identity 的 Client ID

```bash
az aks show -g <rg> -n <cluster> --query addonProfiles.azureKeyvaultSecretsProvider.identity.clientId -o tsv
```

## 步骤 3：给 Identity 授权访问 Key Vault

```bash
export IDENTITY_CLIENT_ID="<clientId>"
export KEYVAULT_SCOPE=$(az keyvault show --name <kv-name> --query id -o tsv)
az role assignment create --role "Key Vault Administrator" --assignee $IDENTITY_CLIENT_ID --scope $KEYVAULT_SCOPE
```

## 步骤 4：创建 SecretProviderClass（Mooncake 需指定 cloudName）

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

## 步骤 5：部署 Nginx Ingress Controller（挂载 CSI Volume）

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

## 步骤 6：启用证书自动轮转

```bash
az aks addon update -n <cluster> -g <rg> -a azure-keyvault-secrets-provider --enable-secret-rotation
```

默认 pull 间隔为 2 分钟，可自定义。

## 注意事项

- Nginx Ingress Controller 无需 Reloader 即可自动更新证书
- Secret 更新后，Nginx 会自动热更新（无需重启 Pod）
- `autorotation` 仅保证 Secret 同步，应用侧需要能监测 volume 变化（Nginx Ingress 已支持）
- Mooncake 中 `cloudName: "AzureChinaCloud"` 是必填项，遗漏会导致 KV 访问失败

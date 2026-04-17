# AKS Key Vault CSI + Workload Identity 配置指南

> **来源**: MCVKB 18.41 | 作者: Icy Lin | 日期: 2022-11-22  
> **前置条件**: 先配置 OIDC issuer + Workload Identity（参考 MCVKB 18.42）  
> **注**: AAD pod identity 已于 2022-10-24 废弃，推荐使用 Workload Identity

---

## 场景

使用 Azure Key Vault Provider for Secrets Store CSI Driver，通过 **Workload Identity** 访问 Key Vault 中的 Secret/Certificate，挂载到 AKS Pod。

---

## Step 1: 启用 Key Vault Secrets Provider

```bash
# 新集群
az aks create -n myAKSCluster -g myResourceGroup \
  --enable-addons azure-keyvault-secrets-provider \
  --enable-managed-identity

# 现有集群
az aks enable-addons \
  --addons azure-keyvault-secrets-provider \
  --name myAKSCluster \
  --resource-group myResourceGroup
```

---

## Step 2: 配置 SecretProviderClass

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: azure-kvname-workload-identity
spec:
  provider: azure
  parameters:
    usePodIdentity: "false"
    clientID: "<workload-identity-client-id>"
    keyvaultName: "<keyvault-name>"
    tenantId: "<tenant-id>"
    objects: |
      array:
        - |
          objectName: secret1
          objectType: secret
```

---

## Step 3: 准备 Workload Identity 和 Key Vault 权限

参考 MCVKB 18.42（OIDC issuer 配置），确保：
- AKS 已启用 OIDC issuer
- 已创建 federated credential
- Service Account 已关联 workload identity
- Key Vault 中已给 Managed Identity 赋予 `Key Vault Secrets User` 角色

---

## Step 4: 部署测试 Pod

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: busybox-secrets-store
spec:
  serviceAccountName: workload-identity-sa
  containers:
    - name: busybox
      image: k8sgcr.azk8s.cn/e2e-test-images/busybox:1.29-1
      command: ["/bin/sleep", "10000"]
      volumeMounts:
      - name: secrets-store01-inline
        mountPath: "/mnt/secrets-store"
        readOnly: true
  volumes:
    - name: secrets-store01-inline
      csi:
        driver: secrets-store.csi.k8s.io
        readOnly: true
        volumeAttributes:
          secretProviderClass: "azure-kvname-workload-identity"
```

---

## 验证

```bash
kubectl exec busybox-secrets-store -- ls /mnt/secrets-store
kubectl exec busybox-secrets-store -- cat /mnt/secrets-store/secret1
```

---

## 参考

- [AKS CSI Secrets Store Driver (Mooncake)](https://docs.azure.cn/en-us/aks/csi-secrets-store-driver)
- [Azure Key Vault Provider for Secrets Store CSI Driver](https://azure.github.io/secrets-store-csi-driver-provider-azure/)

# Workload Identity Federation with OIDC Issuer

## 概述
对于运行在 Azure 外部的工作负载（如 AKS、GitHub Actions），可通过 AAD Workload Identity Federation 使用 OIDC 令牌交换 AAD 访问令牌，无需管理证书/密钥。

## 工作原理
1. 外部 IdP（如 AKS OIDC issuer）签发 JWT 令牌
2. AAD 验证该令牌（基于 federated identity credential 配置的信任关系）
3. 交换成功后返回 AAD access token

## 配置步骤

### 1. 创建 User-Assigned Managed Identity 或 App Registration
```bash
az identity create --name "icyoidcidentity" --resource-group "oidcaks" --location "chinaeast2" --subscription "xxx"
```

### 2. 获取 OIDC Issuer URL（以 AKS 为例）
```bash
AKS_OIDC_ISSUER="$(az aks show -n icyoidcaks -g oidcaks --query "oidcIssuerProfile.issuerUrl" -otsv)"
```

### 3. 创建 Federated Identity Credential
在 App Registration 或 Managed Identity 中添加 federated credential，指定 issuer URL、subject 和 audience。

### 4. Pod 中验证
在 Pod 中可直接使用 `az login` 访问 Azure 资源，令牌文件会自动挂载。

### 5. Postman 验证（可选）
使用 client_credentials 流程，client_assertion_type 设为 `urn:ietf:params:oauth:client-assertion-type:jwt-bearer`，client_assertion 为外部 IdP 签发的 token。

## 参考
- https://learn.microsoft.com/en-us/azure/active-directory/develop/workload-identity-federation
- https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#third-case-access-token-request-with-a-federated-credential

## 21v 适用性
需确认 Azure China 是否支持 workload identity federation 功能（可能有限制）。

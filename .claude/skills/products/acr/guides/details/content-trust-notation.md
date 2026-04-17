# ACR Content Trust 与 Notation 签名 — 综合排查指南

**条目数**: 7 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-acr-content-trust-delegation.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: ACR admin account does not support signer permission for Con
> 来源: ADO Wiki

1. Use a Service Principal with AcrImageSigner and AcrPush RBAC roles instead of admin account. Grant signer permission as per: https://docs.microsoft.com/azure/container-registry/container-registry-cont

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: By design: docker trust sign first pushes the image as an un
> 来源: ADO Wiki

1. This is expected behavior. With DOCKER_CONTENT_TRUST=1, the client pulls trust metadata from Notary → verifies → finds digest → pulls by digest (trusted). With DOCKER_CONTENT_TRUST=0 or pulling by dig

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: The identity used for Notation operations has not authentica
> 来源: ADO Wiki

1. Assign AcrPull role (and AcrPush for signing) to the identity. Login to ACR with 'az acr login', 'docker login', or 'notation login' before running notation commands. See Notation authentication docs 

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: The signing identity does not have the required Key Vault pe
> 来源: ADO Wiki

1. For RBAC: assign 'Key Vault Crypto User', 'Key Vault Secrets User', and 'Key Vault Certificate User' roles to the signing identity. For access policy: configure sign/get/list permissions for keys, get

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 5: The root CA certificate used for signing is not present in N
> 来源: ADO Wiki

1. Add the root CA certificate to Notation trust store using 'notation cert add' command. Ensure the 'trustStores' field in the trust policy references the correct trust store containing the root CA cert

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 6: The trust policy's 'registryScopes' property does not includ
> 来源: ADO Wiki

1. Update 'registryScopes' in trust policy to include the target repository (e.g., 'wabbitregistry.azurecr.io/net-monitor'). Note: registry-level scope like 'wabbitregistry.azurecr.io' is NOT supported —

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 7: Microsoft retiring DCT feature in Azure Container Registry i
> 来源: OneNote

1. 1) Migrate to Notary Project-based signing with Azure Key Vault: https://docs.azure.cn/zh-cn/container-registry/container-registry-tutorial-sign-build-push. 2) Review and update Azure Policy definitio

`[结论: 🟢 8.5/10 — OneNote]`

---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Content Trust signing fails when using ACR admin account as  | ACR admin account does not | → Phase 1 |
| After docker trust sign, unsigned/untrusted image appears in | By design: docker trust sign | → Phase 2 |
| Notation sign/verify/list/inspect commands fail with 'POST o | The identity used for Notation | → Phase 3 |
| Notation sign fails with 'describe-key command failed: Calle | The signing identity does not | → Phase 4 |
| Notation verify fails with 'authenticity validation failed:  | The root CA certificate used | → Phase 5 |
| Notation verify fails with 'artifact has no applicable trust | The trust policy's 'registryScopes' prop | → Phase 6 |
| Docker Content Trust (DCT) is being deprecated in ACR; new r | Microsoft retiring DCT feature in | → Phase 7 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Content Trust signing fails when using ACR admin account as signer - permission  | ACR admin account does not support signer permission for Content Trust. Admin cr | Use a Service Principal with AcrImageSigner and AcrPush RBAC roles instead of ad | 🟢 8.0 | ADO Wiki |
| 2 | After docker trust sign, unsigned/untrusted image appears in ACR repository alon | By design: docker trust sign first pushes the image as an untrusted image to the | This is expected behavior. With DOCKER_CONTENT_TRUST=1, the client pulls trust m | 🟢 8.0 | ADO Wiki |
| 3 | Notation sign/verify/list/inspect commands fail with 'POST oauth2/token: respons | The identity used for Notation operations has not authenticated to ACR or lacks  | Assign AcrPull role (and AcrPush for signing) to the identity. Login to ACR with | 🟢 8.0 | ADO Wiki |
| 4 | Notation sign fails with 'describe-key command failed: Caller is not authorized  | The signing identity does not have the required Key Vault permissions. Notation  | For RBAC: assign 'Key Vault Crypto User', 'Key Vault Secrets User', and 'Key Vau | 🟢 8.0 | ADO Wiki |
| 5 | Notation verify fails with 'authenticity validation failed: signature is not pro | The root CA certificate used for signing is not present in Notation's trust stor | Add the root CA certificate to Notation trust store using 'notation cert add' co | 🟢 8.0 | ADO Wiki |
| 6 | Notation verify fails with 'artifact has no applicable trust policy. Trust polic | The trust policy's 'registryScopes' property does not include the repository bei | Update 'registryScopes' in trust policy to include the target repository (e.g.,  | 🟢 8.0 | ADO Wiki |
| 7 | Docker Content Trust (DCT) is being deprecated in ACR; new registries cannot ena | Microsoft retiring DCT feature in Azure Container Registry in favor of Notary Pr | 1) Migrate to Notary Project-based signing with Azure Key Vault: https://docs.az | 🟢 8.5 | OneNote |

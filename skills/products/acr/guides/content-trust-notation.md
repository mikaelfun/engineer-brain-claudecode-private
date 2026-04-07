# ACR Content Trust 与 Notation 签名 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Content Trust signing fails when using ACR admin account as signer - permission  | ACR admin account does not support signer permission for Content Trust. Admin cr | Use a Service Principal with AcrImageSigner and AcrPush RBAC roles instead of ad | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-009] |
| 2 | After docker trust sign, unsigned/untrusted image appears in ACR repository alon | By design: docker trust sign first pushes the image as an untrusted image to the | This is expected behavior. With DOCKER_CONTENT_TRUST=1, the client pulls trust m | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-010] |
| 3 | Notation sign/verify/list/inspect commands fail with 'POST oauth2/token: respons | The identity used for Notation operations has not authenticated to ACR or lacks  | Assign AcrPull role (and AcrPush for signing) to the identity. Login to ACR with | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-072] |
| 4 | Notation sign fails with 'describe-key command failed: Caller is not authorized  | The signing identity does not have the required Key Vault permissions. Notation  | For RBAC: assign 'Key Vault Crypto User', 'Key Vault Secrets User', and 'Key Vau | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-073] |
| 5 | Notation verify fails with 'authenticity validation failed: signature is not pro | The root CA certificate used for signing is not present in Notation's trust stor | Add the root CA certificate to Notation trust store using 'notation cert add' co | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-074] |
| 6 | Notation verify fails with 'artifact has no applicable trust policy. Trust polic | The trust policy's 'registryScopes' property does not include the repository bei | Update 'registryScopes' in trust policy to include the target repository (e.g.,  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-075] |
| 7 | Docker Content Trust (DCT) is being deprecated in ACR; new registries cannot ena | Microsoft retiring DCT feature in Azure Container Registry in favor of Notary Pr | 1) Migrate to Notary Project-based signing with Azure Key Vault: https://docs.az | 🟢 8.5 — OneNote单源+实证 | [acr-onenote-009] |

## 快速排查路径
1. 检查 → ACR admin account does not support signer permission for Con `[来源: ADO Wiki]`
   - 方案: Use a Service Principal with AcrImageSigner and AcrPush RBAC roles instead of admin account. Grant s
2. 检查 → By design: docker trust sign first pushes the image as an un `[来源: ADO Wiki]`
   - 方案: This is expected behavior. With DOCKER_CONTENT_TRUST=1, the client pulls trust metadata from Notary 
3. 检查 → The identity used for Notation operations has not authentica `[来源: ADO Wiki]`
   - 方案: Assign AcrPull role (and AcrPush for signing) to the identity. Login to ACR with 'az acr login', 'do
4. 检查 → The signing identity does not have the required Key Vault pe `[来源: ADO Wiki]`
   - 方案: For RBAC: assign 'Key Vault Crypto User', 'Key Vault Secrets User', and 'Key Vault Certificate User'
5. 检查 → The root CA certificate used for signing is not present in N `[来源: ADO Wiki]`
   - 方案: Add the root CA certificate to Notation trust store using 'notation cert add' command. Ensure the 't

> 本 topic 有融合排查指南 → [完整排查流程](details/content-trust-notation.md#排查流程)

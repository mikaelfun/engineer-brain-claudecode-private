# AKS Workload Identity / OIDC -- Comprehensive Troubleshooting Guide

**Entries**: 12 | **Draft sources**: 38 | **Kusto queries**: 1
**Source drafts**: ado-wiki-a-Azure-Copilot-AKS-Handlers.md, ado-wiki-a-Azure-Dedicated-Host-On-AKS.md, ado-wiki-a-CICD-using-AKS-and-Jenkins-TSG.md, ado-wiki-a-Microsoft.Flux-AKS-Extensions.md, ado-wiki-a-aks-communication-manager.md, ado-wiki-a-aks-event-grid.md, ado-wiki-a-azure-managed-lustre-with-aks.md, ado-wiki-a-coredns-testing-in-aks-clusters.md, ado-wiki-aks-ado-support-boundary.md, ado-wiki-aks-emerging-issues-reporting.md
**Kusto references**: msi-connector.md
**Generated**: 2026-04-07

---

## Phase 1: OIDC Issuer 一旦启用即为不可逆操作 (by design)。禁用 OIDC 会破坏依赖它

### aks-189: AKS 集群启用 OIDC Issuer 后无法禁用，客户要求 disable OIDC 功能

**Root Cause**: OIDC Issuer 一旦启用即为不可逆操作 (by design)。禁用 OIDC 会破坏依赖它的 Workload Identity、Service Account Token 等功能，影响面广泛。AKS 文档明确标注此限制

**Solution**:
1) 这是 by design，无法 disable; 2) 如客户坚持要禁用，唯一方案是创建新集群; 3) 启用前应评估影响; 4) 文档: https://docs.azure.cn/en-us/aks/use-oidc-issuer#update-an-aks-cluster-with-oidc-issuer

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Token audience (aud claim) mismatch with JWT authe

### aks-729: 401 Unauthorized errors when authenticating to AKS API server using external ide...

**Root Cause**: Token audience (aud claim) mismatch with JWT authenticator config, or issuer URL does not exactly match iss claim (including protocol/trailing slashes), or identity provider OAuth/OIDC settings are incorrect

**Solution**:
1) Verify audience claim in token matches JWT authenticator config. 2) Correct issuer URL to exactly match iss claim. 3) For GitHub: ensure workflow has id-token:write permission and audience matches. 4) For Google: verify OAuth 2.0 client ID/secret. Update: az aks jwtauthenticator update --config-file updated-jwt-config.json

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/External%20Identity%20Providers%20for%20AKS%20Control%20Plane)]`

## Phase 3: Workload Identity webhook was not ready when the p

### aks-928: AKS Workload Identity: pod cannot fetch token, logs show failed to create confid...

**Root Cause**: Workload Identity webhook was not ready when the pod spawned, so AZURE_AUTHORITY_HOST and other required env vars were not injected into pod manifest.

**Solution**:
Restart the affected pod. The webhook should be ready on subsequent pod creation. Verify webhook running: kubectl logs -n kube-system -l azure-workload-identity.io/system

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20AD%20Workload%20Identity)]`

## Phase 4: Previous versions of Workload Identity feature use

### aks-930: AKS Workload Identity components running in legacy namespace azure-workload-iden...

**Root Cause**: Previous versions of Workload Identity feature used the azure-workload-identity-system namespace. Cluster was not migrated after upgrade.

**Solution**:
An IcM to PG is required to perform the migration to kube-system namespace. Query AsyncContextActivity for 'cluster is using legacy webhook namespace' to identify affected clusters.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20AD%20Workload%20Identity)]`

## Phase 5: AKS workload identity requires OIDC issuer to be e

### aks-054: Need to access Azure Key Vault secrets from AKS pods using workload identity (OI...

**Root Cause**: AKS workload identity requires OIDC issuer to be enabled on the cluster. The OIDC issuer URL format for Mooncake is https://{region}.oic.prod-aks.azure.cn/{tenantId}/{clusterId}/

**Solution**:
1) Create AKS cluster with --enable-oidc-issuer --enable-workload-identity. 2) Get OIDC issuer URL: az aks show -n {name} -g {rg} --query oidcIssuerProfile.issuerUrl. 3) Create AAD SP: az ad sp create-for-rbac --name {name}. 4) Set Key Vault access policy for SP. 5) Create K8s ServiceAccount with azure.workload.identity/use label. 6) Create federated identity credential binding SP, SA and OIDC issuer: az ad app fid-sp create --id {objectId} --parameters @params.json. 7) Deploy pod with serviceAccountName and azure.workload.identity/use: true label. Test image: ghcr.io/azure/azure-workload-identity/msal-go

`[Score: [B] 6.5 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.4]]`

## Phase 6: KEDA 2.14 (K8s 1.30) removes: metadata.clientSecre

### aks-1215: KEDA 2.14/2.15 breaking changes cause ScaledObject failures after AKS K8s upgrad...

**Root Cause**: KEDA 2.14 (K8s 1.30) removes: metadata.clientSecret for ADX scaler, metricName from trigger metadata. KEDA 2.15 (K8s 1.32) removes pod-managed identity support entirely

**Solution**:
1) Migrate pod-managed identity to workload identity. 2) Move metricName from trigger.metadata to trigger.name. 3) Replace metadata.clientSecret with clientSecretFromEnv for ADX scaler. 4) Test in non-prod before K8s upgrade. Check affected: kubectl get TriggerAuthentication --all-namespaces -o jsonpath for podIdentity azure provider

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/changes-in-kubernetes-event-driven-autoscaling-add-on-214-215)]`

## Phase 7: KEDA add-on enabled before Workload Identity was c

### aks-1270: KEDA operator pods missing workload identity env vars (AZURE_TENANT_ID, AZURE_FE...

**Root Cause**: KEDA add-on enabled before Workload Identity was configured; env vars not injected into operator pods

**Solution**:
Restart KEDA operator: kubectl rollout restart deployment keda-operator -n kube-system; verify env vars via kubectl describe pod

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-kubernetes-event-driven-autoscaling-add-on)]`

## Phase 8: AAD pod-managed identities feature is not availabl

### aks-001: Customer tries to use Azure Active Directory pod-managed identities in AKS on Az...

**Root Cause**: AAD pod-managed identities feature is not available (NA) in Azure China. Marked explicitly as not applicable in Feature Landing Status.

**Solution**:
Use Workload Identity (OIDC issuer) instead, which is verified and supported in Mooncake.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 6.0 | Source: [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 9: Mooncake uses different AAD resource endpoint. Pod

### aks-018: AAD pod identity fails to authenticate in Mooncake; token requests fail or retur...

**Root Cause**: Mooncake uses different AAD resource endpoint. Pod must specify --resource-name=https://management.chinacloudapi.cn not the global endpoint. az CLI AAD pod identity is public cloud preview only; Mooncake must use open-source.

**Solution**:
1) Install from open-source: https://azure.github.io/aad-pod-identity/docs/. 2) In pod spec args add: --resource-name=https://management.chinacloudapi.cn. 3) Troubleshoot via mic-* and nmi-* logs; check nmi pod on SAME node as affected pod.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1]]`

## Phase 10: Workload identity federation with MSI was not full

### aks-115: AKS workload identity (OIDC) fails when using Managed Identity (MSI) as federate...

**Root Cause**: Workload identity federation with MSI was not fully supported in Mooncake; only application service principal worked

**Solution**:
Use application service principal instead of MSI for workload identity federation. Verify OIDC issuer URL is correctly configured for Mooncake endpoint.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 11: After removing AAD Pod Identity addon, the nmi Dae

### aks-854: Backup job fails on AKS cluster due to presence of residual nmi pod from AAD Pod...

**Root Cause**: After removing AAD Pod Identity addon, the nmi DaemonSet/pod remains as an orphan on the cluster, interfering with backup operations.

**Solution**:
Run 'az aks update -g <resource-group> -n <cluster-name> --disable-pod-identity' to clean up the orphaned nmi DaemonSet. This command works even if Pod Identity addon is not currently installed. Prerequisite: install/update aks-preview extension.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FBackup%20failing%20due%20to%20orphaned%20aad%20nmi%20pod)]`

## Phase 12: JWT authenticator audience/issuer URL mismatch wit

### aks-1283: 401 Unauthorized accessing AKS control plane via external identity providers - t...

**Root Cause**: JWT authenticator audience/issuer URL mismatch with token claims or OAuth misconfigured

**Solution**:
Verify iss/aud claims match JWT authenticator config; az aks jwtauthenticator update; ensure outbound HTTPS to IdP

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 4.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/security/troubleshoot-aks-control-plane-authentication-external-identity-providers)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS 集群启用 OIDC Issuer 后无法禁用，客户要求 disable OIDC 功能 | OIDC Issuer 一旦启用即为不可逆操作 (by design)。禁用 OIDC 会破坏依赖它的 Workload... | 1) 这是 by design，无法 disable; 2) 如客户坚持要禁用，唯一方案是创建新集群; 3) 启用前应评... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | 401 Unauthorized errors when authenticating to AKS API server using external ide... | Token audience (aud claim) mismatch with JWT authenticator c... | 1) Verify audience claim in token matches JWT authenticator ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/External%20Identity%20Providers%20for%20AKS%20Control%20Plane) |
| 3 | AKS Workload Identity: pod cannot fetch token, logs show failed to create confid... | Workload Identity webhook was not ready when the pod spawned... | Restart the affected pod. The webhook should be ready on sub... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20AD%20Workload%20Identity) |
| 4 | AKS Workload Identity components running in legacy namespace azure-workload-iden... | Previous versions of Workload Identity feature used the azur... | An IcM to PG is required to perform the migration to kube-sy... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20AD%20Workload%20Identity) |
| 5 | Need to access Azure Key Vault secrets from AKS pods using workload identity (OI... | AKS workload identity requires OIDC issuer to be enabled on ... | 1) Create AKS cluster with --enable-oidc-issuer --enable-wor... | [B] 6.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.4] |
| 6 | KEDA 2.14/2.15 breaking changes cause ScaledObject failures after AKS K8s upgrad... | KEDA 2.14 (K8s 1.30) removes: metadata.clientSecret for ADX ... | 1) Migrate pod-managed identity to workload identity. 2) Mov... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/changes-in-kubernetes-event-driven-autoscaling-add-on-214-215) |
| 7 | KEDA operator pods missing workload identity env vars (AZURE_TENANT_ID, AZURE_FE... | KEDA add-on enabled before Workload Identity was configured;... | Restart KEDA operator: kubectl rollout restart deployment ke... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-kubernetes-event-driven-autoscaling-add-on) |
| 8 | Customer tries to use Azure Active Directory pod-managed identities in AKS on Az... | AAD pod-managed identities feature is not available (NA) in ... | Use Workload Identity (OIDC issuer) instead, which is verifi... | [B] 6.0 | [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM] |
| 9 | AAD pod identity fails to authenticate in Mooncake; token requests fail or retur... | Mooncake uses different AAD resource endpoint. Pod must spec... | 1) Install from open-source: https://azure.github.io/aad-pod... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 10 | AKS workload identity (OIDC) fails when using Managed Identity (MSI) as federate... | Workload identity federation with MSI was not fully supporte... | Use application service principal instead of MSI for workloa... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 11 | Backup job fails on AKS cluster due to presence of residual nmi pod from AAD Pod... | After removing AAD Pod Identity addon, the nmi DaemonSet/pod... | Run 'az aks update -g <resource-group> -n <cluster-name> --d... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FBackup%20failing%20due%20to%20orphaned%20aad%20nmi%20pod) |
| 12 | 401 Unauthorized accessing AKS control plane via external identity providers - t... | JWT authenticator audience/issuer URL mismatch with token cl... | Verify iss/aud claims match JWT authenticator config; az aks... | [Y] 4.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/security/troubleshoot-aks-control-plane-authentication-external-identity-providers) |

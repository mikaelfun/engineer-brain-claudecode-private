# ACR AKS 拉取 ACR 镜像 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | AKS image pull fails with 401 Unauthorized - failed to fetch anonymous token but | AKS kubelet sends two parallel requests: anonymous (empty creds) and credentiale | 1) Verify image exists: az acr repository show-tags --name <registry> --reposito | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-034] |
| 2 | AKS image pull fails with 'unauthorized: authentication required' when cluster u | The Kubelet managed identity does not have AcrPull role assignment on the ACR. W | Option 1: Detach and reattach ACR (user must have Owner or Contributor+UAA): az  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-047] |
| 3 | AKS Service Connector job fails to pull SC operator image from ACR with 'not fou | Service Connector (SC) extension does not auto-update. The installed version is  | 1) Delete the outdated SC extension: az k8s-extension delete --name <extension-n | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-050] |
| 4 | AKS nodes fail to pull images from ACR with image pull errors during pod creatio | Service Principal credentials used by AKS have expired, or the Service Principal | 1) Check SP expiry: az ad sp credential list --id <SP-ID>. 2) If expired, reset  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-058] |

## 快速排查路径
1. 检查 → AKS kubelet sends two parallel requests: anonymous (empty cr `[来源: ADO Wiki]`
   - 方案: 1) Verify image exists: az acr repository show-tags --name <registry> --repository <repo>. 2) The 40
2. 检查 → The Kubelet managed identity does not have AcrPull role assi `[来源: ADO Wiki]`
   - 方案: Option 1: Detach and reattach ACR (user must have Owner or Contributor+UAA): az aks update --detach-
3. 检查 → Service Connector (SC) extension does not auto-update. The i `[来源: ADO Wiki]`
   - 方案: 1) Delete the outdated SC extension: az k8s-extension delete --name <extension-name> --cluster-name 
4. 检查 → Service Principal credentials used by AKS have expired, or t `[来源: ADO Wiki]`
   - 方案: 1) Check SP expiry: az ad sp credential list --id <SP-ID>. 2) If expired, reset credentials: az ad s

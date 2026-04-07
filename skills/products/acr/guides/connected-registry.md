# ACR Connected Registry 与 Arc 扩展 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Connected Registry Arc extension creation stuck in state 'Running' - PVC phase s | Persistent Volume Claim (PVC) cannot bind - either the desired storage class is  | 1) Check PVC status: kubectl get pvc -n connected-registry -o yaml connected-reg | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-001] |
| 2 | Connected Registry Arc extension creation stuck in 'Running' - logs show UNAUTHO | The connected registry connection string in protected-settings-extension.json is | 1) Regenerate protected-settings-extension.json with: az acr connected-registry  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-002] |
| 3 | Connected Registry extension created but status is not 'Online' - logs show ALRE | A previous Connected Registry extension was deleted but the connected registry r | Run: az acr connected-registry deactivate -n <connected-registry-name> -r <acr-n | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-003] |

## 快速排查路径
1. 检查 → Persistent Volume Claim (PVC) cannot bind - either the desir `[来源: ADO Wiki]`
   - 方案: 1) Check PVC status: kubectl get pvc -n connected-registry -o yaml connected-registry-pvc. 2) If sto
2. 检查 → The connected registry connection string in protected-settin `[来源: ADO Wiki]`
   - 方案: 1) Regenerate protected-settings-extension.json with: az acr connected-registry get-settings --name 
3. 检查 → A previous Connected Registry extension was deleted but the  `[来源: ADO Wiki]`
   - 方案: Run: az acr connected-registry deactivate -n <connected-registry-name> -r <acr-name>. The pod will b

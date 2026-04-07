# ACR Connected Registry 与 Arc 扩展 — 综合排查指南

**条目数**: 3 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Connected Registry Arc extension creation stuck in state 'Running' - PVC phase s | Persistent Volume Claim (PVC) cannot bind - either the desired storage class is  | 1) Check PVC status: kubectl get pvc -n connected-registry -o yaml connected-reg | 🟢 8.0 | ADO Wiki |
| 2 | Connected Registry Arc extension creation stuck in 'Running' - logs show UNAUTHO | The connected registry connection string in protected-settings-extension.json is | 1) Regenerate protected-settings-extension.json with: az acr connected-registry  | 🟢 8.0 | ADO Wiki |
| 3 | Connected Registry extension created but status is not 'Online' - logs show ALRE | A previous Connected Registry extension was deleted but the connected registry r | Run: az acr connected-registry deactivate -n <connected-registry-name> -r <acr-n | 🟢 8.0 | ADO Wiki |

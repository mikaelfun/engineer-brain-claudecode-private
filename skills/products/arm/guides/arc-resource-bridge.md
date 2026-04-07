# ARM Azure Arc Resource Bridge 与 VMware — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Arc Resource Bridge: telemetry-manager pod in CrashLoopBackOff with thousands of restarts in … | msi-adapter container inside telemetry-manager pod fails to start or crashes repeatedly, often due … | 1) Copy kubeconfig from Azure Local node to MGMT VM. 2) kubectl describe po <telemetry-manager-pod>… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. 1) Copy kubeconfig from Azure Local node to MGMT VM. 2) kubectl describe po <te… `[来源: ado-wiki]`

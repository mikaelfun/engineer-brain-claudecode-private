# ACR Connected Registry — 排查速查

**来源数**: 3 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Connected Registry Arc 扩展创建卡在 'Running' 状态 — PVC phase 停留在 'pending' | PVC 无法绑定：目标 storage class 在集群中不可用或存储空间不足 | 1) `kubectl get pvc -n connected-registry -o yaml connected-registry-pvc` 检查 PVC 状态 2) 如 storageclass 缺失：`--config pvc.storageClassName='standard'` 重建扩展 3) 如空间不足：`--config pvc.storageRequest='250Gi'` 重建 | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry) |
| 2 | Connected Registry Arc 扩展创建卡在 'Running' — 日志显示 UNAUTHORIZED 错误 'Incorrect Password' | `protected-settings-extension.json` 中的连接字符串无效或已过期 | 1) 重新生成连接字符串：`az acr connected-registry get-settings --name <name> --registry <acr> --parent-protocol https --generate-password 1 --query ACR_REGISTRY_CONNECTION_STRING --output tsv --yes` 2) 更新扩展：`az k8s-extension update --config-protected-file protected-settings-extension.json` | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry) |
| 3 | Connected Registry 扩展已创建但状态非 'Online' — 日志显示 ALREADY_ACTIVATED：'Failed to activate the connected registry as it is already activated by another instance' | 之前的扩展已删除但 connected registry 资源未 deactivate，仍持有 activation lock | `az acr connected-registry deactivate -n <connected-registry-name> -r <acr-name>`。Pod 会在几分钟内自动重建，错误消失 | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry) |

## 快速排查路径
1. 检查 Connected Registry 扩展状态和日志 `[来源: ADO Wiki]`
   - 扩展卡在 'Running' → 检查 PVC 状态和日志
   - 扩展已创建但非 'Online' → 检查 pod 日志中的错误消息
2. 如果 PVC pending → 确认 storage class 是否可用、存储空间是否充足（#1） `[来源: ADO Wiki]`
3. 如果日志显示 UNAUTHORIZED / Incorrect Password → 重新生成连接字符串（#2） `[来源: ADO Wiki]`
4. 如果日志显示 ALREADY_ACTIVATED → `az acr connected-registry deactivate` 释放锁（#3） `[来源: ADO Wiki]`

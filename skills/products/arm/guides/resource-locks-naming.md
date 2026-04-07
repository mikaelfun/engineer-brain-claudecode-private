# ARM 资源锁与命名约束 — 排查速查

**来源数**: 3 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 无法删除或修改资源/资源组，报错提示资源被锁定（resource is locked）；ReadOnly lock 导致 VM 无法启动/重启、App Service Plan 无法 scale | 资源或资源组上设置了管理锁：CanNotDelete（禁止删除）或 ReadOnly（禁止修改和删除）。ReadOnly lock 会阻止 POST 操作（如 VM 启动）、阻止 scaling、阻… | 1) 查看锁：az group lock list / Get-AzResourceLock；2) 删除不需要的锁：az group lock delete / Remove-AzResourceL… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 2 | ARM 部署报错 AccountNameInvalid / StorageAccountAlreadyTaken / StorageAccountInAnotherResourceGroup：存储账… | 存储账户名必须全局唯一、3-24 字符、仅小写字母和数字。常见错误：1) 名称含大写/特殊字符；2) 名称已被其他订阅/租户占用（全球唯一）；3) 同名不同位置部署；4) 刚删除的存储账户因防悬挂 … | 1) 使用 uniqueString(resourceGroup().id) 生成唯一后缀拼接到名称中；2) 前缀不超过 11 字符确保总长度 ≤ 24；3) 如需恢复已删除的存储账户名，提交 Az… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 3 | ARM 部署报错 ReservedResourceName：The resource name or a part of the name is a trademarked or reserved … | 资源名称包含 Microsoft 保留/商标词汇。保留词包括 AZURE、MICROSOFT、WINDOWS、OFFICE365、DYNAMICS、XBOX 等。MICROSOFT/WINDOWS … | 选择不包含保留词的资源名称。完整保留词列表参见 MS Learn 文档。注意这些限制只适用于有可访问端点（如 FQDN）的资源 | 🔵 6.0 — mslearn+21V适用 | [mslearn] |

## 快速排查路径
1. 1) 查看锁：az group lock list / Get-AzResourceLock；2) 删除不需要的锁：az group lock delete … `[来源: mslearn]`
2. 1) 使用 uniqueString(resourceGroup().id) 生成唯一后缀拼接到名称中；2) 前缀不超过 11 字符确保总长度 ≤ 24；3)… `[来源: mslearn]`
3. 选择不包含保留词的资源名称。完整保留词列表参见 MS Learn 文档。注意这些限制只适用于有可访问端点（如 FQDN）的资源 `[来源: mslearn]`

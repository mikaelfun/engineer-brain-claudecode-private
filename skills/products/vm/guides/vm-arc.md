# VM Vm Arc — 排查速查

**来源数**: 2 | **21V**: 未标注
**条目数**: 3 | **关键词**: arc
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 在 DfM 全局搜索框中无法找到刚创建的 Case（使用顶部 Global Search 搜不到） | DfM 全局搜索通过 Azure Search 实现，存在最长 15 分钟的索引延迟（15 min SLA），刚创建的 Case 尚未被索引 | 改用 Cases Tab 的 All Cases 视图：点击 + 新建标签页 → 选择 Cases → 切换为 All Cases 视图 → 右上角搜索框输入 ... | 🟢 8.0 | ADO Wiki |
| 2 | NFS mount fails with mount.nfs: Remote I/O error | The file share is SMB type, not NFS. Customer is attempting to mount an SMB shar... | Verify the share protocol in Azure Portal or ASC Resource Explorer (Files tab > ... | 🟢 8.0 | ADO Wiki |
| 3 | Engineer needs to receive Azure LSI (Live Site Incident) notification emails for Mooncake/Azure inci... |  | Join IDWeb group: 1) Open https://idwebelements/GroupManagement.aspx; 2) Search ... | 🟢 8.5 | OneNote |

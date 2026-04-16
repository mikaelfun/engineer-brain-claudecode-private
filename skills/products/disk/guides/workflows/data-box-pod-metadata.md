# Disk Data Box POD: Metadata & ACL — 排查工作流

**来源草稿**: ado-wiki-a-applying-acl-permissions-data-box.md, ado-wiki-a-metadata-preservation-permissions-data-box.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: ACL 权限与跨域复制
> 来源: ado-wiki-a-applying-acl-permissions-data-box.md | 适用: Mooncake ✅ / Global ✅

### 场景
客户从本地域 (Domain-A) 复制数据到 Azure Files (Domain-B)，不想保留源 ACL，希望继承目标域权限。

### 三种方案

**Option 1: 保留源 ACL → 目标端手动继承**
- 数据传输后从 share-root 向下继承权限
- 大量数据可能需要数天/数周

**Option 2: 在 WebUI 禁用 ACL 转发**
- 默认 "ACL for Azure Files" 已启用 → 选择禁用
- **权衡**: 同时禁用时间戳和文件属性

**Option 3: 在 Data Box Share 上预设目标权限（推荐）**
- 在 Data Box Share 创建新目录
- 设置目标权限: 右键 → Properties → Security → Advanced → Add
- 使用 Robocopy + "DAT" 选项复制（不转发源权限）
- 验证: `get-acl -Audit <filename> | fl *`

---

## Scenario 2: 元数据保留问题排查
> 来源: ado-wiki-a-metadata-preservation-permissions-data-box.md | 适用: Mooncake ✅ / Global ✅

### 常见问题与解决方案

| 原因 | 解决方案 |
|------|----------|
| 传输到 Blob Storage 不保留元数据 | 改用 Azure Files |
| LastAccessTime / File_Attribute_Offline 未传输 | By design，不支持 |
| NFS 复制不传输 ACL | By design |
| Data Copy Service 不传输 ACL | 改用 Robocopy |
| 用户非 Backup Operator | 加入 Backup Operator 组 + WebUI 启用特权 |
| "Enable ACLs for Azure Files" 已禁用 | 在 WebUI 重新启用 |
| Portal 时间戳不正确 | Portal 显示 REST Last Modified → 挂载后在资源管理器查看 |
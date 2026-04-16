# Disk Data Box Disk: Unlock & Hardware — 排查工作流

**来源草稿**: ado-wiki-a-generic-access-denied-validation-tool.md, ado-wiki-a-usbtreeview-troubleshoot-undetected-disk-unlocking.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 磁盘未检测到或无法解锁
> 来源: ado-wiki-a-usbtreeview-troubleshoot-undetected-disk-unlocking.md | 适用: Mooncake ✅ / Global ✅

### 磁盘未检测到

1. 更换 USB 端口
2. 更换主机
3. 更换 USB 线缆
4. 以上均无效 → 磁盘可能损坏 → 创建 ICM 请求新磁盘

### 磁盘无法解锁

1. 确认 USB 端口为 USB 3.0
2. 更换主机/线缆
3. 检查 Disk Management 中磁盘是否显示为 "RAW" 或 "Unallocated"（截图）
4. 检查 Device Manager 中 USB 端口状态（截图）

### USBTreeView 工具诊断

1. 下载 USBTreeView（Windows SDK 调试工具包含）
2. 选择 Data Box Disk 连接的 USB 端口
3. 检查关键字段：
   - **USB version / Port maximum Speed**: 应为 3.0/SuperSpeed
   - **Demanded Current**: 高电流可能指示电源问题
   - **Connection Status**: 必须显示 "Device is connected"
4. 保存文本报告：File → Save Text Report

### 决策树
```
磁盘问题
├── 未检测到 → 换端口/换机/换线 → 仍失败 → ICM 换盘
└── 无法解锁
    ├── RAW/Unallocated → ICM 换盘
    ├── USB 2.0 端口 → 换 USB 3.0
    └── USBTreeView 异常 → 换直连 USB 3.0 端口/换主机
```

---

## Scenario 2: 验证工具 Access Denied 错误
> 来源: ado-wiki-a-generic-access-denied-validation-tool.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **以管理员身份运行** PowerShell 重新执行脚本
2. **检查权限**: 文件夹属性 → 安全 → 确认 `Everyone` 在用户列表中并有完整权限
3. **检查文件夹属性**: `attrib Drive_Letter:\Folder_Name`
4. **确认数据类型和来源**（如 .bak、SQL 备份等）
5. **在另一台机器上运行验证工具**（需先解锁磁盘）
6. **检查之前的验证运行状态**:
   ```powershell
   cd E:
   E:\DataBoxDiskImport\WaImportExport.exe -?
   ```
7. **收集调试二进制**: 使用私有调试版本 WaImportExportV1
8. **以上均无效 → 创建 ICM**
   - 收集 `Drive:\DataBoxDiskImport\logs` 中的日志
   - 上传到 `\\hcsfs\support\DataBoxDisk<CustomerCompanyName>`
   - 使用 ICM 模板创建 ICM
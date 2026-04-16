# Disk Data Box POD: Data Copy & Performance — 排查工作流

**来源草稿**: ado-wiki-a-data-box-copy-not-yet-started.md, ado-wiki-a-data-copy-slow-data-box.md, onenote-databox-pod-requirements-limits.md, onenote-databox-pod-support-package-analysis.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: DC 端数据复制未开始
> 来源: ado-wiki-a-data-box-copy-not-yet-started.md | 适用: Mooncake ✅ / Global ✅

### 可能原因
- 运输延误，设备未到达 Azure DC
- DC 端处理延迟
- 设备硬件问题
- 多次重试
- 客户更改/删除了存储账户
- 网络适配器未连接
- 运输中设备损坏

### 排查步骤
1. ASC 检查设备是否到达 DC (AtAzureDC stage 应为 succeeded)
2. ASC Shipping Status 查看运输详情
3. ASC Data Transfer Status 查看数据传输状态
4. 需要 ICM 升级时的路径: Windows Azure > Azure Databox > Technical > Issues in Datacenter > DC operations

---

## Scenario 2: 客户端数据复制慢
> 来源: ado-wiki-a-data-copy-slow-data-box.md | 适用: Mooncake ✅ / Global ✅

### 原因与排查

**原因 1: 大量小文件**
- 百万小文件传输本质上慢（每个文件需验证元数据）
- 建议: 小文件 < 512 KB → 2 个 Robocopy 会话，每会话 16 线程

**原因 2: 主机性能问题**
- 在不同机器上测试复制
- 比较本地卷间复制速度
- 收集 PerfMon trace 并联系 Windows 性能团队

**原因 3: 第三方过滤驱动**
- 运行 `fltmc` 检查过滤驱动
- 逐一卸载第三方过滤驱动以隔离问题
- 联系第三方应用团队解决

---

## Scenario 3: Data Box POD 支持包分析
> 来源: onenote-databox-pod-support-package-analysis.md | 适用: Mooncake ✅ / Global ✅

### 生成支持包
Local WebUI > Contact Support > Create Support package > Download

### 关键日志检查清单

| # | 日志文件 | 检查内容 |
|---|---------|----------|
| 1 | `DiagnosticsTestResults.json` | 从失败的测试开始排查 |
| 2 | `Get-HcsApplianceInfo.txt` | 软件版本是否正确 |
| 3 | `Get-HcsTimeSettings.txt` | 时区是否正确 |
| 4 | `Get-HcsNetInterface.txt` | 端口状态是否 Up |
| 5 | `Get-ClusterResource.txt` | 资源状态 (Failed → 需调查) |
| 6 | `hcsmgmt.Primary` | 搜索 `[Err]` 条目 |

### 决策树
```
DiagnosticsTestResults.json → 有测试失败?
├── Yes → 从失败测试开始
│   ├── 检查软件版本 (Get-HcsApplianceInfo)
│   ├── 检查时区 (Get-HcsTimeSettings)
│   ├── 检查网络端口 (Get-HcsNetInterface)
│   ├── 检查集群资源 (Get-ClusterResource)
│   └── 搜索 [Err] in hcsmgmt.Primary
└── No → 检查其他日志的 warnings/errors
```

---

## Scenario 4: 存储账户兼容性检查
> 来源: onenote-databox-pod-requirements-limits.md | 适用: Mooncake ✅ / Global ✅

### 支持矩阵 (Import)

| 账户类型 | Block Blob | Page Blob | Azure Files |
|---------|-----------|-----------|-------------|
| GPv1/v2 Standard | ✅ | ✅ | ✅ |
| GPv1/v2 Premium | ❌ | ✅ | ❌ |
| Premium FileStorage | ❌ | ❌ | ✅ |
| Blob Storage Standard | ✅ | ❌ | ❌ |

### 关键限制
- Import 不支持: Queue, Table, Disk 存储类型
- Export 不支持: Queue, Table, Disk, ADLS Gen2
- Page Blobs 必须 512 字节对齐
- Export 上限: 每单 80 TB
- Archive Blobs 须先 rehydrate
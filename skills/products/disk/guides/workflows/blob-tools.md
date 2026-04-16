# Disk Blob Storage & Transfer Tools — 排查工作流

**来源草稿**: onenote-azcopy-support-reference.md, onenote-blob-capacity-calculation.md, onenote-blobfuse-logging.md, onenote-blobfuse2-csi-setup.md, onenote-blobfuse2-static-mount-msi.md
**Kusto 引用**: 无
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Azcopy 问题排查与性能优化
> 来源: onenote-azcopy-support-reference.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **判断问题类型**
   - 如果不是工具特定问题 → 走常规存储 TSG
   - 如果是工具问题 → 内部检查 [GitHub Issues](https://github.com/Azure/azure-storage-azcopy/issues)（不要指引客户到 GitHub）
   - 问题不在列表中 → 通过 xstore 模板提交 ICM

2. **性能优化关键经验**
   - **大规模 blob 迁移 (500TB/1B files)**: 多个 azcopy 实例并行 + 自定义 sync 工具
   - **大量小文件 (500GB/5M files/5M folders)**: azcopy sync 非常慢，建议：
     - Azure File Sync（实时，最小停机）
     - Robocopy（/MT 多线程，180GB/2M files 仅需 12h）
   - **azcopy sync 关键问题**: 先索引两端 → 非常消耗内存（百万文件级别）

3. **联系方式**
   - SME: azcopyvteam@microsoft.com
   - Engineering: azcopysg@microsoft.com

### 决策树
```
Azcopy 问题
├── 认证/权限错误 → 常规存储 TSG
├── 传输性能差
│   ├── 百万小文件 → 改用 Robocopy / Azure File Sync
│   ├── sync 内存不足 → 增加并发数 / 分批执行
│   └── 服务端限流 → 检查存储账户 QoS
├── 功能缺失 → 创建 ICM + EEE（不让客户提 GitHub）
└── Bug → 内部检查 GitHub → 提交 ICM
```

---

## Scenario 2: Blob 容量计算方法
> 来源: onenote-blob-capacity-calculation.md | 适用: Mooncake ✅ / Global ✅

### 四种方法对比

| 方法 | 精确度 | 速度 | 注意事项 |
|------|--------|------|----------|
| Portal Metrics | 近似值 | 即时 | Container 数量可能不准（已知 Bug） |
| Storage Explorer | 精确 | 慢（手动） | 可枚举系统容器 |
| Blob Inventory | 精确 | 1天周期 | 付费功能，含软删除/版本 |
| PowerShell 脚本 | 精确 | 4h+（百万 blob） | 无法枚举系统容器 |

### 排查步骤

1. Portal 容量 ≠ 预期 → 检查是否启用了软删除/版本控制
2. 精确计算 → 推荐 Blob Inventory（低成本，自动枚举）
3. 百万 blob 级别 PowerShell 脚本 → 从 Azure VM 运行以减少网络延迟

---

## Scenario 3: Blobfuse / Blobfuse2 AKS 挂载问题
> 来源: onenote-blobfuse-logging.md, onenote-blobfuse2-csi-setup.md, onenote-blobfuse2-static-mount-msi.md | 适用: Mooncake ✅ / Global ✅

### CSI 驱动设置流程

1. **启用 CSI driver**
   ```bash
   az aks update --enable-blob-driver --resource-group <rg> --name <aks>
   ```

2. **创建存储密钥 Secret**
   ```bash
   kubectl create secret generic azure-secret \
     --from-literal=azurestorageaccountname=<account> \
     --from-literal=azurestorageaccountkey=<key>
   ```

3. **定义 StorageClass** (关键: `protocol: fuse2`)
   ```yaml
   parameters:
     skuName: Standard_LRS
     containerName: <container>
     protocol: fuse2
   ```

4. **MSI 认证方式** (无需 Secret)
   - 使用 kubelet identity (`xxx-agentpool`)
   - Static mount: 需要 `Storage Blob Data Contributor` 在 storage account 级别
   - Dynamic mount: 需要 `Storage Blob Data Contributor` 在 resource group 级别
   - StorageClass 参数: `AzureStorageAuthType: MSI`, `AzureStorageIdentityClientID: <kubelet-identity-client-id>`

### 日志排查

| 日志级别 | 用途 |
|---------|------|
| LOG_WARNING | 生产默认 |
| LOG_INFO | 排查推荐 |
| LOG_DEBUG | 深度调试（需源码） |

配置方式：在 PV mountOptions 中设置 `--log-level=LOG_INFO`

### 调试参考
- [blob-csi-driver debug guide](https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/csi-debug.md)
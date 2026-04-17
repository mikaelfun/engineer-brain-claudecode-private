# Disk Azure Files, File Sync & NFS — 排查工作流

**来源草稿**: onenote-azure-file-sync-troubleshooting.md, onenote-afs-enumeration-eta.md, onenote-azure-files-ad-ds-cross-forest.md, onenote-azure-files-adds-cross-forest.md, onenote-nfs41-vs-smb-protocol-comparison.md, ado-wiki-a-Slow-NFS-Transfer-Rate-Linux-DataBox.md, ado-wiki-a-Unable-to-mount-NFS-share-of-Azure-Data-Box.md
**Kusto 引用**: 无
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: Azure File Sync 同步故障排查
> 来源: onenote-azure-file-sync-troubleshooting.md, onenote-afs-enumeration-eta.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **确认同步阶段** — AFS 初始同步分 5 阶段：
   - Initial Cloud Enumeration → Fast DR Download → Initial Server Enumeration → Initial Upload → Incremental Sync
   - 通过日志中的 Sync Session Type 判断：`FullGhostedSync`(FastDR), `InitialUploadSync`, `RegularSync`, `SnapshotSync`

2. **运行诊断命令**
   ```powershell
   Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll"
   Debug-StorageSyncServer -Diagnose
   Debug-StorageSyncServer -TestNetworkConnectivity
   Debug-StorageSyncServer -FileSyncErrorsReport
   ```

3. **检查事件日志**
   - Path: Event Viewer > Applications and Services Logs > Microsoft > FileSync > Agent > Telemetry
   - **Event 9102**: 同步完成结果
   - **Event 9302**: 同步进度
   - **Event 9133**: Server 枚举进度 (ETA 计算)
   - **Event 9100**: 同步最终结果

4. **计算枚举 ETA**
   ```
   ETA (seconds) = ((NamespaceDirectoryCount + NamespaceFileCount)
     - (DirectoriesScannedThisRun + FilesScannedThisRun)) / ItemsPerSecondThisRun
   ```

5. **Jarvis 查询 (21v / Mooncake)**
   - Sync Session Status: `https://portal.microsoftgeneva.com/s/63B729E0`
   - Per-item Errors: `https://portal.microsoftgeneva.com/s/C0E4F134`
   - Server Enumeration ETA: `https://portal.microsoftgeneva.com/s/46D060CB`

6. **详细诊断跟踪**
   ```powershell
   cd "c:\Program Files\Azure\StorageSyncAgent"
   Import-Module .\afsdiag.ps1
   Debug-AFS -OutputDirectory C:\output -KernelModeTraceLevel Verbose -UserModeTraceLevel Verbose
   ```

### 决策树
```
同步问题
├── 初始同步卡住 → 确认当前阶段 → 检查 Event 9133/9302
├── 同步失败 → 检查 Event 9102 错误码 → FileSyncErrorsReport
├── 网络连接问题 → TestNetworkConnectivity
└── 性能低下 → 对比 Azcopy/Robocopy/FileSync 基线
```

---

## Scenario 2: Azure Files AD DS 跨林认证配置
> 来源: onenote-azure-files-ad-ds-cross-forest.md, onenote-azure-files-adds-cross-forest.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **单域设置流程**
   - 启用 AD DS 认证 (通过脚本创建计算机/服务账户)
   - 分配 Share-level 权限 (Azure RBAC)
   - 分配 Directory/File-level 权限 (NTFS): 挂载共享 + `icacls`

2. **跨林配置前提**
   - 两个林间的 Trust relationship
   - 两个林均可被单个 Microsoft Entra Connect Sync 服务器访问

3. **跨林 Option A: CNAME + SPN (推荐，支持 2+ 林)**
   ```
   # 在资源域 DNS 添加 CNAME:
   <storage-account-name>.<DomainDnsRoot> -> <storage-account-name>.file.core.chinacloudapi.cn
   # 注册 SPN:
   setspn -s cifs/<storage-account-name>.<DomainDnsRoot> <storage-account-name>
   ```

4. **跨林 Option B: Custom Name Suffix + Routing Rule (仅限 2 个林)**
   - 在资源域添加 UPN suffix
   - 在用户域启用 name suffix routing

5. **排查失败**
   - 验证 Kerberos 认证是否工作 (先测试普通 SMB 共享)
   - 检查 netmon 或认证日志中的 Kerberos ticket 交换
   - **重要**: Kerberos 失败不会回退到 NTLM，NTLM 不受支持
   - 检查用户 Group Membership

### 密码管理注意
- Computer account: 由 netlogon 驱动，不会过期
- Service account: 可能过期，建议使用独立 OU + 禁用 GPO 继承

---

## Scenario 3: NFS 4.1 vs SMB 协议选择
> 来源: onenote-nfs41-vs-smb-protocol-comparison.md | 适用: Mooncake ✅ / Global ✅

### 决策树

| 条件 | 推荐协议 |
|------|----------|
| Linux/UNIX + POSIX 应用 | NFS 4.1 |
| Windows 应用 / 文件共享 | SMB |
| 需要加密传输 | SMB (AES-256-GCM) |
| 需要 AD 认证 | SMB (AD DS) |
| 需要 File Sync | SMB only |
| 需要软删除 | SMB / REST |

### Mooncake 注意事项
- NFS 4.1 加密传输 (aznfs/stunnel) 在 Mooncake 有证书问题
- NFS 不支持 SMB Multichannel
- NFS 不支持软删除和 VSS 快照

---

## Scenario 4: Data Box NFS 挂载失败
> 来源: ado-wiki-a-Unable-to-mount-NFS-share-of-Azure-Data-Box.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. 收集客户截图或错误消息
2. 在 Data Box local WebUI > Connect and copy > NFS settings > NFS client access 中添加客户端 IP
3. 确认 Linux 主机已安装支持的 NFS 客户端版本
4. 执行挂载命令：
   ```bash
   sudo mount <Data Box IP>:/<share name> <mount point>
   ```
   Mac 客户端需加选项：
   ```bash
   sudo mount -t nfs -o sec=sys,resvport <IP>:/<share> <mount>
   ```
5. **重要**: 必须先在 share 下创建文件夹，再复制文件到该文件夹，不能直接复制到 root

---

## Scenario 5: Data Box NFS 传输速度慢
> 来源: ado-wiki-a-Slow-NFS-Transfer-Rate-Linux-DataBox.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **环境信息收集**
   - NFS share 是否在集群中？多少节点？有负载均衡器吗？
   - 数据类型和大小？是否转换格式 (e.g., tar)？
   - Data Box 使用了哪个网络端口？

2. **核实网络端口带宽**
   - DATA1/DATA2 = 10Gbps, DATA3 默认 1Gbps

3. **隔离测试**
   - 比较 Data Box 与本地磁盘的传输速度
   - 尝试单节点复制
   - 尝试复制小文件 vs 大文件

4. **建议**
   - 优先使用 10Gbps 端口
   - 单节点传输
   - 减少节点上的其他 IO 操作
   - 传输前先完成数据转换
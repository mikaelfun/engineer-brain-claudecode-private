# Disk Azure Disk Encryption (ADE) & BitLocker — 排查工作流

**来源草稿**: [mslearn-unlock-encrypted-disk-offline.md], [onenote-nfs41-encryption-in-transit-aznfs.md]
**Kusto 引用**: 无
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: ADE 加密磁盘离线修复
> 来源: mslearn-unlock-encrypted-disk-offline.md | 适用: Mooncake ❌ (ADE not available in 21v) / Global ✅

### 前置判断
| 条件 | 方法 |
|------|------|
| ADE v2 + managed + public IP OK | 自动化: `az vm repair create` |
| ADE v2 + managed + no public IP | 半自动: 创建 VM 时附加磁盘 |
| ADE v1 or unmanaged | 手动: 从 Key Vault 取 BEK |

### 排查步骤 (半自动 — ADE v2)
1. 对加密 OS 磁盘创建 Snapshot
2. 从 Snapshot 创建磁盘（相同 region + AZ）
3. 创建修复 VM (Windows Server 2016+, 相同 region/AZ)
4. **关键**: 在 VM 创建过程中附加磁盘（不是创建后），BEK volume 会自动出现
5. 在 Disk Management 中给 BEK volume 分配驱动器号
6. 查找 BEK 文件: `dir H: /a:h /b /s`
7. 解锁: `manage-bde -unlock G: -RecoveryKey H:\{GUID}.BEK`
   `[来源: mslearn-unlock-encrypted-disk-offline.md]`

### 排查步骤 (手动 — ADE v1/Unmanaged)
1. 在修复 VM 上安装 Az PowerShell module
2. 通过 PowerShell 脚本从 Key Vault 获取 BEK
3. 如果 BEK 是 "Wrapped"，下载并使用 KEK 解包
4. 保存 BEK 到 `C:\BEK\`
5. 解锁: `manage-bde -unlock F: -RecoveryKey C:\BEK\{filename}.BEK`

> **重要**: 解锁不等于解密 — 磁盘仍然是加密的。修复后将 OS 磁盘换回原始 VM。

---

## Scenario 2: NFS 4.1 加密传输 (aznfs) 配置
> 来源: onenote-nfs41-encryption-in-transit-aznfs.md | 适用: Mooncake ✅ (有证书问题) / Global ✅

### 排查步骤 — Linux VM
1. 在 Azure Portal 启用 "Enforce Encryption in Transit"
2. 安装 aznfs mount helper
   ```bash
   curl -sSL -O https://packages.microsoft.com/config/$(source /etc/os-release && echo "$ID/$VERSION_ID")/packages-microsoft-prod.deb
   sudo dpkg -i packages-microsoft-prod.deb && sudo apt-get update && sudo apt-get install aznfs
   ```
3. 挂载 NFS share
   ```bash
   sudo mount -t aznfs <account>.file.core.windows.net:/<account>/<share> /mount/nfsshare \
     -o vers=4,minorversion=1,sec=sys,nconnect=4
   ```
   `[来源: onenote-nfs41-encryption-in-transit-aznfs.md]`

### 排查日志
| 日志/工具 | 路径/命令 |
|----------|---------|
| AZNFS 日志 | `/opt/microsoft/aznfs/data/aznfs.log` |
| Stunnel 日志 | `/etc/stunnel/microsoft/aznfs/nfsv4_fileShare/logs/stunnel_<IP>.log` |
| 网络抓包 | `tcpdump -i eth0 -p -s 0 port 2049 -n -w /tmp/repro.pcap` |
| NFS 挂载信息 | `nfsstat -m` |
| Stunnel 状态 | `sudo netstat -anp \| grep stunnel` |
| Watchdog 状态 | `sudo systemctl status aznfswatchdog*` |

---

## Scenario 3: Mooncake DigiCert 证书问题修复
> 来源: onenote-nfs41-encryption-in-transit-aznfs.md | 适用: Mooncake ✅ / Global-only ❌

### 问题
MC 存储端点使用 DigiCert Global Root CA (G1)，但 aznfs stunnel 配置绑定 G2。挂载失败: "unable to get local issuer certificate"

### 修复步骤 (Debian/Ubuntu/SUSE)
```bash
mv /etc/ssl/certs/DigiCert_Global_Root_G2.pem /etc/ssl/certs/DigiCert_Global_Root_G2_Backup.pem
cat /etc/ssl/certs/DigiCert_Global_Root_CA.pem /etc/ssl/certs/DigiCert_Global_Root_G2_Backup.pem > /etc/ssl/certs/DigiCert_Global_Root_G2.pem
```

### 修复步骤 (RHEL/CentOS/Fedora)
```bash
awk '/DigiCert Global Root CA/ {found=1} found && /BEGIN CERTIFICATE/,/END CERTIFICATE/ {print > "/etc/ssl/certs/DigiCert_Global_Root_CA.pem"} found && /END CERTIFICATE/ {exit}' /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
awk '/DigiCert Global Root G2/ {found=1} found && /BEGIN CERTIFICATE/,/END CERTIFICATE/ {print > "/etc/ssl/certs/DigiCert_Global_Root_G2.pem"} found && /END CERTIFICATE/ {exit}' /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
mv /etc/ssl/certs/DigiCert_Global_Root_G2.pem /etc/ssl/certs/DigiCert_Global_Root_G2_Backup.pem
cat /etc/ssl/certs/DigiCert_Global_Root_G2_Backup.pem /etc/ssl/certs/DigiCert_Global_Root_CA.pem > /etc/ssl/certs/DigiCert_Global_Root_G2.pem
```
`[来源: onenote-nfs41-encryption-in-transit-aznfs.md]`

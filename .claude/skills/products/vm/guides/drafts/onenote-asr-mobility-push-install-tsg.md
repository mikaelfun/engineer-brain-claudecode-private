---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======12. ASR=======/12.19 [ASR] TSG for push installation of mobility.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# ASR Mobility Service Push Installation TSG

## Push Install 前置条件

### Windows 前置条件

1. Process Server (PS) 需要能访问互联网（签名验证）
2. 源机器已开机，且 PS 可以通过指定凭据访问
3. Windows 防火墙需添加以下例外：
   - Windows Management Instrumentation (WMI)
   - File and Printer Sharing
4. 推送账户必须是源机器本地 Administrators 组成员
5. 使用本地账户推送时需**禁用 Remote UAC**

| 机器类型 | 推送账户 | 额外要求 |
|---------|---------|---------|
| 域加入 | 默认域 Administrator | 防火墙 GPO |
| 域加入 | 域用户（本地 Admin 组成员） | 防火墙 GPO |
| 域加入 | 默认本地 Administrator | 防火墙 GPO |
| 域加入 | 本地用户（本地 Admin 组成员） | 防火墙 GPO + 禁用 Remote UAC |
| 工作组 | 默认本地 Administrator | 防火墙设置 |
| 工作组 | 本地用户（本地 Admin 组成员） | 防火墙设置 + 禁用 Remote UAC |

### 禁用 Remote UAC（注册表）

```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System
DWORD: LocalAccountTokenFilterPolicy = 1
```

### Linux 前置条件

1. 需要 root 账户凭据
2. 安装最新 openssh, openssh-server, openssl 包
3. SSH 端口 22 必须开放
4. `/etc/ssh/sshd_config` 中需启用：
   - `PasswordAuthentication yes`
   - `Subsystem sftp ...`（取消注释）
5. 重启 sshd 服务

## 故障排查步骤

### 1. 验证 WMI 连接（Windows）

在 PS 上运行 `wbemtest.exe`：
- Namespace：`\\<source-ip>\root\cimv2`
- Authentication level：**Packet privacy**

连接失败 → WMI/Remote Administration 未在防火墙中允许

### 2. 验证文件共享可访问性（Windows）

在 PS 的文件资源管理器地址栏输入：
```
\\<source-machine-ip>\C$
```
若无法访问 → 检查 File and Printer Sharing 防火墙例外

### 3. 验证 SSH 连接（Linux）

使用 PuTTY 测试：
- Host：source machine IP
- Port：22，Connection type：SSH

连接失败 → 检查防火墙规则和 sshd_config

## 关键提示

> ⚠️ **未更新到外部文档的要求**：PS 必须能访问源机器的 C 盘（`\\<source>\C$`）来复制推送安装文件。

---
title: "Linux VM 密码重置指南"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/reset-password"
product: vm
date: 2026-04-18
21vApplicable: true
---

# Linux VM 密码重置指南

## 适用场景
用户账户过期或密码丢失，需要重置 Linux VM 的本地密码或创建新管理员账户。

## 方法一：Azure Linux Agent（无需挂盘）

**前提**：VM 上已安装 Azure Linux Agent (waagent) 且服务运行中。

```bash
az vm user update -u $ADMIN_USER -p $NEW_PASS -g $RG -n $VM_NAME
```

也可通过 Azure Portal 的 **Reset Password** 功能操作。支持重置 SSH Key。

## 方法二：Serial Console + Single User Mode

1. 通过 Serial Console 进入 single-user mode
2. 检查 `/etc/ssh/sshd_config` 中 `PasswordAuthentication` 是否为 `yes`
3. 运行 `passwd <admin_user>` 重置密码
4. 若 SELinux 为 enforcing，运行 `touch /.autorelabel` 后 reboot

## 方法三：Repair VM（挂盘修复）

1. `az vm repair create` 创建修复 VM 并自动挂载 OS 盘副本
2. 登录修复 VM，进入 chroot 环境
3. 修改 sshd_config、重置密码、处理 SELinux
4. 退出 chroot，`az vm repair restore` 换回 OS 盘

## 决策建议
- Agent 可用 → 方法一（最快）
- Agent 不可用但能访问 Serial Console → 方法二
- 以上都不可用 → 方法三（挂盘修复）

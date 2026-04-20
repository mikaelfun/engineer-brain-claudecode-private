---
title: "Azure Serial Console for Linux 参考指南"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/serial-console-linux"
product: vm
date: 2026-04-18
21vApplicable: false
21vNote: "Serial Console is not yet available in the Azure China cloud (Mooncake)"
---

# Azure Serial Console for Linux

## 概述
连接 VM 的 ttys0 串口，独立于网络和 OS 状态。仅通过 Azure Portal 访问。

## 前提条件
- 启用 Boot diagnostics
- VM 内有密码认证的用户账户
- Azure 账户需有 VM Contributor 或更高权限
- 必须使用 ARM 部署模型
- Storage account 不能禁用 key access

## 常见使用场景
| 场景 | 操作 |
|------|------|
| /etc/fstab 错误 | Single user mode 修复 |
| 防火墙阻断 SSH | 通过 serial console 重配 iptables/firewalld |
| 文件系统损坏 | fsck 检查修复 |
| SSH 配置错误 | 直接修改 sshd_config |
| GRUB 交互 | 重启 VM 进入 GRUB |

## 自定义镜像启用
- `/etc/inittab` 配置 ttyS0：`S0:12345:respawn:/sbin/agetty -L 115200 console vt102`
- 或 `systemctl start serial-getty@ttyS0.service`
- 内核标志：`CONFIG_SERIAL_8250=y`, `CONFIG_MAGIC_SYSRQ_SERIAL=y`

## 已知问题
- Enter 无响应：`grub2-mkconfig -o /etc/grub2-efi.cfg`
- 屏幕显示不完整：安装 xterm 并运行 `resize`
- SLES BYOS 键盘输入异常：卸载 plymouth 包
- 粘贴限制 2048 字符
- Trusted Launch + Secure Boot live migration 后需 reboot

## 安全性
- 传输 TLS 1.2+ 加密
- 不存储控制台数据
- 并发访问：后连接用户会踢掉前一用户
- 建议设置 `export TMOUT=600` 防止会话空闲

## Storage Account 防火墙
需将 Serial Console service IP 添加到 storage account 防火墙排除列表（按 VM region/geography）。

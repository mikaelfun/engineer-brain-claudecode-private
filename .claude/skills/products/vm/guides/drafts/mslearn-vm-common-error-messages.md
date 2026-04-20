---
title: Common Error Messages When Managing VMs in Azure
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/error-messages
product: vm
21vApplicable: true
date: 2026-04-18
---

# Azure VM 常见错误消息参考表

## 概述
管理 Azure VM 时常见的错误代码和消息速查表。

## 错误响应格式
```json
{"status": "status code", "error": {"code": "Top level error code", "message": "...", "details": [...]}}
```

## 高频错误分类

### 分配失败
- **AllocationFailed**: 集群资源不足，建议缩小 VM 大小、稍后重试或更换区域
- **OverConstrainedAllocationRequest**: 所选位置当前无可用 VM 大小

### 磁盘相关
- **AcquireDiskLeaseFailed**: Blob 已被占用
- **AttachDiskWhileBeingDetached**: 磁盘正在分离中，需等待完成
- **ConflictingUserInput**: 磁盘已属于其他 VM
- **DiskBlobNotFound**: 找不到 VHD blob
- **IncorrectDiskBlobType**: 磁盘 blob 必须是 page blob

### 扩展相关
- **ArtifactNotFound**: 找不到扩展
- **VMExtensionProvisioningError**: 扩展处理失败
- **VMExtensionProvisioningTimeout**: 扩展安装超时

### 预配相关
- **OSProvisioningClientError**: Guest OS 正在预配或预配失败
- **OSProvisioningTimedOut**: 预配超时，可能仍在进行

### 存储相关
- **StorageAccountLimitation**: 存储账户不支持 page blob 或超出配额
- **StorageAccountLocationMismatch**: 存储账户与计算资源不在同一位置

### 操作限制
- **OperationNotAllowed**: 各种操作限制（VM 状态不允许、扩展冲突等）

## 关键提示
- 模板部署时，最内层 error details 的 message 通常是根因
- AllocationFailed 可参考 VM resizing strategy: https://aka.ms/azure-resizevm

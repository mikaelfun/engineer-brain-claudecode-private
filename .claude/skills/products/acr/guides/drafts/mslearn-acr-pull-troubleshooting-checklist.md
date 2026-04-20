---
title: ACR Pull 通用排查清单
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/troubleshoot-issues-pull-container-registry
product: acr
date: 2026-04-18
---

# ACR Pull 通用排查清单

从 Azure Container Registry pull 镜像/artifact 失败时的通用排查流程。

## 前置条件

- 已安装 Azure CLI

## 排查步骤

### Step 1: 复现问题

运行 `docker pull <image-name>` 复现问题，记录完整错误信息。

### Step 2: 检查 Registry 健康状态

```bash
az acr check-health --name <container-registry-name> --ignore-errors --yes
```

如果检测到问题，报告会显示错误码和描述。参考 [Health check error reference](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-health-error-reference) 查看错误码含义和解决方案。

### 常见 Pull 失败场景

- **认证错误**: Token 过期、RBAC 权限不足
- **网络问题**: Port 443 不通、DNS 解析失败、NSG/Firewall 阻拦
- **Manifest/Tag 不存在**: 镜像名或 tag 拼写错误、已被删除
- **IP 限制**: Client IP 不在 ACR 防火墙白名单
- **超时**: Proxy/VPN 干扰、带宽不足

> 各具体错误场景详见 known-issues-mslearn.jsonl 中的独立条目。

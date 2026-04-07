---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Proxy Lab: Layer 7 Proxy Testing Application"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FProxy%20Lab%3A%20Layer%207%20Proxy%20Testing%20Application"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Proxy Lab: Layer 7 Proxy Testing Application

[[_TOC_]]

## What is Proxy Lab?

Proxy Lab 是专为 Azure Networking Support Engineers 构建的开源 Layer 7 (HTTP/HTTPS) 代理测试工具，用于测试、调试和验证 Azure Application Gateway、Azure Front Door 等 L7 网络产品的行为。

**公共实例**：https://www.theproxylab.com（仅基础测试，admin功能不可用）

**GitHub**：https://github.com/zcabrer/proxylab

---

## 功能与排查场景

| 功能 | 描述 | 适用场景 |
|------|------|---------|
| **Headers Tool** | 检查/修改HTTP请求/响应头 | 测试header rewrite、x-forwarded-for注入、header路由 |
| **Post Body Tool** | 提交自定义POST请求 | 验证请求体处理、content-length、WAF规则测试 |
| **Query String Tool** | 自定义query string | 测试query rewrite、路由、编码解码 |
| **File Upload/Download Tool** | 上传/下载各种大小文件 | 测试upload/download限制、性能、内容检测 |
| **Request Timeout Tool** | 模拟延迟响应 | 测试超时处理、idle连接超时、proxy稳定性 |
| **HTTP Status Code Generator** | 生成自定义HTTP状态码响应 | 验证错误处理、自定义错误页、健康探测行为 |
| **Admin Center** | HTTPS配置、packet capture、live log streaming | SSL/TLS启用、Wireshark流量捕获、实时请求监控 |

---

## 部署方式

| 部署选项 | 特点 |
|---------|------|
| Azure Linux VM | 完全控制，支持Admin Center HTTPS上传 |
| Azure Container Instance (ACI) | 快速部署，支持KV集成HTTPS |
| Azure Kubernetes Service (AKS) | 可扩展，支持自定义manifest和AKS secrets |
| Azure App Service (Web App for Containers) | 托管平台，支持自定义域名和Azure证书 |
| Local Docker | 本地测试和开发 |

详细部署指南：https://github.com/zcabrer/proxylab/wiki/Deployment-Guides

---

## Getting Started

1. 快速体验：https://www.theproxylab.com（admin功能不可用）
2. 完整功能：参考 [Deployment Guide](https://github.com/zcabrer/proxylab/wiki/Deployment-Guides) 部署到自己的环境
3. 工具说明：https://github.com/zcabrer/proxylab/wiki/Tools
4. Admin Center：https://github.com/zcabrer/proxylab/wiki/Admin-Center

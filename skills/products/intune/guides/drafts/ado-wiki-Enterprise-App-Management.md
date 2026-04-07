# Enterprise App Management — ADO Wiki 提取草稿

> 来源: Supportability/Intune wiki `/App Management/Enterprise App Management`
> 提取日期: 2026-04-04 | ID: intune-ado-wiki-014

## 概述

Enterprise App Management 通过预打包的安全应用目录简化 Windows 应用生命周期管理，支持一方和三方应用的部署与自动更新。目录从 Intune admin center 直接访问。

## Known Issue: 应用不在目录中

**症状**: 客户找不到想要的应用（第一方或第三方）  
**支持边界**:
- SAP Path: `Azure\Microsoft Intune\Enterprise App Management`
- Queue: `SCIM Intune CSS Queues`
- Escalation Path: https://aka.ms/eam/AppRequest

**处理流程**:
1. ❌ **不创建 ICM**——产品团队不接受通过 ICM 提交的 app 请求
2. ✅ 工程师填写 App 申请表: https://aka.ms/eam/AppRequest
3. 记录已提交申请表（case notes）后**关闭 case**
4. 告知客户：目前不接受任何其他方式的缺失应用请求

## 参考链接

- Wiki: https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FEnterprise%20App%20Management
- App Request Form: https://aka.ms/eam/AppRequest

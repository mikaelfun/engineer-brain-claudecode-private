# Company Portal for GCC-H — ADO Wiki 提取草稿

> 来源: Supportability/Intune wiki `/App Management/Windows/Company Portal for GCC-H`
> 提取日期: 2026-04-04 | ID: intune-ado-wiki-015

## 概述

GCC-H (Fairfax) 租户客户无法通过 Microsoft Store 直接部署 Company Portal，因为 Fairfax 环境中新版 Microsoft Store 不可用。

## Known Issue: GCC-H 无法从 Store 部署 Company Portal

**症状**: 客户在 GCC-H Fairfax 租户中无法从 Microsoft Store 推送 Company Portal  
**根本原因**: GCC-H Fairfax 租户不支持新版 Microsoft Store

**解决方案**:

1. **使用商业账号**下载（⚠️ 不能用 GCC-H UPN，否则下载会被阻止）:
   ```
   winget download --id "9WZDNCRFJ3PZ" --source msstore
   ```
   > `--source msstore` 参数必须加，确保从 MS Store 而非 Winget 获取

2. 将下载的二进制文件打包为 **LOB 应用**，通过 Intune 推送

3. ⚠️ **维护注意**: 每次 Company Portal 有新版本更新时，需重复：下载 → 重打包 → 重部署

## 参考链接

- Wiki: https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FWindows%2FCompany%20Portal%20for%20GCC-H

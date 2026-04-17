---
source: onenote
sourceRef: MCVKB/VM+SCIM/=======11. AAD=======/11.50[AADJ+Intune]Add AAD group_Users to AADJ loca.md
sourceUrl: null
importDate: 2026-04-04
type: troubleshooting-guide
---

# AADJ + Intune: 将 AAD 用户/组添加到本地管理员组

## 概述

在 Azure AD Joined (AADJ) 设备上，可以通过两种 Intune 方法将 AAD 用户或 AAD 组加入本地管理员组：
1. **OMA-URI 自定义配置 (LocalUsersAndGroups CSP)**
2. **Account Protection 端点安全策略**

官方文档：https://learn.microsoft.com/en-us/entra/identity/devices/assign-local-admin

## 默认本地管理员

AADJ 设备默认有以下本地管理员：
- 执行 AAD Join 的用户
- **Microsoft Entra Joined Device Local Administrator** 角色持有者
- **Global Administrator** 角色持有者

## 方法一：OMA-URI (LocalUsersAndGroups CSP)

**CSP 文档**：https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-localusersandgroups

**配置路径**：Intune → Devices → Configuration Profiles → New Profile → Windows → Templates → Custom

**OMA-URI**：
```
./Device/Vendor/MSFT/Policy/Config/LocalUsersAndGroups/Configure
```

**Action 说明**：
- `U` (Update)：追加成员，不影响现有成员
- `R` (Replace)：替换全部成员（类似 Restricted Groups），未指定成员会被移除

**示例 XML（添加 AAD 用户和 AAD 组到 Administrators）**：
```xml
<GroupConfiguration>
    <accessgroup desc = "S-1-5-32-544">
        <group action = "U" />
        <add member = "AzureAD\user@contoso.com"/>
        <add member = "S-1-12-2-XXXXXXXXX-XXXXXXXXX-XXXXXXXXX-XXXXXXXXX"/>
    </accessgroup>
</GroupConfiguration>
```

> **注**：AAD 组需使用其 Object ID 对应的 SID（格式 `S-1-12-2-...`）。`S-1-5-32-544` 是 Administrators 组的 SID。

## 方法二：Account Protection 端点安全策略

路径：Intune → Endpoint Security → Account Protection → Create Policy → Windows → Local User Group Membership

- 同样支持 Update 和 Replace 动作
- UI 更友好，可直接选择 AAD 用户/组

## 通过 Entra Groups 功能（Preview）

新功能：通过 AAD Groups 管理 AADJ 设备本地管理员，支持更细粒度的设备组级别管理。
文档：https://learn.microsoft.com/en-us/entra/identity/devices/assign-local-admin#manage-administrator-privileges-using-microsoft-entra-groups-preview

## Lab 验证结论

两种方法（OMA-URI 和 Account Protection）均已验证可用（Verified）。

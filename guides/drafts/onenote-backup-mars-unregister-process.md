# Backup: 无法从 Vault 注销 MARS/DPM/MABS 服务器的处理流程

**Source**: MCVKB/VM+SCIM/======= 13. Backup=======/13.8  
**Date**: 2019-07-03 (Updated: 2020-07-31)  
**Applies to**: Azure Backup (Mooncake/21Vianet + Global)

---

## 背景

**Behavior Change (2019-06-21)**：如果保护服务器（安装了 MARS/DPM/MABS 的原始服务器）已不存在，Portal 不再允许直接注销该服务器的注册或删除备份项。正确做法是通过本地管理控制台（MARS / Azure Backup Server / SC DPM）删除。

参考：[Deleting backup items from management console](https://docs.microsoft.com/en-us/azure/backup/backup-azure-delete-vault#deleting-backup-items-from-management-console)

**当原始服务器不存在时**（如已下线、重建），需要走以下特殊流程，通过 Sev3 ICM 申请后端操作。

---

## 5 步处理流程

### Step 1: 获取客户书面同意

向客户发送以下邮件模板，**必须在收到明确确认后才能启动后端变更**：

---

> Deleting servers' registration from an Azure Backup Recovery Services Vault requires deleting backup items associated with registered backup management or protected servers. We understand that the steps required to delete backups may not be possible due to the servers' unavailability, due to reasons, including but not limited to decommissioning. In such situations, we require your official consent to make an exception and relax the requirement, thereby allowing you to remove the servers' registration without deleting backup items. You must understand and acknowledge that removing the server's registration through this exception is a one-time operation and leads to immediate deletion of all the servers' backups without any possibility of a future recovery. We strongly recommend seeking consent from appropriate departments in your organization before consenting to make this exception.
>
> If you want to go ahead with this exception, please reply to this note confirming that you **"understand the risk of permanent backup deletion and want to go ahead with this exception"**. Additionally, please provide the following details:
> - Server Name as shown in the Azure Portal
> - Azure Region where the vault is deployed
> - Contact of the person who authorized the exception

---

⚠️ **注意**：
- 客户可以用**中文回复**（确认理解永久备份删除的风险即可）
- 收到确认后，**回复客户已收到同意，SLA 为 24 个工作小时**

### Step 2: 立即提 Sev3 ICM

ICM 模板：https://icm.ad.msft.net/imp/v3/incidents/create?tmpl=C19112

在 ASC 中获取每个服务器的 Resource ID（通过 Backup Infrastructure 视图查看）。

⚠️ **每个 Resource ID 需要单独创建一个 ICM**。

### Step 3: 等待后端变更（24 个工作小时）

Backup PG（Rajkumar/Vinoth/Backup-PG）会在 24 个工作小时内：
1. 执行后端服务端变更
2. Mitigate ICM，并在更新中注明 **Exception Expiry Time (UTC)**

### Step 4: 通知客户操作窗口（3天）

ICM mitigate 后，发邮件通知客户：
- 变更已完成，现在可以在 Portal 注销服务器
- 时间窗口为 **3 天**，过期后例外将失效

### Step 5: 确认删除并关单

等待客户确认服务器注销成功后关闭 Case。

---

## 注意事项

| 项目 | 说明 |
|------|------|
| 操作不可逆 | 一旦注销，所有备份数据**永久删除**，无法恢复 |
| 每台服务器单独 ICM | 不要将多台服务器合并到一个 ICM |
| 客户同意先行 | 未收到明确书面同意，不得提交 ICM 申请变更 |
| 语言无限制 | 客户中文回复有效 |
| 异常到期时间 | ICM 备注中有 UTC 格式的 Exception Expiry Time |

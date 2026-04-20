# VM Security Incidents — Common Talking Points

**Source**: MCVKB/VM+SCIM/======22.Security======/22.1 common talking points.md  
**Date**: 2022-06-21  
**Applies to**: Azure VM (Mooncake/21Vianet + Global)

---

## 1. 共同责任模型 (Shared Responsibility)

客户反映安全问题时，首先明确共同责任边界：

- IaaS (Azure VM)：OS 及以上层级属于客户责任范围，不属于 Azure 平台安全事件
- 参考文档：[Shared responsibility in the cloud](https://docs.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility)
- 白皮书：[Azure Security Response in the Cloud (PDF)](https://rmartins.blob.core.windows.net/documentos/MicrosoftAzureSecurityResponseinthecloud.pdf)

---

## 2. 何时需要上报安全团队？

| 情况 | 处理方式 |
|------|----------|
| 疑似 Azure 平台安全事件 / 共同责任安全问题 | 引导客户/CSAM 提 **IR (Incident Response) Case**，安全团队介入 |
| 客户自身 VM 被攻击（customer-only compromise） | IR Case 范围见下方；超出范围需与客户沟通预期 |

**IR Case 有效范围：**
1. 恶意软件的调查分析
2. 安全产品告警和事件的调查分析
3. Determined Human Adversary (DHA) 攻击调查
4. Security Bulletins (SSIRPs) / Vulnerability Events

**不在 IR Case 范围的典型请求：**
- 被黑客加密的数据恢复
- VM 磁盘被加密，要求解密恢复数据
- VM/服务的完整漏洞扫描解决方案

如何发起 IR Case：让 CSAM 或客户以 SAP：Security Incident Response 提新 Case。

---

## 3. 勒索软件/受感染 VM 处理

### 能否启动被感染的 VM 来复制数据？

**不建议直接启动**（勒索软件可能扫描虚拟网络并感染其他 VM）。安全步骤：

1. 立即关闭受感染 VM
2. 对 OS/Data 磁盘创建快照，然后从快照复制磁盘
3. 在**隔离 VNet**（用 NSG 限制出入）中创建新 VM
4. 挂载复制后的磁盘
5. 从隔离环境中复制用户数据或进行调查

参考：[Create a Windows VM from a specialized VHD](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/create-vm-specialized-portal#copy-a-disk)

### 能否直接恢复备份的受感染 VM？

**不建议**。勒索软件注入时间点难以确定，恢复后仍有扩散风险。建议：

1. 在**隔离 VNet** 中恢复备份 VM
2. 检查数据是否未被加密，若是则复制用户数据
3. 在原始网络新建干净 VM，再迁入数据

参考：[Restore VMs using the Azure portal](https://docs.microsoft.com/en-us/azure/backup/backup-azure-arm-restore-vms)

### Microsoft 能否恢复加密数据？

若是客户自身安全攻击，无法保证恢复。可尝试：
- 从 Azure Backup 恢复用户数据
- 提 IR Ticket 让安全团队调查攻击方法和防御步骤

---

## 4. 安全调查所需日志

| 日志来源 | 说明 |
|----------|------|
| OS/Data 磁盘快照 | 保留受感染 VM 的磁盘供深度分析 |
| Azure Security Center / Defender for Cloud | 若已启用 |
| Log Analytics (OMS) | 需预先配置 OMS Agent + Security log/Syslog 收集 |
| Azure Network Watcher 日志 | 需收集到 Log Analytics |
| Azure WAF 日志 | 需收集到 Log Analytics |
| Azure Firewall 日志 | 需收集到 Log Analytics |
| Azure Activity 日志 | 默认保留 90 天（未收集到 LA 时） |
| Azure AAD Audit/Sign-in 日志 | 默认保留 90 天 |

---

## 5. Log Analytics 安全查询示例

如客户已配置 Log Analytics，可运行以下查询（需先在 ASC 确认）。

导入查询包（ARM template）：
```powershell
New-AzResourceGroupDeployment -ResourceGroupName $resourcegroup -Name "securityquerypack" -TemplateFile $templatefile
```
模板地址：https://raw.githubusercontent.com/simonxin/sentinel-like-queries-for-mooncake/master/template/securityquerypack.json

### 检查挖矿软件 (Squid Proxy)
```kusto
Syslog
| where Computer =~ '<your_VM_name>' and TimeGenerated > ago(60d) and Facility !='authpriv'
| where SyslogMessage contains "squid"
| project TimeGenerated, SyslogMessage
```

### 检查 SSH 暴力破解
```kusto
Syslog
| where Computer =~ '<your_VM_name>' and TimeGenerated > ago(60d)
| where SyslogMessage contains "Failed password for"
| where ProcessName =~ "sshd"
| parse kind=relaxed SyslogMessage with * "Failed password for " user " from " ip " port" port " ssh2"
| project user, ip, port, SyslogMessage, EventTime, Computer
| summarize EventTimes = make_list(EventTime), PerHourCount = count() by ip, bin(EventTime, 1h), user, Computer
| where PerHourCount > threshold
| mvexpand EventTimes
| extend EventTimes = tostring(EventTimes)
| summarize StartTimeUtc = min(EventTimes), EndTimeUtc = max(EventTimes), UserList = makeset(user), sum(PerHourCount)
    by IPCustomEntity = ip, HostCustomEntity = Computer
```

---

## 6. 漏洞评估 (Vulnerability Assessment)

- **Azure Global**：Microsoft Defender for Cloud 内置 Qualys 漏洞评估
- **Azure China (21Vianet)**：⚠️ 无 Qualys 功能，需引入第三方漏洞扫描方案
- Windows 漏洞：查询 [MSRC 安全更新程序指南](https://msrc.microsoft.com/update-guide/vulnerability)
- 非 Windows 漏洞：查询 [CVE Database](https://www.cve.org/SiteSearch)
- 恶意 IP/网站查询：[VirusTotal](https://www.virustotal.com/gui/home/search)

---

## 7. 互联网暴露的最佳实践

- 避免直接开放 VM 的公网访问
- Web 应用前置 Application Gateway（WAF 已启用），微软会自动更新 WAF 规则（如 log4j）
- 用 Azure Firewall 管理出站流量（可识别并拦截挖矿流量）
- VM SSH 访问建议选项：
  - **Option 1**：通过 ER/VPN 只允许内网访问
  - **Option 2**：通过 AVD (Azure Virtual Desktop) + VNet Peering 访问
  - **Option 3**：[Azure Bastion](https://docs.azure.cn/zh-cn/bastion/bastion-overview)

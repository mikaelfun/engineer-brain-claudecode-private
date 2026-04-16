# Defender Defender for DNS — 排查工作流

**来源草稿**: ado-wiki-d-defender-for-dns-technical-knowledge.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Azure Defender for DNS
> 来源: ado-wiki-d-defender-for-dns-technical-knowledge.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Are DNS transactions recorded on customer logs?**
2. **Customer has Defender for DNS enabled in Azure AD DS but cannot detect alerts**
3. **Do we support Azure Private DNS?**
4. **DNS alerts only on VM resources**

### Kusto 诊断查询
**查询 1:**
```kusto
union cluster('romeeus.eastus.kusto.windows.net').database("ProdAlerts").SecurityAlerts,
   cluster('romeuksouth.uksouth.kusto.windows.net').database("ProdAlerts").SecurityAlerts
   | where AzureResourceSubscriptionId == "{SubscriptionId}" and TimeGeneratedUtc > ago(30d) and ProviderName == "Dns"
```

**查询 2:**
```kusto
union cluster('romeeus.eastus.kusto.windows.net').database("ProdAlerts").SecurityAlerts,
   cluster('romeuksouth.uksouth.kusto.windows.net').database("ProdAlerts").SecurityAlerts
   | where AzureResourceSubscriptionId == "{SubscriptionId}" and TimeGeneratedUtc > ago(30d) and ProviderName == "Dns"
   | where * contains "Attempted communication with suspicious sinkholed domain"
   | extend domainFQDN=tostring(parse_json(ExtendedProperties)["DomainName"])
   | extend DNSanswers=tostring(parse_json(ExtendedProperties)["Answers"])
   | summarize min(StartTimeUtc), max(EndTimeUtc), make_set(AzureResourceId), make_set(DNSanswers), make_set(CompromisedEntity), make_set(AlertType), make_set(ProductName), make_set(Description) by domainFQDN
```

---

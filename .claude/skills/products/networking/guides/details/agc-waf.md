# Networking AGC WAF 策略与规则 — 综合排查指南

**条目数**: 5 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-waf-support-agc.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 已知问题与限制
> 来源: ado-wiki

1. **AGC WAF: JS Challenge action not working with Bot Manager Ruleset**
   - 根因: JS Challenge action is not supported in Application Gateway for Containers WAF during preview
   - 方案: Set Bot Manager Ruleset actions to Block, Log, or Allow instead of JS Challenge
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers)`

2. **AGC WAF: Using unsupported OWASP ruleset (CRS 3.0/3.1/3.2) causes 500 error when associating WAF policy to AGC**
   - 根因: Only Default Ruleset (DRS) 2.1 is supported on AGC WAF; Core Ruleset (OWASP) 3.0, 3.1, 3.2 are not supported
   - 方案: Use Default Ruleset (DRS) 2.1 as the managed ruleset instead of OWASP CRS 3.x
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers)`

### Phase 2: 其他
> 来源: ado-wiki

1. **AGC WAF: Deleting AGC parent resource fails when child security policy resources exist**
   - 根因: Child security policy resources are auto-removed but deletion of parent may fail if references not cleaned up first
   - 方案: Remove child resource security policy references from the security policy configuration before deleting the AGC parent resource
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers)`

2. **AGC WAF: Brief period of WAF policy not applied when moving policy target up the hierarchy**
   - 根因: When editing WAF policy to move target from lower level (Path) to higher level (Gateway), there is a transient gap in policy enforcement
   - 方案: Be aware of brief gap during hierarchy change; plan WAF policy changes during maintenance windows if possible
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers)`

### Phase 3: 网络与路由
> 来源: ado-wiki

1. **AGC BYO: WAF WebApplicationFirewallPolicy YAML applied but WAF not enforcing rules - policy appears applied in kubectl b**
   - 根因: In BYO AGC mode, applying a WebApplicationFirewallPolicy YAML does not auto-create the security policy object (unlike ManagedBy mode where it is auto-generated). Without the security policy association, WAF cannot enforce rules.
   - 方案: For BYO AGC, manually create the security policy by associating the WAF policy to the AGC resource via Azure Portal, CLI, or PowerShell. This creates the necessary security policy linkage that ManagedBy mode handles automatically.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/2-%20BYO%20and%20ManagedBy%20AGC%20-%20How%20to%20tell%2C%20why%20it%20matters%2C%20and%20how%20it%20affects%20WAF%20(Part%202%20of%20video%20series))`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | AGC WAF: JS Challenge action not working with Bot Manager... | JS Challenge action is not supported in Applica... | Set Bot Manager Ruleset actions to Block, Log, ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers) |
| 2 | AGC WAF: Using unsupported OWASP ruleset (CRS 3.0/3.1/3.2... | Only Default Ruleset (DRS) 2.1 is supported on ... | Use Default Ruleset (DRS) 2.1 as the managed ru... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers) |
| 3 | AGC WAF: Deleting AGC parent resource fails when child se... | Child security policy resources are auto-remove... | Remove child resource security policy reference... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers) |
| 4 | AGC BYO: WAF WebApplicationFirewallPolicy YAML applied bu... | In BYO AGC mode, applying a WebApplicationFirew... | For BYO AGC, manually create the security polic... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/2-%20BYO%20and%20ManagedBy%20AGC%20-%20How%20to%20tell%2C%20why%20it%20matters%2C%20and%20how%20it%20affects%20WAF%20(Part%202%20of%20video%20series)) |
| 5 | AGC WAF: Brief period of WAF policy not applied when movi... | When editing WAF policy to move target from low... | Be aware of brief gap during hierarchy change; ... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers) |

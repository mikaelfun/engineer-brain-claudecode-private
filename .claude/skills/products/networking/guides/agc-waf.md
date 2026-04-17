# Networking AGC WAF 策略与规则 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | AGC WAF: JS Challenge action not working with Bot Manager... | JS Challenge action is not supported in Applica... | Set Bot Manager Ruleset actions to Block, Log, ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers) |
| 2 📋 | AGC WAF: Using unsupported OWASP ruleset (CRS 3.0/3.1/3.2... | Only Default Ruleset (DRS) 2.1 is supported on ... | Use Default Ruleset (DRS) 2.1 as the managed ru... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers) |
| 3 📋 | AGC WAF: Deleting AGC parent resource fails when child se... | Child security policy resources are auto-remove... | Remove child resource security policy reference... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers) |
| 4 📋 | AGC BYO: WAF WebApplicationFirewallPolicy YAML applied bu... | In BYO AGC mode, applying a WebApplicationFirew... | For BYO AGC, manually create the security polic... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/2-%20BYO%20and%20ManagedBy%20AGC%20-%20How%20to%20tell%2C%20why%20it%20matters%2C%20and%20how%20it%20affects%20WAF%20(Part%202%20of%20video%20series)) |
| 5 📋 | AGC WAF: Brief period of WAF policy not applied when movi... | When editing WAF policy to move target from low... | Be aware of brief gap during hierarchy change; ... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers) |

## 快速排查路径
1. Set Bot Manager Ruleset actions to Block, Log, or Allow instead of JS Challenge `[来源: ado-wiki]`
2. Use Default Ruleset (DRS) 2.1 as the managed ruleset instead of OWASP CRS 3.x `[来源: ado-wiki]`
3. Remove child resource security policy references from the security policy configuration before delet `[来源: ado-wiki]`
4. For BYO AGC, manually create the security policy by associating the WAF policy to the AGC resource v `[来源: ado-wiki]`
5. Be aware of brief gap during hierarchy change; plan WAF policy changes during maintenance windows if `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/agc-waf.md#排查流程)

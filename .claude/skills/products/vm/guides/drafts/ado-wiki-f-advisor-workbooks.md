---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/TSGs/Advisor Workbooks_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Advisor%2FTSGs%2FAdvisor%20Workbooks_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Advisor Workbooks (Preview) Troubleshooting Guide

## Scope

Built-in Advisor Workbooks: Cost Optimization, Reliability, Service Retirement.
**Covers:** Query troubleshooting, data interpretation.
**Excludes:** Custom workbook development.

## Support Boundaries

| Supported | Not Supported |
|-----------|---------------|
| Built-in workbook templates | Custom workbook development |
| Query troubleshooting | Direct modification of default queries |
| Data interpretation | Custom JSON/KQL editing in built-in workbooks |
| Copying workbooks for customization | Schema customization |

## Troubleshooting

### 1. Workbook Not Loading
- Validate RBAC (Reader role or higher)
- Confirm resource scope selection (try deselecting/reselecting subscription)
- Check API responses (200 status but UI not loading)
- Collect browser trace logs with "Preserve log" enabled
- Try creating a new workbook to test if issue is workbook-specific

### 2. Missing Data
- Advisor refresh cycle is ~24 hours
- Validate impacted services for Service Retirement workbook
- Confirm data availability in Advisor portal
- Validate Log Analytics workspace connectivity
- Collect HAR file

### 3. Performance Issues
- Test queries independently in Log Analytics
- Reduce scope (fewer subscriptions/resource groups)
- Adjust time range filters
- For Service Retirement workbook subscription loading issues:
  1. Navigate to portal.azure.com/#settings/directory
  2. Set Default Subscription Filter
  3. Go to workbook page and verify subscriptions listed

### 4. KQL/JSON Query Connection
- Open workbook in Edit mode > Advanced Settings
- Inspect and copy KQL query to Log Analytics
- Validate JSON binding and column mappings
- Test query execution independently

## Cross-Team Escalation

| Team | Responsibility |
|------|---------------|
| Azure Monitor | Log Analytics query engine issues (Tier 2) |
| Cost Management | Billing anomalies (Tier 2) |
| Service Retirement | Validate impacted services (Tier 2) |
| Product Group | Bugs or feature gaps (Tier 3) |
| IAM/Permissions | Permissions/config checks (Tier 1) |

## Escalation Process

Use ASC > Escalation button > Recommended tab > "Azure Advisor PG engagement" template.

## References

- [Azure Advisor Workbooks Overview](https://learn.microsoft.com/en-us/azure/advisor/advisor-workbooks)
- [Cost Optimization Workbook](https://learn.microsoft.com/en-us/azure/advisor/advisor-workbook-cost-optimization)
- [Reliability Workbook](https://learn.microsoft.com/en-us/azure/advisor/advisor-workbook-reliability)
- [Service Retirement Workbook](https://learn.microsoft.com/en-us/azure/advisor/advisor-workbook-service-retirement)

---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Deploy or manage Application Insights resources/Billing and cost management"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Support%20Topics/Deploy%20or%20manage%20Application%20Insights%20resources/Billing%20and%20cost%20management"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Insights Billing and Cost Management

## Scenario
Insights into billing charges against Application Insights resources.

## CSS Responsibilities
- Explain usage (why bill changed)
- Determine if SLA was violated
- Calculate service credit

## Decision Tree

### Explaining Usage
- Typically: "Why is my bill higher this month?"
- This is a usage explanation issue, not a billing team issue
- Follow: Identifying and controlling high ingestion in Application Insights guide

### Application Insights SLA
- SLA commits to **query access** to content within App Insights Component only
- Query access = "did the query request get handled" (even if failed due to permissions/syntax)
- SLA is NOT about data timeliness or lost data
- SLA violations are very rare
- Reference: [Service Level Agreements for Online Services](https://www.microsoft.com/licensing/docs/view/Service-Level-Agreements-SLA-for-Online-Services)

### Service Credit Calculation
- Credit requests must go to Billing Team (ASMS)
- CSS derives calculations ASMS needs
- Scenarios: Daily Cap not respected, excessive charges without Daily Cap, significant data loss

### Other Billing Questions
- Pricing tiers may vary (EA/CSP contracts, grandfathered tiers)
- Cost Management portal questions -> Billing team (ASMS)
- Higher billing after classic to workspace-based migration: See known issue #75855
- Understanding Cost Management data: [link](https://learn.microsoft.com/azure/cost-management-billing/costs/understand-cost-mgt-data)

## Key References
- [Troubleshoot High Data Ingestion](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/telemetry/troubleshoot-high-data-ingestion)
- [Azure Monitor cost and usage](https://docs.microsoft.com/azure/azure-monitor/usage-estimated-costs)
- [Azure Monitor pricing](https://azure.microsoft.com/pricing/details/monitor)

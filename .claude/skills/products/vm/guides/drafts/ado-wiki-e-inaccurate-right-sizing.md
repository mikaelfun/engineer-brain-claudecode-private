---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/TSGs/Inaccurate right sizing recommendation or consumption related issues in Advisor_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Advisor%2FTSGs%2FInaccurate%20right%20sizing%20recommendation%20or%20consumption%20related%20issues%20in%20Advisor_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Inaccurate Right-Sizing Recommendation or Consumption Related Issues in Advisor

## Summary

This guide clarifies common questions about Advisor right-size/shutdown and consumption-related recommendations.

## Commitments Filter

The commitments filter in Advisor has Term and Look-back Period (days) options. **The commitments filter only applies to savings plan and reserved instances recommendations. It does NOT apply to right-sizing recommendations.**

## Retail vs Discounted Pricing

Two kinds of pricing for right-sizing recommendations:

- **Retail price**: Retail cost of the resource
- **Discounted price**: Certain large customers get resources at a discounted price, less than retail

| View | Pricing | Currency |
|------|---------|----------|
| Overall recommendation view | Retail | USD |
| Drill-down view (per row) | Discounted | Customer currency |
| CSV/PDF export | Retail | USD |
| REST API | Retail (except RI = discounted) | USD |

PG team is working to align the two prices; currently by design.

## Why Do I See/Not See a Right-Sizing Recommendation

Right-sizing recommendations for VMs are provided when the current workload can be supported by a more suitable and cost-effective SKU based on retail pricing. For VMSS, recommendations appear if workload can be handled by a more affordable SKU or by reducing instance count.

**CloudFit** evaluates resource utilization and generates these recommendations:
- [CloudFit Documentation](https://eng.ms/docs/products/cloudfit/cloudfit)
- [CloudFit Tool](https://aka.ms/CloudFitTool) - Use to check if a right-sizing/shutdown recommendation exists for a customer VM
- [How-To: Check VM Utilization for Cost Recommendations](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/SME-Topics/Azure-Advisor/How-Tos/Check-VM-Utilization-for-Cost-Recommendations_Advisor)

## VM/VMSS Right-Sizing Configuration

Advisor analyzes recent usage patterns using rules to identify low-usage VMs. Default lookback period is **7 days**.

Configurable thresholds (at subscription level in Advisor Configuration blade):
- **CPU utilization threshold**: Advisor shows right-size/shutdown recommendation if VM utilization over the period is less than this threshold
- **Lookback period options**: 7, 14, 21, 30, 60, or 90 days

If customer has too many or too few right-sizing recommendations, check the configuration thresholds.

Reference: [Azure Advisor portal basics - Configure recommendations](https://learn.microsoft.com/en-us/azure/advisor/advisor-get-started#configure-recommendations)

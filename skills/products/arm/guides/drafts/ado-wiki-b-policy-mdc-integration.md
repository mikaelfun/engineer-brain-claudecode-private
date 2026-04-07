---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Policy RP integrations/Microsoft Defender for Cloud (formerly known as Azure Security Center (ASC))"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FPolicy%20RP%20integrations%2FMicrosoft%20Defender%20for%20Cloud%20%28formerly%20known%20as%20Azure%20Security%20Center%20%28ASC%29%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

There are three ways in which Microsoft Defender for Cloud interacts with Azure Policy:

## 1. By leveraging Azure Policy compliance results and initiatives

Microsoft Defender for Cloud leverages Azure Policy to present the information in the ASC UI. Calculation on the ASC UI might differ from the one in Azure Policy compliance. **This is expected**, and ASC should address any concerns about how they do their calculation.

When configured, Microsoft Defender for Cloud will also create one or more Microsoft Defender for Cloud initiative assignments in the customer Policy UI, in order to consume this information later. These assignments can be customized by the customer as needed.

Our support scope for this scenario does not change much, but any question related to the information presented in Security Center or how they consume that information from Policy, needs to be answered on the Microsoft Defender for Cloud side.

## 2. Some built-in policy definitions rely on the Microsoft.Security RP to evaluate other resources

Some policy definitions with category **"Security Center"** may not query the resources they say they do directly. These policies usually have an *AuditIfNotExists* effect, and target **type** `Microsoft.Security/assessments`.

Here is a sample of one of these, the policy name is **Azure DDoS Protection Standard should be enabled**:

```json
{
    "if": {
        "field": "type",
        "equals": "microsoft.network/virtualNetworks"
    },
    "then": {
        "effect": "[parameters('effect')]",
        "details": {
            "type": "Microsoft.Security/assessments",
            "name": "00000000-0000-0000-0000-000000000000",
            "existenceCondition": {
                "field": "Microsoft.Security/assessments/status.code",
                "in": [
                    "Healthy"
                ]
            }
        }
    }
}
```

This policy scans for **virtualNetworks** resources, but there is no condition to evaluate DDoS settings directly. Instead, the determination is made by going to the Microsoft.Security RP, to check if there is a resource of **type** `assessments` with a specific **name** where **status.code** is `Healthy`.

> ⚠️ **Key implication**: Compliance for "Security Center" category AuditIfNotExists policies is **entirely determined by what the Microsoft.Security RP returns**, not by directly evaluating the resource properties. Unexpected compliance results for these policies should be escalated to the Microsoft Defender for Cloud team.

## 3. MDC can create attestations for manual policies

MDC provides a UI for users to create attestations for manual effect policies. For this scenario:
- MDC is responsible for the UI and what the UI sends into the Policy API
- The Policy API itself is owned and supported by Azure Policy team

## Support scope summary

| Scenario | Owner |
|-|-|
| ASC/MDfC UI shows different compliance than Azure Policy | MDfC team (expected behavior) |
| "Security Center" category policy shows unexpected compliance | MDfC team (check Microsoft.Security/assessments) |
| MDfC initiative assignments in customer Policy UI | Shared (customer-configurable) |
| Policy API used by MDfC attestation UI | Azure Policy |

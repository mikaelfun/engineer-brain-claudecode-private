---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Microsoft Defender for Cloud Workflow Automation/[Product Knowledge] - Workflow automation"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FMicrosoft%20Defender%20for%20Cloud%20Workflow%20Automation%2F%5BProduct%20Knowledge%5D%20-%20Workflow%20automation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Workflow Automation

MDC Workflow Automation triggers Logic Apps on security alerts, recommendations, and regulatory compliance changes.

- [Official docs](https://learn.microsoft.com/en-us/azure/defender-for-cloud/workflow-automation)
- [Sample playbooks on GitHub](https://github.com/Azure/Microsoft-Defender-for-Cloud/tree/main/Workflow%20automation)

## Deploy at Scale (DINE Policies)

| Goal | Policy | Policy ID |
|------|--------|-----------|
| Alerts | Deploy Workflow Automation for MDC alerts | f1525828-9a90-4fcf-be48-268cdd02361e |
| Recommendations | Deploy Workflow Automation for MDC recommendations | 73d6ab6c-2475-4850-afd6-43795f3492ef |
| Regulatory compliance changes | Deploy Workflow Automation for MDC regulatory compliance | 509122b9-ddd9-47ba-a5f1-d0dac20be63c |

## Escalating Issues

- Use ASC with IcM template **91n1e3**
- Provide JSON dump of [Automations - List REST API](https://learn.microsoft.com/en-us/rest/api/defenderforcloud/automations/list?view=rest-defenderforcloud-2023-12-01-preview)

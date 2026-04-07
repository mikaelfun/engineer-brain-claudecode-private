---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/TSGs/Advisor support boundaries_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Advisor%2FTSGs%2FAdvisor%20support%20boundaries_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Advisor Support Boundaries and Case Routing

## Advisor Issues - Worked by IaaS VM Team

| Scenario | Supported By | SAP Queue |
|----------|-------------|-----------|
| Advisor not showing recommendations | IaaS VM team (+ collab if source service issue) | Azure/Advisor/... |
| Advisor score incorrect | IaaS VM team (+ ASMS collab for Cost, + Security for MDC) | Azure/Advisor/Advisor Score/... |
| Cannot dismiss/postpone recommendations | IaaS VM team | Azure/Advisor/... |
| Questions about recommendations | IaaS VM team (+ collab with owning service) | Azure/Advisor/... |
| Cannot access Advisor (Portal/REST/CLI) | IaaS VM team (+ Tools team for CLI/PS issues) | Azure/Advisor/... |
| Recommendations disappear/reappear | IaaS VM team (+ collab if source service) | Azure/Advisor/... |
| Advisor Workbooks | IaaS VM team | Azure/Advisor/... |
| Advisor API cases | IaaS VM team (+ ARM collab for general API) | Azure/Advisor/... |
| Advisor Assessments/Reviews | IaaS VM team (+ CSAM/CSA for contract setup) | Azure/Advisor/... |
| Advisor Alerts and Digest | IaaS VM team (+ Monitoring collab if needed) | Azure/Advisor/... or Azure/Alerts and Action Groups/... |
| Security data/Secure score missing | IaaS VM team (+ MDC collab) | Azure/Advisor/... or Azure/MDC/Recommendations platform management |
| Cost recommendations missing | IaaS VM team (+ ASMS/Billing collab) | Azure/Advisor/... or Azure/Billing/... |

## Not Advisor Issues - Route to Other Teams

1. **Cost recommendation values (RI, commitments)** → Collab with ASMS: Azure/Billing/Cost Management
2. **Security recommendation impact questions** → Collab with Security: Azure/MDC/Recommendations platform management
3. **Non-VM/Storage recommendation questions** → Collab with appropriate service team
4. **Script/API development help** → Not supported; contact CSAM for CSA engagement
5. **3rd party tool issues (Postman, Terraform)** → Not supported; contact software vendor
6. **General advisory questions (wrong SAP)** → Provide public docs; contact CSAM for CSA

## Escalation

Submit AVA request to [Azure Advisor SME Channel](https://teams.microsoft.com/l/channel/19%3ae676dc5eeb0f4bdb83999d5ec0317f00%40thread.tacv2/MGMT%2520-%2520Advisor%2520and%2520Advisor%2520Score%2520(AVA))

---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Boundaries/Azure Bot Framework SDK and Composer"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Support%20Boundaries/Azure%20Bot%20Framework%20SDK%20and%20Composer"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Support Boundary: Azure Bot Framework SDK/Composer + App Insights

## Overview
Microsoft Bot Framework and Azure AI Bot Service provide libraries for building intelligent bots. Bot Framework Composer is an open-source IDE. Both LUIS and QnA Maker are built on Bot Framework (both being deprecated in favor of Azure AI Language).

## Integrations (All Owned by Bot Services PG)
1. **Bot Service telemetry**: https://learn.microsoft.com/azure/bot-service/bot-builder-telemetry
2. **QnA Maker telemetry**: https://learn.microsoft.com/azure/bot-service/bot-builder-telemetry-qnamaker
3. **Composer telemetry**: https://learn.microsoft.com/composer/how-to-capture-telemetry
4. **QnA Maker auto-instrumentation** (during resource creation): Owned by Cognitive Services PG

## Key Point
- How the integration collects telemetry and how it can be configured = Bot Service team
- Server-side App Insights aspects (ingestion, blades) = Azure Monitoring can assist
- Follow [Guidelines for App Insights case management](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1393084/Support-Boundaries-(new))

## SAP Routing
- Bot Framework Composer: `Azure/Bot Service/I need help on Bot Framework Composer/My issue is not listed`
- Bot Framework SDK: `Azure/Bot Service/I need help on Bot Framework SDK/Configure application insights for Bot SDK code`
- QnA Maker: `Azure/Cognitive Services-QnA Maker/QnA components/App Insights`

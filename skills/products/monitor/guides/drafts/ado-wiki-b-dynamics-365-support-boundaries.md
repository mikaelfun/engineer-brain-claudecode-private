---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Boundaries/Dynamics 365 (BC, CE, FO, Commerce, PowerApps, PowerPlatform)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Boundaries%2FDynamics%20365%20%28BC%2C%20CE%2C%20FO%2C%20Commerce%2C%20PowerApps%2C%20PowerPlatform%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Dynamics 365 + Application Insights Support Boundaries

## Overview
Microsoft Dynamics 365 is a comprehensive portfolio of intelligent business applications (BC, CE, FO, Commerce, PowerApps, PowerPlatform).

## Key Support Boundary
These integration scenarios are **NOT supported by Azure Monitor or the Application Insights Product team**. Issues should as general rule be owned by the appropriate Dynamics team and sub-cased to Azure Monitor.

## Azure Monitor CSS Responsibilities
- Vetting backend ingestion service is performing as expected
- Address questions specific to Application Insights experiences (Performance, Failures, Application Map, Transaction Search, Live Metrics, etc.)
- Provide guidance on endpoints needing whitelisting for telemetry ingestion
- Assist with creating/modifying Application Insights resources (ARM operations)

## Escalation Flow
1. **Initial Troubleshooting**: Dynamics customer works with Dynamics support
2. **Collaboration**: Dynamics customer opens an **Azure Support Case** under their AI resource (with diagnostic log access granted)
3. **Full Investigation**: Azure Monitor team uses full tooling
4. **Escalation to PG**: Azure Monitor CSS files the CRI (Dynamics engineers should NOT escalate directly)

> **Note**: Collaboration tasks on Dynamics cases do not grant Azure Monitor engineers access to the customer's Azure subscription.

## Dynamics 365 Customer Engagement (CE)
- Internal wiki: https://supportability.visualstudio.com/DynamicsCE/_wiki/wikis/DynamicsCE/538900/Analyze-telemetry-with-Application-Insights
- SAP: Dynamics / Power Platform Administration / Analytics and activity logging / Monitoring performance and diagnostics using Application Insights
- SME: Ricardo Gimenez (ricds)

### Power Pages
Power Pages uses client-side JS SDK telemetry. Be aware: AMPLS-bound AI resources with public access disabled will NOT see telemetry from Power Pages on public networks.

## Dynamics 365 Business Central (BC)
- Internal wiki: https://supportability.visualstudio.com/DynamicsBC/_wiki/wikis/DynamicsBC/664705/Welcome
- Extensive public docs on telemetry: https://learn.microsoft.com/dynamics365/business-central/dev-itpro/administration/telemetry-overview

## Dynamics 365 Commerce
- Public docs: https://learn.microsoft.com/dynamics365/commerce/dev-itpro/commerce-application-insights

## Dynamics 365 Finance and Operations (FO)
- Internal wiki: https://supportability.visualstudio.com/DynamicsFO/_wiki/wikis/Dynamics%20FO/447536/Welcome
- Public docs: https://learn.microsoft.com/dynamics365/fin-ops-core/dev-itpro/sysadmin/monitoring-and-telemetry-appinsights

## Dynamics 365 Supply Chain Management
- Public docs: https://learn.microsoft.com/dynamics365/supply-chain/warehousing/application-insights-warehousing

## Data Collection for Engagement
- Precise ask to the team
- Documentation reference being followed
- Application Insights resource URI / instrumentation key
- For CE: Dynamics CRM app ID

## Contacts
- Dynamics 365 Global Escalation Engineers: gbl365ee@microsoft.com

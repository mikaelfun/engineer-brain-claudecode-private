---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/SAP/SAP agentless/[Product knowledge] - SAP agentless"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Data%20Ingestion%20-%20Connectors/Third%20Party%20Connectors/SAP/SAP%20agentless/%5BProduct%20knowledge%5D%20-%20SAP%20agentless"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [Product knowledge] - SAP agentless

This page was created from a session with PG that was recorded. It is available in [CSS Training - Microsoft Sentinel agentless data connector for SAP - How it works | QA Platform](https://platform.qa.com/resource/css-training-microsoft-sentinel-agentless-data-connector-for-sap-how-it-works-1854/?context_id=12963&context_resource=lp).

## How it works

The previous solution is docker based. It's complicated and introduces complexity. The agentless version is trying to simplify the entire process.

To do this we are using the SAP Integration Suite (Infrastructure/Platform as a Service from SAP). Integration Suite is what is used to configure the SAP agent.

Each customer will have its own instance of SAP BTP (SAP Business Technology Platform, think of it like an Azure environment/subscription) in which they import the package (a .zip file).

The solution is a hybrid with codeless connectors features (in which we call some HTTP endpoint) and push connector features (like using Data Collection Rules to push data in Log Analytics tables).

In Sentinel we have the connector UI to configure the ingestion components (Data Collection Endpoints, Rules and Tables) and then a second part to setup the SAP Environment.

Inside the package there are 2 artifacts also known as Integration Flows (in SAP, equivalent to Logic Apps or Power Automate flows):

1. **Data collector**: heart of the data collector flow
2. **Prerequisites checker**: designed to enable the SAP team to fix whatever is needed before focusing on the Sentinel side looking for issues.

### Key Architecture Points

- Integration Flows have an HTTP endpoint. Sentinel calls this endpoint to trigger data collection (the codeless connector part in Sentinel is responsible for pulling this HTTP endpoint - it's a Sentinel design choice).
- Usually data is collected (pulling these endpoints) every minute to avoid having too much data and hitting timeouts during the workflow execution (both on Sentinel and SAP).
- Keep in mind there can be multiple SAP systems with multiple poolers.
- CSS is not expected to get involved too much into the SAP Integration Suite components. The important thing is to know the role of the Prerequisites checker and the TSG wiki.

### Monitoring & Troubleshooting

- **Monitor logs**: SAP Integration Suite > Monitor > Integrations and APIs > Monitor Message Processing
- **Failed flows**: Click on failed message to see error details
- **Trace logging**: Set Log Verbosity to trace to drill down on the different actions the flow took
- **Customization**: Configuration values can be customized per [Download the configuration file and customize settings](https://learn.microsoft.com/en-us/azure/sentinel/sap/deploy-data-connector-agent-container?tabs=managed-identity&pivots=connection-agentless#download-the-configuration-file-and-customize-settings)

## Deployment

Make sure all the [deployment steps](https://learn.microsoft.com/en-us/azure/sentinel/sap/deployment-overview?tabs=agentless#deployment-flow-and-personas) were followed correctly and fully reviewed (especially the prerequisites from both Sentinel and SAP side):

1. [Review the prerequisites for deploying the SAP agentless data connector](https://learn.microsoft.com/en-us/azure/sentinel/sap/prerequisites-for-deploying-sap-continuous-threat-monitoring).
2. [Deploy the SAP applications solution from the content hub](https://learn.microsoft.com/en-us/azure/sentinel/sap/deploy-sap-security-content). This step is handled by the security team on the Azure portal.
3. [Configure your SAP system for the Microsoft Sentinel solution](https://learn.microsoft.com/en-us/azure/sentinel/sap/preparing-sap), including configuring SAP authorizations, configuring SAP auditing, and more. These steps should be done by the SAP BASIS team.
4. [Connect your SAP system](https://learn.microsoft.com/en-us/azure/sentinel/sap/deploy-data-connector-agent-container) using an agentless data connector with the SAP Cloud Connector. This step is handled by the security team on the Azure portal, using information provided by the SAP BASIS team.
5. [Enable SAP detections and threat protection](https://learn.microsoft.com/en-us/azure/sentinel/sap/deployment-solution-configuration). This step is handled by the security team on the Azure portal.

## Notes

Whenever possible ask the customer to use or migrate to the agentless version of the SAP connector.
The old solution relies on a deprecated Log Analytics API endpoint that is going to retire in 2026 (do not share this with the customer unless publicly announced/documented).

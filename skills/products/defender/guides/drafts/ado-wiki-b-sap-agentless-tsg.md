---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/SAP/SAP agentless/[TSG] - SAP Agentless"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FThird%20Party%20Connectors%2FSAP%2FSAP%20agentless%2F%5BTSG%5D%20-%20SAP%20Agentless"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] SAP Agentless Connector Troubleshooting Guide

## Intro
Most of the troubleshooting is done in the SAP Integration Suite. The message log will display errors indicating the nature of the issue encountered.

First, examine the message processing logs (see SAP docs: [Monitor Message Processing](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/monitor-message-processing-monitor)).

Message processing logs will show you error messages that can diagnose issues with missing permissions, connectivity errors and other misconfigurations.

If you do not see your error, you can do more in depth troubleshooting by turning on trace logging (see SAP docs: [Setting Log Levels](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/setting-log-levels)).

## First step

Follow the article [Troubleshooting your Microsoft Sentinel solution for SAP applications deployment](https://learn.microsoft.com/en-us/azure/sentinel/sap/sap-deploy-troubleshoot?pivots=connection-agentless).

## Pre-requisites checker
A pre-requisite checker has been added to the package to help SAP admins diagnose and fix issues related to the SAP environment configuration:
1. Select the `Prerequisite checker` iflow. Click on `configure` and set the target RFC destination to check. Deploy the iflow.
2. Trigger the iflow using your preferred approach (e.g. PowerShell script against CPI endpoint).
3. Successful run results in the message `Pre-requisite check passed successfully`.
4. Ensure the pre-req checker runs successfully before connecting to Sentinel.

## Before raising an ICM

1. If the question is related to setup and configuration, ensure the customer watches the [Setup tutorial](https://www.youtube.com/watch?v=PbO1S1E29Yk). Ensure the customer has read the SAP pre-requisites sections.
2. Upload the screenshot of the error shown in the SAP message processing logs and attach to the ICM.
3. **Agentless ICM should be routed to _Connectors Acceleration / Triage_**

## General Troubleshooting

Troubleshooting for the SAP agentless connector is done primarily within the SAP integration suite. There is very limited error information provided by the codeless connector itself beyond common error messages relating to authentication and HTTP status codes.

### Examine the message processing logs
1. In Integration Suite, navigate to Monitor > Integrations and APIs.
2. Click on Manage Integration Content > All.
3. Find the Data collector inflow and select Monitor Message processing.
4. Filter on failed messages and click on the failed run to view the error details.
5. For advanced troubleshooting, turn on trace logging (temporarily activated).
6. Under monitor message processing, click on the Trace link to view detailed runtime logs.
7. You will see the initialized runtime configuration, parameters and data in the message payload.

### Deployment and setup issues

#### Pre-requisite checker
Ensure customer SAP admins run the [pre-requisite tool](https://learn.microsoft.com/en-us/azure/sentinel/sap/sap-deploy-troubleshoot?pivots=connection-agentless#check-for-prerequisites) to validate setup before connecting.

#### Troubleshooting FAQs
Most common errors documented at: https://learn.microsoft.com/en-us/azure/sentinel/sap/sap-deploy-troubleshoot?pivots=connection-agentless

#### Setup tutorial
[Onboard SAP to Microsoft Sentinel Solution for SAP with Agentless Connector](https://www.youtube.com/watch?v=PbO1S1E29Yk)

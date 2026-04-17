---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Copilot/Copilot Pay As You Go"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FCopilot%2FCopilot%20Pay%20As%20You%20Go"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Overview

We are releasing a new method for customers to pay for Copilot agents based on usage. This new "Copilot Pay-As-You-Go" feature will allow Administrators to link to an existing Azure subscription and Azure Resource Group to facilitate usage-based billing. In addition, Administrators will be able to do a cost analysis based on Pay-As-You-Go usage from the Cost Management blade in the M365 Admin Center (MAC).

The new feature will be accessed using the Copilot pay-as-you-go billing option under the Settings tab on the Copilot Control System page in the MAC.

## Configure Copilot Pay-As-You-Go

On the new "Set up billing and turn on **Copilot Chat**" blade, administrators will be able to choose an Azure Subscription, Resource Group and Region where the service metadata is stored.

**Note: All Azure Subscriptions and Resource Groups must be configured from the Entra/Azure Admin Centers prior to adding them for use in this blade.**

**Note: The administrator must be assigned the "Owner" or "Contributor" role for the subscription and resource group. If there is no subscription in the tenant, or the administrator is not an owner of the resource group or subscription an error will be displayed.**

## Changing Subscriptions

The subscription and resource group **cannot** be updated after they have been configured and Pay-As-You-Go is active. To change the subscription or resource group, Copilot Pay-As-You-Go must be turned off and the wizard will need to be run again to choose the new subscription or resource group.

## Turn off Copilot Pay-As-You-Go

To turn off Copilot pay-as-you-go billing the administrator can select the "Turn off pay-as-you-go billing" option on the same configuration blade. After clicking the button, the administrator will be asked to confirm the selection and informed that users will lose access to their agents once this request is completed.

## Cost Management

Administrators can access a breakout of the costs of Copilot Pay-As-You-Go from the Cost Management blade. This blade can be accessed from the "Manage Costs" option under Copilot Pay-As-You-Go on the Copilot blade, or it can be accessed directly under Billing in the M365 Admin Center.

Note: The Cost Management blade may not appear in your test tenant. A billed product must be in place for this page to appear.

**Note: The Cost Management blade is owned by M365 Commerce. M365 Identity can assist with issues with the Manage Costs option not directing Administrators to the Cost Management blade, but issues with the blade loading or inaccuracies on the Cost Management blade will need to be directed to the Commerce team.**

## Boundaries and SAPs

### Azure Subscription Management
For issues involving creation or management of Azure / Entra subscriptions, please collaborate with the Azure Subscription Management team.
- SAP: Azure/Subscription management/Purchase, sign up or upgrade issues/Unable to sign-up for subscription
- SAP: Azure/Subscription management/Create or list Azure subscriptions via REST API

### Azure Resource Management
For issues related to creation or management of Resource Groups, please collaborate with the Azure Resource Management team.
- SAP: Azure/Azure Resource Manager (ARM)/Resource Management/Resource Group management

### Cost Management Page
Issues with the Cost Management page are handled by the Commerce team.
- SAP: Microsoft 365/Subscription and Billing for Business/Purchase, Sign-up, MAC Portal errors

## Escalation Paths

For issues with the Copilot Pay-As-You-Go blade such as:
- Region failing to update
- Set up billing and turn on **Copilot Chat** failing to load
- Subscription or Resource Groups not available for selection in the GUI (**only escalate after Azure Subscription Management or Azure Resource Management teams confirm they are active, valid and that the Administrator has the correct ownership rights**)

Use the [ICM Submission Process](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/589927) and select the following ASC escalation template:
**[ID] [M365] [MAC]** - Copilot in M365 Admin Center (General)

**Issues involving escalations for Subscriptions, and Resource Groups will need to be filed by the Azure Subscription Management and Azure Resource Management teams respectively.**

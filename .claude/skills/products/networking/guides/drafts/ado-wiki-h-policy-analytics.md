---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Features & Functions/Policy Analytics"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Firewall%2FFeatures%20%26%20Functions%2FPolicy%20Analytics"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview
Policy Analytics provides insights, centralized visibility, and control to Azure Firewall. IT teams today are challenged to keep Firewall rules up to date, manage existing rules, and remove unused rules. Any accidental rule updates can lead to a significant downtime for IT teams.

For large, geographically dispersed organizations, manually managing Firewall rules and policies is a complex and sometimes error-prone process. The new Policy Analytics feature is the answer to this common challenge faced by IT teams.

You can now refine and update Firewall rules and policies with confidence in just a few steps in the Azure portal. You have granular control to define your own custom rules for an enhanced security and compliance posture. You can automate rule and policy management to reduce the risks associated with a manual process.

# Prerequisites
Policy Analytics has a number of prerequisites that must be met prior to configuring: 

- An Azure Firewall Standard or Premium  
- An Azure Firewall Standard or Premium policy attached to the Firewall
- Structured firewall logs must be configured on the Azure Firewall

# Key Policy Analytics Features
 - Policy insight panel: Aggregates insights and highlights relevant policy information.
 - Rule analytics: Analyzes existing DNAT, Network, and Application rules to identify rules with low utilization or rules with low usage in a specific time window.
 - Traffic flow analysis: Maps traffic flow to rules by identifying top traffic flows and enabling an integrated experience.
 - Single Rule analysis: Analyzes a single rule to learn what traffic hits that rule to refine the access it provides and improve the overall security posture.

# Troubleshooting
It is anticipated that the configuration and setup will be the biggest driver of support volume. 

## How to setup and configure
Policy analytics starts monitoring the flows in the DNAT, Network, and Application rule analysis only after you enable the feature. It can't analyze rules hit before the feature is enabled.

1. Select Policy analytics in the table of contents.
1. Next, select Configure Workspaces.
1. In the pane that opens, select the Enable Policy Analytics checkbox.
1. Next, choose a log analytics workspace. The log analytics workspace should be the same as the Firewall attached to the policy.
1. Select Save after you choose the log analytics workspace.

Enable Structured firewall logs

https://learn.microsoft.com/en-us/azure/firewall/firewall-structured-logs#enable-structured-logs

## How to check if logs are configured properly

The customer can run the following query to test if the logs are configured correctly. NOTE: Logs may take up to 60 minutes to appear after initial setup due to the logs being aggregated every hour.
```
AZFWNetworkRuleAggregation
| union AZFWApplicationRuleAggregation, AZFWNatRuleAggregation
```
Currently there is no way to export this data directly from Policy Analytics. The query above can be ran from the Azure Firewall and exported to Excel/csv

## TIP
Policy Analytics has a dependency on both Log Analytics and Azure Firewall resource specific logging. Verify the Firewall is configured appropriately or follow the previous instructions. Be aware that logs take 60 minutes to appear after enabling them for the first time. This is because logs are aggregated in the backend every hour. You can check logs are configured appropriately by running a log analytics query on the resource specific tables such as AZFWNetworkRuleAggregation, AZFWApplicationRuleAggregation, and AZFWNatRuleAggregation by following the methods found here: [TSG - Customer Facing Logs](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/496970/TSG-Customer-Facing-Azure-Firewall-Logs?anchor=new-structured-logs-from-asc)


## Common misconfiguration scenarios
1. Following the incorrect log analytics scenario  
    - The steps for initial configuration differ if the customer is using an existing or new log analytics workspace. Confirm what scenario the customer actually needs to use and validate the steps taken. Refer to the public documentation below for the proper workflow. 
1. Incorrect logs selected in diagnostic settings
    - Resource Specific Tables (RST) are required for policy analytics. If the classic AzureDiagnostic tables are selected, policy analytics will not work. Diagnostic settings can be validated [via Kusto](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/297858/Log-Sources-for-Network-Watcher?anchor=registrationtelemetry-(kusto-only%2C-sg-restricted)). Note that the cluster requires a separate SG to join, check [here for permissions](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/401004/Kusto-Clusters-and-Requirements). 



# Public Documentation
- [Policy Analytics](https://learn.microsoft.com/en-us/azure/firewall/policy-analytics)
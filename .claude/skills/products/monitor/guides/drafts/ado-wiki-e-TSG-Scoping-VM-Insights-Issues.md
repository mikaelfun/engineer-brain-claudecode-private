---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/VM Insights/Troubleshooting Guides/TSG Scoping VM Insights Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FVM%20Insights%2FTroubleshooting%20Guides%2FTSG%20Scoping%20VM%20Insights%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG Scoping VM Insights Issues

## Overview
Performing proper scoping of issues is paramount to following the correct guidance for troubleshooting. This guide helps narrow down the scope of VM Insights issues and follow the right troubleshooting guide.

## Issue Classification

VM Insights issues can be classified into the following groups:

### Missing Data
Missing some or all data coming into Log Analytics from VM Insights (Performance or Map experience).

**Applicable SAPs:**
- Azure\VM insights\I am having trouble enabling VM insights\The performance view is blank or shows partial data
- Azure\VM insights\I am having trouble enabling VM insights\The map view is blank or shows partial data

### VM Insights Configuration
Issues with the configuration of the agent preventing data from being sent (misconfiguration, onboarding issues).

**Applicable SAPs:**
- Azure\Container insights\I can't see or my data is missing
- Azure\Container insights\Issue enabling container insights

### Agent Management
Issues in managing the agent such as disabling or enabling VM Insights.

**Applicable SAPs:**
- Azure\VM insights\I am having trouble enabling VM insights
- Azure\VM insights\Issue configuring VM insights using Azure Monitor Agent(AMA)

### Data Collection
Issues/questions about the data collected or interpreting the data.

**Applicable SAPs:**
- Azure\VM insights\I can't interpret the data, or the data isn't shown

## Scoping Process

1. **Validate problem statement** - Paraphrase the customer description, validate with customer
2. **Classify the issue** - Match to one of the key issue categories above, adjust SAP accordingly
3. **Check known issues** - Review the [Known Issues and Errors](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/909828/Known-Issues-and-Errors) page
4. **Follow TSGs** - If not a known issue, see [VM Insights TSGs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/610946/Troubleshooting-Guides). Note: issue may span multiple categories.

## Example Symptoms vs Issue Classification

| Symptom | Issue Classification |
|---|---|
| Missing Data Some/All VM Insights Tables | Missing Data |
| VM Insights Deployment Error | Agent Management |
| Questions About Data Collected | Data Collection |

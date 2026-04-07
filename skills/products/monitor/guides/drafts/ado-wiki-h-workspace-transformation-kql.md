---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check if a KQL transform exists in a DCR"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Check%20if%20a%20KQL%20transform%20exists%20in%20a%20DCR"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AMA: How To Check if a KQL Transform Exists in a DCR

Applies To: Azure Monitor - Data Collection Rules

## Description

This guide demonstrates how to identify KQL transforms for a given scenario.

## Scenario: Text Log

### Step 1: Identify the DCR

For a list of associated DCRs, see: [AMA: HT: List Associated DCRs and DCEs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs)

### Step 2: Locate the Data Source

Identify the DCR that contains a Data Source with the file or filter pattern of interest and its corresponding stream name.

### Step 3: Identify the Data Flow

Locate the Data Flow for the stream name of interest:

- **With transform**: The `transformKql` property will contain a KQL expression (not just "source")
- **Without transform**: The `transformKql` property will be "source" or absent entirely

The `transformKql` value determines how data is transformed before it reaches the destination table. The default "source" means no transformation is applied.

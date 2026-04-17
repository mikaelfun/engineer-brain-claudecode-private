---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Classification and sensitivity labels/Missing or incorrectly labeled assets/What are labels"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FClassification%20and%20sensitivity%20labels%2FMissing%20or%20incorrectly%20labeled%20assets%2FWhat%20are%20labels"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Purview can utilize the M365 Sensitivity Labels to automatically apply sensitivity labels. We recommend Microsoft Purview for labeling SQL databases, as it uses global MIP labels created in M365 Compliance Center that can be applied across multiple platforms. you can check the documentation here - [Automatically apply sensitivity labels to your data - Microsoft Purview | Microsoft Docs](https://docs.microsoft.com/en-us/azure/purview/create-sensitivity-label#labeling-for-sql-database-columns) .

![Applying labels to assets in Purview flow. Create labels, register asset, scan asset, classifications found, labels applied.](https://docs.microsoft.com/en-us/azure/purview/media/create-sensitivity-label/apply-label-flow.png)

What is difference between classification and labelling?

**Classification** = Over 200 built-in or use regex to create custom classifications for sensitive information types (e.g. PCI, SSN) found in the data

**Labeling** = the label taxonomy defined by an organization (e.g. Public, General, Confidential) within the M365 Security and Compliance Center and associated with specific classifications.  At asset & column level for some assets.  Only a single label can be assigned to an asset.  The top label security level is defined by Order column in the PB Security & Compliance configuration.

[Supported Data Sources & Limitations GUIDE](https://docs.microsoft.com/en-us/azure/purview/create-sensitivity-label#supported-data-sources)

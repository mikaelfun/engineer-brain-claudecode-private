---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/How To/How to check if ARS are enabled for an account"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Scanning/How%20To/How%20to%20check%20if%20ARS%20are%20enabled%20for%20an%20account"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to check if ARS (Advanced Resource Sets) are enabled for an account

Author: Monika Lezanska

## Kusto Query

Use the below query on `babylon.eastus2.kusto.windows.net` / `babylonMdsLogs`:

```kql
PipelineManagerLogEvent  
| where CatalogId == "<catalog-id>"
| where Message contains "ARS Setting"
| project TIMESTAMP, Message  
| order by TIMESTAMP desc
```

## Interpretation
In the Message column, it will either say:
- **"ARS Setting Default"** → ARS is **disabled**
- **"ARS Setting Advanced"** → ARS is **enabled**

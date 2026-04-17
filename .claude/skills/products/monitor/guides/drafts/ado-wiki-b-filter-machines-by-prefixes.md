---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Useful KQL Queries/Customer-facing queries (Log Analytics)/Filter Machines by list of prefixes"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FUseful%20KQL%20Queries%2FCustomer-facing%20queries%20(Log%20Analytics)%2FFilter%20Machines%20by%20list%20of%20prefixes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Filter Machines by List of Name Prefixes

The use-case of this query is when you have a number of machines that follow a common naming convention. This query is useful because new machines that are created later that also follow the naming convention will be detected. Therefore, database servers or other purpose-named machines can be easily identified and filtered on _without giving a list of full machine names_ in the query.

## Steps:
1. Create a dynamic variable with the array of prefixes to filter on
2. Extract all the prefixes of the desired length into a new column (example uses first 4 letters)
3. Set the "i" variable for number of characters that your prefixes contain (all prefixes must be same length)
4. Use a where filter to find machines with their prefix value in prefixes list

```kql
let timeago = ago(3d);
let i = "{4}";
let i_letter_prefixes = dynamic(["wins", "demo"]);
Heartbeat
| where TimeGenerated > timeago
| extend prefix = extract(strcat("[a-z]", i) , 0, tolower(Computer))
| where prefix in(i_letter_prefixes)
| summarize Last_Heartbeat = arg_max(TimeGenerated, prefix) by Computer
| sort by Computer
```

Reference: https://learn.microsoft.com/azure/data-explorer/kusto/query/extractfunction

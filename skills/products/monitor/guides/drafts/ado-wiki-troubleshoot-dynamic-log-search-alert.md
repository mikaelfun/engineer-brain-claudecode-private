---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshoot Dynamic log search alert"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Alerts/Troubleshooting%20Guides/Troubleshoot%20Dynamic%20log%20search%20alert"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshoot Dynamic Log Search Alert

This troubleshooting guide helps investigate dynamic threshold log search alert tickets.

## Prerequisites

- Install Kusto Explorer and add connection for **azalertsprodweu** cluster: `https://azalertsprodweu.westeurope.kusto.windows.net`
- Database: **BaselineService** (for baseline history) and **LogSearchRule** (for TSID lookup)

## Review Alert Rule Properties from ASC

- Note **Aggregation Granularity** (Window Size) and **Sensitivity** from alert rule configuration (check payload)
- Check if the alert rule uses **Dimensions**

## Troubleshoot Alert Rule Without Dimensions

If Dimensions = N/A:

1. Navigate to **Execution History** in ASC, filter by timeframe of reported issue
2. Open relevant **Evaluation Log**
3. Locate first log line starting with `Getting predictions from` — this contains the **Time Series ID (TSID)**
4. Copy the TSID (format: `/subscriptions/<sub-id>/resourcegroups/<rg>/providers/microsoft.insights/scheduledqueryrules/<alert-rule>_<hashed-config>`)
5. Generate Baseline History Chart using BaselineService database:

```kusto
let StartDate = datetime(2025-11-24 06:30:50.777);
let EndDate = datetime(2025-11-24 13:00:50.777);
cluster("azalertsprodweu").database("BaselineService").ShowHistoricalBaselineByTsid("TSIDGOESHERE", SENSITIVITYGOESHERE, StartDate, EndDate, tsidBin=totimespan(""))
```

- Replace sensitivity: **High = 0, Medium = 1.5, Low = 3**
- Update tsidBin with aggregation granularity from alert rule
- Output: Chart showing high threshold (blue), low threshold (red), and metrics

## Troubleshoot Alert Rule With Dimensions

TSID format: `ResourceId_GUID_HashedDimensionCombination_GUID`

### Step 1: Get TSID Prefix

Run in **LogSearchRule** database on azalertsprodweu cluster:

```kusto
let StartDate = datetime(2025-11-24 00:30:50.777);
let EndDate = datetime(2025-11-24 07:00:50.777);
lsa_requests
| where timestamp between (StartDate .. EndDate)
| where name == "dt-training-processor"
| where customDimensions["TimeSeriesId"] startswith ""  // Paste Alert rule resource Id
| take 1
| project tsidPrefix = customDimensions["TimeSeriesId"]
```

### Step 2: Generate Hashed Dimension Combination GUID

Run in **Customer's Log Analytics workspace** from ASC. Add `summarize by` all dimensions to the original alert query, then:

```kusto
// After original query with summarize by dimensions:
| summarize by Computer, CounterName  // adjust to actual dimensions
| serialize
| extend JsonObject = pack_all()
| extend Id = row_number(1)
| mv-apply kvp = bag_keys(JsonObject) on (extend Key = tostring(kvp) | extend Value = tostring(JsonObject[Key]))
| project Id, Key, Value
| order by Id, Key asc
| summarize SortedPairs = make_list(strcat(Key, "=", Value)) by Id
| extend SortedString = strcat_array(SortedPairs, ",")
| project Id, DimCombination=SortedString, HashedDimensionCombination=hash_sha256(SortedString)
```

### Step 3: Combine TSID

Final TSID: `{Step1_GUID}_{Step2_GUID}`

### Step 4: Generate Baseline History Chart

Same query as non-dimension case, using the full combined TSID.

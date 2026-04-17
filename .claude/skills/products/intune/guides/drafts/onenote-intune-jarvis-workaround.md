# Intune Jarvis/Geneva Query Workaround

> Source: OneNote - Mooncake POD Support Notebook / Intune / Kusto Query / Jarvis query

## Overview

When you have no access to the Intune Kusto cluster (e.g., during a critical situation or access provisioning delay), you can use Geneva/Jarvis as a workaround to query Intune raw telemetry data.

## Key Information

- Intune microservices use the Geneva agent to collect all raw data
- Each site has one namespace named as `IntuneCN*` (for China/Mooncake)
- Jarvis query speed is slower than Kusto — use precise filters (time range, account ID, device ID)
- Geneva raw data tables are not as well-formatted as Kusto tables and may have slight differences

## Steps

1. Open Jarvis and navigate to the appropriate namespace (e.g., `IntuneCN*`)
2. Select the raw data table you need
3. Filter by Account ID or Device ID to narrow results
4. Use KQL query syntax to filter and format the raw event data

## Limitations

- Slower than direct Kusto access
- Raw data format may differ from optimized Kusto tables
- Best used for urgent/critical situations only
- For routine troubleshooting, apply for Kusto access via `Intunekusto-CSS` entitlement

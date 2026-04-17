---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Support Operations - Collect Traces"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FSupport%20Operations%20-%20Collect%20Traces"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Support Operations — Collect Traces (HPC Cache)

> **Requires:** SAW machine + AME account

Access Geneva Actions: https://aka.ms/GenevaActions

The **Collect Traces** function collects trace information from an HPC Cache using a Geneva Action operation.

---

## ACCESS

Collect Traces is a **read/write action** — a valid Access Token for the specified Endpoint is required.

---

## REQUIRED PARAMETERS

**Environment Parameter**
- `Environment`: Cloud environment used to create the cache

**HPC Cache Parameters**
- `Endpoint`: Endpoint server corresponding to the Region where the cache was created
- `Subscription Id`: Subscription ID used to create the cache
- `Resource Group Name`: Resource group where the cache was created
- `Cache Name`: Name of the target cache

**Operation Parameters**
- `Initial Time`: Base time to collect traces from (accepts several formats)
- `Duration Before`: How many minutes before the base time to collect
- `Duration After`: How many minutes after the base time to collect

> **NOTE:** If the Duration After would put the end collection time in the future, it will only collect data until the current time.

---

## OUTPUT

Output will be **"Accepted."**

Once completed, the trace automatically uploads to Avere servers and can be viewed in the debug environment. If the trace is not visible after the duration has passed, run `get_data.py` in the debug environment to update with latest information.

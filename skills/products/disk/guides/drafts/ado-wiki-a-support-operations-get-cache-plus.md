---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Support Operations - Get Cache PLus"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FSupport%20Operations%20-%20Get%20Cache%20PLus"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Support Operations — Get Cache Plus (HPC Cache)

> **Requires:** SAW machine + AME account (ame.gbl credential)

Access Geneva Actions: https://aka.ms/GenevaActions

The **Get Cache Plus** operation retrieves initial diagnostic information from the HPC Cache using a Geneva Action. Returns: resource ID, Prod name (needed for debug environment access), contact information, current state, current and past conditions, and more.

---

## ACCESS

Get Cache Plus is a **read-only action** — endpoint access token is NOT required. Logging in with an `ame.gbl` credential is sufficient.

---

## REQUIRED PARAMETERS

**Environment Parameter**
- `Environment`: Cloud environment used to create the cache

**HPC Cache Parameters**
- `Endpoint`: Endpoint server corresponding to the Region where the cache was created
- `Subscription Id`: Subscription ID used to create the cache
- `Resource Group Name`: Resource group where the cache was created
- `Cache Name`: Name of the target cache

---

## OUTPUT FIELDS (Key Fields)

```json
{
  "APICache": {
    "sku": { "name": "Standard_2G" },
    "properties": {
      "cacheSizeGB": 3072,
      "health": {
        "state": "Degraded",
        "statusDescription": "...",
        "conditions": [...]
      },
      "mountAddresses": ["10.18.0.7", "10.18.0.8", "10.18.0.9"],
      "provisioningState": "Succeeded",
      "upgradeStatus": {
        "currentFirmwareVersion": "8.0.2",
        "firmwareUpdateStatus": "unavailable"
      }
    }
  },
  "CacheBaseName": "prod-644c38b7-...",
  "GsiPath": "...",
  "CurrentState": "Degraded",
  "GoalState": "Running",
  "ActiveImage": "8.0.2",
  "NumberOfNodes": 3,
  "NodeStates": ["Running", "Running", "Running"],
  "ClusterIPs": ["10.18.0.10", "10.18.0.11", "10.18.0.12"],
  "NumberOfCriticalConditions": 0,
  "Alerts": [],
  "ClearedAlerts": [...]
}
```

**Key fields to check:**
- `CurrentState` / `GoalState` — should both be "Running"
- `health.conditions` — active conditions with timestamps and messages
- `CacheBaseName` — needed for debug environment access
- `ActiveImage` / `AltImage` — firmware versions
- `NodeStates` — individual node health
- `ClusterIPs` — client-facing mount addresses

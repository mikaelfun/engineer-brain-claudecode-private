---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## Common TSG/Device Configuration Policy.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Device Configuration Policy Troubleshooting

**Public Docs**: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/troubleshoot-policies-in-microsoft-intune

## Error Codes
- **Windows**: SyncML return code; 0x8xxxxxxx -> query https://windowsinternalservices.azurewebsites.net/Static/Errors/
- **iOS**: platform-specific error codes

## General Steps

### Step 1: Get Policy Applied Result
Use Intune device ID and EventId 5786 as filter in Kusto:

```kql
DeviceManagementProvider 
| where env_time >= ago(10d)
| where ActivityId == "<Intune device id>" 
| where EventId == 5786
| project env_time, userId, deviceId, PolicyName=name, PolicyType=typeAndCategory, 
         Applicability=applicablilityState, Compliance=reportComplianceState, 
         TaskName, EventId, EventMessage, message 
| order by env_time asc
```

**Key fields**:
- `Applicability=Applicable` means policy evaluated and will deploy
- For Windows profiles assigned to user group: ensure userId is in the project list (helps check Azure ART token)

### Step 2: Extract Policy ID
From Step 1 results, parse the CIId field:
- Format: `AC_{AccountId}/LogicalName_{PolicyId}/{version}`
- Version suffix (e.g., `/2`) indicates modification count
- **Note**: If policy modified multiple times within 1 day, settings may not update immediately (common with Wi-Fi/SCEP/VPN profiles)

### Step 3: No Results with EventId 5786
Intune has not yet evaluated the policy for deployment. Check Device and User Effective Group membership.

### Step 4: EventId 5786 Shows Error
Query DeviceManagementProvider with the same filters but without EventId filter to see full message flow.

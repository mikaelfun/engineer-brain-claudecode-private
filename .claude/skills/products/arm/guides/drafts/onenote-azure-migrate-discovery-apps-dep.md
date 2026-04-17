# Azure Migrate Discovery (Apps & Dependency) - Kusto Diagnostics

> Source: OneNote — Azure Migrate Troubleshooting / Kusto Query / Discovery (Apps and Dependency)
> Clusters: asrcluscus / asrcluswe / asrclussea
> Databases: AMPKustoDB, ASRKustoDB

## Workflow

1. Find appliances and migrate projects by Subscription ID
2. Get agent IDs using Machine Identifier
3. Query dependency map and app discovery errors
4. Drill into agent logs using ServiceActivityID
5. Confirm data is sent to hub every 3 hours

## 1. Find Appliances and Migrate Projects

```kql
let StartDateTime = ago(10d); let EndDateTime = now();
union (cluster("asrcluscus").database("AMPKustoDB").Messages)
| where Timestamp >= StartDateTime and Timestamp <= EndDateTime
| where CustomDimensions has "ASRMigrationWebApp"
| where Raw contains "<SUBSCRIPTION_ID>"
| where Raw contains "configstring"
| extend OVFJson = parsejson(Raw)
| extend Message1 = parsejson(OVFJson.Message)
| extend Message2 = parsejson(Message1.Message)
| extend ApplicationVersion = extract("Application.Version:([0-9.]+)", 1, CustomDimensions)
| extend MachineIdentifier = extract("MachineIdentifier:([a-zA-Z0-9-]+)",1, CustomDimensions)
| extend MigrateProject = tostring(Message2.migrateProject)
| extend subscriptionName = tostring(Message2.subscriptionName)
| extend ApplianceName = tostring(Message2.applianceName)
| extend FabricAdapter = tostring(OVFJson.FabricAdapter)
| extend City = extract("Location.City:([a-zA-Z0-9-. ]+)",1, CustomDimensions)
| extend Hostname = extract("Device.RoleInstance:([a-zA-Z0-9-.]+)",1, CustomDimensions)
| summarize arg_max(Timestamp, *) by MachineIdentifier
| distinct Timestamp, MachineIdentifier, ApplianceName, FabricAdapter, ApplicationVersion, MigrateProject, subscriptionName, City, Hostname
```

## 2. Get Agent IDs

Use MachineIdentifier or Hostname from step 1.

```kql
(cluster("asrcluscus").database("AMPKustoDB").Messages)
| where Timestamp > ago(150d)
| extend OVFJson = parsejson(Raw)
| where Raw contains "agentid" or Raw contains "DRA Id:" or Raw contains "RS vault name:"
| where Raw !contains "HeartBeat" and Raw !contains "vddk" and Raw !contains "connected to ht"
| where CustomDimensions has "ASRMigrationWebApp"
| where CustomDimensions has "<MACHINE_IDENTIFIER>"
| extend Message = parse_json(Raw).Message
| extend Agent_Name = trim(" ",extract("([a-zA-Z0-9- ]+)ID: ", 1, toupper(tostring(Message))))
| extend AgentId = extract("id: ([a-zA-Z0-9-]+)", 1, tolower(tostring(Message)))
| extend Endpoint = extract("endpoint: ([a-zA-Z0-9-:.//]+)", 1, tostring(Message))
| distinct Agent_Name, AgentId, Endpoint, tostring(Message)
```

## 3. Get Dependency Map and App Discovery Errors

Uses Discovery agent ID from step 2. Joins FdsTelemetryEvent (discovered VMs) with Messages (discovery results).

Key fields in output:
- **DiscoveryType**: `DependencyMap` or `AppsAndRoles`
- **Result**: `Success` or error details
- **AccountID/AccountName**: RunAs credential used
- **CredentialType**: Authentication method

### RunAs Account check
The query also joins with FdsTelemetryEvent filtering `ServiceEventName contains "RunAsAccount"` to get credential details.

## 4. Drill into Agent Logs by ServiceActivityID

```kql
let ServiceActivityID = "<FROM_STEP_3>";
let MachineID = "<TARGET_MACHINE_ID>";
let Time = ago(2d);
union
(cluster("asrcluswe").database("ASRKustoDB").Messages),
(cluster("asrclussea").database("ASRKustoDB").Messages),
(cluster("asrcluscus").database("ASRKustoDB").Messages),
(cluster("asrcluswe").database("AMPKustoDB").Messages),
(cluster("asrclussea").database("AMPKustoDB").Messages),
(cluster("asrcluscus").database("AMPKustoDB").Messages)
| where Timestamp >= Time
| extend RawP = parsejson(Raw)
| extend LogLevel = tostring(RawP.LogLevel)
| where Raw has ServiceActivityID or CustomDimensions has ServiceActivityID
| project Timestamp, Level, LogLevel, Raw, CustomDimensions
```

## Notes

- Discovery agent ID format: `<GUID>-agent`
- FdsTelemetryEvent contains VM metadata (BIOS GUID, OS, VMware Tools status, etc.)
- App discovery errors often relate to credential issues (wrong RunAs account) or VMware Tools not installed

# Azure Migrate Discovery (VM) - Kusto Diagnostics

> Source: OneNote — Azure Migrate Troubleshooting / Kusto Query / Discovery (VM)
> Clusters: asrcluscus / asrcluswe / asrclussea
> Databases: AMPKustoDB, ASRKustoDB

## Workflow

1. Find appliances → 2. Get Discovery agent ID → 3. Get discovered machines → 4. Check discovery agent logs → 5. Check duplicate BIOS GUIDs

## 1-2. Find Appliances & Get Agent IDs

Same pattern as other discovery guides (configstring + agentid queries).

## 3. Get Discovered Machines (FdsTelemetryEvent)

```kql
let subid = "<SUBSCRIPTION_ID>";
let DiscoveryAgentIDs = "<DISCOVERY_AGENT_ID>-agent";
union
(cluster("asrcluswe").database("ASRKustoDB").FdsTelemetryEvent),
(cluster("asrclussea").database("ASRKustoDB").FdsTelemetryEvent),
(cluster("asrcluscus").database("ASRKustoDB").FdsTelemetryEvent)
| where PreciseTimeStamp > ago(20d)
| where SubscriptionId contains subid
| where ResourceId contains DiscoveryAgentIDs
| extend obj = todynamic(Message)
| where obj.ObjectType == "Vm" or obj.ObjectType == "Server"
| extend data = todynamic((tostring(obj.ObjectData)))
| extend machineId = tostring(parsejson(tostring(parsejson(obj).ObjectData)).ID)
| extend machineName = tostring(parsejson(tostring(parsejson(obj).ObjectData)).Name)
| extend vcenterId = tostring(data.VCenterId), vcenterFqdn=tostring(data.VCenterFqdn),
    DatacenterMachineID = tostring(data.ID), VMName = tostring(data.Name),
    OSName = tostring(data.OSDetails.OSName), OSVersion = tostring(data.OSDetails.OSVersion),
    PowerStatus = tostring(data.PowerStatus), Firmware = tostring(data.Firmware),
    VMwareToolsStatus = tostring(data.VMwareToolsStatus),
    ChangeTrackingEnabled = tostring(data.ChangeTrackingEnabled),
    BIOSGuid = tostring(data.BIOSGuid), Uuid = tostring(data.Uuid)
| summarize arg_max(PreciseTimeStamp, *) by DatacenterMachineID
| where ServiceEventName != "VMwareVmDeleteEvent"
```

## 4. Get Discovery Agent Logs for a Specific VM

```kql
let MachineNAME = "<VM_NAME>";
let Discovery_agent_ID = "<AGENT_ID>";
let Time = ago(7d);
union
(cluster("asrcluswe").database("AMPKustoDB").Messages),
(cluster("asrclussea").database("AMPKustoDB").Messages),
(cluster("asrcluscus").database("AMPKustoDB").Messages)
| where Timestamp >= Time
| extend RawP = parsejson(Raw)
| extend LogLevel = tostring(RawP.LogLevel)
| where Raw has MachineNAME
| extend ServiceActivityId=extract("activityid:([^;]+)", 1, CustomDimensions)
| extend Agentid=extract("agentid:([^;]+)", 1, CustomDimensions)
| extend MachineId = iff(CustomDimensions has "VirtualMachineUuid:",
    trim(" ",tostring(split(split(CustomDimensions,"VirtualMachineUuid:")[1],";")[0])),
    trim(" ",tostring(split(split(Raw,"completed on ")[1],":")[0])))
| extend Result = iif(Raw contains "Success", "Success",
    iif(Raw has "ErrorCode", split(Raw,"ErrorCode: ")[1],
    tostring(split(split(Raw,"Exception.Message: ")[1],".")[0])))
| where Agentid contains Discovery_agent_ID
| project Timestamp, Level, LogLevel, Raw, CustomDimensions
```

## 5. Check Duplicate BIOS GUIDs (Cloned VMs)

```kql
let AgentID = "<DISCOVERY_AGENT_ID>-agent";
union
(cluster("asrcluswe").database("ASRKustoDB").Messages),
(cluster("asrclussea").database("ASRKustoDB").Messages),
(cluster("asrcluscus").database("ASRKustoDB").Messages),
(cluster("asrcluswe").database("AMPKustoDB").Messages),
(cluster("asrclussea").database("AMPKustoDB").Messages),
(cluster("asrcluscus").database("AMPKustoDB").Messages)
| extend RawP = parsejson(Raw)
| extend MachineIdentifier = extract("MachineIdentifier:([a-zA-Z0-9-]+)",1, CustomDimensions)
| where CustomDimensions contains AgentID or Raw contains AgentID
| where Raw !contains "CredSsp"
| extend DatacenterMachineID = extract("VirtualMachineUuid:([a-zA-Z0-9-.]+)",1, CustomDimensions)
| extend VMname2 = extract("VM Name ([a-zA-Z0-9-._]+)",1, Raw)
| extend VMname1 = extract("machine ([a-zA-Z0-9-._]+)",1, Raw)
| extend VMname = iff(VMname1 == "", VMname2, VMname1)
| where VMname2 != "" or VMname1 != ""
| where DatacenterMachineID != ""
| project Timestamp, DatacenterMachineID, VMname
```

If multiple VMnames map to the same DatacenterMachineID → cloned VM BIOS GUID issue.

## Key Tables

| Table | Database | Content |
|-------|----------|---------|
| Messages | AMPKustoDB | Appliance webapp logs |
| FdsTelemetryEvent | ASRKustoDB | Discovered machine metadata |
| FdsOperationEvent | ASRKustoDB | Discovery operation events |

## Notes

- ObjectType `"Vm"` = VMware VMs; `"Server"` = Physical/Hyper-V servers
- ServiceEventName `"VMwareVmDeleteEvent"` = deleted VMs (filter out)
- FabricElementType distinguishes VMware vs Hyper-V vs Physical

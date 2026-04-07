---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Settings Framework/Troubleshooting - Work in Progress"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FSettings%20Framework%2FTroubleshooting%20-%20Work%20in%20Progress"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Settings Framework Troubleshooting

## CPCD and Kusto

Monitor Settings Framework changes in **CPCD > Settings** or using Kusto.

### Query 1: Settings Profile Ingested (Daily)

Shows daily ingestion of all Settings profiles. Data ingestion can take up to 24 hours.

```kusto
let TenantID = ''; // Enter TenantID
fn_GetSettingProfileEntity
| where ChangeType == "Update"
| where TenantId == TenantID
| extend SettingsArray = parse_json(Settings)
| mv-expand Setting = SettingsArray
| extend 
    SettingDefinitionId = tostring(Setting.SettingDefinitionId),
    Value = tostring(Setting.Value),
    SettingProfileID = tostring(Setting.ProfileId),
    Priority = toint(Setting.Priority)
| extend SettingDefinitionId = extract(@"[^.]+\.[^.]+\.(.+)", 1, SettingDefinitionId)
| project IngestionTimeStamp = DPUData__IngestedTimestamp, TenantId, ChangeType, Priority, SettingProfileID, TemplateId, SettingDefinitionId, Value
```

### Query 2: Settings Profile Changes (30 days)

Tracks all changes to Setting profiles. Shows profiles with multiple settings and groups.

```kusto
let TenantID = '';
let cluster = cluster("https://cloudpc.eastus2.kusto.windows.net").database("CloudPC").CloudPCEvent
| union (cluster("https://cloudpcneu.northeurope.kusto.windows.net").database("CloudPCProd").CloudPCEvent);
cluster
| where AccountId == TenantID
| where ApplicationName == "wset"
| where env_cloud_environment == "PROD"
| where Col1 contains "Created SettingProfileEntity:" or Col1 contains "Updated SettingProfileEntity:"
| extend JsonData = parse_json(extract(@"(?:Created|Updated) SettingProfileEntity: (.+)$", 1, Col1))
| extend profile_id = tostring(JsonData.id), profile_templateId = tostring(JsonData.templateId), Priority = toint(JsonData.priorityMetaData.Priority)
```

## Specific Setting Troubleshooting Links

- **Cloud PC configurations**: AI-enabled Cloud PCs
- **Windows App Settings**: (WIP)
- **Remote Connection Experience**: (WIP)
- **User settings (legacy)**: User Settings policy

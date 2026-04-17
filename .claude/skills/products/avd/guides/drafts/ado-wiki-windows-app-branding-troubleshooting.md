---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Windows App Branding/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Windows%20App%20Branding/Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows App Branding - Troubleshooting

## Diagnosis Steps
1. Confirm affected user and platform
2. Verify policy assignment and scope
3. Check for conflicting policies
4. Validate branding asset requirements (size, format)
5. Confirm client version and sign-in state

## Kusto Queries (GRS Reporting)
- fn_GetSettingProfileEntity: Get all setting profiles for tenant, by UniqueId, by TemplateId
- fn_GetSettingTargetEntity: Get setting targets, check branding by SettingDefinitionId
- Cluster: cpcdeedprpttestgbl.eastus / Reporting database
- Key SettingDefinitionIds: W365.WindowsApp.Branding.CompanyLogo, W365.WindowsApp.*

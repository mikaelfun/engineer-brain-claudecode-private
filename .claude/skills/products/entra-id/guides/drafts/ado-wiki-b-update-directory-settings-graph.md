---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Microsoft Graph Update Directory Settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FMicrosoft%20Graph%20Update%20Directory%20Settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Using Microsoft Graph PowerShell to Update Directory Settings

## Known Issue: ObjectSettingsTemplate not supported for Group

**Error**: `ObjectSettingsTemplate '62375ab9-6b52-47ed-826b-58e47e0e304b' is not supported for DirectoryObjectClass 'Group'`

The Group.Unified template must be applied at the directory level, not on a group object.

### Fix (v1.0)
```powershell
Connect-MgGraph -Scopes "Directory.ReadWrite.All", "Group.Read.All"
$template = Get-MgGroupSettingTemplateGroupSettingTemplate | Where-Object {$_.DisplayName -eq "Group.Unified"}
$setting = @{
    TemplateId = $template.Id
    Values = @(
        @{Name = "EnableGroupCreation"; Value = "false"},
        @{Name = "AllowToAddGuests"; Value = "true"}
    )
}
$groupUnifiedSettings = Get-MgGroupSetting | Where-Object { $_.DisplayName -eq "Group.Unified" }
If($groupUnifiedSettings -eq $null) {
  New-MgGroupSetting -BodyParameter $setting
} else {
  Update-MgGroupSetting -GroupSettingId $groupUnifiedSettings.Id -BodyParameter $setting
}
```

### Fix (Beta)
```powershell
Connect-MgGraph -Scopes "Directory.ReadWrite.All", "Group.Read.All"
$template = Get-MgBetaDirectorySettingTemplate | Where-Object {$_.DisplayName -eq "Group.Unified"}
$setting = @{
    TemplateId = $template.Id
    Values = @(
        @{Name = "EnableGroupCreation"; Value = "false"},
        @{Name = "AllowToAddGuests"; Value = "true"}
    )
}
$groupUnifiedSettings = Get-MgBetaDirectorySetting | where { $_.DisplayName -eq "Group.Unified" }
If($groupUnifiedSettings -eq $null) {
  New-MgBetaDirectorySetting -BodyParameter $setting
} else {
  Update-MgBetaDirectorySetting -DirectorySettingId $groupUnifiedSettings.Id -BodyParameter $setting
}
```

## Group-Specific Settings (Group.Unified.Guest)
Use GUID `08d542b9-071f-4e16-94b0-74abb372e3d9` for per-group guest settings:
```powershell
$groupId = "group_id"
$template = Get-MgBetaDirectorySettingTemplate | Where-Object {$_.DisplayName -eq "Group.Unified.Guest"}
$setting = @{
    TemplateId = $template.Id
    Values = @(@{Name = "AllowToAddGuests"; Value = "true"})
}
$existing = Get-MgGroupSetting -GroupId $groupId | Where-Object { $_.TemplateId -eq $template.id }
If($existing -eq $null) {
  New-MgGroupSetting -GroupId $groupId -BodyParameter $setting
} else {
  Update-MgGroupSetting -GroupId $groupId -GroupSettingId $existing.Id -BodyParameter $setting
}
```

## Enable MIP Labels
```powershell
$groupUnifiedSettings = Get-MgBetaDirectorySetting | where { $_.DisplayName -eq "Group.Unified" }
$params = @{
    Values = @(@{Name = "EnableMIPLabels"; Value = "True"})
}
if($groupUnifiedSettings) {
  Update-MgBetaDirectorySetting -DirectorySettingId $groupUnifiedSettings.id -BodyParameter $params
} else {
  $template = Get-MgBetaDirectorySettingTemplate | where { $_.DisplayName -eq "Group.Unified" }
  $params.templateId = $template.id
  New-MgBetaDirectorySetting -BodyParameter $params
}
```

# Defender MDE 集成 (Defender for Endpoint) — 排查工作流

**来源草稿**: ado-wiki-a-mde-test-alert.md, ado-wiki-e-get-mde-investigation-package-playbook.md, ado-wiki-e-isolate-endpoint-mde-playbook.md, mslearn-mde-security-config-mgmt-enrollment.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Generate a Benign MDE Test Alert
> 来源: ado-wiki-a-mde-test-alert.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Use Remote Desktop to access either a Windows Server 2012 R2 VM or a Windows Server 2016 VM.
2. Create a folder `C:\test-MDATP-test`.
3. Open a command-line window.
4. At the prompt, copy and run the following command (the Command Prompt window will close automatically):
5. If the command is successful, you'll see a new alert on the Azure Security Center dashboard and the Microsoft Defender for Endpoint portal. This alert might take a few minutes to appear.
6. To review the alert in Security Center, **you must work with the new Alerts portal (introduced in Jan 2021) and make sure to filter in Informational alerts as well**.

### Portal 导航路径
- a command-line window

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('romelogs.kusto.windows.net').database("Rome3Prod").FabricTraceEvent
| where env_time > ago(10d)
| where message has "Received alert"
| where message has "{machine_name or machine_id}"
```

**查询 2:**
```kusto
cluster('romelogs.kusto.windows.net').database("Rome3Prod").FabricTraceEvent
| where env_time > ago(10d)
| where env_cv has "<operationId>"
| project env_time, traceLevel, message
```

### 脚本命令
```powershell
powershell.exe -NoExit -ExecutionPolicy Bypass -WindowStyle Hidden (New-Object System.Net.WebClient).DownloadFile('http://127.0.0.1/1.exe', 'C:\\test-MDATP-test\\invoice.exe'); Start-Process 'C:\\test-MDATP-test\\invoice.exe'
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: Quick Deployment
> 来源: ado-wiki-e-get-mde-investigation-package-playbook.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. ## Get the Teams ID and Channel ID
2. ## Grant the following permissions to the managed identity by running the commands in the Cloud Shell.
3. ## Authorize teams-Get-MDEInvestigationPackage API connections
4. ## Apply Microsoft Sentinel Responder permissions to managed identity.
5. Simulate a MDE or M365 Defender incident.
6. Click Actions - choose Run Playbook
7. Run the Get-MDEInvestigationPackage playbook.
8. Once the playbook triggered successfully, click the playbook name to view the status.
9. Please note that it will take about 2-3 minutes until it shows the result.
10. If it runs successfully, go to Teams and check the message in the channel.
11. Copy the URL and paste it on another tab to download the package.
12. **Expired token when downloading investigation package**: The playbook generates a URI for downloading the package, but an expired token appears. The URI must be used immediately (within 1 minute). Reference: https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/get-package-sas-uri?view=o365-worldwide#response
13. **Missing permissions error**: The customer runs the playbook, but receives error "'message': 'The application does not have any of the required application permissions (Machine.Read.All, Machine.ReadWrite.All) to access the resource'". **Solution**: Ensure that the customer has added Machine.Read.All, Machine.ReadWrite.All permissions to the managed identity (see Prerequisites step 2).

### Portal 导航路径
- https://github
- Teams and check the message in the channel

### 脚本命令
```powershell
$MIGuid = " enter managed identity here "
$MI = Get-AzureADServicePrincipal -ObjectId $MIGuid

$MDEAppId = "fc780465-2017-40d4-a0c5-307022471b92"
$PermissionName = "Machine.CollectForensics"

$MDEServicePrincipal = Get-AzureADServicePrincipal -Filter "appId eq '$MDEAppId'"
$AppRole = $MDEServicePrincipal.AppRoles | Where-Object {$_.Value -eq $PermissionName -and $_.AllowedMemberTypes -contains "Application"}
New-AzureAdServiceAppRoleAssignment -ObjectId $MI.ObjectId -PrincipalId $MI.ObjectId `
-ResourceId $MDEServicePrincipal.ObjectId -Id $AppRole.Id
```

```powershell
$MIGuid = " enter managed identity here "
$MI = Get-AzureADServicePrincipal -ObjectId $MIGuid

$MDEAppId = "fc780465-2017-40d4-a0c5-307022471b92"
$PermissionName = "Machine.ReadWrite.All"

$MDEServicePrincipal = Get-AzureADServicePrincipal -Filter "appId eq '$MDEAppId'"
$AppRole = $MDEServicePrincipal.AppRoles | Where-Object {$_.Value -eq $PermissionName -and $_.AllowedMemberTypes -contains "Application"}
New-AzureAdServiceAppRoleAssignment -ObjectId $MI.ObjectId -PrincipalId $MI.ObjectId `
-ResourceId $MDEServicePrincipal.ObjectId -Id $AppRole.Id
```

```powershell
$MIGuid = " enter managed identity here "
$MI = Get-AzureADServicePrincipal -ObjectId $MIGuid

$MDEAppId = "fc780465-2017-40d4-a0c5-307022471b92"
$PermissionName = "Machine.Read.All"

$MDEServicePrincipal = Get-AzureADServicePrincipal -Filter "appId eq '$MDEAppId'"
$AppRole = $MDEServicePrincipal.AppRoles | Where-Object {$_.Value -eq $PermissionName -and $_.AllowedMemberTypes -contains "Application"}
New-AzureAdServiceAppRoleAssignment -ObjectId $MI.ObjectId -PrincipalId $MI.ObjectId `
-ResourceId $MDEServicePrincipal.ObjectId -Id $AppRole.Id
```

---

## Scenario 3: Prerequisites
> 来源: ado-wiki-e-isolate-endpoint-mde-playbook.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Grant Machine.Isolate permissions to the managed identity. Run the following command in cloud shell.

### 脚本命令
```powershell
$MIGuid = "enter the managed identity id here"
$MI = Get-AzureADServicePrincipal -ObjectId $MIGuid

$MDEAppId = "fc780465-2017-40d4-a0c5-307022471b92"
$PermissionName = "Machine.Isolate"

$MDEServicePrincipal = Get-AzureADServicePrincipal -Filter "appId eq '$MDEAppId'"
$AppRole = $MDEServicePrincipal.AppRoles | Where-Object {$_.Value -eq $PermissionName -and $_.AllowedMemberTypes -contains "Application"}
New-AzureAdServiceAppRoleAssignment -ObjectId $MI.ObjectId -PrincipalId $MI.ObjectId `
-ResourceId $MDEServicePrincipal.ObjectId -Id $AppRole.Id
```

---

## Scenario 4: MDE Security Configuration Management — Enrollment Troubleshooting
> 来源: mslearn-mde-security-config-mgmt-enrollment.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Verify device OS is in scope for Security Config Mgmt
2. Confirm device appears in Entra ID
3. Check enrollment status registry key
4. Run Client Analyzer for actionable guidance
5. Verify Entra ID + Intune endpoints are reachable

---

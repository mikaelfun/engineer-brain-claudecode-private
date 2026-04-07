# OMS Agent Troubleshooting Guide

> Source: OneNote — OMS Agent / OMS Agent TSG
> Quality: draft | Needs: review, note MMA retirement

## Windows Troubleshooting

### Step 1: Check Agent Status on Machine

1. Open **Control Panel → Microsoft Monitoring Agent**
2. Check the status of the agent and connected workspaces

### Step 2: Disconnect and Reconnect to Workspace

1. Go to **Log Analytics** workspace
2. Navigate to **Data sources → Virtual machines**
3. Check machine status — look for errors or wrong workspace connection
4. If errors/health issues: **disconnect** then **reconnect** the machine
5. Agent health should update within 5 minutes of reconnecting

### Step 3: Remove Extension and Redeploy

1. Go to **Virtual Machines → Extensions**
2. Click on the monitoring agent extension → **Delete**
3. Go to **Log Analytics → Data sources → Virtual machines**
4. Reconnect machine to workspace (auto-installs agent)

### Step 4: Check Event Logs

- Windows Event Viewer: Operations Manager logs
- Agent logs:
  - `C:\WindowsAzure\logs\WaAppAgent.log`
  - `C:\WindowsAzure\Logs\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\*`

### Check Workspace Connection (Windows)

**Option A** — Monitoring control panel (GUI)

**Option B** — PowerShell:
```powershell
(New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg').GetCloudWorkspaces()
```

### Test Agent Cloud Connection

```cmd
"C:\Program Files\Microsoft Monitoring Agent\Agent\TestCloudConnection.exe"
```

## Linux Troubleshooting

### Check Workspace Connection

```bash
/opt/microsoft/omsagent/bin/omsadmin.sh -l
```

> For detailed Linux agent investigation, refer to the Linux Agent Investigation guide.

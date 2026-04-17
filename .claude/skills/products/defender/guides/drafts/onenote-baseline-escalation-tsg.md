# VM Baseline Escalation & Troubleshooting

> Source: OneNote — Recommendations / Baseline escalation + baseline TSG
> Quality: draft | Needs: review, verify team names still current

## Escalation Contacts

### Windows Baseline Issues

- Email: AzSecBaselineSupport@microsoft.com
- IcM teams:
  - **AzSec SLAM Reporting / AzSecSLAM** — for baseline content issues (e.g., why a setting's expected value is X)
  - **AZURESECURITYMONITORINGASMSLAM / AzSecPackLab** — for technical baseline pipeline issues (e.g., stale baseline data)

### Linux Baseline / OMS Agent

- **Azure Security Monitoring (Engineering) / AzSecPackTeam**
- **Azure Security Monitoring (Engineering) / ASM-Dev**

## Baseline Troubleshooting Steps

### Step 1: Verify Scanner Freshness

```kql
cluster('romelogs').database('romelogs').OmsHealthMonitoringOE
| where env_time > ago(2d)
| where SubscriptionId == "<SubscriptionId>"
| summarize arg_max(env_time, *) by VmId
```

Check BaselineStatus column — look for "Fail - No Heartbeat" or stale timestamps.

### Step 2: Check OMS Data Cap (Free Tier)

For free-tier customers, check if the OMS data cap has been exceeded. Reach out to Xteam.

### Step 3: Collect Logs

**Windows:**
1. Enable Baseline Logging:
   ```cmd
   reg add HKLM\SOFTWARE\Microsoft\AzureOperationalInsights /v Assessments_LogDirectoryPath /t REG_SZ /d <LOGPATH>
   ```
2. Restart HealthService:
   ```cmd
   net stop healthservice
   del "C:\Program Files\Microsoft Monitoring Agent\Agent\Health Service State" /s /q
   net start healthservice
   ```
3. Collect: Operations Manager event log + logs from `<LOGPATH>`

**Linux:**
1. Run: `sudo /opt/microsoft/omsagent/plugin/omsbaseline > /tmp/baseline.json`
2. Send baseline.json for analysis
3. Check msid=157.15 (Ensure system accounts are non-login) for Offending account errors

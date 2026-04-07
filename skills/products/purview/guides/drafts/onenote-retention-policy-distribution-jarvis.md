# Retention Policy Distribution Troubleshooting via Jarvis

> Source: OneNote — Query for retention policy distribution details
> Status: draft

## When to Use

Customer reports retention policy is not applied / sync failed / distribution stuck.

## Steps

### 1. Get Policy GUID

```powershell
Get-RetentionCompliancePolicy -Identity "<policy name>" -DistributionDetail | Format-List *
```

- Note the **GUID** (this is the policy ID)
- Note the **LastStatusUpdateTime** (policy sync timestamp)

### 2. Query Jarvis

- Namespace: `O365PassiveGal`
- Table: `UnifiedPolicyMonitoringInfoLogEvent`
- Set time range to cover the policy update window
- Set filter: `Container = {GUID}`
- Saved query: https://portal.microsoftgeneva.com/s/24D066E5

### 3. Analyze Results

```kql
source
| project env_time, Workload, ObjectType, Stage, Status, RetryCount, Description, CustomData
| sort by env_time asc
```

- Look at the **target workload** column
- Check **Status** and **Description** for error details
- **RetryCount** > 0 indicates transient failures

## 21V Applicability

Available in 21Vianet. Use Mooncake Jarvis portal.

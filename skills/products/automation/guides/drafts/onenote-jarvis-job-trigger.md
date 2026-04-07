# Jarvis: Query Why a Job Was Triggered

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Troubleshooting > Jarvis > How to query why job is triggered

## Step-by-Step

### Step 1: Find Job Trigger Source
- Namespace: **OaasMKProd{region}**
- Jarvis link: https://jarvis-west.dc.ad.msft.net/65E02B49
- Filter by: Runbook name
- Key field: **JobtriggerSource** — enum values: `scheduled`, `manual`, `webhook`

### Step 2: Find Trigger Details (Schedule Info)
- Namespace: **OaasMKTrigger{region}**
- Jarvis link: https://jarvis-west.dc.ad.msft.net/8E93F5FE
- Filter by: Runbook name
- Result: Shows which schedule triggered the job

### Step 3: Get Schedule Settings
- Use Jarvis action: **Get Resource from URI**
- URI format:
  ```
  /subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.Automation/automationAccounts/{account}/schedules/{scheduleName}
  ```

## Use Cases
- Customer reports unexpected job execution
- Need to verify job was triggered by correct schedule/webhook
- Auditing automation execution history

## Applicability
- 21v (Mooncake): Yes (use MK namespace prefix)

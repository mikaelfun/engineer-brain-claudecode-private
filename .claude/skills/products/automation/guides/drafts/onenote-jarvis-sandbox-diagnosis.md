# Jarvis: Diagnose Failed/Suspended Runbook Jobs (Sandbox)

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Troubleshooting > Jarvis > How to find sandbox related events

## Step-by-Step Diagnosis

### Step 1: Get Job ID
Find the failed/suspended job ID from the Azure portal (Automation Account > Jobs).

### Step 2: Find Sandbox Process ID
Query table **EtwAll** in namespace **OaasMKProd{region}**:
- Filter: `EventMessage contains "{JobID}"` AND `TaskName == "SandboxHandleJobActionEnter"`
- Result: Returns records for each sandbox process that picked up the job
- Key field: **processId** — the sandbox process identifier

### Step 3: Check Sandbox Events
Query table **DrawbridgeHostV1**:
- Filter: `pid == {processId}` (from Step 2)
- Result: Events related to sandbox process execution
- **Normal**: Benign informational/warning events or no events
- **Problem**: Sandbox terminated due to memory exhaustion or other resource limits

## Common Root Causes Found via This Method
- Sandbox terminated due to **memory exhaustion** (400MB+ limit)
- Sandbox crash due to resource contention

## Reference
- Runbook troubleshooting: https://docs.azure.cn/zh-cn/automation/troubleshoot/runbooks

## Applicability
- 21v (Mooncake): Yes (use MK namespaces)

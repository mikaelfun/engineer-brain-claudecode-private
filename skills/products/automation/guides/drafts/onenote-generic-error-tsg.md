# Generic Error Troubleshooting with Try-Catch-Retry

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Troubleshooting > Runbook common troubleshooting > Generic Error

## Scoping Questions
1. What is the exact error message?
2. Multiple errors? Choose one to scope per support ticket
3. Where does error appear? (Errors pane = fatal; Output pane = non-fatal)
4. Occurrence rate: first time? intermittent? consistent?

## Try-Catch-Retry Pattern
```powershell
$RetryIntervalInSeconds = 10
$NumberOfRetryAttempts = 2
$cmdOk = $FALSE

do {
    try {
        # Use -ErrorAction Stop to catch non-fatal exceptions too
        <cmdlet to trap here> -ErrorAction Stop
        $cmdOk = $TRUE
    }
    catch {
        Write-Output "Exception Caught..."
        $ErrorMessage = $_.Exception.Message
        $StackTrace = $_.Exception.StackTrace  # NOT supported in Workflows
        Write-Output "Error: $ErrorMessage, stack: $StackTrace. Retries left: $NumberOfRetryAttempts"
        $NumberOfRetryAttempts--
        Start-Sleep -Seconds $RetryIntervalInSeconds
    }
} while (-not $cmdOk -and $NumberOfRetryAttempts -ge 0)
```

**Note**: Some cmdlets don't support `-ErrorAction`. Use instead:
```powershell
$ErrorActionPreference = 'Stop'
<cmdlet>
$cmdOk = $TRUE
$ErrorActionPreference = 'Continue'
```

## Debugging Techniques
```powershell
# Method 1: -Debug flag
$DebugPreference = "Continue"
Add-AzureAccount -Credential $Cred -Debug *>&1

# Method 2: PSDebug trace
$GLOBAL:DebugPreference = "Continue"
SET-PSDebug -Trace 2
Get-AzureRmResourceGroupDeployment -ResourceGroupName "rgName"
```

## Data Collection Script
```powershell
Get-AutomationDiagnosticResults.ps1 -AutomationAccountName '<name>' -RunbookName '<name>'
```
Source: https://github.com/jefffanjoy/DemoCode/blob/master/Scripts/Azure%20Automation/Get-AutomationDiagnosticResults.ps1

## Applicability
- 21v (Mooncake): Yes

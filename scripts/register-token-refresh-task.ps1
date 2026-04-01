$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-NoProfile -ExecutionPolicy Bypass -File "C:\Users\fangkun\Documents\Claude Code Projects\EngineerBrain\scripts\refresh-cme-kusto-token.ps1"'
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 4)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName 'CME-Kusto-Token-Refresh' -Action $action -Trigger $trigger -Settings $settings -Force

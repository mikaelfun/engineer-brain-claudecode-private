# AAD Connect: Auto Truncate mms_step_history via Scheduled Task

> Source: Internal sharing (Byron Hu)

## Problem

AAD Connect's WID database can grow large due to accumulated run history in `mms_step_history` table, eventually causing DB full and service start failure.

## Automated Solution: Windows Scheduled Task

### Prerequisites
- SQLCMD.EXE available (default: `C:\Program Files\Microsoft SQL Server\110\Tools\Binn\SQLCMD.EXE`)
- SQL truncate script file (e.g., `C:\truncateTable.sql`)
- Admin account for Task Scheduler

### Steps

1. Open **Task Scheduler** (search or find in Administrative Tools)
2. **Create Task** (not "Create Basic Task")
3. **General Tab**: Set user account in admin group
4. **Trigger**: Set frequency (e.g., every hour, daily)
5. **Action**: 
   - Program: Browse to `SQLCMD.EXE`
   - Arguments: `-S \\.\pipe\LOCALDB#<instance>\tsql\query -E -i "C:\truncateTable.sql"`
6. Test by manually running the task
7. Verify `mms_step_history` data is cleared

### truncateTable.sql Content

```sql
USE ADSync
GO
TRUNCATE TABLE mms_step_history
GO
```

### Finding the Named Pipe

```powershell
cd 'C:\Program Files\Microsoft SQL Server\110\Tools\Binn'
SqlLocalDB.exe i ".\ADSync"
# Copy the "Instance pipe name" value
```

## Related

- Manual truncation: `SQLCMD -S (localDB)\.\ADSync -d ADSync -E -Q "truncate table mms_step_history"`
- Prevention: `Set-ADSyncScheduler -PurgeRunHistoryInterval DD.HH:MM:SS`
- `mms_step_history` contains detailed per-step info (larger), `mms_run_history` contains per-run summary

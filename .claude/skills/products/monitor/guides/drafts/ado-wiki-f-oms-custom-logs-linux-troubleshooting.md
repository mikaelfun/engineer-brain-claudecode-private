---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Troubleshooting Guides/Troubleshooting Custom Logs - Linux Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Troubleshooting Guides/Troubleshooting Custom Logs - Linux Agent"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# OMS Linux Agent: Troubleshooting Custom Logs

## Important
Start troubleshooting from SOURCE towards DESTINATION. Verify OMS Agent is collecting and shipping logs before checking ingestion service.

## Technical Background

### The .pos file
Each custom log rule has an associated `.pos` file referenced in `customlog.conf`. Each targeted file has a line: `/path/to/my.log <byte_position_hex> <inode_hex>`.

### The collection loop (every 1 minute)
| Scenario | Criterion | Behavior |
|----------|-----------|----------|
| Known | path seen, same inode | Ingests bytes after last read position |
| Unknown | new path | Creates .pos entry, sets position to end of file (ignores existing content) |
| Recreated | path seen, different inode | Treats as new file, updates .pos with new inode + end position |
| Deleted | path gone | Removes entry from .pos |

**Critical**: If file is truncated to size < last read position, no data collected until file grows past that position.

## Troubleshooting Steps

### 1. Collect Logs
- OMS Linux Agent Log Collector
- Key files: omsagent.log, omsagent.conf, omsconfig.log, /var/log/azure/*, /var/log/waagent.log
- .pos file contents, wc output for affected logs
- Process info: `ps axo user,pid,ppid,pcpu,pmem,vsz,rss,tty,stat,start_time,time,comm | grep 'omsagent\|omiagent'`

### 2-3. Check OS support and common issues
- Verify supported OS (server editions only, not client)
- Review [common troubleshooting items](https://github.com/Microsoft/OMS-Agent-for-Linux/blob/master/docs/Troubleshooting.md)

### 4-5. Check customlog.conf presence
- File: `/etc/opt/microsoft/omsagent/conf/omsagent.d/customlog.conf`
- If missing after 15+ minutes → DSC issue

### 6. Check DSC configuration
- Review `/var/opt/microsoft/omsconfig/omsconfig.log`
- Look for: `PerformRequiredConfigurationChecks DSC operation completed`
- Should appear every 15 minutes

### 7-11. Check omsagent.log for file tailing
Expected entries:
```
[info]: INFO Following tail of /var/log/custom.log
```

Warning patterns:
- `WARN <PATH> does not exist` → incorrect path
- `WARN <PATH> is excluded since it's unreadable` → permission issue
- `WARN <PATH> is a directory` → need file name or wildcard

### 8. Check .pos file tracking
Compare .pos file byte position (hex) with actual file size:
```
wc /path/to/my.log
cat /var/opt/microsoft/omsagent/state/CUSTOM_LOG_BLOB.<RULE>_<WS>.pos
```

### 12. Enable debug logging
```
# Disable DSC
sudo /opt/microsoft/omsconfig/Scripts/OMS_MetaConfigHelper.py --disable
# Add log_level debug to customlog.conf
# Restart: sudo /opt/microsoft/omsagent/bin/service_control restart
```

### 13. Large file count issues
- tailfilereader hangs with >100 files or >8.5k EPS per rule
- Check: `ps aux | grep tailfilereader`
- Check ulimit: `ulimit`
- Fix: split wildcard rules into multiple specific rules

## Important Notes

### Log rotation
- Supported: rename old file + create new (different inode)
- NOT supported: circular rotation (overwrite in place)
- Check: `cat /var/lib/logrotate/logrotate.status | grep 'fileName'`

### Encoding
- Only ASCII and UTF-8 supported
- Check: `file full_path_to_file`

### File handle limits
- Soft limit: 1024 files
- Check: `lsof | awk '{print $1}' | sort | uniq -c | sort -r -n | head`

---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Unknown Solution Investigation"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FUnknown%20Solution%20Investigation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AD Replication Failure Data Collection

Most AD replication failures are documented, but new problems can occur.

## Recommended Data Collection

1. **Directory Service SDP** from both sending and destination DCs
2. **Two-sided network trace** on both DCs while forcing replication

## ETW Tracing (NTDSAI Provider)

**Start tracing:**
```
logman create trace "g_os" -ow -o c:\g_os.etl -p "Microsoft-Windows-Active-Directory-Instrumentation" 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 4096 -ets
```

**Stop tracing:**
```
logman stop "g_os" -ets
```

Collect ETL from both servers while forcing replication.

## IDNA Trace (Advanced)
IDNA trace of LSASS.EXE from both DCs - only after escalation consultation.

Reference: https://aka.ms/insightweb

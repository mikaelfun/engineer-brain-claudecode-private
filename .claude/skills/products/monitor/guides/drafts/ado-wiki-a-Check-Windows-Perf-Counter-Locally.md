---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/General/How to check Windows Perf counter is working on local Machine"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FGeneral%2FHow%20to%20check%20Windows%20Perf%20counter%20is%20working%20on%20local%20Machine"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to check Windows Perf counter is working on local Machine

Applies To:
- Microsoft Monitoring Agent (MMA) - All versions
- Azure Monitor Agent (AMA)

## Scenario

Before troubleshooting why Perf counters from Windows are not uploaded to workspace via MMA or AMA, you must validate that the missing perf counter actually loads values on the local Windows machine.

This is a must-have step even if hundreds of machines are uploading perf counters and only a few are not.

## Validating Perf Counter via Perfmon

1. Launch Perfmon
2. Add the counter (e.g., Object: LogicalDisk, Counter: Disk Transfers/sec, Instance: Total)
3. Verify the counter produces values

## Validating Perf Counter via Typeperf command

Run the typeperf command to verify counter values:

```
typeperf "\LogicalDisk(_Total)\Disk Transfers/sec"
```

## If Counter Values Are Missing

If you are unable to observe counter values, engage the respective counter owner team:
- **SQL counters** -> SQL team
- **Basic Windows counters** -> Windows support team
- **Third-party counters** -> Customer works with 3rd party support

## How to make sure DCR collects custom perf counters successfully

1. Launch elevated command prompt
2. Run: `typeperf -qx | FIND /i "<counter keyword>"` to find exact counter path
3. Run: `typeperf -sc 5 <counter>` with the correct counter from step 2, verify returned results are valid
4. Use the exact counter path in DCR

> **Important Note**: When collecting Custom Performance Counters via DCR or Legacy MMA, always test the counter on the Windows machine via the typeperf command. Copy & paste the counter name from typeperf output to use in DCR to avoid non-binding space character issues.

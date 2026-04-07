---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Tools/ADPerf: Diagnostic Collection Tools/Memory Dumps/Full Dump: Hyper-V"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20Tools%2FADPerf%3A%20Diagnostic%20Collection%20Tools%2FMemory%20Dumps%2FFull%20Dump%3A%20Hyper-V"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Getting a Memory Dump from a Running Hyper-V Machine

You can take a dump with LiveKD while the machine is in the hung/bad state.

LiveKD is part of Sysinternals: https://learn.microsoft.com/en-us/sysinternals/downloads/livekd

## Steps

If you need to convert a running VM to a dump file, use LiveKD:

```
LiveKD -p -hv {Target} -o c:\dumps\test_vm.DMP
```

**Parameters:**
- `-o` — write out the dump file
- `-p` — pause the VM while collecting the dump
- `-hv` — target is a Hyper-V machine

> **Note:** This takes a while to complete.

## Common Issues

### Error: Symbol Path Not Configured

**Error message:**
```
Error resolving symbol KdVersionBlock: 126
Failed to resolve KdVersionBlock - 126
Failed to load guest symbols - 126
Failed to prepare hypervisor session for debugger - error 126
```

**Fix:** Set the `_NT_SYMBOL_PATH` environment variable:

```cmd
SET _NT_SYMBOL_PATH=srv*c:\symbols*http://msdl.microsoft.com/download/symbols
```

You need a public symbol path configured for customer environments.

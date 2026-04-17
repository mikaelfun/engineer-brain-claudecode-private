---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/GA/Capture Linux GA Callstack_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FGA%2FCapture%20Linux%20GA%20Callstack_AGEX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Capture Linux GA Callstack

This How To helps you collect a call stack of the Azure Linux Agent when it is unresponsive.

## Step 1: Check Service Status and Get PID

Run:

```bash
service waagent status
# On Ubuntu:
service walinuxagent status
```

Note the PID of the WALinuxAgent process with `-run-exthandlers` parameter.

## Step 2: Get Process Status

```bash
ps -fL <PID>
```

## Method A: Using gdb Debugger

### Install gdb

```bash
yum install gdb
```

### Attach and Capture Callstack

```bash
gdb -p <PID>
```

If you see "Missing separate debuginfos" message, quit gdb and install Python debugging info:

```bash
debuginfo-install python-2.7.5-86.el7.x86_64
```

Then re-attach and capture:

```
(gdb) set logging on
(gdb) thread apply all bt full
(gdb) q
```

The output is saved to `/home/gdb.txt`.

**Note**: The exthandler process uses 3 threads:
- Environment - Periodically checks environment settings (e.g. network firewall)
- Monitor - Periodically sends telemetry, heartbeat
- Extension handling (the interesting one - others are usually sleeping)

## Method B: Using strace Debugger

If gdb is not available:

1. Start debugger and restart agent:
```bash
strace -o /tmp/strace_restart_waagent.log -f -tT systemctl restart waagent
```

2. Find the PID:
```bash
ps -fea | egrep -i agent | tee /tmp/egrep_waagent.log
```

3. Debug the agent (auto-stops after 2 minutes):
```bash
timeout 120 strace -o /tmp/strace_debug_waagent.log -f -tT -p <PID>
```

4. Collect supplementary info:
```bash
sudo waagent version >> /tmp/output.log
sudo waagent run-exthandlers >> /tmp/output.log
which python python3 >> /tmp/output.log
python -V >> /tmp/output.log 2>&1
python3 -V >> /tmp/output.log
```

## Files to Collect

- `/tmp/strace_restart_waagent.log`
- `/tmp/egrep_waagent.log`
- `/tmp/strace_debug_waagent.log`
- `/tmp/output.log`
- `/home/gdb.txt` (if using gdb)

## Next Steps

Open a CRI to [EEE GA/PA](https://aka.ms/CRI-GAPA) for analysis by the Linux Escalation POD or WALinuxAgent Product Group.

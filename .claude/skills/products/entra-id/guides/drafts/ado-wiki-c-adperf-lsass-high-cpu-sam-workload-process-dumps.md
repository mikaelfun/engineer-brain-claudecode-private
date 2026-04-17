---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Lsass High CPU/Data Analysis and Walkthroughs/SAM Workload (using Process Dumps)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A+ADPERF%3A+Lsass+High+CPU%2FData+Analysis+and+Walkthroughs%2FSAM+Workload+(using+Process+Dumps)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Walkthrough of data analysis for SAM workload (using Process Dumps)

**Summary**: This walkthrough assists in investigating and analyzing high CPU usage by LSASS on a domain controller. It uses various diagnostic tools and provides a case study of a CheckPoint firewall causing the issue.

## Symptoms

This is a walkthrough to assist with investigation and data analysis in scenarios where the LSASS CPU load seems to be generated from the Domain Controller itself.

**The problem**: One single random Active Directory domain controller in a specific site experiences high CPU usage. The customer had recently installed a CheckPoint firewall and configured Identity Awareness.

**Symptom**: One Windows Server 2008 R2 Active Directory domain controller in a specific site experiences high CPU usage. It is not always the same DC, but it is only one at a time. Rebooting the DC does not solve the issue, as CPU spikes just after rebooting, or the load gets transferred to another DC in the same site.

## AD Performance Diagnostic SDP / AD Data Collector Set

From the report, identify the load was coming from SAM. Check the ETL with Joey Seiferts parsers (B2881754).

Filter out traces to find EnumUsersInDomain SAM calls using filter: `samsrv.SamEnumUsersInDom_Start` OR `samsrv.SamEnumUsersInDom_End`

The SID of the caller is the Administrators well-known SID (S-1-5-32-544), so it points to something being run with the credentials of a member of that group.

## Xperf/WPR

Load Xperf file into WPA and open the CPU Usage (Precise) graph. Inspect LSASS threads with high CPU - see the load from a call to SAM to enumerate all users in the domain.

The load is coming from RPC client (since LSASS thread has **OSF_SCALL** it means this is the **server side of an incoming RPC request**).

To find the client caller, search call stacks for EnumerateUsersInDomain and look for an RPC client-side call. **WmiPrvSE** process was triggering those calls through `Cwin32UserAccount::GetDomainUsersNT` and WMI class **Win32_UserAccount**.

## WMI Event Tracing

Enable WMI event tracing in the event log:
```
Wevtutil.exe sl Microsoft-Windows-WMI-Activity/Trace /e:true
```

## Network Traces

Inspect the **MSRPC Auth3 frame** to see authenticating user. Look at the **ExecQuery** frame to see the actual WMI query:
```
StrQuery: SELECT SID,Domain,Name FROM Win32_UserAccount WHERE SID="S-1-5-21-x-x-x-x"
```

## Memory Dump Analysis

If no network trace available, gather user mode memory dumps of SvcHost hosting WMIMgmt and LSASS process using `procdump -ma PID`.

Load SvcHost into WinDBG. Use MEX:
- `!mex.wmi -arb` - shows WMI tasks in arbitrator, reveals user running dozens of Win32_UserAccount operations
- `!mex.us` - unique stacks reveals 129 threads in two specific call stacks
- Frame 7: waiting for thread processing `wbemcore!CCoreQueue::Execute`
- Frame 8: reveals actual query being processed
- Frame 18: tells client IP address and port (OSF_SCALL shows Client Endpoint)

## Cause

Load came from WMI calls triggered from a specific IP address. Customer found a CheckPoint firewall with Identity Awareness feature at that IP.

## Resolution

After disabling/disconnecting CheckPoint Identity Awareness, CPU load on DCs returned to normal. Customer contacts CheckPoint support for further investigation.

## Related KBs

- 3058557 ADPERF: App: Checkpoint Identity Awareness AD causes high memory or CPU utilization on DCs
- 3028961 ADPERF: Queries for WMI classes Win32_UserAccount and Win32_Group cause high network traffic and CPU load on DCs

---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Windows Agent and Hang Dumps"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Common%20Concepts/Windows%20Agent%20and%20Hang%20Dumps"
importDate: "2026-04-07"
type: troubleshooting-guide
---

 :::template /.templates/Common-Header.md
:::

Purpose
-------

This TSG describes how to use **Sysinternals ProcDump** to collect memory dumps for **application hangs, crashes, and exceptionbased failures**.  
These dumps are used for advanced troubleshooting, root cause analysis, and Product Group (PG) escalation.

Download [Link](https://docs.microsoft.com/sysinternals/downloads/procdump)

Applies To
----------

*   Windows-based applications (native, .NET, mixed mode)
*   Services and user-mode processes
*   Customer and internal test environments (subject to data-handling policy)

 

Common Scenarios
----------------

*   Application is **running but unresponsive (hang)**
*   Application **crashes unexpectedly**
*   Application throws **specific exceptions** but does not crash
*   Need to **observe firstchance exceptions** for diagnostic purposes

 

Symptoms
--------

*   Application UI freezes or stops responding
*   Service remains running but performs no work
*   Application terminates with or without visible error
*   Silent failures or intermittent instability
*   Event logs indicate unhandled or repeated exceptions

 

Data Collection
---------------

### Prerequisites

*   Download **ProcDump** from Sysinternals
*   Extract ProcDump on the affected machine
*   Open **Command Prompt as Administrator**
*   Ensure adequate disk space for dump files

 


Scenario 1: Collect an Immediate Hang Dump
------------------------------------------

Use when the process is **currently running but hung**.

### Option A: By Process ID (PID)
`procdump -ma 1234`
 

*   Captures an immediate **full memory dump**
*   Replace `1234` with the target process ID

 

### Option B: By Process Name
`procdump -ma myapp.exe`  

*   Captures a full dump of `myapp.exe`
*   Useful when PID is unknown

 

Scenario 2: Collect a Dump When the Application Crashes
-------------------------------------------------------

Use when the application **terminates due to an unhandled exception**.
`procdump -e -ma myapp.exe`
 

*   Waits for a **secondchance exception (crash)**
*   Captures a **full memory dump**
*   Recommended default crash-dump scenario



 

Scenario 3: Capture FirstChance and SecondChance Exceptions
-------------------------------------------------------------

Use when investigating **early failures or unexpected exception behavior**.
`procdump -e 1 -ma myapp.exe`
 

*   Monitors:
    *   Firstchance exceptions
    *   Secondchance (crash) exceptions
*   Takes a dump when either occurs

 

Scenario 4: Observe FirstChance Exceptions (No Dump)
-----------------------------------------------------

Use when you want to **identify which exceptions are being thrown** without generating dump files.
`procdump -e 1 -f "" myapp.exe`
 

*   Displays firstchance exceptions in the console
*   **No dump is generated**
*   Useful to discover exception names for filtering


 

Scenario 5: Capture a Dump for a Specific FirstChance Exception
----------------------------------------------------------------
Use after identifying a specific exception (for example, `NotFound`).
### Full Memory Dump on Specific Exception
`procdump -e 1 -ma -f NotFound myapp.exe`
 
*   Takes a **full memory dump**
*   Triggered only when the `NotFound` firstchance exception occurs

 

### Mini Dump on Specific Exception
`procdump -e 1 -f NotFound myapp.exe`
 
*   Takes a **mini dump**
*   Use only when full memory is not required

 

Analysis / Resolution Guidance
------------------------------

*   **Full dumps (`-ma`)** are preferred for:
    *   Hangs
    *   Memory corruption
    *   GC, heap, or threading issues
*   **Mini dumps** may be sufficient for:
    *   Stack analysis
    *   Known exception patterns
*   For recurring issues, consider capturing **multiple dumps** spaced over time

 

Common Flags Reference
----------------------

| Flag | Description |
| --- | --- |
| `-ma` | Full memory dump |
| `-e` | Capture on unhandled exception |
| `-e 1` | Include firstchance exceptions |
| `-f <ExceptionName>` | Filter on specific exception |
| `""` | Empty filter (display only) |

 

Support Notes (Internal)
------------------------

*   Always record:
    *   ProcDump command used
    *   Timestamp of capture
    *   Process name and PID
*   Follow **data privacy and security policies** before collecting dumps from customer systems
*   Attach dumps and command details when escalating to PG or opening CRI/ICM
*   Confirm with PG whether **full vs mini dump** is required before collection in production

 

Escalation Criteria
-------------------

Escalate with collected dumps when:
*   Issue is reproducible and blocks customer workload
*   Root cause cannot be determined via logs or traces
*   PG explicitly requests memory dump analysis
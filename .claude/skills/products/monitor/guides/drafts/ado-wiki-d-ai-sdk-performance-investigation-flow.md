---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Existing Material from PG Wiki/Troubleshooting performance issues when Application Insights .Net or .Net core SDK library is a suspect"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FExisting%20Material%20from%20PG%20Wiki%2FTroubleshooting%20performance%20issues%20when%20Application%20Insights%20.Net%20or%20.Net%20core%20SDK%20library%20is%20a%20suspect"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Generic Investigation Flow for Application Insights SDK Performance Issues

## Step 1: Identify the overhead type

Determine which overhead is of concern:
- CPU / RPS degradation
- Memory consumption
- Lock contention
- TCP connection exhaustion

## Step 2: Compare against known issues KB

Check the knowledge base of known AI SDK performance issues (see known-issues-ado-wiki JSONL entries for specific patterns).

- **Found** → Apply one of the solutions from KB
- **Not found** → Continue investigation with profiling tools (Step 3)

## Step 3: Profiling-based investigation

### 3a. CPU issue

1. [Collect profiling trace with PerfView.exe](https://learn.microsoft.com/shows/perfview-tutorial/1-collecting-data-run-command) or any .NET profiling tool
2. Identify the stack that consumes the most CPU in addition to customer's code (can be identified by namespace of the methods)
3. Evaluate possible cause for this stack to be executed so often or to take a prolonged amount of time
4. Contact PG for support if the reason is not identified

Reference: [PerfView CPU investigation guide](https://learn.microsoft.com/shows/perfview-tutorial/2-simple-cpu-performance-investigation)

### 3b. Memory issue

1. Collect memory profiling trace or memory dump with the tool of choice
2. Identify the object that consumes most of the memory: typically many small AI objects, or a bunch of heavy AI objects
3. Identify the code pattern that leads to this object creation and refactor if it's in customer's code
4. If pattern is in SDK code or not identified → Contact PG for support

References:
- [PerfView memory leak investigation Part 1](https://learn.microsoft.com/shows/perfview-tutorial/tutorial-10-investigating-net-heap-memory-leaks-part1-collecting-data)
- [PerfView memory leak investigation Part 2](https://learn.microsoft.com/shows/perfview-tutorial/tutorial-11-investigating-net-heap-memory-leaks-part2-analyzing-data)

### 3c. Lock contention issue

References:
- [.NET Contention Scenario Using PerfView](https://blogs.msdn.microsoft.com/rihamselim/2014/02/24/net-contention-scenario-using-perfview/)
- PerfView tool has guide in its help UI, source: [PerfView UsersGuide](https://github.com/microsoft/perfview/blob/master/src/PerfView/SupportFiles/UsersGuide.htm#L738)

## Step 4: Document findings

When solved, add issue and/or the solution to the knowledge base if it wasn't in the list before.

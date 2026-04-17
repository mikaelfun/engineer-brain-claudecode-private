---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Concepts/Understanding Profiler Data"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Concepts/Understanding%20Profiler%20Data"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Understanding Profiler Data

Profiler is meant to show where performance issues are in an application. However, it can be challenging to look at and understand what the Profiler captured. Like everything it has limitations and these are often not clearly understood. The material below is meant to provide a better understanding of Profiler captures and how they can be leveraged.

## Official Documentation

https://docs.microsoft.com/azure/azure-monitor/app/profiler-overview

Profiler is heavy-handed with regards to the overhead it adds, it can be anywhere from 5-15% and this point is covered in the on-line documentation. This overhead only occurs during the time profiling is actually occurring; by default this means about 2 minutes per hour as this is how often by default it will take a sample trace. While it does add some overhead, it provides a lot of details with the information it captures. In most instances it is more information than most need, but it is evolving.

## Application Code

The purpose of Profiler is to locate trouble spots in code in terms of performance. However, to really understand the output and how to leverage what it provides usually relies on more than just the Profiler trace data.

The goal of Profiler is to show the functions or methods taking the most time, it will rarely show you a line of code that is the issue. The reason is Profiler measures from the point of entering a function or method to when it returns out of that function or method. Details of what occurred within that method or function might not be visible. If that method/function has dependency calls or calls to other function or method, then those will be seen.

## Profiling

Given it is known how to hit the slow part of the app, the "Profile Now" button is going to be used to kick off a profiling session while the performance issue is reproduced. The Profile Now button is found by going to the Performance blade and hitting the Profiler button.

This will bring up the Profiler Blade which is where the "Profiler now" button is found. The Profile Now button is just what it sounds — it starts a profiling session which allows the problem known problem to be reproduced and then analyzed. It is also the page you will see recent sessions that were profiled.

After hitting the Profiler now pause a second to let Profiler get spun up, you want to see "Profiling is in progress" prior to reproducing an issue.

Profiler will capture a trace for two minutes at a time. If Profiler is enabled, it will randomly run every hour for two minutes. However, depending on the thresholds configured it could run more if the app exceeds either of these thresholds, CPU or memory. These settings are found when using the "Triggers" button on the Profiler blade.

Traces manually triggered will have a "Triggered By" value of "Profile Now".

### Locating relevant Profiler Data

The Performance blade is often the key to finding the right Profiler session to look at and it helps paint a good picture that can help break down the performance issue.

Click on the desired "Operation Name" in the list of Operation Names. Clicking on the "Profiler Traces" button in the lower right gets you traces specific to that operation. Adjusting the time sliders will have a similar impact with regards to filtering.

Clicking on the "Samples" button at the bottom brings up the "Select a sample operation" blade. The "Profiler traces" button count correlates to manual sessions.

The graph in the End-to-End Transaction blade shows a representation of the code execution. SQL calls show up in the middle portion of the duration.

## Analyzing Profiler Data

### Profiler — Wait Time

Wait Time scenario: code uses `Thread.Sleep()` causing delays rather than CPU work. Modified Privacy() method calls MyReallySlowCall() (which sleeps 10s), then SQL (5s delay via `waitfor delay`), then another sleep loop (5s).

**Key Profiler UI Tips:**
- Default view shows the "hot path" or longest duration path
- Click on "Timeline" header to put in descending order by events (matches End-to-End view better)
- Click "Suggested Events" button to filter to user code only
- NOTE: "Suggested Events" filter may hide dependency call events (e.g., Microsoft.Data.SQLClient). Click the blue X on the "Microsoft." filter box to add SQL events back.
- **Performance Tip** in the box will note "code was mostly waiting" for wait-time scenarios

### Profiler Data — CPU Time

CPU Time scenario: code uses tight processing loops (`while (MyCounter < 5000000000) { MyCounter++; }`) causing high CPU instead of waiting.

**Key differences from Wait Time:**
- No "mostly waiting" comment box appears
- Profiler shows actual code execution time, not I/O waits
- The flame chart column widths represent actual CPU time spent

### Not Enough Information

When Profiler cannot provide enough granularity within a slow method (e.g., a method with hundreds of lines of code and no dependency calls):

**Workaround: Instrument TrackTrace() calls**

Add `TelemetryClient.TrackTrace()` calls at strategic points in the code to create additional measurement points:

```csharp
var telemetry = new TelemetryClient();
telemetry.TrackTrace("Right After Query Completes", SeverityLevel.Information);
// ... more code ...
telemetry.TrackTrace("Half Way Done", SeverityLevel.Information);
// ... more code ...
telemetry.TrackTrace("Exiting Privacy", SeverityLevel.Information);
```

Use the timestamp field of these trace messages to calculate which portion of the code consumed the most time. This is a quick and dirty way to narrow down performance issues when Profiler can't break it down further.

### Flame Graph

Shows more details of the code path. Each method that is called is represented as a bar, and the width represents the amount of time spent in that method. If a method calls other methods, you'll see multiple columns under the calling method.

**To find the code taking the most CPU, look for the widest columns.**

## Miscellaneous

The same Profiler trace can be accessed from different locations. To verify you're looking at the same trace, compare the **Process ID** and **Activity ID** shown at the top of dialogs.

**Recommendation**: Access traces via the Performance blade, filter to the specific operation, then click the "Profiler Traces" button.

---
*Original author: Matthofa, 10/2021*

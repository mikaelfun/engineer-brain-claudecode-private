---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Tools/Analyze Java Dumps and Traces"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FTools%2FAnalyze%20Java%20Dumps%20and%20Traces"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

The following article provides introductory information to initially analyze different kinds of Java dumps and traces, in order to troubleshoot performance issues where the Java Agent is suspect to be driving such behavior.

# Considerations

This information is not exhaustive by any means and rather aims to provide CSS engineers with basic skills to review these diagnostic files and have the ability to make an initial assessment around an issue.

# Troubleshooting Guide (TSG)

## Java Heap Dumps

Java heap dumps are amazing diagnostics to help you determine if memory issues, such as memory leaks, exist in an application and whether the Java Agent is culprit to these behaviors.

### How to open a Java heap dump file?

You can download the Eclipse Memory Analyzer Tool (MAT) from the official website.

1. **Download and Install:**
   - Download the [Eclipse Memory Analyzer Tool (MAT)](https://eclipse.dev/mat/)
2. **Start the Application:**
   - Launch `MemoryAnalyzer.exe`.
3. **Open the .hprof File:**
   - Go to the `File` menu.
   - Select `Open Heap Dump` and choose the .hprof file you want to analyze.

### Troubleshoot memory leak conditions

When you open a `.hprof` file for the first time in MAT, it will generate index files on your disk. This process may take some time.

MAT will then prompt you to generate a Leak Suspects report → click `Finish`.

This report will help you identify the objects that are consuming most heap at the time of the capture.

**Object Histogram**: Create an object histogram and sort by `Retained Heap` to see which objects are consuming the most memory.

**Filter for OpenTelemetry**: Apply a filter for OpenTelemetry-related objects to check if the Java agent is contributing to memory consumption.

## Java Thread Dumps

TBD

## Java Flight Recorder (JFR)

JFR traces can be helpful for many scenarios like determining the root cause for high CPU / high memory consumption, as well as finding the root cause for application slowness.

### How to open a JFR trace file?

1. **Download and Uncompress:**
   - Download the [JDK Mission Control package](https://adoptium.net/fr/jmc/).
   - Uncompress the downloaded file.
2. **Locate and Start JDK Mission Control:**
   - Navigate to the `JDK Mission Control` sub-folder.
   - Find the `jmc.exe` file and start it.
3. **Open the JFR File:**
   - Go to the `File` menu.
   - Select `Open File` and choose the JFR file you want to analyze.

### Troubleshoot high CPU consumption

Once you open the `.jfr` file, you will see the results of the performance rules evaluation.

Performance rules in JDK Mission Control (JMC) are designed to automatically evaluate and analyze the performance of Java applications.

**Key analysis steps:**

1. Check if high CPU was caused by external process vs. the java process itself
2. If caused by app's process, explore the left-hand UI options
3. Navigate to **Method Profiling** section and search for methods related to OpenTelemetry and Application Insights
4. The Method Profiling tab identifies methods consuming the most CPU

**Additional strategies:**

1. **Analyze CPU Load Events**: Navigate to the **Threads** tab to view CPU usage over time. Look for `jdk.CPULoad` events.
2. **Check for Thread Contention**: Examine thread states and stack traces for threads frequently in runnable state but not progressing.
3. **Review Garbage Collection (GC) Activity**: High CPU usage can sometimes be due to excessive garbage collection. Check the **Garbage Collection** tab for frequent or long GC pauses.

# Public Documentation

- [Eclipse Memory Analyzer Tool (MAT)](https://eclipse.dev/mat/)
- [JDK Mission Control package](https://adoptium.net/fr/jmc/)

# Internal References

- [Collect Java Dumps and Traces](/Application-Insights/How-To/Diagnostics-and-Tools/Tools/Collect-Java-Dumps-and-Traces)

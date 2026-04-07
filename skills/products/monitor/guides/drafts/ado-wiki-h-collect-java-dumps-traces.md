---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Tools/Collect Java Dumps and Traces"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FTools%2FCollect%20Java%20Dumps%20and%20Traces"
importDate: "2026-04-05"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
::: 

[[_TOC_]]

#Overview
___
The following article aims to provide general guidelines on the different Java-related dumps and traces that can be collected when investigating memory and/or CPU impacting issues involving the Application Insights Java Agent, as well as slow startup issues. 

#Considerations
___
The collection of Java diagnostics, such as thread or heap dumps, can vary based on the specific scenario and the underlying reasons for troubleshooting. It is essential to assess the situation to determine the appropriate timing and type of information to collect from a Java process. When in doubt, consult with a Subject Matter Expert (SME) or Technical Advisor (TA) for guidance.

#Troubleshooting Guide (TSG)
___
<details><summary>Java Heap Dumps</summary>

<div style="margin:25px">

A **Java heap dump** is essentially a snapshot of the memory of the Java Virtual Machine (JVM) at a specific point in time. It captures all the objects that are currently in memory, along with their data and references.

**Uses of Java Heap Dumps:**
1. **Troubleshooting Memory Leaks**: Heap dumps are invaluable for diagnosing memory leaks. By analyzing the heap dump, you can identify objects that are consuming excessive memory and not being garbage collected.
2. **Optimizing Memory Usage**: They help in understanding the memory usage patterns of your application, allowing you to optimize memory allocation and improve performance.
3. **Analyzing OutOfMemoryError**: When your application runs out of memory, a heap dump can provide insights into what caused the error by showing the state of memory at the time of the crash.
4. **Debugging**: Developers use heap dumps to debug issues related to object creation and memory consumption.

**Tools for Analyzing Heap Dumps:**
- **JVisualVM**: A graphical tool that provides a user-friendly interface for analyzing heap dumps.
- **Eclipse Memory Analyzer (MAT)**: A powerful tool for detailed analysis of heap dumps, helping to find memory leaks and reduce memory consumption.
- **jmap**: A command-line utility that can generate heap dumps for a running JVM process.

<details><summary>Collecting Java Heap Dumps on Windows App Services</summary>

<div style="margin:25px">

Windows App Services expose a built-in option to collect Java Heap dumps from the portal. You can find this by navigating to the web app resource, clicking on "Diagnose and solve problems", and "Diagnostic Tools": 

![image.png](/.attachments/image-861f1c54-8f09-4bcf-aadf-c1edb2e12490.png)

</div>

</details>

<details><summary>Collecting Java Heap Dumps on Linux App Services</summary>

<div style="margin:25px">

1. Go to the Kudu Site of the WebApp via Advanced Tools blade:

   ![image.png](/.attachments/image-ef2ec0af-7e84-4ccb-b209-b48b301bde22.png)

1. Click on SSH to ssh into the application: 

   ![image.png](/.attachments/image-3f1a4fec-d279-419e-a23e-ef58accaf938.png)

1. Get the PID of the Java process by running the following command: `ps -ef | grep java | grep -v grep`

   ![image.png](/.attachments/image-b2b2d2cd-9811-4c0e-b4ce-57f9a78970f2.png)

1. Finally, execute the following command to collect the Heap Dump and save it as a file: `jcmd <PID of Java Process> GC.heap_dump /home/heapdump`

   ![image.png](/.attachments/image-746253d6-d9d6-4c23-84f6-66a14aaa11ec.png)

1. Validate the file was generated: 

   ![image.png](/.attachments/image-07c4c967-e89e-4429-b635-327ffeb9e209.png)

</div>

</details>

<details><summary>Collecting Java Heap Dumps on App Services running Docker containers</summary>

<div style="margin:25px">

To collect Java Heap Dumps on a custom Docker container, follow the same procedure outlined in the Linux App Services instructions. However, it is crucial to select "SSH" when connecting to Kudu. Additionally, ensure that [SSH is enabled on your custom container](https://learn.microsoft.com/azure/app-service/configure-custom-container?tabs=debian&pivots=container-linux#enable-ssh).

</div>

</details>

<details><summary>Collecting Java Heap Dumps when troubleshooting OutOfMemory errors</summary>

<div style="margin:25px">

An `OutOfMemoryError` in Java occurs when the Java Virtual Machine (JVM) cannot allocate enough memory to fulfill a request. This error can lead to application crashes and significantly impact performance. 

To help diagnose and handle `OutOfMemoryError`, you can use the following JVM options:

`-XX:+HeapDumpOnOutOfMemoryError`
This option instructs the JVM to generate a heap dump when an `OutOfMemoryError` occurs. A heap dump is a snapshot of the JVM's heap memory at a specific point in time, which can be analyzed to understand what objects are consuming memory and potentially causing the `OutOfMemoryError`.

`-XX:HeapDumpPath=<path>`
This option specifies the file path where the heap dump should be saved. If you do not specify a path, the heap dump will be saved in the working directory of the JVM process.

**Example Usage**
To enable heap dumps on `OutOfMemoryError` and specify a path for the heap dump file, you can start your Java application with the following options:

```bash
java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/to/dumpfile.hprof -jar your-application.jar
```

In this example:
- `-XX:+HeapDumpOnOutOfMemoryError` enables the heap dump generation.
- `-XX:HeapDumpPath=/path/to/dumpfile.hprof` specifies the location and name of the heap dump file.

</div>

</details>

</div>

</details>

<details><summary>Java Thread Dumps</summary>

<div style="margin:25px">

A **Java thread dump** is a snapshot of all the threads that are running in a Java application at a specific point in time. It provides detailed information about each thread's state, including what each thread is currently doing, whether it is waiting, blocked, or running, and the stack traces of each thread.

**Uses of Java Thread Dumps:**
1. **Diagnosing Performance Issues**: Thread dumps help identify performance bottlenecks by showing which threads are consuming the most CPU or are stuck in long-running operations.
2. **Troubleshooting Deadlocks**: They are essential for detecting deadlocks, where two or more threads are waiting indefinitely for each other to release resources.
3. **Analyzing Concurrency Problems**: Thread dumps can reveal issues related to thread contention, where multiple threads are competing for the same resources, leading to poor performance.
4. **Debugging**: Developers use thread dumps to understand the behavior of threads and to debug issues related to thread execution and synchronization.

**Tools for Capturing and Analyzing Thread Dumps:**
- **jstack**: A command-line utility that captures thread dumps of a running Java process.
- **Java Mission Control (JMC)**: A GUI tool that provides advanced profiling and diagnostics capabilities, including thread dump analysis.
- **JVisualVM**: A graphical tool that allows you to capture and analyze thread dumps.
- **jcmd**: A versatile command-line tool that can capture thread dumps among other diagnostics.

<details><summary>Collecting Java Thread Dumps on Windows App Services</summary>

<div style="margin:25px">

Windows App Services expose a built-in option to collect Java Thread dumps from the portal. You can find this by navigating to the web app resource, clicking on "Diagnose and solve problems", and "Diagnostic Tools": 

![image.png](/.attachments/image-1b061861-b860-4eb2-8b16-efee89a68ca7.png)

</div>

</details>

<details><summary>Collecting Java Thread Dumps on Linux App Services</summary>

<div style="margin:25px">

1. Go to the Kudu Site of the WebApp via Advanced Tools blade:

   ![image.png](/.attachments/image-ef2ec0af-7e84-4ccb-b209-b48b301bde22.png)

1. Click on SSH to ssh into the application: 

   ![image.png](/.attachments/image-3f1a4fec-d279-419e-a23e-ef58accaf938.png)

1. Get the PID of the Java process by running the following command: `ps -ef | grep java | grep -v grep`

   ![image.png](/.attachments/image-b2b2d2cd-9811-4c0e-b4ce-57f9a78970f2.png)

1. Finally, execute the following command to collect the Heap Dump and save it as a file: `jcmd <PID of Java Process> Thread.print > /home/threaddump`

   ![image.png](/.attachments/image-5cc535b0-110e-4c94-b123-0b39083307af.png)

1. Validate the file was generated: 

   ![image.png](/.attachments/image-07c4c967-e89e-4429-b635-327ffeb9e209.png)

Alternatively, you can also collect a thread dump using the `jstack` utility:

1. Identify the Process ID (PID) of the Java Application:

   You need to know the PID of the Java process for which you want to collect the thread dump. You can find the PID using commands likeá`jps`,á`ps`, orá`top`.

2. Run the `jstack` Command:

   Use theá`jstack`ácommand followed by the PID of the Java process to generate the thread dump:

   `jstack <PID> > thread_dump.txt`
   
</div>

</details>

<details><summary>Collecting Java Thread Dumps on App Services running Docker containers</summary>

<div style="margin:25px">

To collect Java Thread Dumps on a custom Docker container, follow the same procedure outlined in the Linux App Services instructions. However, it is crucial to select "SSH" when connecting to Kudu. Additionally, ensure that [SSH is enabled on your custom container](https://learn.microsoft.com/azure/app-service/configure-custom-container?tabs=debian&pivots=container-linux#enable-ssh).

</div>

</details>

<details><summary>Collecting Java Thread Dumps for diagnosing slow startup behaviors</summary>

<div style="margin:25px">

The Java Agent PG team has a [reference](https://github.com/microsoft/ApplicationInsights-Java/wiki/Thread-dump) in their GitHub on the steps to collect a thread dump to diagnose these kinds of issues. 

</div>

</details>

</div>

</details>

<details><summary>Java Flight Recorder</summary>

<div style="margin:25px">

**Java Flight Recorder (JFR)** is a powerful profiling and event collection tool built into the Java Development Kit (JDK). It collects detailed information about the Java Virtual Machine (JVM) and the applications running on it, capturing data on various events such as method executions, memory usage, thread activity, and more.

**Uses of Java Flight Recorder:**
1. **Performance Monitoring**: JFR helps in monitoring the performance of Java applications by recording events that can be analyzed to identify performance bottlenecks.
2. **Troubleshooting**: It is useful for diagnosing issues such as high CPU usage, memory leaks, and application crashes by providing a detailed view of what was happening in the JVM at the time of the issue.
3. **Profiling**: Developers can use JFR to profile their applications, understanding which methods are consuming the most resources and optimizing them accordingly.
4. **Event Analysis**: JFR records a wide range of events, including garbage collection, thread states, and I/O operations, which can be analyzed to gain insights into the application's behavior and performance.

**Tools for Capturing and Analyzing JFR Traces:**
- **Java Mission Control (JMC)**: A GUI tool that works with JFR to visualize and analyze the recorded data. It provides detailed insights into the JVM's performance and helps in identifying issues.
- **jcmd**: A command-line tool that can start and stop JFR recordings, as well as dump the recorded data for analysis.

<details><summary>Application Insights Java Profiler</summary>

<div style="margin:25px">

The easiest method to collect a JFR trace from an app instrumented with the Java Agent is to leverage the profiler feature available from version 3.4.0. More details can be found [here](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-profiler)

</div>

</details>

<details><summary>Collecting Java Flight Recorder traces on Windows App Services</summary>

<div style="margin:25px">

Windows App Services expose a built-in option to collect Java Flight Recorder traces from the portal. You can find this by navigating to the web app resource, clicking on "Diagnose and solve problems", and "Diagnostic Tools": 

![image.png](/.attachments/image-949cd31b-e07d-4184-b57b-3a99566d14b7.png)

</div>

</details>

<details><summary>Collecting Java Flight Recorder traces on Linux App Services</summary>

<div style="margin:25px">

1. Go to the Kudu Site of the WebApp via Advanced Tools blade:

   ![image.png](/.attachments/image-ef2ec0af-7e84-4ccb-b209-b48b301bde22.png)

1. Click on SSH to ssh into the application: 

   ![image.png](/.attachments/image-3f1a4fec-d279-419e-a23e-ef58accaf938.png)

1. Get the PID of the Java process by running the following command: `ps -ef | grep java | grep -v grep`

   ![image.png](/.attachments/image-b2b2d2cd-9811-4c0e-b4ce-57f9a78970f2.png)

1. Finally, execute the following command to collect the Heap Dump and save it as a file: `jcmd <PID of Java Process> JFR.start duration=60s filename=/home/site/wwwroot/recording.jfr`

   ![image.png](/.attachments/image-925cefed-b05b-4ad2-a31c-0189599d3349.png)
   
   Alternatively, you can stop the capture prematurely by running `jcmd <PID of Java Process> JFR.stop`

1. Validate the file was generated: 

   ![image.png](/.attachments/image-73f20ed1-0a54-4d69-9b98-7161f91de39d.png)

Alternatively, you can also control the start and stop time of the JFR traces by running the commands below: 

1. Start the recording:

   `jcmd PID JFR.start filename=recording-PID.jfr`
    
   This command initiates a Java Flight Recorder (JFR) session for the JVM process with the specified PID and saves the recording to `recording-PID.jfr`.

2. Wait a few minutes: 
   
   Allow the JFR to collect profiling data over a period of time.
    
3. Dump the recording data:

   `jcmd PID JFR.dump filename=recording-PID.jfr`
    
   This command dumps the current recording data to the specified file, ensuring the data is saved correctly.

4. Check the recording status:

   `jcmd PID JFR.check`
    
   This command checks the status of the JFR recording and returns information about the current recording, including the recording name.

5. Stop the recording:

   `jcmd PID JFR.stop name=recordingName`
    
   This command stops the JFR recording using the recording name obtained from the `JFR.check` command.

</div>

</details>

<details><summary>Collecting Java Flight Recorder traces on App Services running Docker containers</summary>

<div style="margin:25px">

To collect JFR Traces on a custom Docker container, follow the same procedure outlined in the Linux App Services instructions. However, it is crucial to select "SSH" when connecting to Kudu. Additionally, ensure that [SSH is enabled on your custom container](https://learn.microsoft.com/azure/app-service/configure-custom-container?tabs=debian&pivots=container-linux#enable-ssh).

</div>

</details>

</div>

</details>

#Public Documentation
___
- [Open an SSH session to a container in Azure App Service](https://learn.microsoft.com/azure/app-service/configure-linux-open-ssh-session?pivots=container-linux)
- [Enable SSH on a custom container](https://learn.microsoft.com/azure/app-service/configure-custom-container?tabs=debian&pivots=container-linux#enable-ssh)
- [Collect Java Thread and Heap Dumps](https://techcommunity.microsoft.com/t5/apps-on-azure-blog/collect-thread-dump-and-heap-dump-on-linux-app-service-java/ba-p/3620971)

#Internal References
___
- N/A

___
_Created by: nzamoralopez
Created: November 4th, 2024
Last Modified: February 19th, 2025
Last Modified By: nzamoralopez_
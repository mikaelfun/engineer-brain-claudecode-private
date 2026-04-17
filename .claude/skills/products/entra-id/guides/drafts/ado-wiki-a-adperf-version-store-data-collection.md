---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Version Store issues/Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20Version%20Store%20issues%2FData%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## ADPERF: Version Store Data Collection

- Procdump -ma lsass.exe when we hit the Event ID: 623 (You can collect a 2 Dumps in the span of 2-3 Minutes)
- Directory Services Event Logs

(You can also Attach a Task to the Event ID: 623 to collect a LSASS Dump.)

For Advanced cases or if you need additional data, you may need to use Performance Monitor to view in real-time or collect data for a version store issue using the "Version Buckets Allocated" performance counter. Here are the manual steps. This is likely capture automatically with the ADperf script.

1. Open Performance Monitor
Press Windows + R, type perfmon, and press Enter to open Performance Monitor.

2. Add the Performance Counter
In the left pane, click on "Performance Monitor" under "Monitoring Tools."
Right-click on the graph area in the right pane and select "Add Counters..."
In the "Add Counters" dialog box:
In the "Available counters" section, scroll down and locate "Database Instances(*)" under the "NTDS" or "ESE" category, depending on the server setup.
Expand "Database Instances(*)" and select "Version Buckets Allocated".
Click "Add >>" to move it to the "Added counters" section.
Select the specific instance(s) you want to monitor if applicable (e.g., NTDS).
Click "OK" to add the counter to the graph.

3. Monitor the Counter
The "Version Buckets Allocated" counter will now appear in the Performance Monitor graph.
Observe the graph for any consistent or sudden spikes in the number of version buckets allocated.
Take note of the values, particularly if they approach the configured maximum (around 12,000 buckets or 400 MB by default).

4. Log the Performance Data
To log this data over time, you can create a Data Collector Set:
In the left pane, right-click "Data Collector Sets" under "Performance Monitor", and choose "New" > "Data Collector Set".
Name your Data Collector Set (e.g., "Version Store Monitoring") and choose "Create manually (Advanced)".
Select "Performance Counter" and click "Next".
Click "Add...", and repeat the steps to add the "Version Buckets Allocated" counter.
Configure the sample interval (e.g., every 15 seconds) and click "OK".
Choose where to save the data, then click "Finish".

5. Correlate with Event Logs
Check the Directory Services event log for relevant events (e.g., Event IDs 623 and 1519) to correlate the performance data with logged issues.

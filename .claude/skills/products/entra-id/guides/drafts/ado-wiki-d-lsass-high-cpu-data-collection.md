---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Lsass High CPU/Customer-Ready \"How To\" Collect Data"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20Lsass%20High%20CPU%2FCustomer-Ready%20%22How%20To%22%20Collect%20Data"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Lsass High CPU Customer-Ready Data Collection Steps

## Perfmon: Active Directory Collector Set

### Gather Active Directory Data Collector Set data
If a domain controller is identified to have a performance problem, you may gather Active Directory Data Collector Set data to help evaluate domain controller operations during the 5-minute sampling period of the collector. It is important to trigger this data collector while the domain controller is actively experiencing slow LDAP response times.

1. Click Start, click Administrative Tools, and then click Reliability and Performance Monitor.
2. Double-click Data Collector Sets, double-click System, right-click Active Directory Diagnostics, and then click Start.
3. The collector will automatically gather performance and diagnostic data and stop after 5 minutes. Then, it will compile the data into a report.
4. The contents of the `c:\perflogs\adds\<DATE>` folder may be compressed and uploaded to our workspace.

The report (located within the nodes "Reports", "System", "Active Directory Diagnostics", <date>) will detail what activities are being performed by the Active Directory service and other processes running on the server.

For more information:
http://blogs.technet.com/b/askds/archive/2010/06/08/son-of-spa-ad-data-collector-sets-in-win2008-and-beyond.aspx

### Turn up Field Engineering Debug level
- Change the debug level for Field Engineering to level 5: https://support.microsoft.com/en-us/kb/314980
- Extend the Directory Services Event log size to 400mb to capture additional 1644 events
- Change the LDAP Inefficient Search Result Threshold to 50ms: regkey found here: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\NTDS\Parameters\Inefficient Search Results Threshold`

For more information:
http://blogs.technet.com/b/askpfeplat/archive/2015/05/11/how-to-find-expensive-inefficient-and-long-running-ldap-queries-in-active-directory.aspx

### Setting up a Larger Perfmon to catch intermittent issues

Detailed performance data is helpful if we wish to evaluate if the slow response times are due to overhead while the domain controller performs internal operations. For example, we wish to evaluate if the slow operations occur because of the searching of non-indexed attributes or another system on the network is overloading the domain controller.

Steps to create a custom data collector set:
1. Open Performance area in Computer Management under data collector sets folder
2. Right-Click the "User defined" Folder and select "New\Data Collector Set"
3. Give the set a decent name
4. Select the System AD Data Collector as the template
5. Click "Finish"
6. Right-click the new set and select "Data Manager..." to customize:
   - Change deletion strategy to "delete oldest"
   - Set maximum size to 4GB+ (adjust as needed)
7. Start via GUI or command line: `Logman start "Big AD Data Collector Set"`

The collector stops automatically after five minutes.

To generate a report later:
```
tracerpt *.blg *.etl -df PerfmonSchemaFileName.xsl -report your_report.html -f html
```

## Xperf/WPR

### Installing Xperf/WPR
1. Download Windows SDK from: http://msdn.microsoft.com/en-US/windows/desktop/bg162891
2. Install only "Windows Performance Toolkit"
3. Disable paging executive (requires reboot):
   - Navigate to: `HKLM\System\CurrentControlSet\Control\Session Manager\Memory Management`
   - Set "DisablePagingExecutive" from 0 to 1
   - Restart

### Option 1: High CPU Collection with Xperf (least intrusive)

Start trace:
```
xperf -on PROC_THREAD+LOADER+PROFILE+INTERRUPT+DPC -stackwalk Profile -BufferSize 1024 -MinBuffers 526 -MaxBuffers 1024 -MaxFile 1024 -FileMode Circular
```

Reproduce the issue, then stop:
```
xperf -stop -d Highcpu.etl
```

**NOTE**: this won't run at the same time as ADPERF Data collector set because they both use the same kernel logger name (default). To capture WPR trace at the same time as ADPERF data use wpr.exe or wprui.exe.

### Option 2: use WPRUI.exe (more heavy/collects more data)

1. Run "Windows Performance Recorder" or `C:\Program Files (x86)\Windows Kits\8.1\Windows Performance Toolkit\WPRUI.exe`
2. Configure settings: always change logging mode to FILE (not memory)
3. Click "Run"
4. Allow the tool to collect data for 3-5 minutes
5. Stop the tracing by hitting the "Save button"
6. Add a description to the issue (Lsass_high_CPU)
7. Note the save location and click save

---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Dependencies/AVD/Geneva Agent/Geneva monitoring agent troubleshooting missing information RTT Bandwidth"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FDependencies%2FAVD%2FGeneva%20Agent%2FGeneva%20monitoring%20agent%20troubleshooting%20missing%20information%20RTT%20Bandwidth"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Geneva Monitoring Agent Check
=============================

The Geneva Monitoring platform enables services to do Monitoring, Diagnostics and Analytics at scale. It is designed to support the requirements of services built on Azure, AutoPilot, Pilotfish or GFS/Baremetal environments. Geneva is a compliant offering (Azure and Office365) and available in all national clouds. It natively integrates with IcM, ExpressV2 for deployments, Azure Watson for compliant dump collection, Geneva Actions for compliant live site management amongst others.
Geneva maximizes the availability and performance of applications and services with a comprehensive solution for collecting, analyzing, and acting on telemetry across your cloud and on-premises environments. Large parts of the Geneva infrastructure (e.g. Agents, Metrics, Health System, Pipeline) are utilized to power Microsoft external monitoring offering - Azure Monitor.
Detailed documentation can be located[here](http://aka.ms/GenevaDocs).

Geneva Monitoring Agent
-----------------------

* * *

Process that collects data from a node (session host and/or VM) and pushes that data to the Geneva pipeline.
More details[here](http://aka.ms/Geneva/Agent)

# Scenarios:

Health Check
------------

* * *

RD Infra agent running at session host (VM) is executing periodic check for_health_of said Geneva monitoring agent. Check is non-intrusive and relies heavily on stored settings to recognize what should be running and how to perform and attempt automatic recovery in some cases. Health check only reports that customer's machine**needs assistance**when unable to retrieve information confirming health of monitoring agent.
One of possible recognition is based on event raised by check itself.

![image.png](/.attachments/image-f63bc741-b7f0-4a3b-bea3-63cbef147e2e.png)

1.Verify Monitoring agent is installed.
*   Go to`C:\Program Files\Microsoft RDInfra`and verify agent was installed successfully and that folder**RDMonitoringAgent...**exists.
![image.png](/.attachments/image-fa6d9ec0-5995-4d84-a78b-5233c0b6faed.png)

2.Verify Monitoring agent environment variables exist.
*   Open elevated command prompt and enter command:**set MON**
![image.png](/.attachments/image-0f48f538-e383-4cdd-ad8f-3965fffd5b13.png)

3.Verify Monitoring agent scheduled task is running.
*   Open Task Scheduler and check root for task presence.
![image.png](/.attachments/image-52e5b57e-1bd2-42dd-be3e-925b94b67f9c.png)

````
## NOTE
More tasks with name starting Geneva may exists.
One task**`MUST`**be enabled and running!
If the scheduled task status is stuck in "starting" there is something on the computer that is preventing the scheduled task from starting under SYSTEM account at startup. This is not AVD issue and needs to be fixed by CSS.
````

4.Verify Monitoring agent tables exist locally.
*   Open explorer and go to`C:\Windows\System32\config\systemprofile\AppData\Roaming\Microsoft\Monitoring\tables`.
![image.png](/.attachments/image-c84704fc-c4ea-481e-ae3e-0289e9d1f246.png)

# Mitigations
1. ### Mitigate by forcing certificate refresh

* * *

In rare cases, WVD agent may fail to ensure valid certificate is present for Geneva agent to authenticate against its platform, leading to its failure to start. WVD attempts to refresh certificate after RD Infra Agent restart, then 20 minutes later and then finally every 12 hours for a remainder of WVD agent execution.
In all cases, to forcefully refresh expired certificate, do the following:
1.  Start -> Run -> certlm.msc -> Expand Personal and select Certificates
    1.  Delete all certificates**when no valid certificate**issued to RDSAgent.WVD exists.
![image.png](/.attachments/image-326ba004-4b47-45e4-b3c1-67ebc77ea08c.png)
    2. 1.  **`*This* mitigation is not needed with valid certificate existance!`**
2. 1.  Restart RD Agent Bootloader service.
    1.  net stop rdagentboolader
    2.  net start rdagentbootloader
2.  Wait up to 30 minutes for new cert to be downloaded and installed.

2. ### Mitigate by starting scheduled task

* * *

In rare cases, WVD agent may fail to ensure that scheduled task responsible for monitoring agent execution lifetime management is started/running. WVD attempts to start this task right after RD Infra Agent restarts in case it was not running.
In all cases, to ensure task execution, do the following:
1.  Start -> Run -> taskschd.msc
    1.  Ensure**_one_enabled**task exists and start it when not running already.
        
    2.  If no`Geneva...`task is present, or if all tasks with`Geneva..`name are disabled, follow these[steps](https://eng.ms/docs/experiences-devices/wd-windows/wcx/avd/azure-virtual-desktop/internal-documentation/documentation/sessionhost/healthchecks/monitoringagentcheck#mitigate-by-reinstalling-monitoring-agent)to reinstall monitoring agent manually.
        
2.  Wait up couple minutes and refresh`Task Scheduler`view ensuring task remains running.
![image.png](/.attachments/image-d6d7831b-4821-4323-979f-493883b8a416.png)


3. ### Mitigate by reinstalling monitoring agent

* * *

In rear cases, when no other mitigations worked, reinstall manually is an option. RD Infra Agent attempts to keep monitoring running and up to date each time it starts, but in case it fails, following are steps to take in order to reinstal.
1.  Verify Monitoring Agent MSI is present
    *   Go to`C:\Program Files\Microsoft RDInfra`and verify agent installation file is present (Microsoft.RDInfra.Geneva.Installer-x64...)
![image.png](/.attachments/image-315e953b-a390-4aef-addf-eff02925e832.png)

2. Run following command

    msiexec /fa "C:\Program Files\Microsoft RDInfra\Microsoft.RDInfra.Geneva.Installer-x64-44.3.1.msi" /quiet /qn /norestart /l*+! "C:\Program Files\Microsoft RDInfra\ManualGeneva.txt"

 3.  Inspect ManualGeneva.txt for installation succeess
    
4.  Inspect Task Scheduler for task state (and start if not running)
![image.png](/.attachments/image-f795d78b-f40a-451e-ae2a-0c5c62d14a56.png)





Engineering documentation link:
[Windows Virtual Desktop Session Host Geneva Monitoring Agent Check | Windows Virtual Desktop Internal Documents](https://eng.ms/docs/experiences-devices/wd-windows/wcx/avd/azure-virtual-desktop/internal-documentation/documentation/sessionhost/healthchecks/monitoringagentcheck)

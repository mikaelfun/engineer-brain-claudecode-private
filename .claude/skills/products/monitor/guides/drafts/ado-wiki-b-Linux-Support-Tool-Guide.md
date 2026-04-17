---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/How-To/Linux Support Tool Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/How-To/Linux%20Support%20Tool%20Guide"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

# Overview
---
The OMS Agent for Linux Troubleshooter is a script to either be installed manually (below) or upon installation of the OMS Agent (for future release soon), and can be run in order to help find and diagnose issues in the agent.


# How to Get Started
---
1. Download the troubleshooter through the wget command below onto the Linux machine containing OMS:
```
        $ wget "https://raw.githubusercontent.com/microsoft/OMS-Agent-for-Linux/master/source/code/troubleshooter/omsagent_tst.tar.gz"
Or
        $ wget " https://github.com/microsoft/OMS-Agent-for-Linux/blob/master/source/code/troubleshooter/omsagent_tst.tar.gz"
```
 
2. Unzip it using the following command:
```
	$ tar -xzvf omsagent_tst.tar.gz
```
3. Run the installation script:
```
	$ sudo ./install_tst
```
4. If installed successfully, the troubleshooter can be run using the following command:
```
	$ sudo /opt/microsoft/omsagent/bin/troubleshooter
```

## IMPORTANT
The **troubleshooter** might not run if **gdb** (GNU Debugger) is not installed on the Linux machine - so you might see this error:


<font color="red">_Program 'gdb' not installed._</font>

![image.png](/.attachments/image-d6c8998a-2270-4c95-8bea-981934f7e2c4.png)

If this error appears, then please install **gdb** on the Linux machine. 

One of the below commands should install it, depending on what Linux distribution is present on the VM:

For RedHat, CentOS:
```
	$ sudo yum install gdb
```

For SUSE:
```
	$ sudo zypper install gdb
```

For Ubuntu:
```
	$ sudo apt-get install gdb
```








# Dependencies
---
The OMS Troubleshooter requires **Python 2.6+** installed on the machine, but will work with either Python2 or Python3. In addition, **gdb is required**, as well as the following Python packages:
| Python Package | Required for Python2? | Required for Python3? |
| --- | --- | --- |
| copy | **yes** | **yes** |
| errno | **yes** | **yes** |
| os | **yes** | **yes** |
| platform | **yes** | **yes** |
| re | **yes** | **yes** |
| socket | **yes** | **yes** |
| ssl | **yes** | **yes** |
| subprocess | **yes** | **yes** |
| urllib2 | **yes** | no |
| urllib.request | no | **yes** |


# Why It's Valuable
---
![image.png](/.attachments/image-8d660ee3-298f-479f-861f-7541e9cce500.png)


# Scenarios Covered
---
1. Agent is unhealthy, heartbeat doesn't work properly
	* Verify agent is installed / connected
	* Check if running multi-homing (multi-homing is not supported yet)
	* Verify OMSAgent is currently running
	* Start / restart OMSAgent if necessary
	* Check if OMSAgent is encountering an error in omsagent.log
2. Agent doesn't start, can't connect to Log Analytic Services
	* Ask about error codes encountered during onboarding
	* Verify agent is installed
	* Check omsadmin.conf
	* Check internet connectivity
	* Check agent service endpoint connectivity
	* Check log analytics endpoints connectivity
	* Run queries to see if logs are flowing
3. Agent syslog isn't working
	* Verify agent is installed / connected / healthy
	* Check if machine is running rsyslog or syslog-ng
	* Check 95-omsagent.conf for configuration errors
	* Check syslog.conf for configuration errors
	* Verify data is being sent to port
4. Agent has high CPU / memory usage
	* Verify agent is installed / connected / healthy
	* Check if logs are rotating correctly with logrotate
	* Check if OMI is running at 100% CPU
	* Check if slab memory / dentry cache usage is erroring
5. Agent having installation issues
	* Ask about error codes encountered during installation
	* Check OS version is supported
	* Check disk space
	* Check package manager
	* Check package installation (DSC, OMI, SCX)
	* Check OMS version
	* Check location / permissions on files
	* Check certificate and RSA key
6. Agent custom logs aren't working
	* Ask user if running custom logs
	* Verify agent is installed / connected / healthy
	* Check if agent has pulled configuration from OMS backend
	* Check customlog.conf for configuration errors
	* Parse through custom logs for errors
7. (A) Run all scenarios
	* Run through scenarios 1-6 in the following order: 5, 2, 1, 4, 3, 6
8. (L) Collect logs
	* Run OMS Agent Log Collector
9. No issues found
	* Tell customer what information to collect



# Misc
---
* Screenshot of the installation scenario:

<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=/.attachments/tst_install_scenario-4066c324-6648-4b17-8680-45963585c9d6.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="tst_install_scenario.png"/>
	
* Location upon installation: **/opt/microsoft/omsagent/bin/troubleshooter**


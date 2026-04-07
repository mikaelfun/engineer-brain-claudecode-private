---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Troubleshooting Guides/Troubleshooting Issues related to high CPU or Memory consumption by OMS Agent or its subcomponents"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/Troubleshooting%20Guides/Troubleshooting%20Issues%20related%20to%20high%20CPU%20or%20Memory%20consumption%20by%20OMS%20Agent%20or%20its%20subcomponents"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
# Scenario
---
The Customer reports high CPU/Memory consumption for omsagent or its subcomponents like: OMI or SCX
# Details
---

When we encounter CPU/memory issues for omsagent, mostly its related to subcomponents of the agent like NPMD, OMI or others. It can also be caused if customers are pushing the agent outside of its capabilities (for example EPS above supported rate, poorly configured custom log rules etc.). In such scenarios we need to start the investigation by narrowing down to the exact process which is consuming high CPU/memory and investigate in that tangent.
# Troubleshooting steps
---
1. Identify the process which is consuming high CPU/memory by running "top" command and checking the process name.
By default, the processes are sorted wrt to CPU utilization. The initial entries of output would reflect the processes consuming high CPU (attach screenshot)
To sort the entries for memory utilization, press Shit+M. Now refer the initial entries of output to check the process consuming high memory (attach screenshot)

2. If omsagent process is consuming high CPU/memory, then start by checking the configuration of omsagent and the data sources enabled. Some of the checks are mentioned below:
   - Check if the EPS is above supported rate. You can refer [How to: Change Rate Limits and Caching - Linux Agent](/Monitor-Agents/Agents/OMS-Agent-for-Linux-\(omsagent\)/How%2DTo/How-to:-Change-Rate-Limits-and-Caching-%2D-Linux-Agent) document for more information on rate limits of omsagent.
   - Verify the configuration of custom log rules and the amount of data ingested from the target log files. If customer has large number of files being captured by one custom log rule, it's possible that the tailfilereader process is getting hung leading to high resource consumption. The max cap varies based on the machine, but anything over 100 files caught by one rule, or 5k EPS, could cause this issue. You can refer[Troubleshooting Custom Logs - Linux Agent](/Monitor-Agents/Agents/OMS-Agent-for-Linux-\(omsagent\)/Troubleshooting-Guides/Troubleshooting-Custom-Logs-%2D-Linux-Agent) wiki for more details.

3.If CPU/Memory consumption is specific to omi/scx, then collect omsagent logs following the steps mentioned in [Linux Support Tool Guide](/Monitor-Agents/Agents/OMS-Agent-for-Linux-\(omsagent\)/How%2DTo/Linux-Support-Tool-Guide) document. 

**High CPU consumption by OMI/SCX:**

In addition to omsagent logs, we also need the CPU information of the omiagent process. Hence need to get the stack trace of omisagent when exceeding a certain threshold.

**STEPS**:

a.	Check omi/scx/ version


For rpm based machines(RHEL, Oracle, CentOS, Fedora)
`````
rpm -qa | grep omi
rpm -qa | grep scx
`````
For Ubuntu/Debian machines
````
apt list -a omi
apt list -a scx
````

b.	Check if omi/scx is working normally by executing below commmands:
````
/opt/omi/bin/omicli id
/opt/omi/bin/omicli ei root/scx SCX_Agent
````

**Expected result:** If the result contains "**instance of**", it means omi/scx is work normally without any issues.

c.	Check openssl version(**Command**: openssl version) and then install omi symbol version by following the steps mentioned below:

-->**If OpenSSL version 1.0.x:** 
                       
1) copy \\cdmbuilds\Archive\OnPrem\XPLAT\OSTCData\builds\omi\release\1.6.6-0\Linux_ULINUX_1.0_x64_64_Release\openssl_1.0.0\omi-1.6.6-0.ssl_100.ulinux.x64.withsymbols.rpm to impacted machine.

2)Run below command:
```
 rpm -i omi-1.6.6-0.ssl_100.ulinux.x64.withsymbols.rpm --force
```

-->**If OpenSSL version 1.1.x:** 

1) copy \\cdmbuilds\Archive\OnPrem\XPLAT\OSTCData\builds\omi\release\1.6.6-0\Linux_ULINUX_1.0_x64_64_Release\openssl_1.1.0\omi-1.6.6-0.ssl_110.ulinux.x64.withsymbols.rpm to impacted box.

2) Run below command:
```
 rpm -i omi-1.6.6-0.ssl_110.ulinux.x64.withsymbols.rpm --force
```

d. Enable omi/scx logging through below commands:

```

sed -i 's/#loglevel = WARNING/loglevel = INFO/g'

/etc/opt/omi/conf/omiserver.conf

scxadmin -log-set all verbose

/opt/omi/bin/service_control restart
```

e. Wait the issue to reproduce.

f. Download the script

wget https://raw.githubusercontent.com/microsoft/OMS-Agent-for-Linux/master/tools/LogCollector/source/omiHighCPUDiagnostics.sh

g. Run diagnostics for 24 hours with 30% CPU threshold
```
bash omiHighCPUDiagnostics.sh --runtime-in-min 1440 --cpu-threshold 30
```
f. Collect above logs generated by diagnostics script and logs under /var/opt/omi/log and /var/opt/microsoft/scx/log 

**High Memory consumption by OMI/SCX:**

In addition to collecting omsagent, we also need omiagent process's memory information.

**STEPS**:

a. Find out the high memory pid by executing below command:

       ps -aux|grep omiagent

b. Once found the pid, for example, 6864 is the highest memory omiagent process, then run below command:
```
       
lsof -p 6864
```
7.	From above command output we will get the provider details. 
8.	Collect above outputs and output of command: "dmesg"

**Note**: There is a familiar memory related issue which generated below error messages in \var\log\messages:

**Error messages:**
```
Line 2318: Sep 18 14:31:35 bfticker1 kernel: omiagent[1773]: segfault at 7f3c2d225e00 ip 00007f3c2d225e00 sp 00007f3c27107d50 error 14 in libnss_dns-2.17.so[7f3c2d3ad000+5000]
```

If customer observes similar behaviour, then they can use following steps to upgrade dsc to fix this issue.

Steps:

a. Download the new release version of dsc from:https://github.com/microsoft/PowerShell-DSC-for-Linux/releases
```
wget https://github.com/microsoft/PowerShell-DSC-for-Linux/releases/download/v1.2.1-0/dsc-1.2.1-0.ssl_100.x64.rpm  
```
b. Upgrade package

```
yum upgrade dsc-1.2.1-0.ssl_100.x64.rpm
```
**Related ICM:** 

Incident-148142032(https://portal.microsofticm.com/imp/v3/incidents/details/148142032/home)

**Related GitHub Issue:** DSC extension cause omiagent to segfault � Issue #875 � Azure/azure-linux-extensions (github.com)

#PG Escalation Path
---
<Pending - WIP>







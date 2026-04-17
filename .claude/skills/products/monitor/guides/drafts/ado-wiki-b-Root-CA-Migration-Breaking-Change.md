---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Breaking Change - Log Analytics Root CA Migration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/Troubleshooting%20Guides/Breaking%20Change%20-%20Log%20Analytics%20Root%20CA%20Migration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

#Root CA Change Overview
***

As of June 1 2024, Log Analytics back-end will no longer be accepting connections from MMA that reference an outdate root certificate. These MMAs are older versions prior to the Winter 2020 release (Log Analytics) and prior to SCOM 2019 UR3 (SCOM). Any version, Bundle: 10.20.18053 / Extension: 1.0.18053.0, or greater will not have any issues, as well as any version above SCOM 2019 UR3. Any agent older than that will break and no longer be working and uploading to Log Analytics. 

#What exactly is changing?
***
As part of an ongoing security effort across various Azure services, Azure Log Analytics will be officially switching from the Baltimore CyberTrust CA Root to the [DigiCert Global G2 CA Root](https://www.digicert.com/kb/digicert-root-certificates.htm). This change will impact TLS communications with Log Analytics if the new DigiCert Global G2 CA Root certificate is missing from the OS, or the application is referencing the old Baltimore Root CA. **What this means is that Log Analytics will no longer accept connections from MMA that use this old root CA after it's retired.**


This change impacts both Log Analytics branch MMA versions, as well as SCOM branch MMA versions. Please read through the article below to understand which versions include the fix and how to handle support cases and questions related to this change. 

#Why does this impact the SCOM agent and Log Analytics Agent (MMA)? 
****
The Microsoft Monitoring Agent relies on certificate pinning, meaning the root certificate being used is essentially hardcoded into the agent. Because older versions of the Microsoft Monitoring Agent (both SCOM and Log Analytics branch) have certificate pinning pointing only to the old root CA, once the change occurs on the Log Analytics side those agents will no longer be able to communicate with Log Analytics. 

Newer versions of the Microsoft Monitoring Agent have been modified to include references to the updated root certificate and will not be impacted. SCOM customers will only be impacted if they have configured their agent to point to Log Analytics workspace. 


#When is this happening?
***
>**June 1st, 2024**

The official date of the change is slated for the above. 


#Which versions of the agent are impacted? 
***
##SCOM
Any SCOM agent/management server version older than SCOM 2019 UR3 is impacted. This includes ALL SCOM 2016 and 2012R2 versions. To be clear, if your customer is using the SCOM agent your customer MUST be on SCOM 2019 UR3 or higher. 

If your customer is instead using the Log Analytics agent branch in their SCOM Windows infrastructure (10.20.x.x)  they must be on 10.20.18053 at a minimum. Any versions higher than this will not be impacted by the change. 

>If your SCOM customer doesnt have their MMA or management group configured to send data to Log Analytics, there is no impact.


<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;background-color:#fdddd9">
<font size=5></font>
<b>Note</b>: The SCOM agent version displayed in the Heartbeat table in Log Analytics always shows the base product version, that is, SCOM 2019 RTM (10.19.10014.0) or SCOM 2022 RTM (10.22.10056.0), even if the client has a higher Update Rollup version installed.
 <br><br>
If the client questions the version number difference between what is shown in the SCOM console and the Heartbeat table, inform them that this is by design and has no impact if the version seen in the SCOM console includes the fix (SCOM 2019 Update Rollup 3 or later).
</div>



##Log Analytics
Any version, Bundle: 10.20.18053 / Extension: 1.0.18053.0, or greater will not have any issues. Any agent older than that will break and no longer be working and uploading. See [here](https://learn.microsoft.com/azure/virtual-machines/extensions/oms-windows?toc=%2Fazure%2Fazure-monitor%2Ftoc.json#agent-and-vm-extension-version) for Agent versions.


#MMA Versions with the Fix
****
The below agent versions include the fix for the new root certificate and will continue to report to Log Analytics after the change:

**SCOM 2019 Management Server Build versions With Fix:**
| **Build Number** | **KB**                                                                                                                                            | **Release Date** | **Description**                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------- |
| 10.19.10505.0    | [**4594078**](https://support.microsoft.com/topic/a7b9aa06-7d72-dc5a-e303-1899fafe9931)                                                           | Mar-21           | Update Rollup 3                          |
| 10.19.10550.0    | [**5006871**](https://support.microsoft.com/topic/5006871-0e3a513a-ad80-4830-8984-2fc5a40ee7f7)                                                   | Oct-21           | Update Rollup 3 - Hotfix for Web Console |
| 10.19.10552.0    | [**5005527**](https://support.microsoft.com/topic/f5aa7ec5-85c2-4886-b13b-288fd9900737)                                                           | Oct-21           | Update Rollup 3 - Hotfix Oct 2021        |
| 10.19.10569.0    | [**5013427**](https://support.microsoft.com/topic/update-rollup-4-for-system-center-operations-manager-2019-07ad0ef3-a330-4373-92f6-2dda3821bee5) | Jun-22           | Update Rollup 4                          |                                                                                                                                                                                                 |                                                                  |
| 10.19.10606.0 | [**5025123**](https://support.microsoft.com/kb/5025123) | April 2023   | Update Rollup 5                                                                                                                                                                                                              |
| 10.19.10615.0 | [**5029601**](https://support.microsoft.com/kb/5029601) | July 2023    | GB compliance                                                                                                                            |
| 10.19.10618.0 | [**5028684**](https://support.microsoft.com/kb/5028684) | August 2023  | SCX Compiler Mitigated Packages                                                                                                          |
| 10.19.10649.0 | [**5035285**](https://support.microsoft.com/kb/5035285) | March 2024   | Update Rollup 6                                                                                                                          |
| 10.19.10652.0 | [**5037360**]( https://support.microsoft.com/kb/5037360) | April 2024   | Update Rollup 6 Hotfix - Introduces support for crypto policies in FIPS mode, specifically tailored for users monitoring Linux workloads |


**SCOM 2019 Agent Build Versions with Fix:**
| **Build Number** | **KB**                                                                                                                                            | **Release Date** | **Description**                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------- |
| 10.19.10177.0    | [**4594078**](https://support.microsoft.com/topic/a7b9aa06-7d72-dc5a-e303-1899fafe9931)                                                           | Mar-21           | Update Rollup 3                   |
| 10.19.10185.0    | [**5005527**](https://support.microsoft.com/topic/f5aa7ec5-85c2-4886-b13b-288fd9900737)                                                           | Oct-21           | Update Rollup 3 - Hotfix Oct 2021 |
| 10.19.10200.0    | [**5013427**](https://support.microsoft.com/topic/update-rollup-4-for-system-center-operations-manager-2019-07ad0ef3-a330-4373-92f6-2dda3821bee5) | Jun-22           | Update Rollup 4                   |
| 10.19.10211.0 | [**5025123**](https://support.microsoft.com/kb/5025123) | Apr-23 | Update Rollup 5 |
| 10.19.10253.0 | [**5035285**](https://support.microsoft.com/kb/5035285) | Mar-24 | Update Rollup 6 |


**SCOM 2022 Management Server Build versions With Fix:**
| **Build Number** | **Release Date** | **Description**      |
| ---------------- | ---------------- | -------------------- |
| 10.22.10118.0    | Mar-22           | General Availability |
| 10.22.10337.0 | December 2022 | Update Rollup 1                                                                                                                           |
| 10.22.10337.0 | December 2022 | Update Rollup 1 - Console Hotfix                                                                                                          |
| 10.22.10448.0 | March 2023    | Update Rollup 1 - OpenSSL3.0 integration Hotfix                                                                                           |
| 10.22.10565.0 | July 2023     | Discover Azure Migrate in Operations Manager                                                                                              |
| 10.22.10575.0 | July 2023     | GB compliance                                                                                                                             |
| 10.22.10560.0 | August 2023   | SCX Compiler Mitigated Packages  This package is not cumulative; apply KB5024286 as a prerequisite.                                       |
| 10.22.10610.0 | November 2023 | Update Rollup 2                                                                                                                           |
| 10.22.10618.0 | December 2023 | Update Rollup 2 Hotfix - Addresses Linux monitoring issues.                                                                               |
| 10.22.10684.0 | April 2024    | Update Rollup 2 Hotfix - Introduces support for crypto policies in FIPS mode, specifically tailored for users monitoring Linux workloads. |

**SCOM 2022 Agent Build Versions with Fix:**
| **Build Number** | **Release Date** | **Description**      |
| ---------------- | ---------------- | -------------------- |
| 10.22.10056.0    | Mar-22           | General Availability |
| 10.22.10110.0 | December 2022 | Update Rollup 1        |
| 10.22.10208.0 | November 2023 | Update Rollup 2        |
| 10.22.10215.0 | November 2023 | Update Rollup 2 hotfix |

**Log Analytics Build Versions with the Fix:**

| **Log Analytics Windows agent version** | **Log Analytics Windows VM extension version** | **Release Date** |  
| --------------------------------------- | ---------------------------------------------- | ---------------- |  
| 10.20.18067.0                           | 1.0.18067                                      | Mar-22           |  
| 10.20.18064.0                           | 1.0.18064                                      | Dec-21           |  
| 10.20.18062.0                           | 1.0.18062                                      | Nov-21           |  
| 10.20.18053                             | 1.0.18053.0                                    | Oct-20           |  
                                    
#What should my customer do if they are on an outdated version?
****
<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:80%;border-radius:10px;background-color:#efd9fd">
 Customers using SCOM only have to upgrade if they want to upload data to Log Analytics. Customers not using this feature are not impacted and their environment will continue to function as normal. 
</div>

**Get a list of outdated agents**

Run the following PowerShell script on a SCOM management server to get a list of outdated agents:

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="color:blue;background:white">Import-Module </SPAN><SPAN style="color:blueviolet;background:white">OperationsManager</SPAN></P>



<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="background:white">&nbsp;</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="color:#A82D00;background:white">$agents </SPAN><SPAN style="color:dimgray;background:white">=</SPAN><SPAN style="color:black;background:white"> @{}</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="background:white">&nbsp;</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="color:blue;background:white">Get-SCOMAgent </SPAN><SPAN style="color:dimgray;background:white">| </SPAN><SPAN style="color:blue;background:white">foreach</SPAN><SPAN style="color:black;background:white"> {</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="background:white">&nbsp;</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="color:black;background:white"><SPAN> </SPAN></SPAN><SPAN style="color:#A82D00;background:white">$version </SPAN><SPAN style="color:dimgray;background:white">= </SPAN><SPAN style="color:blue;background:white">New-Object
</SPAN><SPAN style="color:blueviolet;background:white">System.Version </SPAN><SPAN style="color:navy;background:white">-ArgumentList </SPAN><SPAN style="color:#A82D00;background:white">$_</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Version</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="background:white">&nbsp;</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="color:black;background:white"><SPAN> </SPAN></SPAN><SPAN style="color:darkblue;background:white">if</SPAN><SPAN style="color:black;background:white"> (</SPAN><SPAN style="color:#A82D00;background:white">$version</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Major </SPAN><SPAN style="color:dimgray;background:white">-lt
</SPAN><SPAN style="color:purple;background:white">10</SPAN><SPAN style="color:black;background:white">) {</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt;color:black"><SPAN style="background:white"><SPAN> </SPAN></SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="color:black;background:white"><SPAN>
</SPAN></SPAN><SPAN style="color:#A82D00;background:white">$agents</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Add(</SPAN><SPAN style="color:#A82D00;background:white">$_</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">PrincipalName</SPAN><SPAN style="color:dimgray;background:
white">, </SPAN><SPAN style="color:#A82D00;background:white">$_</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Version)</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt;color:black"><SPAN style="background:white"><SPAN> </SPAN>}</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="color:black;background:white"><SPAN> </SPAN></SPAN><SPAN style="color:darkblue;background:white">elseif</SPAN><SPAN style="color:black;background:white"> (</SPAN><SPAN style="color:#A82D00;background:white">$version</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Major </SPAN><SPAN style="color:dimgray;background:white">-eq
</SPAN><SPAN style="color:purple;background:white">10 </SPAN><SPAN style="color:dimgray;background:white">-and </SPAN><SPAN style="color:#A82D00;background:white">$version</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Minor </SPAN><SPAN style="color:dimgray;background:white">-eq </SPAN><SPAN style="color:purple;background:white">19 </SPAN><SPAN style="color:dimgray;background:white">-and </SPAN><SPAN style="color:#A82D00;background:white">$version</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Build </SPAN><SPAN style="color:dimgray;background:white">-lt </SPAN><SPAN style="color:purple;background:white">10177</SPAN><SPAN style="color:black;background:white"> ) {</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt;color:black"><SPAN style="background:white"><SPAN> </SPAN></SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="color:black;background:white"><SPAN>
</SPAN></SPAN><SPAN style="color:#A82D00;background:white">$agents</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Add(</SPAN><SPAN style="color:#A82D00;background:white">$_</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">PrincipalName</SPAN><SPAN style="color:dimgray;background:
white">, </SPAN><SPAN style="color:#A82D00;background:white">$_</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Version)</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt;color:black"><SPAN style="background:white"><SPAN> </SPAN>}</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="color:black;background:white"><SPAN> </SPAN></SPAN><SPAN style="color:darkblue;background:white">elseif</SPAN><SPAN style="color:black;background:white"> (</SPAN><SPAN style="color:#A82D00;background:white">$version</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Major </SPAN><SPAN style="color:dimgray;background:white">-eq
</SPAN><SPAN style="color:purple;background:white">10 </SPAN><SPAN style="color:dimgray;background:white">-and </SPAN><SPAN style="color:#A82D00;background:white">$version</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Minor </SPAN><SPAN style="color:dimgray;background:white">-eq </SPAN><SPAN style="color:purple;background:white">20 </SPAN><SPAN style="color:dimgray;background:white">-and </SPAN><SPAN style="color:#A82D00;background:white">$version</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Build </SPAN><SPAN style="color:dimgray;background:white">-lt </SPAN><SPAN style="color:purple;background:white">18053</SPAN><SPAN style="color:black;background:white"> ) {</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt;color:black"><SPAN style="background:white"><SPAN> </SPAN></SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="color:black;background:white"><SPAN>
</SPAN></SPAN><SPAN style="color:#A82D00;background:white">$agents</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Add(</SPAN><SPAN style="color:#A82D00;background:white">$_</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">PrincipalName</SPAN><SPAN style="color:dimgray;background:
white">, </SPAN><SPAN style="color:#A82D00;background:white">$_</SPAN><SPAN style="color:dimgray;background:white">.</SPAN><SPAN style="color:black;background:white">Version)</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt;color:black"><SPAN style="background:white"><SPAN> </SPAN>}</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt;color:black"><SPAN style="background:white">}</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt"><SPAN style="background:white">&nbsp;</SPAN></P>

<P style="margin:0in;font-family:&quot;Lucida Console&quot;;font-size:9.0pt;color:#A82D00"><SPAN style="background:white">$agents </SPAN></P>
<P></P>

**Upgrade outdated agents**

In order for agents to continue communicating with Log Analytics, customer simply needs to upgrade their agent. See below documentation on how to upgrade: 

- [Upgrade Log Analytics Agents](https://learn.microsoft.com/azure/azure-monitor/agents/agent-manage?tabs=PowerShellLinux)
- [Upgrade SCOM Windows Agents](https://learn.microsoft.com/system-center/scom/deploy-upgrade-agents?view=sc-om-2022)
- [Upgrade Management Group](https://learn.microsoft.com/system-center/scom/deploy-upgrade-overview?view=sc-om-2019)


<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:80%;border-radius:10px;background-color:#DEA5A4">
<b> IMPORTANT </b> - If we discover the MMA in question is a SCOM management server, its VERY important we do not upgrade like you would a regular agent. This will break their environment to an often unrepairable broken state. Instead, they should follow the <a href="https://learn.microsoft.com/system-center/scom/deploy-upgrade-overview?view=sc-om-2019">Upgrade Management Group</a> instructions.  
</div>

**Consider Migrating to AMA**

Log Analytics branch of MMA is currently on path to deprecation and set to retire in August of 2024. If customer is not using SCOM, this may be a good time to upgrade to the successor of MMA, the Azure Monitoring Agent (AMA).

https://docs.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-migration 
<br>

#SCOM Branch FAQ
***




<details><summary><font size =3>What information can I share with my SCOM customers?</font> <font size=2><i>(click to expand)</i></font> </summary><br>

Microsoft is sending out announcements to customers with Log Analytics subscriptions to notify them of this change. However, we understand that many SCOM administrators may not have directly received this email.

If you receive a support case on this change and customer is wanting official guidance, we can share the below customer ready statement:
<hr>

<font size=4 color=#387FBA><b>What is the impact?</b></font>
On1st February 2023, Azure will no longer accept connections from older versions of the Operations Manager agent, that uses older method for certificate handling. If Operations Manager agent is setup to send data to Log Analytics directly or as per <a href="https://learn.microsoft.com/azure/azure-monitor/agents/om-agents">Connect Operations Manager to Azure Monitor</a>, please upgrade your agent or Management Server to the latest or supported version by that date. 

<font size=4 color=#387FBA><b>Who is impacted?</b></font>
Operations Manager Management Servers or Agents which are setup to send data to Log Analytics directly or as per <a href="https://learn.microsoft.com/azure/azure-monitor/agents/om-agents">Connect Operations Manager to Azure Monitor</a> will be impacted. If you are using an agent prior to 10.19.10177.0 (2019 UR3) or Management Group prior to SCOM 2019 UR3, your agent/Management Server will be unable to connect to Azure Log Analytics. Core features of the product will continue to function as is.

<font size=4 color=#387FBA><b>What is the recommendation? </b></font>
We recommend you to be on the latest or Supported version of the agent or Management Group by followingtheseguidelines.

<b>Agent:</b> <a href="https://learn.microsoft.com/system-center/scom/deploy-upgrade-agents?view=sc-om-2022">How to Upgrade an Agent to System Center Operations Manager | Microsoft Learn</a>
<b>Management Group:</b> <a href="https://learn.microsoft.com/system-center/scom/deploy-upgrade-overview?view=sc-om-2019">Upgrading System Center Operations Manager | Microsoft Learn</a>

<font size=4 color=#387FBA><b>Who is <u>not</u> impacted?</b></font>
<li>SCOM Agent or Management group that is not configured to send data to Log Analytics</li>
<li>SCOM Agent that is on version 10.19.10177.0 (2019 UR3 or newer) or 10.22.10056.0 (2022 RTM. </li>
<li>SCOM Management Server that is on SCOM 2022 & 2019 UR3 or higher version.</li>
<br>

<font size=4 color=#387FBA><b>Are there any other impacted services?</b> </font>
System Center Service Manager using agents prior to 10.19.10177.0 (2019 UR3) will be impacted. If you are using an agent prior to 10.19.10177.0 (2019 UR3), your agent will be unable to connect to Azure Log Analytics. Core features of the product will continue to function as is. 
 

<hr>

</details>

****

<details><summary><font size =3>Is there any workaround for customers using Log Analytics integration using SCOM 2016 Environment? </font> <font size=2><i>(click to expand)</i></font> </summary><br>

Only official method would be to remove SCOM Log Analytics integration and then connect SCOM agents directly to Log Analytics via the latest or supported version of agents (10.19.10177.0 (2019 UR3 or newer) or 10.22.10056.0 (2022 RTM))
</details>

****
<details><summary><font size =3>Is there any workaround for customers using Log Analytics integration using SCOM 2012 R2 Environment? </font> <font size=2><i>(click to expand)</i></font> </summary><br>
SCOM 2012 R2 is out of support, request the customer to upgrade to Supported Version of SCOM 
</details>

****
<details><summary><font size =3>Does this impact Linux agents? </font> <font size=2><i>(click to expand)</i></font> </summary><br>
No  this change is only for Windows (Microsoft Monitoring Agent) and will not impact any version of the Linux agents. 
</details>

****
<details><summary><font size =3>If my SCOM customers are not sending data to Log Analytics, will there be any impact? </font> <font size=2><i>(click to expand)</i></font> </summary><br>
No  this change is only impacting the communication between these older agents and Log Analytics. If your SCOM customer doesnt have their MMA or management group configured to send data to Log Analytics, there is no impact. 
</details>

****
<details><summary><font size =3>How can I get an inventory of agents with their version?</font> <font size=2><i>(click to expand)</i></font> </summary><br>
You can discover all agents by running PS script <a href="https://learn.microsoft.com/powershell/module/operationsmanager/get-scomagent?view=systemcenter-ps-2022">Get-SCOMAgent (OperationsManager) | Microsoft Learn </a>
</details>
<br>
<font size =3 color=#387FBA><b>If you have any other questions or anything is unclear - please reach out to your SME!</b></font>
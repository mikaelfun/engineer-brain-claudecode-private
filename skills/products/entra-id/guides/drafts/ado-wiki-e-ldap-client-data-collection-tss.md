---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/LDAP/LDAP Client/LDAP Client: Data Collection (TSS)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/LDAP/LDAP%20Client/LDAP%20Client%3A%20Data%20Collection%20%28TSS%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053069&Instance=1053069&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053069&Instance=1053069&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a detailed workflow for automated data collection using the Troubleshooting Support Script (TSS) for issues related to Lightweight Directory Access Protocol (LDAP). It includes instructions for downloading and running TSS, prerequisites, data collection plans, and FAQs.

[[_TOC_]]

#Data collection description
This is the automated method for data collection using Troubleshooting Support Script (TSS) for issues related to Lightweight Directory Access Protocol (LDAP). 

Be aware that customers may not be able to provide exact setup information during Scoping phase. 
You may use the information gathered during Data Collection, then get the most precise setup and problem description by an iteration. Sometimes this may also include to rescope the case, or even change the case type. 

Take in consideration that is not rare that LDAP issues have more than an endpoint involved in the flow, most cases LDAP client is the endpoint you will be interested, however in some cases it may also be helpful to collect the data from target server as well.

#How to get TSS
**Public download site:** Customer can TSS.zip is available from public download site at https://aka.ms/getTSS

**Internal download site:** The TTD version is located MS internally here: `\\EmeaCssDfs.europe.corp.microsoft.com\NetPod\WindowsDiag\ALL\TSS\TSS_TTD.zip`


<details>
<summary>What if the download is not allowed by the customer? (Click to expand)</summary>

- Besides the full TSS package (~25MB) our customers now have the possibility to download the TSSLite version (~1MB), available from public download site at https://aka.ms/getTSSLite or `\\EmeaCssDfs.europe.corp.microsoft.com\NetPod\WindowsDiag\ALL\TSS\TSSLite.zip`

- TSSLite is a stripped-down version without executables (*.exe and *.dll).There are no \BIN*** folders and no psSDP folder included. This package is useful if customers don't allow downloading *.zip files, which contain executables. TSS data collection still works, but be aware that resulting datasets will not include all expected data, like ProcMon.pml, SDP report, or any data which depends on an executable, which is not shipped by Windows

- If you need to collect iDNA/TTT/TTD trace, please upload TSS_TTD.zip to customer workspace (note, this version including iDNA cannot be hosted on public website and will be shared per customer case only.)

- If you need to collect iDNA/TTT/TTD trace, please upload TSS_TTD.zip to customer workspace (note, this version including iDNA cannot be hosted on public website and will be shared per customer case only).
</details>

<br>

<details>
<summary>TSS Prerequisites (Click to expand)</summary>

- The TSS toolset must be run by accounts with administrator privileges on the local system, and the end-user license agreement (EULA) must be accepted. Once the EULA is accepted, the TSS toolset won't prompt the EULA again.
- The PowerShell script execution policy should be set toRemoteSignedfor the process level by running the cmdlet ```Set-ExecutionPolicy -scope Process -ExecutionPolicy RemoteSigned -Force``` from an elevated PowerShell command prompt.

>:memo: **Note:** The process level changes only affect the current PowerShell session.

</details>

#Data collection plan

##Guidelines

- Get a detailed description of the problem. Make use of scoping questions, the scoping questions are as important as the logs, gather all the possible information about the problem, about the environment and the deployment.
- Always use the latest TSS version
- Make sure the traces are collected on all the devices simultaneously while reproducing the issue
- Reproduce the issue at least twice (if possible) during the same trace, this will avoid confusion due coincidences that may happen during the time of the issue
- Get the exact timestamps for the attempts, this will help you to optimize your log analysis. The timestamp must be as detailed as possible, even including the exact second when the problem occurred
- Verify the required data was collected properly prior uploading the data to the DTM or before ending the troubleshooting session with the customer

<br>

>:memo: **Note:** Collecting data from a working and a non-working system can be helpful if you are having difficulty finding the issue with just the non-working data set. 

##Preparing the machines
- In this step, we will prepare the machine to run TSS. If that was already done before on this machine, please proceed with the next step.

###If the machine has internet access

Start an elevated Powershell window on the problem machine on which the issue is reproduced and then copy and paste the below cmdlets into that window:

```
md C:\TSS
Set-ExecutionPolicy -scope Process -ExecutionPolicy RemoteSigned -Force
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Start-BitsTransfer https://aka.ms/getTSS -Destination C:\TSS\TSS.zip
Expand-Archive -LiteralPath C:\TSS\TSS.zip -DestinationPath C:\TSS -force
cd C:\TSS
```
<details>
<summary>Explanation (Click to expand)</summary>


The commands above will automatically prepare the machine to run TSS by taking the following actions in the given order:

- Create C:\TSS folder

- Set the PowerShell script execution policy to RemoteSigned for the Process level (process level changes only affect the current PowerShell window)

- Set TLS type to 1.2 and download the TSS zip file from Microsoft

- Expand the TSS.zip file into C:\TSS folder

- Change to C:\TSS folder

</details>

###If the machine does NOT have internet access
a. Download TSS at https://aka.ms/getTSS from another client which has Internet access and then copy the downloaded zip file (TSS.zip) to the affected machine and extract it to a folder like C:\TSS

b. Start an elevated Powershell window on the problem machine on which the issue is reproduced and then copy and paste the below cmdlet into that window:
```
Set-ExecutionPolicy -scope Process -ExecutionPolicy RemoteSigned -Force
```
>:memo: **Note:** The command above will set the PowerShell script execution policy to RemoteSigned for the Process level (process level changes only affect the current PowerShell window)

c. Change the directory path on powershell to the previously created folder with the command:
```
cd C:\TSS
```

##Client machine data collection
1. Identify the process generating the LDAP traffic, you can use the method you prefer, such as: Network trace, Procmon or any other.
2. Modify the "tss_config.cfg" file adding in the _LDAPcliProcess parameter the actual process name generating the traffic. I.E.

![TSSConfigLDAPProcess.png](/.attachments/LDAP/TSSConfigLDAPProcess.png)


3. Start the TSS log collection from the elevated Powershell with the command:
```
.\TSS.ps1 -Start -Scenario ADS_Auth -NET_LDAPcli -netsh -noBasiclog
``` 
![/LDAP/LDAP_TSS_DataCollection_1.png](/.attachments/LDAP/LDAP_TSS_DataCollection_1.png)

2. Let the script start its logs captures and then reproduce the issue
3. Stop the TSS traces once the issue was reproduced by focusing back the Powershell previously opened and pressing "Y" key
4. Verify the necessary logs have been collected properly under the folder "C:\MS_DATA"
5. Have the customer share the data using the case DTM 

##Server data collection (Domain controller)
Most of the LDAP related issues should be first investigated on the LDAP client side. However there are some scenarios where you also need to capture data on the LDAP server.

1. Start the TSS log collection from the elevated Powershell with the command:
```
.\TSS.ps1 -Collectlog ADS_Perf -noBasiclog
``` 

2. Select the option 1. to start the traces immediately.

![ADPerf_high_CPU_Select_1.png](/.attachments/ADPerf/ADPerf_high_CPU_Select_1.png)

3. Stop the TSS traces once the issue was reproduced by focusing back the Powershell previously opened and pressing "Y" key
4. Verify the necessary logs have been collected properly under the folder "C:\MS_DATA"
5. Have the customer share the data using the case DTM 

<br>

If you would like to customize your own command please explore [command builder](https://tss-front.azurewebsites.net/default/ADS)

#TSS FAQs
<details>
<summary>TSS Frequently asked questions (FAQs) (Click to expand)</summary>
<br>

Q1:Does the TSS script change any setup or configuration of my system?

A1:No, but a registry setting is required for enabling debug logging in some scenarios. The script sets the necessary key at the start of the data collection and reverts the key to the default value at the end of the data collection. It may also delete some caches (for example, the ARP cache or the name resolution cache) at the start of the data collection to observe the problem from the logs

Q2:Does the TSS toolset put an additional load on the server?

A2:Some loggings (for example, network capturing, ETW tracing collection, and so on) that are started by the TSS toolset might put a minor load on the system. The load is usually at ignorable levels. Contact your support representative when you see high CPU, memory, or disk usage after starting the TSS toolset

Q3:Why can't we reproduce the issue when the TSS toolset is running?

A3:The TSS toolset may delete all cached information at the start. It also starts the network capturing in a promiscuous mode, which changes the Network Interface Card (NIC) default behaviors. These changes might affect the issue, and the problems may disappear. Especially for particular timing issues, problems disappear because of the TSS toolset's data collection. The data collection starts logging, which might affect the issue indirectly and change the situation

Q4: Why is the TSS toolsetnot responding for a long time?

A4: In some cases, the operating system's built-in commands run by the TSS toolset might not respond or take a long time to complete. Contact your support representative if you experience this issue

Q5: Do I need to worry about disk space or anything else when I run the TSS toolset for a long time?

A5: All TSS tracing is configured to run with ring buffers, so you can run the toolset for a long time if needed. The TSS toolset also calculates disk space at the beginning of the data collection and may exit if there isn't sufficient disk space. If you see high disk usage after starting the TSS toolset or have any other concerns about the disk usage of the toolset, contact your support representative

Q6: What should I do if I receive the following security warning when running the .\TSS.ps1 script?

```Security Warning: Run only scripts that you trust. While scripts from the Internet can be useful, this script can potentially harm your computer. Do you want to run .\TSS.ps1? [D] Do not run [R] Run once [S] Suspend [?] Help (default is "D")```

A6: In rare situations, you may receive this security warning. You may unblock the script by using the cmdlet ```PS C:\> Unblock-File -Path C:\TSS\TSS.ps1``` This script will unblock all other modules by using the cmdlet ```Get-ChildItem -Recurse -Path C:\TSS\*.ps* | Unblock-File -Confirm:$false```

</details>
---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: LSASS high memory/Domain Controller - LSASS high memory/Data collection: Domain Controller (TSS) LSASS High Memory"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20LSASS%20high%20memory%2FDomain%20Controller%20-%20LSASS%20high%20memory%2FData%20collection%3A%20Domain%20Controller%20(TSS)%20LSASS%20High%20Memory"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533529&Instance=1533529&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533529&Instance=1533529&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

##ADPERF: Domain Controller high memory data collection using TSS

Abstract: This page describes how you can use TSS (TroubleShooting Script) to collect a dataset to troubleshoot LSASS High Memory issue on a domain controller.

#Data collection description
**Before you collect data:**

1. Check known issues  
2. Ensure the Domain Controller is on the latest fixes - Especially if the DC is 2012 R2 because there were many leaks in the LDAP Arena Heap memory allocation mechanism on WS 2012 R2 which were all fixed to date.

**In case of 2012 R2 check if the customer has ESU** - break-fix cases for 2012 R2 for Unified Customers are covered by ESU Year 1 for 2012 R2 (**until October 8th 2024**).

 

>**:warning: Note: Always recommend the customer tests his action plan and data collection outside of hours where possible before gathering the data during peak hours. This is to avoid any surprises (I.e., sometimes invasive tools like idna/debugdiag can cause LSASS to crash). And thus, we cannot guarantee it works smoothly. It may be fine on one DC and not on the other!**

#How to get TSS
**Public download site:** TSS.zip is available for download in public download site at https://aka.ms/getTSS

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

- Get a detailed description of the problem. Make use of scoping questions, the scoping questions are as important as the logs, gather all the possible information about the problem, about the environment and the deployment
- Always use the latest TSS version
- Verify the required data was collected properly prior uploading the data to the DTM (Case workspace) or before ending the troubleshooting session with the customer

##Preparing the machine
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

#LSASS High Memory TSS Scenarios

##Scenario 1: Constant LSASS high memory usage or increase on a Domain Controller or member server
A customer has a constant LSASS high consumption on the memory or the customer is capable of reproducing the issue on demand.

1. Use a PowerShell Terminal as administrator and use the following command to capture with TSS while the issue is present.

>>```.\TSS.ps1 -Collectlog ADS_Perf -noBasiclog``` 

2. Select the option 3. to start the traces immediately.

![ADPerf_high_memory_Select_3.png](/.attachments/ADPerf/ADPerf_high_memory_Select_3.png)

3. After passed 3-5 minutes while the memory is high stop the command with the option prompted **Press the enter key to stop it. **
4. Verify the data collected and ask the customer to upload it to the workspace

##Scenario 2: Intermittent LSASS high memory spikes on a Domain Controller or member server
A customer has a Domain Controller performance issue where three times per day the memory has spikes but it is intermittent, and you are not able to identify a pattern to capture the data at the right time.

1. Use a PowerShell Terminal as administrator and use the following base example to make a trigger start capture using the TSS

>>```.\TSS.ps1 -Collectlog ADS_Perf -noBasiclog```

2. Select the option 4. and ask the customer what memory usage percentage they consider it as high. You can choose to run the logs during 3-5 minutes when the threshold is triggered.

![ADPerf_high_memory_Select_4.png](/.attachments/ADPerf/ADPerf_high_memory_Select_4.png)

3. Verify the data collected and ask the customer to upload it to the workspace

##Scenario 3: Collecting an IDNA/TTD for an Escalation Engineer.
A customer has a particular issue where the regular logging and analysis is not enough to determine the cause of the issue and it is required to have IDNA (TTD) collected as per senior recommendation. Please ask to your TA if TTD/IDNA is required in your case.

>:memo: **Note:** Take in consideration that the capture of the IDNA needs to be targeted on a specific process and this is to collect a capture of certain minutes or seconds while the issue is reproducing to debug the traces.

1. Use the steps at the beginning of this document to download the internal TTD version of TSS.
2. Identify the process ID to be captured, you can use the command:
>>`tasklist /svc >tasklist.txt`
3. Use a PowerShell Terminal as administrator and use the following base example to make the IDNA capture using the TSS.
>>`.\TSS.ps1 -TTD <PID> -TTDMaxFile <Max size in MB>`

![ADPerf_TTDSample.png](/.attachments/ADPerf/ADPerf_TTDSample.png)

4. After the issue was reproduced you just need **to press the (Y) letter to finish the capture.**


To Use it, use a PowerShell Terminal as administrator and execute the command of above, after the time has already pass you just need **to press the (Y) letter to finish the capture.**


| Switch | Purpose | 
|--|--|
|  -TTDPath <Folder path tttracer.exe>   | Here allow you to specify what path to use, is typically not required but if you would like to specify a path you can with this switch.  
| -TTDMode <Full- Ring - OnLaunch> | **Full:** Dump Full <br> **Ring:** Ring Buffer Mode <br> **Onlaunch:** If is Onlaunch 
| -TTDOptions <string of TTD options>  | This is if you would like to add aditional options to the TTD.   
| -TTDMaxFile <size in MB> | This is to specify how much MBs would you like to capture 

>:memo: **Note:** We can use multiple switches in the same command, also mentioned that instead of the PID we can use a ServiceName or a ProcessName.exe.

**Command example:**
`.\TSS.ps1 -TTD 1000 -TTDMaxFile 2048`

<br>

If you would like to customize your own command please explore [command builder](https://tss-front.azurewebsites.net/default/ADS)

#TSS FAQs
<details>
<summary>TSS Frequently asked questions (FAQs) (Click to expand)</summary>
<br>

**Q1:Does the TSS script change any setup or configuration of my system?**

A1:No, but a registry setting is required for enabling debug logging in some scenarios. The script sets the necessary key at the start of the data collection and reverts the key to the default value at the end of the data collection. It may also delete some caches (for example, the ARP cache or the name resolution cache) at the start of the data collection to observe the problem from the logs

**Q2:Does the TSS toolset put an additional load on the server?**

A2:Some loggings (for example, network capturing, ETW tracing collection, and so on) that are started by the TSS toolset might put a minor load on the system. The load is usually at ignorable levels. Contact your support representative when you see high CPU, memory, or disk usage after starting the TSS toolset

**Q3:Why can't we reproduce the issue when the TSS toolset is running?**

A3:The TSS toolset may delete all cached information at the start. It also starts the network capturing in a promiscuous mode, which changes the Network Interface Card (NIC) default behaviors. These changes might affect the issue, and the problems may disappear. Especially for particular timing issues, problems disappear because of the TSS toolset's data collection. The data collection starts logging, which might affect the issue indirectly and change the situation

**Q4: Why is the TSS toolsetnot responding for a long time?**

A4: In some cases, the operating system's built-in commands run by the TSS toolset might not respond or take a long time to complete. Contact your support representative if you experience this issue

**Q5: Do I need to worry about disk space or anything else when I run the TSS toolset for a long time?**

A5: All TSS tracing is configured to run with ring buffers, so you can run the toolset for a long time if needed. The TSS toolset also calculates disk space at the beginning of the data collection and may exit if there isn't sufficient disk space. If you see high disk usage after starting the TSS toolset or have any other concerns about the disk usage of the toolset, contact your support representative

**Q6: What should I do if I receive the following security warning when running the .\TSS.ps1 script?**

```Security Warning: Run only scripts that you trust. While scripts from the Internet can be useful, this script can potentially harm your computer. Do you want to run .\TSS.ps1? [D] Do not run [R] Run once [S] Suspend [?] Help (default is "D")```

A6: In rare situations, you may receive this security warning. You may unblock the script by using the cmdlet ```PS C:\> Unblock-File -Path C:\TSS\TSS.ps1``` This script will unblock all other modules by using the cmdlet ```Get-ChildItem -Recurse -Path C:\TSS\*.ps* | Unblock-File -Confirm:$false```

</details>

<span style="color:red">***_All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data._**
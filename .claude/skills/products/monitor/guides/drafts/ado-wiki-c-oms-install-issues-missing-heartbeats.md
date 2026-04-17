---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Troubleshooting Guides/Troubleshooting OMS Agent Install Issues & Missing Heartbeats"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/Troubleshooting%20Guides/Troubleshooting%20OMS%20Agent%20Install%20Issues%20%26%20Missing%20Heartbeats"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md 

::: 

[[_TOC_]] 

 

# Scenario 

--- 

The Customer has an issue with a Linux Log Analytics agent where it's not reporting heartbeats to the Log Analytics workspace.   

# Saving Time
---
1. Collect the following data up front  [Linux Support Tool](/Monitor-Agents/Agents/OMS-Agent-for-Linux-\(omsagent\)/How%2DTo/Linux-Support-Tool-Guide)
     * Choose "**L: Collect the logs for OMS Agent.**"
     * Provide an output directory : Example: /home/<username>  - This will put the archive in the users home directory.
     * Provide the SR Number
     * Optional: Provide a company name
     * Navigate to the directory you specified during the first prompt, and verify the .tgz file was created.
     * Request that the customer connect to the VM using an SFTP client (WinSCP, Filezilla, etc) and download the .tgz
     * Request the customer upload the file to DTM

 
# Scoping Questions

--- 
The response to these questions should be documented in your FQR case note.

<details><summary>Are Heartbeats really missing?</summary>

>
> Document the query used by the customer.
> Then, using the simplified queries below, query Log Analytics to ensure it's really missing.
> If results are found, validate the Category as this will help determine the Type of agent that sent the Heartbeat.  
> A **Category** of **Direct Agent** indicates the **OMS** sent the Heartbeat.
> A **Category** of **Azure Monitor Agent** indicates, the **AMA** sent the Heartbeat

``` csharp
//This query will check for heartbeat from a specific server within the last 10 minutes
//If this returns a result, then the server is heartbeating just fine
Heartbeat 
| where Computer contains "ServerName"
| where Category contains "Direct Agent"
| where TimeGenerated > ago(10m)
| order by TimeGenerated
```

> If the above query doesn't return a result, check for heartbeats based on resource Id instead.  
> This may happen if the name isn't what is expected.  
> Note: This only works for Azure VMs or ARC Connected Machines

> **Resource ID** can be found in **ASC->Resource Explorer->Resource Provider->Microsoft.Compute->virutalMachines-><VM Name>->V2 Properties->VM Base Properties->Resource Uri**
> **Resource ID** can be found in the **Azure Portal->Virtual Machines-><Virtual Machine Name>->Properties->Resource Id**

``` csharp
//This query will check for heartbeat from a specific ResoruceId within the last 10 minutes
//If this returns a result, then the server is heartbeating just fine
Heartbeat 
| where ResourceId contains "ResourceId"
| where Category contains "Direct Agent"
| where TimeGenerated > ago(10m)
| order by TimeGenerated
```
</details>

<details><summary>How many machines are not heartbeating?</summary>

> 
> 
> If more than one machine is failing to heartbeat, use the [Linux Support Tool](/Monitor-Agents/Agents/OMS-Agent-for-Linux-\(omsagent\)/How%2DTo/Linux-Support-Tool-Guide) to collect logs from a few machines that are also experiencing the problem.

>
> Does the customer have any agents that are successfully sending heartbeats to the Log Analytics workspace?  
> If yes, again use [Linux Support Tool](/Monitor-Agents/Agents/OMS-Agent-for-Linux-\(omsagent\)/How%2DTo/Linux-Support-Tool-Guide) to collect logs from a machine that is working.  

> Use this data to identify differences between working and non-working systems.
> What is different between the working and non-working systems that may explain this condition.
> Things to check
>> Do the servers have different roles?
>>> Different server roles will likely have different monitoring needs.  For instance, monitoring a SQL server will have different needs than monitoring a Domain Controller or a File Server.  
>
>> Are the servers on different networks?
>>> Networks may have their own unique firewall polices which may affect network connectivity.
>
>> On-Prem versus Azure VMs?
>>> Are all on-prem servers failing versus all Azure VMs working, or vice-versa? 

</details>

<details><summary>Has the agent ever successfully sent heartbeats to this Log Analytics workspace?</summary>

>
>
> If yes, when was the last time it successfully heartbeated?
> To determine this, navigate to the Workspace in ASC and review the Agent Report. 
> ![image.png](/.attachments/image-6b5cddd3-57da-4132-a332-2cbb82876186.png)

>
> **Or** use the below **KQL** query to determine the time of the last heartbeat from the MMA

``` csharp
Heartbeat
| where Computer contains "ServerName"
| where Category contains "Direct Agent"
| summarize arg_max(TimeGenerated, *) by Computer
```
> Use this time as a reference in the log files and event logs to determine what may have happened at that time.  Heartbeats occur every minute, so if something breaks that causes a log entry, it'll likely show up within a minute of the last heartbeat.

>
> Also use this time to determine if the issue is intermittent.  Does it work **sometimes** but not others. 
>
</details>

<details>
<summary>Is the OMS Agent installed?</summary>

>
> To determine if the Agent is installed see [How to locate installed version of OMS Agent](/Monitor-Agents/Agents/OMS-Agent-for-Linux-\(omsagent\)/How%2DTo/How-to-locate-installed-version-of-OMS-Agent-for-Linux)
>
> If agent isn't installed [Install the Log Analytics agent on Linux computers - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux?tabs=wrapper-script#install-the-agent)

>
>
</details>

<details>
<summary>Is this running on a supported Operating System?</summary>

>
> The OS Version can be found in the **Linux Support Tool** output in the **omslinux.out** file
![image.png](/.attachments/image-2b3932f1-5d08-4a20-b159-3f61ba16c3e2.png)

>
> Then, check the **Supported OS** documentation - [Supported operating systems - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux?tabs=wrapper-script#supported-operating-systemss)
>
>
</details>



# Update SAP
--- 
Ensure that the Support Topic is coded to _Azure\Log Analytics\Agent - Linux\Agent not reporting data or Heartbeat data missing_  
Do this to ensure you get the correct template if you need to escalate to the Product Group.

# Pre-Requisites 

--- 


* Check that the Agent can be supported in this scenario. [Check here for supportability](/Monitor-Agents/Agents/Common-Concepts/Linux-Agent-Basics) 

  -  You can run this command to determine the distro if you are uncertain: _cat /etc/system-release_ 

  -  This can also be found early in the [Data Collection for Linux Agent](/Monitor-Agents/Agents/Common-Concepts/Data-Collection-for-Linux-Agent) output.  

 

# Troubleshooting steps 

1. The assumption in this workflow is that there are no Log Analytics Ingestion issues going on. This is important to note because if all agents have stopped sending Heartbeats this could mean an ingestion issue on the Azure service side.  

    - Validate there are no general Azure Log Analytics Ingestion issues occurring by seeing if you have agents heartbeating, check for emails from azcomm, and also consider their region it is possible ingestion issues are region specific or customer specific. If you are comfortable that Ingestion is not at play proceed with this workflow. 

2. Check to see if other Machines are also not sending heartbeats, do they have other agents successfully sending heartbeats?  

    - Go  to the workspace in the Portal or Azure Support Center and run this query:  
    ```
    Heartbeat 
    | where OSType == "Linux" 
    | summarize arg_max(TimeGenerated, *) by Computer 
    ```
    - If you find that more than one machine has nearly the exact same or very close to the last time a machine has successfully heartbeat it can often be a networking change done by the customer that is now preventing endpoint access. 

    - If you find that you only have one machine that stopped sending heartbeats and the rest of the machines are still heart beating just fine then it is far less likely that there is a networking issue at play since network changes tend to effect a large number of VMs at once. 

    - If the VM is an Azure VM: Check the Extension Blade of the VM in ASC for the extension handler status, often times the answer to why is a VM not Heart beating is in the status of this screen. 

3. From here scope the case such that you will concentrate on one failed machine. All steps taken can be replicated to additional machines.  

4. Is the OMSAgent running on the machine? 

    - If you have the log collector data, look for the `omslinux.out` file and locate this string `ps -ef | grep -i oms | grep -v grep`. You can also run that same command directly on the machine. The output of the command shows the OMSAgent processes is running: 

      ![image.png](/.attachments/image-a329b0e0-c701-4fe7-b3f2-cb112235433e.png)

      - You are looking for an entry similar to the above. (Yellow Highlight)

4. Have the customer run the following network check commands and run the log collector script if possible and provide you the output. 
    
    **Network Connection checks for linux:** 
    _Using curl cmd:_
    ```
    curl -v https://WOKSPACEID.oms.opinsights.azure.com:443
    curl -v https://WOKSPACEID.ods.opinsights.azure.com:443
    curl -v https://WOKSPACEID.agentsvc.azure-automation.net:443
    ```
    
    _Using openssl cmd:_
    ```
    echo | openssl s_client -connect WORKSPACEID.oms.opinsights.azure.com:443 -servername WORKSPACEID.oms.opinsights.azure.com -showcerts 

    echo | openssl s_client -connect WORKSPACEID.ods.opinsights.azure.com:443 -servername WORKSPACEID.ods.opinsights.azure.com -showcerts 

    echo | openssl s_client -connect WORKSPACEID.agentsvc.azure-automation.net:443 -servername WORKSPACEID.agentsvc.azure-automation.net -showcerts   
    ```

    - If the network connection checks work you�ll see an output like this detailing the connection that was made, the TLS version used, the cipher suite used and available to make the connection. You�ll also see the server certificate used to connect to the endpoint.  We should be able to see TLS 1.2 being used and the Microsoft certificate being presented. 
![image.png](/.attachments/image-c2f7a9be-f3f2-4555-be63-40242f81e540.png)
 ![image.png](/.attachments/image-6eeb4ab5-eca5-4e1f-adc2-84488c5a7fd4.png)

    - ANY FAILURES HERE POINT TO A NETWORKING ISSUE: if you try to use a bad workspace id or try these commands where DNS resolution doesn�t work you�ll get an output like this: 
![image.png](/.attachments/image-18531e04-91b3-4800-8840-7b64cc4753c8.png)
 

    - If the customer cant make the connection to oms.opinsights.azure.com: typically the agent wont install and download configuration correctly.  

    - If the customer can make the connection to oms.opinsights.azure.com but not ods.opinsights.azure.com: typically the agent will install but no data will be flowing from the agent. 

     - If the customer can make the connection to oms.opinsights.azure.com and ods.opinsights.azure.com but not agentsvc.azure-automation.net: Typically only heartbeat data will be flowing things like Perf Counters, Custom logs, and update management wont work. 




5. If you find the process is running from the above steps proceed to step **2**; if you did not find the process proceed to the next step. 

6. Since you did not find the process, lets attempt to start it manually. 

    -  From the Linux command prompt issue the command: `sudo /opt/microsoft/omsagent/bin/service_control start` 

    -  After the command completes, go back to Step **5** to see if it shows as running. 

7. If you see it running, note the GUID in the path of the output. This GUID should match the GUID of the workspace ID. Is the GUID the same workspace ID the customer provided?  

    - If the answer is **NO** the agent is configured to report to a different workspace and would need to be reconfigured to point to the desired workspace. The customer should investigate why it is reporting to the current workspace first as there might be a valid reason for it.  

    - If it is the correct workspace ID go to the next step. 

8. Now the agent is running the logs need to be checked to see if it is logging heartbeat entries and no errors are occurring. This is quicker than waiting on heatbeat entries showing in the workspace. To check the OMSAgent log, go to the Linux Command prompt, use `sudo -i` to gain sufficient privileges. Then navigate to the log folder. **Note** it is required to plug in the proper workspace id : `/var/opt/microsoft/omsagent/<workspaceid>/log/`

    - Upon getting into the folder execute a `tail` command to see the end of the log file: `tail omsagent.log` and you should see output like this: 

 

      ``` 
      2018-03-16 13:27:13 +0100 [warn]: /var/opt/microsoft/omsconfig/omsconfig.log not found. Continuing without tailing it. 

      2018-03-16 13:27:13 +0100 [info]: listening syslog socket on 127.0.0.1:25224 with udp 

      2018-03-16 13:32:13 +0100 [warn]: Hostname 'butagaz.helium.front-01' not compliant (RFCs 1123, 2181 with hostname range of {1,63} octets for non-root item.).  Not IP Address Either. 

      2018-03-16 13:32:13 +0100 [warn]: Hostname 'butagaz.helium.front-01' found, but did NOT validate as compliant.  Hostname 'butagaz.helium.front-01' not compliant (RFCs 1123, 2181 with hostname range of {1,63} octets for non-root item.).  Not IP Address Either..  Using anyway. 

      2018-03-16 13:32:13 +0100 [info]: Sending OMS Heartbeat succeeded at 2018-03-16T12:32:13.262Z 

      2018-03-16 13:37:13 +0100 [info]: Sending OMS Heartbeat succeeded at 2018-03-16T12:37:13.264Z 

      2018-03-16 13:42:13 +0100 [info]: Sending OMS Heartbeat succeeded at 2018-03-16T12:42:13.266Z 

      2018-03-16 13:47:13 +0100 [info]: Sending OMS Heartbeat succeeded at 2018-03-16T12:47:13.266Z 

      2018-03-16 13:47:13 +0100 [info]: DSC AgentService Heartbeat success 

      2018-03-16 13:52:13 +0100 [info]: Sending OMS Heartbeat succeeded at 2018-03-16T12:52:13.270Z 
      ``` 

   - If the omsagent.log file does **not** exist despite the omsagent process showing as running in step **4**, run `sudo systemctl restart omsagent-<workspace id>.service` (make sure to insert the workspace id). Then check that the `omsagent.log` file is created. 

   -  What you are looking for in `omsagent.log` are entries that have `...Sending OMS Heartbeat succeeded at...`. If you see such entries, the agent looks to be working correctly. Go to Step **12** to validate functionality. 

   - If you see something like the below, the batch of heartbeats the agent is attempting to send is actually failing transmit to the workspace. If you see this you should run the [Linux Support Tool](/Monitor-Agents/Agents/OMS-Agent-for-Linux-\(omsagent\)/How%2DTo/Linux-Support-Tool-Guide) and go Step **10**. 


     ``` 
     2019-04-02 19:27:43 -0500 [info]: Sending OMS Heartbeat succeeded at 2019-04-03T00:27:43.729Z 

     2019-04-02 19:28:43 -0500 [info]: Sending OMS Heartbeat succeeded at 2019-04-03T00:28:43.729Z 

     2019-04-02 19:29:31 -0500 [info]: Encountered retryable exception. Will retry sending data later. 

     2019-04-02 19:29:31 -0500 [warn]: temporarily failed to flush the buffer. next_retry=2019-04-02 19:38:01 -0500 error_class="RuntimeError" error="Net::HTTP.Post raises exception: Net::OpenTimeout, 'execution expired'" plugin_id="object:2ab334e31fcc" 

     2019-04-02 19:29:31 -0500 [warn]: suppressed same stacktrace 

     2019-04-02 19:29:43 -0500 [info]: Sending OMS Heartbeat succeeded at 2019-04-03T00:29:43.730Z 

     2019-04-02 19:30:43 -0500 [info]: Sending OMS Heartbeat succeeded at 2019-04-03T00:30:43.731Z 

     2019-04-02 19:31:43 -0500 [info]: Sending OMS Heartbeat succeeded at 2019-04-03T00:31:43.731Z 

     2019-04-02 19:32:04 -0500 [info]: Encountered retryable exception. Will retry sending data later. 

     2019-04-02 19:32:04 -0500 [warn]: temporarily failed to flush the buffer. next_retry=2019-04-02 19:36:34 -0500 error_class="RuntimeError" error="Net::HTTP.Post raises exception: Net::OpenTimeout, 'execution expired'" plugin_id="object:2ab3347a61e4" 

     2019-04-02 19:32:04 -0500 [warn]: suppressed same stacktrace 

     2019-04-02 19:32:43 -0500 [info]: Sending OMS Heartbeat succeeded at 2019-04-03T00:32:43.732Z 

     2019-04-02 19:33:43 -0500 [info]: Sending OMS Heartbeat succeeded at 2019-04-03T00:33:43.733Z 

     2019-04-02 19:34:43 -0500 [info]: Sending OMS Heartbeat succeeded at 2019-04-03T00:34:43.734Z 

     2019-04-02 19:35:43 -0500 [info]: Sending OMS Heartbeat succeeded at 2019-04-03T00:35:43.735Z 

     2019-04-02 19:36:43 -0500 [info]: Sending OMS Heartbeat succeeded at 2019-04-03T00:36:43.736Z 

     2019-04-02 19:37:04 -0500 [info]: Encountered retryable exception. Will retry sending data later. 

     2019-04-02 19:37:04 -0500 [warn]: failed to flush the buffer. error_class="RuntimeError" error="Net::HTTP.Post raises exception: Net::OpenTimeout, 'execution expired'" plugin_id="object:2ab3347a61e4" 

     ``` 

10. Check to see if the network is still the problem

    Check if SSL root CA certificates are good and SSL connections are possible. 

    [test_https_ssl.zip](/.attachments/test_https_ssl-d09a21f5-df98-4089-8fcb-07be9fb5d344.zip) 

    - Run attached test_https_ssl.rb and make sure SSL connections are possible on the machine 

    To run the script, you would have to first move it to the **/tmp/** path, otherwise it will throw an error: 

    ![image.png](/.attachments/image-3b68ce0d-9837-4225-9333-849808d2f0fc.png)

    Therefore, let's move the ruby script to /tmp/: 

    `sudo cp test_https_ssl.rb /tmp` 

    And let's run it using this command: 

    `sudo -u omsagent ruby /tmp/test_https_ssl.rb` 

    You might get an error like the one below: 
    ![image.png](/.attachments/image-b6f063d9-1318-4092-8f76-048b7140c34a.png)



    If you do, please try running with this command: 

    `sudo -u omsagent /opt/microsoft/omsagent/ruby/bin/ruby /tmp/test_https_ssl.rb`

    - Ensure Root CA certs are accessible to �omsagent� user for read or you may see a similar error to this: 
    ![image.png](/.attachments/image-84c908c4-f39a-4b76-ac2e-6bb5736c103f.png)

 
<< NEEDS CLARIFICATION >>
11. Further Troubleshooting needs data from the Linux Support Tool:
 

    Look for the **omslinux.out** file in the data collector dump, open it, and scroll to the bottom. 

    - At the bottom you will see where basic connectivity checks were performed. The output should look like below. 

      >Network check:  
      > 
      >bing.com: success 
      >google.com: success 
      > 
      >scus-agentservice-prod-1.azure-automation.net: success 
      > 
      >eus2-jobruntimedata-prod-su1.azure-automation.net: success 
      > 
      >00000000-0000-0000-0000-000000000000.ods.opinsights.azure.com: success 
      >00000000-0000-0000-0000-000000000000.oms.opinsights.azure.com: success 
      >ods.systemcenteradvisor.com: success 
<<>>
 

12. If there aren't any network issue or they have fixed or otherwise attempted to fix networking issues on their side that were causing issues you can use the following command to reattempt to download configurations without reinstallation:

      `sudo -u omsagent /opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py`
      
      Or Depending on the operating system 
      
      `sudo -u omsagent python3 /opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py`
      - This should produce a HUGE output stream you can have the customer copy and paste this output stream to you and you can check it for any error messages. 

 
13.  We should attempt to reconnect the agent to the workspace using the following.  This will reconfigure the agent to the workspace.

        `/opt/microsoft/omsagent/bin/omsadmin.sh -w <Workspace ID> -s <Workspace Key>` 


14. If networking issues are seemingly not at play or no longer at play, but the agent is still not functioning for any reason you can try to purge and reinstall the agent: 
**BE AWARE THAT THIS REMOVES THE ABILITY TO FIND OUT WHY THE AGENT WAS BROKEN IN THE FIRST PLACE. IF THE CUSTOMER IS GOING TO WANT AN RCA ON WHY THE AGENT IS BROKEN WE MUST HAVE A LOG COLLECTOR SCRIPT DUMP TAKEN BEFORE PURINGING THE AGENT.** 
Once the Customer has acknowledged that this removes all the evidence from the machine as to why the machine is not functional you can purge and reinstall the agent. 

    - The Current purge and reinstall instructions are located here: 
       [Troubleshoot issues with the Log Analytics agent for Linux :: Purge and reinstall the Linux agent](https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot#purge-and-reinstall-the-linux-agent ) 

 
<hr>

# Escalating to Product Group

If you still not seeing the heartbeats in the workspace and then you are at a point to reach out to other resources for help. Verify that the SAP is set correctly and proceed to ASC and utilize the Escalation button at the top left. You will be given the template automatically but if you are having issues with ASC and need to open an ICM utilize the Manual Template below. You can engage the Escalating to the Azure Log Analytics Agent Product Group directly or you can reach out to your TA / EE for a review before engaging the Product Group. Inform the customer that you are reviewing with a teammate, but do not mention that they are the Product Group or your TA/EE (this is for a customer satisfaction standpoint so they maintain confidence) 

Manual Template:  https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ci3v1e


- Please be ready to detail what you have done up to this point, and that you have gone through this TSG. 

- Ensure that the Log Collector output is still available in DTM. 

- Make sure your case notes are up to date and complete. This will result in a quicker turnaround time to resolution. 

- What if Agent is behind Azure Private Link? [Follow Azure Monitor Private Link Troubleshooting](https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/587890/Azure-Monitor-Private-Link-Troubleshooting) 

 
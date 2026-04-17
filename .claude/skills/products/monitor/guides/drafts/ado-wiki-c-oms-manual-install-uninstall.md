---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Troubleshooting Guides/Troubleshooting OMS Agent Installation and Uninstallation issue"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/Troubleshooting%20Guides/Troubleshooting%20OMS%20Agent%20Installation%20and%20Uninstallation%20issue"
importDate: "2026-04-07"
type: troubleshooting-guide
---

Applies to:
- OMS agent: Manual installation & uninstallation

[[_TOC_]]
#Troubleshooting
---

Firstly, you need to know how to [access to ASC(Azure Support Center)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/499768/How-to-open-Azure-Support-Center-from-case-management-systems) and [find a desired resource in ASC](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/503141/How-to-navigate-to-a-resource-in-Azure-Support-Center) to get basic information.


##Installation troubleshooting
---

###Basic installation steps to install omsagent manually.

<details><summary>Basic installation steps</summary>

>https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux?tabs=wrapper-script#install-the-agent
>
>- Get the link containing workspace id and primary key from portal.
>portal>Log analytics workspace>Agents>Linux servers>Download and onboard agent for Linux
>![image.png](/.attachments/image-07d7cc7a-d061-43e6-b6e0-ddd830f94a89.png)
>
>- To run the shell script giving the arguments manually, get workspace id and primary key from portal.
>portal>Log analytics workspace>Agents>Linux servers>Workspace ID, Primary key
>```wget https://raw.githubusercontent.com/Microsoft/OMS-Agent-for-Linux/master/installer/scripts/onboard_agent.sh && sh onboard_agent.sh -w <YOUR WORKSPACE ID> -s <YOUR WORKSPACE PRIMARY KEY>```
>![image.png](/.attachments/image-ac3d843e-4bf5-4064-b47a-bb520c3d2bd9.png)
</details>

---
>
1. Determine if omsagent is deployed manually or extension based
   - manually deployed omsagent won't show up in extension(ASC>VM>Extensions, portal>VM>Extensions), see [extension installation troubleshooting](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/841332/Troubleshooting-OMS-Agent-Install-Uninstall-Extension-based-deployment) for details.
2. Collect logs for troubleshooting
   - Ask customer to capture the output of the installation shell script
      ![Items (20).png](/.attachments/Items%20(20)-524eb6ae-902f-40e5-ab6d-368366a11977.png)

      If the output gives you an error code, refer to the code chart from [here](https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot?source=recommendations#installation-error-codes) for Installation errors and [here](https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot?source=recommendations#onboarding-error-codes) for Onboarding errors.
   - Before asking collecting troubleshooter logs to customer, you can extract IaaS Disk logs from ASC by yourself
      <details><summary>Collect IaaS Disk logs from ASC</summary>

        ASC>VM>Diagnostics
        ![Items (11).png](/.attachments/Items%20(11)-b5307f24-e419-4717-9e07-850b617c9348.png)

        Inspect IaaS Disk>Create report>Monitor-Mgmt>Run
        Download the created report
        ![Items (12).png](/.attachments/Items%20(12)-eaafdfca-e2b5-401d-99b6-9cb6731fa3e8.png)

        If you unzip the file, you will find omsagen.log from a path similar to this
        ```
        \joham-redhat8-eus-InspectIaaSDisk-cl3dfusx.gjy_9d9372386a\device_0\var\opt\microsoft\omsagent\{workspace id}\log\omsagent.log
        ```

        omsagent.log shows if the agent is running or not.
        ```
        2023-04-07 01:25:09 +0000 [info]: Sending OMS Heartbeat succeeded at 2023-04-07T01:25:09.144Z
        2023-04-07 01:25:22 +0000 [info]: INFO sudo tail plugin in agent configuration is provisioned to tail files from the following paths: /root/*.log,/var/log/secure, log_level=info
        2023-04-07 01:25:22 +0000 [info]: INFO File path /var/log/secure exists. Trying to tail.
        2023-04-07 01:26:09 +0000 [info]: Sending OMS Heartbeat succeeded at 2023-04-07T01:26:09.145Z
        2023-04-07 01:26:22 +0000 [info]: INFO sudo tail plugin in agent configuration is provisioned to tail files from the following paths: /root/*.log,/var/log/secure, log_level=info
        2023-04-07 01:26:22 +0000 [info]: INFO File path /var/log/secure exists. Trying to tail.
        2023-04-07 01:27:09 +0000 [info]: Sending OMS Heartbeat succeeded at 2023-04-07T01:27:09.146Z
        2023-04-07 01:27:22 +0000 [info]: INFO sudo tail plugin in agent configuration is provisioned to tail files from the following paths: /root/*.log,/var/log/secure, log_level=info
        2023-04-07 01:27:22 +0000 [info]: INFO File path /var/log/secure exists. Trying to tail.
        ```
      </details>

   - Ask customer to collect logs using troubleshooting tool
      <details><summary>Collect logs using Log Analytics Troubleshooting Tool</summary>

        To analyze a cause of Installation/Uninstallation issue, logs should be collected.
        https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot#use-the-troubleshooting-tool

        - To run the Troubleshooting Tool locally, paste the following command.
          ```sudo /opt/microsoft/omsagent/bin/troubleshooter```
        - Manual install the Troubleshooting Tool in case the troubleshooter does not exist in the path.
          1. Ensure that the GNU Project Debugger (GDB) is installed on the machine because the troubleshooter relies on it.
        Copy the troubleshooter bundle onto your machine: 
        ```wget https://raw.github.com/microsoft/OMS-Agent-for-Linux/master/source/code/troubleshooter/omsagent_tst.tar.gz```
          2. Unpack the bundle: ```tar -xzvf omsagent_tst.tar.gz```
          3. Run the manual installation: ```sudo ./install_tst```
        - After running the troubleshooter, follow these steps to collect logs
          1. Choose "5: Installation failures." and if no errors were found, 
        ![image.png](/.attachments/image-c1c8733c-30cf-4ca0-a270-ae053e61d7db.png)
        then proceed with "L: Collect the logs for OMS Agent."

          2. Provide an output directory : Example: /home/<username> - This will put the archive in the users home directory.
          3. Provide the SR Number
          4. Optional: Provide a company name
          5. Navigate to the directory you specified during the first prompt, and verify the .tgz file was created.
          6. Request that the customer connect to the VM using an SFTP client (WinSCP, Filezilla, etc) and download the .tgz
          7. Request the customer upload the file to DTM
        - To determine if the Agent is installed, see the following wiki
        https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/785652/How-to-locate-installed-version-of-OMS-Agent-for-Linux

          If agent isn't installed, https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux?tabs=wrapper-script#install-the-agent

        **Files to check from the output of troubleshooter**
        - omslinux.out
          - Contains general information about omsagent.
            rpm, processes, disk space, versions, connected workspace id, agent guid, etc.
          - Is the OMSAgent running on the machine? locate this string or run the command from the machine directly.
        ```ps -ef | grep -i oms | grep -v grep```
        ![image.png](/.attachments/image-510e5d0e-5404-4fc7-a719-f176ef01d3fe.png)
        - messages
        System messages including syslog, kernel and so on.
        ```
        Jan  5 20:49:43 joham-redhat6 omsagent[4696]: [INFO] Reusing previous agent GUID xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        Jan  5 20:49:43 joham-redhat6 omsagent[4697]: [INFO] Agent GUID is xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        Jan  5 20:49:44 joham-redhat6 omsagent[4737]: [INFO] Onboarding success
        Jan  5 20:49:44 joham-redhat6 kernel: Kernel logging (proc) stopped.
        Jan  5 20:49:44 joham-redhat6 rsyslogd: [origin software="rsyslogd" swVersion="5.8.10" x-pid="2661" x-info="http://www.rsyslog.com"] exiting on signal 15.
        Jan  5 20:49:44 joham-redhat6 kernel: imklog 5.8.10, log source = /proc/kmsg started.
        Jan  5 20:49:44 joham-redhat6 rsyslogd: [origin software="rsyslogd" swVersion="5.8.10" x-pid="4834" x-info="http://www.rsyslog.com"] start
        Jan  5 20:49:46 joham-redhat6 omsagent[4903]: [INFO] omsconfig is configured successfuly
        ```
       </details>

   - If internet connection is not available, collect logs manually
       <details><summary>Collect logs manually</summary>

        - If internet access is not allowed, manually collect logs from these directory.
          ```
          /var/opt/*
          /var/log/azure/*
          /var/log/messages
          ```
        - run the following command to see the last part of omsagent.log. If omsagent is working, the output would similar to the following.
           ```sudo tail omsagent.log```
           /var/opt/microsoft/omsagent/{workspace id}/log/omsagent.log
           ```
           2023-04-07 00:31:09 +0000 [info]: Sending OMS Heartbeat succeeded at 2023-04-07T00:31:09.079Z
           2023-04-07 00:31:12 +0000 [info]: INFO sudo tail plugin in agent configuration is provisioned to tail files from the 
           following paths: /root/*.log,/var/log/secure, log_level=info
           2023-04-07 00:31:12 +0000 [info]: INFO File path /var/log/secure exists. Trying to tail.
           2023-04-07 00:32:09 +0000 [info]: Sending OMS Heartbeat succeeded at 2023-04-07T00:32:09.080Z
           2023-04-07 00:32:12 +0000 [info]: INFO sudo tail plugin in agent configuration is provisioned to tail files from the 
           following paths: /root/*.log,/var/log/secure, log_level=info
           2023-04-07 00:32:12 +0000 [info]: INFO File path /var/log/secure exists. Trying to tail.
           2023-04-07 00:33:09 +0000 [info]: Sending OMS Heartbeat succeeded at 2023-04-07T00:33:09.081Z
           2023-04-07 00:33:12 +0000 [info]: INFO sudo tail plugin in agent configuration is provisioned to tail files from the 
           following paths: /root/*.log,/var/log/secure, log_level=info
           2023-04-07 00:33:12 +0000 [info]: INFO File path /var/log/secure exists. Trying to tail.
           2023-04-07 00:33:23 +0000 [info]: OMS agent management service telemetry request success
           ```
       </details>
>
3. Common installation failure scenarios

    <details><summary>Unsupported OS</summary>

    - Supported Linux version(tested with RHEL,CentOS,SUSE,Oracle,Fedora,Ubuntu): 
      ```cat /etc/*-release | uniq```
      
      The command will show a result like the following:
      ![Items (24).png](/.attachments/Items%20(24)-c024abd9-8130-4cd4-a745-bda7b95b97f6.png)

      Check the version with the list documented here:
      https://learn.microsoft.com/azure/azure-monitor/agents/agents-overview#supported-operating-systems

      Otherwise, guide customer the linux version is not supported
    </details>

    <details><summary>Insufficient disk space</summary>

    - Check disk free space(at least 500MB for each)
    If less than 500MB, ask customer to secure enough space as required.
    https://github.com/Azure/azure-linux-extensions/blob/master/OmsAgent/omsagent.py#L331
       ```
       /var
       /etc
       /opt
       ```

      run 'df' command to get free disk space. '-h' option displays the space as GB unit.
    ![Items (25).png](/.attachments/Items%20(25)-0983de8b-bd3b-4289-bcee-0394d0ddd87a.png)
    </details>

    <details><summary>Network connection issue</summary>

    - Check Network requirements
    https://learn.microsoft.com/azure/azure-monitor/agents/log-analytics-agent#firewall-requirements
    ![Items (17).png](/.attachments/Items%20(17)-7b2fddcd-7934-4a78-aa09-2b40460592df.png)

    - Check connectivity to the endpoints from a vm
        ```
        (replace # with workspace id)
        curl -v ########-####-####-####-############.oms.opinsights.azure.com:443
        curl -v ########-####-####-####-############.ods.opinsights.azure.com:443
        curl -v ########-####-####-####-############..agentsvc.azure-automation.net:443
        ```
      An expected result would be similar to this:
      ![Items (18).png](/.attachments/Items%20(18)-a5d5cf3e-343c-44d2-a538-611894915659.png)

      If the endpoints are not reachable, check if there is any interruption from customer side(proxy, firewall, HTTPS inspection, or any security devices)

    - If the customer cant make the connection to oms.opinsights.azure.com : typically the agent wont install and download configuration correctly.

    - If the customer can make the connection to oms.opinsights.azure.com  but not ods.opinsights.azure.com : typically the agent will install but no data will be flowing from the agent.

    - If the customer can make the connection to oms.opinsights.azure.com  and ods.opinsights.azure.com  but not agentsvc.azure-automation.net : Typically only heartbeat data will be flowing things like Perf Counters, Custom logs, and update management wont work.

      When the issue still exists, follow these TSG 
      - SSL connectivity check: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605541/How-to-Check-SSL-Connectivity-for-OMS-Agent-for-Linux-using-Open-SSL
    or
    https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605654/Troubleshooting-OMS-Agent-Install-Issues-Missing-Heartbeats
      - DNS resolution check: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/795326/How-to-Use-nslookup-to-validate-DNS-resolution
      - port connectivity check: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/795328/How-to-Use-telnet-to-validate-endpoint-port-connectivity
      
      Once the above TSG does not work, collect network trace while installing the agent and escalate to swarming channel([AzMon POD Swarming>Agents and Extensions - Linux](https://teams.microsoft.com/l/channel/19%3a924dc6708e40443992b12985027fca20%40thread.tacv2/Agents%2520and%2520Extensions%2520-%2520Linux?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47))
    https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/812779/How-To-Capture-a-Linux-Network-Trace-for-the-OMS-agent-for-Linux
    </details>

    <details><summary>Lack of permission</summary>

    - Required directory permission
    https://github.com/microsoft/OMS-Agent-for-Linux/blob/master/docs/Hardening.md#directory-permissions
    ![Items (19).png](/.attachments/Items%20(19)-fbb6ea13-df3e-4e83-b397-1b2275929b2e.png)

    - To fix, run the following commands
      ```
      $> chmod 755 /var
      $> chmod 775 /var/log
      $> chmod 775 /etc
      $> chmod 775 /tmp
      ```
    </details>

    <details><summary>Lack of permission on /etc/hosts</summary>

    - Error message from omsagent.log
      ```
      022-10-18 15:32:39 +0900 [warn]: temporarily failed to flush the buffer. next_retry=2022-10-18 15:33:09 +0900 error_class="RuntimeError" error="Net::HTTP.Post raises exception: Errno::EACCES, 'Failed to open TCP connection to ########-####-####-####-############.ods.opinsights.azure.com:443 (Permission denied @ rb_sysopen - /etc/hosts)'" plugin_id="object:3fe6334a3dc4"
      ```
    - Change the permission
      ```
      # chmod 644 /etc/hosts
      ```

    - The result would be similar to this:
      ```
      -rw-r--r-- 1 root root 221 Dec 20  2018 /etc/hosts
      ```
    </details>

    <details><summary>Regenerate the SourceComputerId (Agent ID) on the Linux Agent</summary>

    When customers clone machines with the OMS Agent for Linux installed and configured (that is, connected to a Log Analytics workspace), then machines created from that clone image will all have the same SourceComputerId (also known as the agent ID). Follow this wiki for troubleshooting:
    https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605545/How-to-Regenerate-the-SourceComputerId-(Agent-ID)-on-the-Linux-Agent
    </details>

    <details><summary>I'm getting a 403 when I'm trying to onboard!</summary>

    https://github.com/microsoft/OMS-Agent-for-Linux/blob/master/docs/Troubleshooting.md#im-getting-a-403-when-im-trying-to-onboard
    - Probable Causes
      - Date and Time is incorrect on Linux Server
      - Workspace ID and Workspace Key used are not correct
    - Resolution
      - Check the time on your Linux server with the command date. if the data is +/- 15 minutes from current time then onboarding fails. To correct this update, the date and/or timezone of your Linux server.
      - New! The latest version of the OMS Agent for Linux now notifies you if the time skew is causing the onboarding failure
      - Re-onboard using correct Workspace ID and Workspace Key instructions
    </details>

    <details><summary>I'm seeing a 500 Error and 404 Error in the log file right after onboarding</summary>

    https://github.com/microsoft/OMS-Agent-for-Linux/blob/master/docs/Troubleshooting.md#im-seeing-a-500-error-and-404-error-in-the-log-file-right-after-onboarding
    - This is a known issue an occurs on first upload of Linux data into an OMS workspace. This does not affect data being sent or service experience.
    </details>


    <details><summary>I'm not seeing any Linux data in the OMS Portal</summary>

    https://github.com/microsoft/OMS-Agent-for-Linux/blob/master/docs/Troubleshooting.md#im-not-seeing-any-linux-data-in-the-oms-portal
    - Probable Causes
      - Onboarding to the OMS Service failed
      - Connection to the OMS Service is blocked
      - VM was rebooted
      - OMI package was manually upgraded to a newer version compared to what was installed by OMS Agent package
      - OMI is frozen, blocking OMS agent
      - DSC resource logs "class not found" error in ```omsconfig.log``` log file
      - OMS Agent for Linux data is backed up
      - DSC logs "Current configuration does not exist. Execute Start-DscConfiguration command with -Path parameter to specify a configuration file and create a current configuration first." in ```omsconfig.log``` log file, but no log message exists about ```PerformRequiredConfigurationChecks``` operations.

    - Resolutions
      - Install all dependencies like auditd package
      - Check if onboarding the OMS Service was successful by checking if the following file exists: ```/etc/opt/microsoft/omsagent/<workspace id>/conf/omsadmin.conf```
      - Re-onboard using the omsadmin.sh command line [instructions](https://github.com/Microsoft/OMS-Agent-for-Linux/blob/master/docs/OMS-Agent-for-Linux.md#onboarding-using-the-command-line)
      - If using a proxy, check proxy troubleshooting steps above
      - In some Azure distribution systems omid OMI server daemon does not start after Virtual machine is rebooted. This will result in not seeing Audit, ChangeTracking or UpdateManagement solution related data. Workaround is manually start omi server by running ```sudo /opt/omi/bin/service_control restart```
      - After OMI package is manually upgraded to a newer version it has to be manually restarted for OMS Agent to conitnue functioning. This step is required for some distros where OMI server does not automatically start after upgrade. Please run ```sudo /opt/omi/bin/service_control restart``` to restart OMI.
      - In some situations, OMI can become frozen. The OMS agent may enter a blocked state waiting for OMI, blocking all data collection. The OMS agent process will be running but there will be no activity, evidenced by no new log lines (such as sent heartbeats) present in ```omsagent.log```. Restart OMI with ```sudo /opt/omi/bin/service_control restart``` to recover the agent.
      - If you see DSC resource "class not found" error in omsconfig.log, please run sudo /opt/omi/bin/service_control restart
      - In some cases, when the OMS Agent for Linux cannot talk to the OMS Service, data on the Agent is backed up to the full buffer size: 50 MB. The OMS Agent for Linux should be restarted by running the following command /opt/microsoft/omsagent/bin/service_control restart
      - Note: This issue is fixed in Agent version >= 1.1.0-28
      - If ```omsconfig.log``` log file does not indicate that ```PerformRequiredConfigurationChecks``` operations are running periodically on the system, there might be a problem with the cron job/service. Make sure cron job exists under ```/etc/cron.d/OMSConsistencyInvoker```. If needed run the following commands to create the cron job:
    ```
    mkdir -p /etc/cron.d/
    echo "*/15 * * * * omsagent /opt/omi/bin/OMSConsistencyInvoker >/dev/null 2>&1" | sudo tee /etc/cron.d/OMSConsistencyInvoker
    ```
    Also, make sure the cron service is running. You can use service cron status (Debian, Ubuntu, SUSE) or service crond status (RHEL, CentOS, Oracle Linux) to check the status of this service. If the service does not exist, you can install the binaries and start the service using the following:

    On Ubuntu/Debian:
    ```
    # To Install the service binaries
    sudo apt-get install -y cron
    # To start the service
    sudo service cron start
    ```
    On SUSE:
    ```
    # To Install the service binaries
    sudo zypper in cron -y
    # To start the service
    sudo systemctl enable cron
    sudo systemctl start cron
    ```
    On RHEL/CentOS:
    ```
    # To Install the service binaries
    sudo yum install -y crond
    # To start the service
    sudo service crond start
    ```
    On Oracle Linux:
    ```
    # To Install the service binaries
    sudo yum install -y cronie
    # To start the service
    sudo service crond start
    ```
    </details>

    <details><summary>Python issue</summary>

    https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux?tabs=wrapper-script#python-requirement
    Starting from agent version 1.13.27, the Linux agent will support both Python 2 and 3. We always recommend that you use the latest agent.

    If you're using an older version of the agent, you must have the virtual machine use Python 2 by default. If your virtual machine is using a distro that doesn't include Python 2 by default, then you must install it. The following sample commands will install Python 2 on different distros:

    - Red Hat, CentOS, Oracle: yum install -y python2
    - Ubuntu, Debian: apt-get install -y python2
    - SUSE: zypper install -y python2

    Again, only if you're using an older version of the agent, the python2 executable must be aliased to python. Use the following method to set this alias:

    Run the following command to remove any existing aliases:
    ```
    sudo update-alternatives --remove-all python
    ```

    Run the following command to create the alias:
    ```
    sudo update-alternatives --install /usr/bin/python python /usr/bin/python2 1
    ```
    </details>

   -[Knwon issue: Omsagent installation fails if we have both the package managers rpm & dpkg on the VM](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605593/Omsagent-installation-fails-if-we-have-both-the-package-managers-that is-rpm-dpkg-on-the-VM)
   -[TSG: Enable fails with exit code 52 "Couldn't create Marker File"](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/708203/Troubleshooting-Enable-fails-with-exit-code-52-Couldn't-create-Marker-File-)

4. Manual deployment failure scenarios


    <details><summary>workspace key incorrect</summary>

    - Incorrect workspace key was provided when installing the agent.
      - run the following command to offboard from the wrong workspace
    ```sudo /opt/microsoft/omsagent/bin/omsadmin.sh -X```
      - Obtain the workspace ID and workspace key by following this
    https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux?tabs=wrapper-script#workspace-id-and-key
    Log analytics workspace>Agents>Linux servers>Log Analytics agent instruction>copy Workspace ID and Primary key
    ![image.png](/.attachments/image-ac3d843e-4bf5-4064-b47a-bb520c3d2bd9.png)
        - Run the following command in bash to re-onboard the agent
          ```sudo /opt/microsoft/omsagent/bin/omsadmin.sh -w OMS_WS_ID -s OMS_WS_Primary_KEY```

      - Network connection to the endpoints of LAW was failed after installing the agent. 
      -> check if the endpoints are allowed from customer side.
      -> test SSL connection
      https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605541/How-to-Check-SSL-Connectivity-for-OMS-Agent-for-Linux-using-Open-SSL
    </details>

>


5. If you are still seeing the issue, [escalate the case](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/841334/Troubleshooting-OMS-Agent-Install-Uninstall-manual-deployment?anchor=escalating-to-product-group)

##Uninstallation troubleshooting
---
###Basic uninstallation steps to learn how to uninstall the agent.

<details><summary>Basic uninstallation steps</summary>

>- Running the purge script requires internet connection.
>https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot#purge-and-reinstall-the-linux-agent
>  1. Download the purge script:
>
>   ```wget https://raw.githubusercontent.com/microsoft/OMS-Agent-for-Linux/master/tools/purge_omsagent.sh```
>
>  2. Run the purge script (with sudo permissions):
>
>   ```sudo sh purge_omsagent.sh```
>- If no access to internet, follow this wiki to purge manually
>https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605544/How-to-Purge-and-reinstall-the-Linux-agent
</details>

---

>
1. Ask customer to capture the output of the uninstallation shell script(purge_omsagent.sh or other scripts)
![Items (21).png](/.attachments/Items%20(21)-88ac8837-2d4a-4f3c-9c77-c2e6f555eb68.png)

   If customer purged omsagent manually, request the output of the command caused the purge to become stuck.

2. Collect logs to look for any clue while uninstalling
```sudo cat /var/log/messages | grep -i omsagent```
![Items (22).png](/.attachments/Items%20(22)-00bf4785-62cc-4af9-b70d-89d43c059f4e.png)

3. Make sure if omsagent is not running
```ps -ef | grep -i oms | grep -v grep```
![Items (23).png](/.attachments/Items%20(23)-0f6c0e6f-e7ca-43f5-b8c4-4590cac3cec9.png)

4. If customer does not have the output to troubleshoot, ask them to re-run the uninstallation script to obtain the output.

5. If you are still seeing the issue, [escalate the case](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/841334/Troubleshooting-OMS-Agent-Install-Uninstall-manual-deployment?anchor=escalating-to-product-group)


#Escalating to Product Group
---
If you still fail installing or uninstalling omsagent and then you are at a point to reach out to other resources for help.
##Update SAP
Ensure that the Support Topic is coded to Azure/Log Analytics agent (MMA and OMS)/Linux Agents/Linux agent installation and uninstallation issues
Do this to ensure you get the correct template if you need to escalate to the Product Group. 
![Items (9).png](/.attachments/Items%20(9)-cbf59fa7-f8cc-4f36-a646-965dff61a0a9.png)

##Escalate case
Detailed process for PG escalation
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480442/Product-Group-Escalation

Proceed to ASC and utilize the Escalation button at the top right. 
![Items (10).png](/.attachments/Items%20(10)-3cc7935a-108b-4cb8-a4ee-2e4d35a2ac57.png)
You will be given the template automatically but if you are having issues with ASC and need to open an ICM utilize the Manual Template below. You can engage the Escalating to the Azure Log Analytics Agent Product Group directly or you can reach out to your TA / EE for a review before engaging the Product Group. Inform the customer that you are reviewing with a teammate, but do not mention that they are the Product Group or your TA/EE (this is for a customer satisfaction standpoint so they maintain confidence)

Manual Template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ci3v1e 

  - Please be ready to detail what you have done up to this point, and that you have gone through this TSG.

  - Ensure that the Log Collector output is still available in DTM.

  - Make sure your case notes are up to date and complete. This will result in a quicker turnaround time to resolution.

  - What if Agent is behind Azure Private Link? Follow https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750398/Azure-Monitor-Private-Link-Troubleshooting

  - Linux level escalation
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/774568/Collaboration-Guide-Azure-Linux-Escalation-Team

#References
---
**Learning materials**
Brownbag list:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605648/BrownBags

**Troubleshooting guides**
Troubleshooting-OMS-Agent-Install-Issues-Missing-Heartbeats: 
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605654/Troubleshooting-OMS-Agent-Install-Issues-Missing-Heartbeats

Troubleshooting-OMS-Linux-Agent-Missing-Performance-Counters:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605655/Troubleshooting-OMS-Linux-Agent-Missing-Performance-Counters

Troubleshooting-OMS-Linux-Agent-Crash:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605632/Troubleshooting-OMS-Linux-Agent-Crash

Troubleshooting-OMS-Agent-for-Linux-Performance-Issues:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605630/Troubleshooting-OMS-Agent-for-Linux-Performance-Issues

Troubleshooting-omsagent-Hang-Issue:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/620164/Troubleshooting-omsagent-Hang-Issue

Troubleshooting-Issues-related-to-high-CPU-or-Memory-consumption-by-OMS-Agent-or-its-subcomponents:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605653/Troubleshooting-Issues-related-to-high-CPU-or-Memory-consumption-by-OMS-Agent-or-its-subcomponents

Troubleshooting-OmsAgent-plugins-issue-for-distros-running-Python3:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/620169/Troubleshooting-OmsAgent-plugins-issue-for-distros-running-Python3

Required permissions for OS Hardening Customizations
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605657/Required-permissions-for-OS-Hardening-Customizations-Linux-Agent

**Public docs to refer**
Log Analytics agent overview:
https://learn.microsoft.com/azure/azure-monitor/agents/log-analytics-agent

Install the Log Analytics agent on Linux computers:
https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux?tabs=wrapper-script

Log Analytics gateway:
https://learn.microsoft.com/azure/azure-monitor/agents/gateway

agent-linux-troubleshoot:
https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot
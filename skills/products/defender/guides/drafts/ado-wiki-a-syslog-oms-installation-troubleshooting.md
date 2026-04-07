---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Archive/Data Ingestion - Connectors/Deprecated/Syslog OMS Installation and Troubleshooting"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FArchive%2FData%20Ingestion%20-%20Connectors%2FDeprecated%2FSyslog%20OMS%20Installation%20and%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---



Lab: Setup and configure a Linux platform to forward Syslogs from 3rd party devices.

**### Make sure to disable ASC Auto-provisioning before creating the Syslog Server Virtual Machine. ###**

![image.png](/.attachments/image-0e1bb6c3-51a0-417e-97d3-bda173db8d60.png)

1.	Create a Linux Azure Virtual Machine

![image.png](/.attachments/image-e1db9418-be15-49a3-a67c-3c0ea749a941.png)

2.	Enable tcp and udp port 514 for access to the virtual machine.

![image.png](/.attachments/image-fbd34cf4-04a5-4448-a3dd-e4afa629a2e1.png)

3.	Click the add inbound port rule button

![image.png](/.attachments/image-1438b169-19fd-4bfb-a49a-5901f896607a.png)

4.	Click the Add button to save the rule

![image.png](/.attachments/image-6ca426e9-7917-4348-af54-4f1abec91205.png)

5.	SSH or use Serial Console Connection to Login

![image.png](/.attachments/image-a798e667-09fe-489a-a602-20a4a16f4354.png)

6.	Change to Root user
rogfleming@ClassSyslogServer:~$ sudo -i
root@ClassSyslogServer:~#


7.	Create a new browser page and navigate to the Sentinel and enable Syslog and other Syslog facilities (Log Analytics Workspace � Advance settings � Data � Syslog) 

### Note this is not required if they are only going to ingest CEF logs to the Syslog Server to the Log Analytics Workspace.

![image.png](/.attachments/image-e67418a9-41c6-4d82-90c9-f22ff61f8dd5.png)

8.	Open the CEF Connector in Sentinel Data Connector page

![image.png](/.attachments/image-ace10a12-da20-4195-9fc2-1d743a7fcb64.png)

9.	Click the Open Connector Page button

![image.png](/.attachments/image-595becdc-6f38-4334-8c80-e628e91d87d3.png)

10.	Click the copy/Paste icon to copy the Python script to the clipboard


11.	Paste in the Virtual Machine cli the python OMSAgent Install script command

![image.png](/.attachments/image-256938a4-7bb8-45fd-ba06-8d5a7afdf521.png)

12.	Wait until the Python script completes

![image.png](/.attachments/image-8945a219-dbe4-4e11-b1b9-5c064fd47b26.png)

13.	Now that the installation is complete, we need to confirm that everything is working as expected.


14.	We need to run the Python Troubleshooting script to create Mock log events for us to query in Sentinel.

![image.png](/.attachments/image-ccfd5654-be2f-4d7f-adbf-664c26487a77.png)
 
15.	Copy and paste the Python command from the copy/paste icon and paste it in the cli of the virtual machine.

![image.png](/.attachments/image-ad27dee6-1231-42c6-a40f-013e3ed6144b.png)

This confirm the regexp expression has been installed on the agent to parse CEF message on local4

![image.png](/.attachments/image-29ce4ab9-d243-4e6e-9170-c4f77757a3da.png)

This confirms that the Syslog filter for ASA/CEF has been created 
![image.png](/.attachments/image-1f4435cf-6118-4b48-aad6-396ba491e2db.png)
 
This validates that syslog server is listening and the OMSAgent is also up and running

![image.png](/.attachments/image-e43e7de3-014d-4d01-8de5-95a547c03966.png)
 
This means no logs from the external devices is being received by the syslog server

![image.png](/.attachments/image-decf1a99-bd5f-49a3-894e-f218070c63e1.png)
 
These are normal syslog host syslog logs, these are not the ones we are looking for

![image.png](/.attachments/image-c099c5ff-e204-40ea-ad2f-9b187cc4a374.png)

![image.png](/.attachments/image-fa3af7ca-d2a4-48ef-9eda-81d4723d6846.png)

 
The Python script sent MOCK logs to Azure for testing






16.	What do we need to check to confirm that everything is working correctly?
a. Is the syslog server started and connected to the OMSAgent

![image.png](/.attachments/image-0f3a0309-631a-46e8-a75b-22162da91fe9.png)
 
b. Is the OMSAgent filer file present and populated

![image.png](/.attachments/image-0d7a0c44-4c4e-416e-9d09-7836dbb6beec.png)
 
c. Does the OMSAgent have the solution to collect syslogs? Run the following command which will cause the OMSAgent to fetch a update from the LAW
sudo su omsagent -c 'python /opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py'

![image.png](/.attachments/image-54b6434c-7393-4855-9882-a615a536fbec.png)
 
Examine the output and look for keywords Syslog, Info0, and info4






17.	Tcpdump can provide details

root@ClassSyslogServer:/etc/rsyslog.d# tcpdump -Xni any port 514
 
![image.png](/.attachments/image-122b95cb-266c-49a5-bb17-0bbd6569d912.png)

root@ClassSyslogServer:/etc/rsyslog.d# tcpdump -Xni any port 25226

![image.png](/.attachments/image-0aaf84d5-0c85-47c9-8a9c-a8268c771677.png)

18.	Open the Log Analytics Workspace and query CommonSecurityLog

![image.png](/.attachments/image-fc5c1cde-c513-47f9-9ca7-9122fbdc442a.png)
 
*<div style="text-align: right"><font size="1"> Edgie Enabled </div></font>*

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::


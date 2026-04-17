---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Dependencies/AVD/Connectivity/Connectivity Error & TSG Mapping/Use network trace to determine which process is causing disconnection"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FDependencies%2FAVD%2FConnectivity%2FConnectivity%20Error%20%26%20TSG%20Mapping%2FUse%20network%20trace%20to%20determine%20which%20process%20is%20causing%20disconnection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Summary
- User experiences frequent disconnections on Cloud PC, every 90 minutes or so.
- The user is able to sign into the Cloud PC immediately after the disconnection, and pick up where they left off, so there is no logoff or restart happening during the issue.
- Due to the frequency of the issue, a circular trace is required to catch the culprit.

# Collecting network capture

Collect the netsh trace simultaneously from both client and Cloud PC

Starting circular trace with additional logging:
1. Create temp folder (if one does not exist): `mkdir c:\temp`
1. Start trace: `netsh trace start capture=yes level=5 tracefile=c:\temp\%computername%_nettrace.etl maxsize=2048 scenario=netconnection filemode=circular overwrite=yes persistent=yes`
1. Continue running the circular trace until the issue is reproduced. Ensure that the customer collects the exact timestamp of the disconnection.
1. End netsh trace: `netsh trace stop`
1. Run: `Tasklist /svc /fi "imagename eq svchost.exe"  > C:\temp\tasklistsvchost.txt`
1. Provide these details for the repro:
		a. Private IP: 
		b. Public IP: 
		c. Timestamp: 
		d. Name of affected Cloud PC: 
	
# Using Kusto to find the gateway used for the connection

Using the timestamp and information of the affected Cloud PC and timestamp, identify the activity ID of the connection that experienced the issue.


```
DiagActivity  
| where TIMESTAMP >= ago(3d)
| where SessionHostName contains "CPC-facun-02CF1" // CPC name
| where Type == "Connection"
| join kind=leftouter DiagError on ActivityId
| project TIMESTAMP, ActivityId, StartDate, Duration = datetime_diff('minute', EndDate, StartDate), Type, Outcome, UserName, UserObjectId, AadDeviceId, SessionHostJoinType, SessionHostName, GatewayCluster, GatewayRegion , ClientOS, ClientType, ClientVersion, ClientIPAddress, AgentOSVersion, AgentSxsStackVersion, AgentVersion, SessionHostAzureVmLocation, SessionHostIPAddress, UdpType, UdpUse, ErrorInternal, ErrorCodeSymbolic, ErrorSource, ErrorOperation, ErrorMessage
```
 
 
Once you have the activityID, check AVD Orchestration logs to identify which Gateway was used during the connection.


```
RDInfraTrace
| where ActivityId == "065e8921-49ec-4c1b-8ef2-025efbd90000" // Activity ID
| where Msg contains "Use client address"
| project TIMESTAMP, Msg
```


The result would look something like this:


```
Msg
Use client address 'rdgateway-host-green-c104-eus-r1.wvd.microsoft.com'
```


Run: `nslookup rdgateway-host-green-c104-eus-r1.wvd.microsoft.com`, to find the target address the client and Cloud PC communicate to when talking to the AVD gateway. In this example, the **destination IP address** is **20.232.123.155.**

# Analyzing network capture

Enter the following filters to look for call made to the AVD gateway: 

Wireshark: `ip.addr == 20.232.123.155`
Network Monitor: `IPv4.Address == 20.232.123.155`

Analyze the traces and identify [FIN] event. The source IP was the internal IP address of the Cloud PC, while the Destination IP was the IP address of the AVD Gateway.
Within the event, you can also see the PID, or Process ID associated with it. This is the process that triggered the disconnection.

# Identify the name associated with the PID

Cross-reference the PID from the network trace with the taskinfo.txt and tasklistsvchost.txt output.
If the PID is associated with svchost.exe, check `Tasklist /svc /fi "imagename eq svchost.exe"` output to determine the specific service.

# Resolution
In this example, the issue was resolved by modifying session timeout connectivity Terminal Services policies. 
In other scenarios, this might be helpful if we can confirm and identify other services, including third-party, initiating the disconnection from the Cloud PC.

# Need additional assistance
If additional assistance is needed reviewing the network capture, open a collaboration with Windows networking team.
SAP: `Windows/Windows 11/Windows 11 Enterprise and Education, version 22H2/Network Connectivity and File Sharing/TCP/IP Connectivity (TCP Protocol, NLA, NCSI, WinHTTP, Proxy)`

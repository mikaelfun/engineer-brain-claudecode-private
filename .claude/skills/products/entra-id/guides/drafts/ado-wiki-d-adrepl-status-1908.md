---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow: Common Solutions to Replication Failures/Scenario walkthrough: ADREPL status 1908"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FWorkflow%3A%20Common%20Solutions%20to%20Replication%20Failures%2FScenario%20walkthrough%3A%20ADREPL%20status%201908"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/421153&Instance=421153&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/421153&Instance=421153&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a detailed walkthrough for troubleshooting and resolving Active Directory (AD) replication error 1908, which indicates that the domain controller could not be found. It includes steps to enable verbose logging, diagnose the issue using various tools, and fix DNS delegation settings.

## 1908 | Could not find the domain controller for this domain

In this exercise, you will review the netlogon.log to determine the cause of AD replication error 1908. Nltest.exe will be used to enable verbose Netlogon logging as well as exercising the domain controller (DC) locator function of Netlogon. You will then use dcdiag.exe and the DNS management snap-in to further diagnose and resolve the problem.

**Scenario**

**DC1, DC2, and TRDC1 are failing to replicate from ChildDC1 with error 1908 "Could not find the domain controller for this domain".**

This error is returned when there is a failure by Netlogon to locate a DC that is advertising the Key Distribution Center (KDC) flag.

## Task 1 - Determine the cause of the AD replication failure

Perform this task on DC1.

- Enable verbose logging for Netlogon by executing the following command on DC1:
  - `Nltest /dbflag:2080ffff`
  - This enables additional detail to be logged to the Netlogon.log file located in the C:\Windows\Debug directory.

- On DC1, initiate replication from ChildDC1:
  - `repadmin /replicate dc1 childdc1 dc=child,dc=root,dc=contoso,dc=com`
  - `DSReplicaSync() failed with status 1908 (0x774):`
  - `Could not find the domain controller for this domain.`

- From DC1, test Netlogon's ability to locate a KDC in the child.root.contoso.com domain:
  - `Nltest /dsgetdc:child /kdc`
  - `Getting DC name failed: Status = 1355 0x54b ERROR_NO_SUCH_DOMAIN`

- Execute the same command without the /KDC option to see if Netlogon can find any DC in the child domain:
  - `Nltest /dsgetdc:child`
  - `Getting DC name failed: Status = 1355 0x54b ERROR_NO_SUCH_DOMAIN`

- You will now review the netlogon.log file to see what was logged upon the execution of the first nltest command.
  - Open up the Netlogon.log file in (C:\Windows\Debug\Netlogon.log), and go to the bottom of the file to see the most recent entries.
  - Look for the entry that begins with DSGetDcName function called.
    - There will be multiple similar entries. Find the entry in the log that has the same parameters you specified in the first nltest command. (Dom:child and Flags: KDC)
    - If you have trouble locating the call, place your cursor on the last line of text and search up for KDC.  
![Description of the picture](/.attachments/ADReplication/Scenario_walkthrough_ADREPL_status_1908.jpg)

The entry will look similar to the following:

```plaintext
DsGetDcName function called: client PID=2176, Dom:child Acct:(null) Flags: KDC
```

View the results of the operation (everything with the same thread ID) that follows. The last entry will begin with DsGetDcName function returns.

| Time      | Category | ThreadID | Message Text                                                                                      |
|-----------|----------|----------|---------------------------------------------------------------------------------------------------|
| 12:21:42  | MISC     | 3372     | ROOT: **DsGetDcName function called**: client PID=2176, Dom:**child** Acct:(null) Flags: **KDC**  |
| 12:21:42  | MISC     | 3372     | NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c07ffff1                                          |
| 12:21:42  | MAILSLOT | 3372     | Received ping from DC1(DC1.root.contoso.com) child.root.contoso.com (null) on <Local>             |
| 12:21:42  | CRITICAL | 3372     | Ping from DC1 for domain child.root.contoso.com child for (null) on <Local> is invalid since we don't host the named domain. |
| 12:21:50  | CRITICAL | 3372     | **NetpDcGetDcNext: _kerberos._tcp.Boulder._sites.dc._msdcs.child.root.contoso.com.: Cannot Query DNS. 9002 0x232a** |
| 12:21:50  | CRITICAL | 3372     | **NetpDcGetNameIp: child.root.contoso.com: No data returned from DnsQuery.**                      |
| 12:21:50  | MISC     | 3372     | NetpDcGetName: NetpDcGetNameIp for child.root.contoso.com returned 1355                           |
| 12:21:50  | CRITICAL | 3372     | NetpDcGetName: child.root.contoso.com: IP and Netbios are both done.                              |
| 12:21:50  | MISC     | 3372     | ROOT: DsGetDcName function returns 1355 (client PID=2176): Dom:child Acct:(null) Flags: KDC       |

In the Netlogon log output, you can see a DNS lookup failure for a KDC SRV record in the Child domain.

- How do the domain controllers in root.contoso.com resolve names for the Child domain? (Open up the DNS management snap-in to determine the answer)
  - Can you ping child.root.contoso.com?

- Test the DNS delegation settings with Dcdiag.exe:
  - `dcdiag /test:dns /dnsdelegation >dnstest.txt`

- Open up dnstest.txt to see the results of the DNS delegation test.
  - Are there any failures reported for the DNS delegation test?
  - What is the cause of the failure to locate a KDC in the child domain?

## Task 2 - Resolve the AD replication failure

In this task, you will fix the broken DNS delegation for the child domain.

Perform this task on DC1.

- Open up the DNS management snap-in (dnsmgmt.msc).
- Expand Forward Lookup Zones, expand root.contoso.com, and select child.
- Open up the properties of the (same as parent folder) NS record.
- Select the entry for lamedc1.child.contoso.com and then select Remove.
- Add a valid child domain DNS server to the delegation settings:
  - Select **Add**.
  - In the Server fully qualified domain name (FQDN) text box, type: **childdc1.child.root.contoso.com**.
  - In the IP Addresses of this NS record section, type the IP address of ChildDC1: **192.168.10.11**.
  - Select **OK** and then select **OK** again.
  - Select **Yes** to the dialogue window that opens up asking if you want to delete the glue record lamedc1.child.contoso.com [192.168.10.1].
- Now use nltest to verify we are able to locate a KDC in the child domain:
  - `Nltest /dsgetdc:child /kdc /force`
  - The /force option is used to ensure the Netlogon cache is not used.
- Test AD replication (replicate from childdc1 to dc1 and dc2) now that you have corrected the DNS delegation:
  - Initiate replication using repadmin.exe OR via AD Sites and Services.
  - Initiate replication using repadmin:
  - `Repadmin /replicate dc1 childdc1 "dc=child,dc=root,dc=contoso,dc=com"`
  - Initiate replication on DC1 from CHILDDC1 using Active Directory Sites and Services:
- Open up Active Directory Sites and Services (dssite.msc).
- Expand Sites, Boulder, Servers, and DC1.
- Select DC1's **NTDS Settings** object.
- Right-click the **<automatically generated>** connection object from server CHILDDC1 and choose **Replicate Now**.
![Description of the picture](/.attachments/ADReplication/Scenario_walkthrough_ADREPL_status_1908_1.jpg)
- Expand DC2's server object and initiate replication from CHILDDC1.
- Expand TRDC1's server object and initiate replication on TRDC1 from CHILDDC1.

**Tip:**
Use `repadmin /syncall` to quickly initiate AD replication in this lab environment:
Synchronizes a specified domain controller with all replication partners.
By default, if no directory partition is provided in the naming context parameter, the command performs its operations on the configuration directory partition.

```plaintext
[SYNTAX]

/syncall <DSA> [<Naming Context>] [<flags>]

The following flags are supported:
  /a Abort if any server is unavailable.
  /A Sync all naming contexts which are held on the home server.
  /d Identify servers by distinguished name in messages.
  /e Enterprise, cross sites.
  /h Print this help screen.
  /i Iterate indefinitely.
  /I Perform showreps on each server pair in path instead of syncing.
  /j Synchronize adjacent servers only.
  /p Pause for possible user abort after every message.
  /P Push changes outward from home server.
  /q Run in quiet mode, suppress call back messages.
  /Q Run in very quiet mode, report fatal errors only.
  /s Do not synchronize.
  /S Skip initial server response check.
```

By default, /syncall does not cross site boundaries.  
Lab-specific examples:

Synchronizes the target DC with all its partners, all partitions including ones cross-site, displaying the partners by DN rather than GUID.

```plaintext
repadmin /syncall DC1 /Aed
repadmin /syncall DC2 /Aed
repadmin /syncall ChildDC1 /Aed
repadmin /syncall ChildDC2 /Aed
repadmin /syncall TRDC1 /Aed
```

- Refresh the forest-wide replication status using adreplstatus or repadmin.
  - If using adreplstatus, ensure you click the Configuration/Scope Settings tab and then check Re-Discover Environment before refreshing the replication status. This is required because the broken DNS delegation caused an error in the tool's initial discovery of the Child domain.

- Observe that you now have replication status from the child domain DCs. At this point, the only replication error displayed is error 8606.

**Tip:**
If errors other than 8606 or 8614 are displayed:
Ensure you have initiated AD replication from DCs where it was failing before, and then run `repadmin /showrepl` or adreplstatus again.

**Note:**
Note that error 1256 is no longer displayed. This was cleared up by resolving the first set of errors. Error 1256 is logged when the replication task is canceled after a failure to replicate the Schema, configuration, or domain partitions for other replication errors. For this reason, you should always troubleshoot the error that led to the replication task being canceled (do not bother troubleshooting 1256).

More:

For more information, see:  
[Troubleshooting AD Replication error 1908: Could not find the domain controller for this domain.](https://learn.microsoft.com/troubleshoot/windows-server/active-directory/ad-replication-error-1908-not-find-domain-controller)

## Answers

- How do the domain controllers in root.contoso.com resolve names for the child domain?
  - Via DNS delegation - the Child domain zone is delegated to a different DNS server.

- Are there any failures reported for the DCDIAG DNS delegation test?
  - Yes:
```plaintext
DC1

TEST: Delegations (Del)
                  Error: DNS server: lamedc1.child.contoso.com. IP:192.168.10.1
                  [Broken delegated domain child.root.contoso.com.]
```

- Does a server named lamedc1.child.contoso.com exist that hosts the child.root.contoso.com DNS zone?
  - No. Also, the IP address 192.168.10.1 belongs to DC1.

- What is the cause of the failure to locate a KDC in the child domain?
  - Netlogon attempts to locate a KDC by querying a KDC SRV DNS record. Netlogon fails to get a response to this DNS query. Ultimately, this is caused by a broken DNS delegation.

# Log output

**nltest /dsgetdc:child /kdc**  
_Getting DC name failed: Status = 1355 0x54b ERROR_NO_SUCH_DOMAIN_

**Netlogon.log**
```plaintext
12/18 11:05:59 [MISC] [1856] ROOT: DsGetDcName function called: client PID=-1, Dom:CHILD.ROOT.CONTOSO.COM Acct:(null) Flags: IP KDC
12/18 11:05:59 [MISC] [1856] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c07ffff1
12/18 11:05:59 [MAILSLOT] [1856] Received ping from DC1(DC1.root.contoso.com) CHILD.ROOT.CONTOSO.COM (null) on <Local>
12/18 11:05:59 [CRITICAL] [1856] Ping from DC1 for domain CHILD.ROOT.CONTOSO.COM (null) for (null) on <Local> is invalid since we don't host the named domain.
12/18 11:06:06 [MISC] [624] ROOT: DsGetDcName function called: client PID=-1, Dom:CHILD.ROOT.CONTOSO.COM Acct:(null) Flags: IP KDC
12/18 11:06:06 [MISC] [624] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c07ffff1
12/18 11:06:06 [MAILSLOT] [624] Received ping from DC1(DC1.root.contoso.com) CHILD.ROOT.CONTOSO.COM (null) on <Local>
12/18 11:06:06 [CRITICAL] [624] Ping from DC1 for domain CHILD.ROOT.CONTOSO.COM (null) for (null) on <Local> is invalid since we don't host the named domain.
12/18 11:06:08 [CRITICAL] [1856] NetpDcGetDcNext: _kerberos._tcp.Boulder._sites.dc._msdcs.CHILD.ROOT.CONTOSO.COM.: Cannot Query DNS. 9002 0x232a
12/18 11:06:08 [CRITICAL] [1856] NetpDcGetNameIp: CHILD.ROOT.CONTOSO.COM: No data returned from DnsQuery.
12/18 11:06:08 [MISC] [1856] NetpDcGetName: NetpDcGetNameIp for CHILD.ROOT.CONTOSO.COM returned 1355
12/18 11:06:08 [CRITICAL] [1856] NetpDcGetName: CHILD.ROOT.CONTOSO.COM: IP and Netbios are both done.
12/18 11:06:08 [MISC] [1856] ROOT: DsGetDcName function returns 1355 (client PID=-1): Dom:CHILD.ROOT.CONTOSO.COM Acct:(null) Flags: IP KDC
12/18 11:06:08 [CRITICAL] [624] NetpDcGetDcNext: _kerberos._tcp.Boulder._sites.dc._msdcs.CHILD.ROOT.CONTOSO.COM.: Cannot Query DNS. 9002 0x232a
12/18 11:06:08 [CRITICAL] [624] NetpDcGetNameIp: CHILD.ROOT.CONTOSO.COM: No data returned from DnsQuery.
12/18 11:06:08 [MISC] [624] NetpDcGetName: NetpDcGetNameIp for CHILD.ROOT.CONTOSO.COM returned 1355
12/18 11:06:08 [CRITICAL] [624] NetpDcGetName: CHILD.ROOT.CONTOSO.COM: IP and Netbios are both done.
12/18 11:06:08 [MISC] [624] ROOT: DsGetDcName function returns 1355 (client PID=-1): Dom:CHILD.ROOT.CONTOSO.COM Acct:(null) Flags: IP KDC
```

**Network trace**
```plaintext
66    DC1    DC2    DNS:QueryId = 0x7A52, QUERY (Standard query), Query for ChildDC1.child.root.contoso.com of type Host Addr on class Internet    
67    DC1    DC2    DNS:QueryId = 0x597F, QUERY (Standard query), Query for _kerberos._tcp.Boulder._sites.dc._msdcs.CHILD.ROOT.CONTOSO.COM of type SRV
68    DC1    DC2    DNS:QueryId = 0x7A52, QUERY (Standard query), Query for ChildDC1.child.root.contoso.com of type Host Addr on class Internet    
71    DC2    DC1    DNS:QueryId = 0x597F, QUERY (Standard query), Response - Server failure     {DNS:28, UDP:27, IPv4:1}
79    DC1    DC2    DNS:QueryId = 0x7A52, QUERY (Standard query), Query for ChildDC1.child.root.contoso.com of type Host Addr on class Internet    
84    DC2    DC1    DNS:QueryId = 0x7A52, QUERY (Standard query), Response - Server failure     {DNS:32, UDP:31, IPv4:1}
```

**Dcdiag /test:dns /dnsdelegation >dnstest.txt**
```
Directory Server Diagnosis
Performing initial setup:
   Trying to find home server...
   Home Server = DC1
   * Identified AD Forest.
   Done gathering initial info.
Doing initial required tests
   Testing server: Boulder\DC1
      Starting test: Connectivity
         ......................... DC1 passed test Connectivity

Doing primary tests
   Testing server: Boulder\DC1
      Starting test: DNS
         DNS Tests are running and not hung. Please wait a few minutes...
         ......................... DC1 passed test DNS

   Running partition tests on : ForestDnsZones
   Running partition tests on : DomainDnsZones
   Running partition tests on : Schema
   Running partition tests on : Configuration
   Running partition tests on : root
   Running enterprise tests on : root.contoso.com
      Starting test: DNS
         Test results for domain controllers:
            DC: DC1.root.contoso.com
            Domain: root.contoso.com
               TEST: Delegations (Del) 
                  Error: DNS server: lamedc1.child.contoso.com. IP:192.168.10.1 
                  \[Broken delegated domain child.root.contoso.com.\] 

         Summary of test results for DNS servers used by the above domain 
         controllers: 
            DNS server: 192.168.10.1 (lamedc1.child.contoso.com.) 
               1 test failure on this DNS server 
         Summary of DNS test results: 
                                            Auth Basc Forw Del  Dyn  RReg Ext 


            Domain: root.contoso.com 
               DC1                          PASS PASS n/a  FAIL n/a  n/a  n/a   
         ......................... root.contoso.com failed test DNS
```
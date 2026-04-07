---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow: Common Solutions to Replication Failures/Error 1722 RPC Server is Unavailable"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FWorkflow%3A%20Common%20Solutions%20to%20Replication%20Failures%2FError%201722%20RPC%20Server%20is%20Unavailable"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423190&Instance=423190&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423190&Instance=423190&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides troubleshooting steps for resolving the "RPC Server is Unavailable" error (Error 1772) in Active Directory replication. It covers DNS issues, RPC connectivity, and includes commands and tools to diagnose and fix the problem.

---

# Error 1772: RPC server is unavailable

Basically, the destination Domain Controller (DC) is unable to establish Remote Procedure Call (RPC) connectivity with the source DC. 

Replication uses RPC for communication. RPC requires connectivity to TCP port 135 and at least one other port. By default, when the Active Directory service starts, it will allocate a dynamic RPC port for replication. The default range for RPC ports is as follows:
- Windows Server 2003: 1025-5000
- Windows Server 2008 and newer: 49152-65535

This article has the commands to view the RPC port range:  
https://learn.microsoft.com/troubleshoot/windows-server/networking/default-dynamic-port-range-tcpip-chang

This article has the port requirements for Active Directory:  
https://learn.microsoft.com/troubleshoot/windows-server/networking/service-overview-and-network-port-requirements

Active Directory can be set to use a static fixed port by using the steps in this article:  
https://learn.microsoft.com/troubleshoot/windows-server/active-directory/restrict-ad-rpc-traffic-to-specific-port 

This is the main public Knowledge Base (KB) article to troubleshoot the issue:  
https://learn.microsoft.com/troubleshoot/windows-server/active-directory/replication-error-1722-rpc-server-unavailable 

## General Symptoms

If you try to force replication using Active Directory Sites and Services, it will fail with the following error:  
![image.png](/.attachments/image-fb895598-b5cb-4653-8732-dfcffa3ba62c.png)



The `repadmin /showrepl` command will show the following error:

```plaintext
DC=contoso,DC=com 
    Default-First-Site-Name\DC2 via RPC 
        DSA object GUID: 985dd406-194e-4581-944e-8ae8471d9cd5 
        Last attempt @ 2019-11-11 08:18:05 failed, result 1722 (0x6ba): 
            The RPC server is unavailable. 
        1 consecutive failure(s). 
        Last success @ 2019-11-11 08:16:47.
```

## General Troubleshooting Steps

### DNS

It could be a DNS problem. Make sure you can resolve the source DC name using the Fully Qualified Domain Name (FQDN) from the destination DC and the source DC Directory System Agent (DSA) name. You can use ping as a test. You do not need to be able to successfully ping the source DC, but when you run the ping command make sure it shows the correct IP address.

Example:

In the above `repadmin /showrepl` output, the source DC is dc2.contoso.com and the DSA object GUID is 985dd406-194e-4581-944e-8ae8471d9cd5.

The server should correctly resolve both dc2.contoso.com and 985dd406-194e-4581-944e-8ae8471d9cd5._msdcs.contoso.com to the right IP address.

```plaintext
C:\Windows>ping dc2.contoso.com  
Pinging dc2.contoso.com [192.168.1.3] with 32 bytes of data:  

C:\Windows>ping 985dd406-194e-4581-944e-8ae8471d9cd5._msdcs.contoso.com  
Pinging dc2.contoso.com [192.168.1.3] with 32 bytes of data:  
```

The important part is that we should see the correct server name and IP address returned.

### RPC Connectivity

Replication utilizes the RPC protocol for transport. In order to establish RPC connectivity, the destination server must first connect to the source server on TCP port 135. This port is known as the RPC endpoint mapper. The client will send the UUID of the service it wants to communicate with. If that service is registered as an endpoint, the server will respond back with the port that the service is currently listening on. Then the client will make a new connection to the new port number.

A working network trace for a replication request will look like this:

First, the machine will connect to the source DC on port 135. In this case, DC2 is going to try to inbound replicate from DC1.

First, we establish the connection by completing the TCP 3-way handshake:

```plaintext
14978 10:59:15 AM 11/11/2019 3720.7601255 svchost.exe dc2.contoso.com dc1.contoso.com TCP TCP:Flags=CE....S., SrcPort=60389, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=3607795779, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:2104, IPv4:6} 
14979 10:59:15 AM 11/11/2019 3720.7601768 svchost.exe dc1.contoso.com dc2.contoso.com TCP TCP:Flags=.E.A..S., SrcPort=DCE endpoint resolution(135), DstPort=60389, PayloadLen=0, Seq=165070428, Ack=3607795780, Win=8192 ( Negotiated scale factor 0x8 ) = 2097152 {TCP:2104, IPv4:6} 
14980 10:59:15 AM 11/11/2019 3720.7639016 svchost.exe dc2.contoso.com dc1.contoso.com TCP TCP:Flags=...A...., SrcPort=60389, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=3607795780, Ack=165070429, Win=8212 (scale factor 0x8) = 2102272 {TCP:2104, IPv4:6} 
```

Then the DC binds to the RPC Endpoint mapper:

```plaintext
14981 10:59:15 AM 11/11/2019 3720.7639016 svchost.exe dc2.contoso.com dc1.contoso.com MSRPC MSRPC:c/o Bind: EPT(EPMP) UUID{E1AF8308-5D1F-11C9-91A4-08002B14A0FA}  Call=0x2  Assoc Grp=0x0  Xmit=0x16D0  Recv=0x16D0 {MSRPC:2105, TCP:2104, IPv4:6} 
14982 10:59:15 AM 11/11/2019 3720.7642348 svchost.exe dc1.contoso.com dc2.contoso.com MSRPC MSRPC:c/o Bind Ack:  Call=0x2  Assoc Grp=0x277E  Xmit=0x16D0  Recv=0x16D0 {MSRPC:2105, TCP:2104, IPv4:6} 
```

We request the DRSR endpoint:

```plaintext
14983 10:59:15 AM 11/11/2019 3720.7663214 svchost.exe dc2.contoso.com dc1.contoso.com EPM EPM:Request: ept_map: NDR, DRSR(DRSR) {E3514235-4B06-11D1-AB04-00C04FC2DCD2} v4.0, RPC v5, 0.0.0.0:135 (0x87) [DCE endpoint resolution(135)] {MSRPC:2105, TCP:2104, IPv4:6} 
14984 10:59:15 AM 11/11/2019 3720.7665356 svchost.exe dc1.contoso.com dc2.contoso.com EPM EPM:Response: ept_map: NDR, DRSR(DRSR) {E3514235-4B06-11D1-AB04-00C04FC2DCD2} v4.0, RPC v5, 192.168.1.2:49667 (0xC203) [49667] {MSRPC:2105, TCP:2104, IPv4:6} 
15000 10:59:15 AM 11/11/2019 3720.7877645 svchost.exe dc2.contoso.com dc1.contoso.com TCP TCP:Flags=...A...., SrcPort=60389, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=3607796108, Ack=165070709, Win=8211 (scale factor 0x8) = 2102016 {TCP:2104, IPv4:6} 
```

In the endpoint response, the DC will return back the actual TCP port number that the DRSR endpoint resides on:

```plaintext
Floors: NDR, DRSR(DRSR) {E3514235-4B06-11D1-AB04-00C04FC2DCD2} v4.0, RPC v5, 192.168.1.2:49667 (0xC203) [49667]
```

In the endpoint response will be floor information. This will have the TCP port for the endpoint. In this case, it is port 49667.

Then the domain controller will make a new connection on port 49667 and send the command for DRSReplicaSync:

```plaintext
15528 10:59:56 AM 11/11/2019 3761.0291828 lsass.exe dc2.contoso.com dc1.contoso.com TCP TCP:Flags=CE....S., SrcPort=56158, DstPort=49667, PayloadLen=0, Seq=3823342002, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:2291, IPv4:15} 
15529 10:59:56 AM 11/11/2019 3761.0292229 lsass.exe dc1.contoso.com dc2.contoso.com TCP TCP:Flags=.E.A..S., SrcPort=49667, DstPort=56158, PayloadLen=0, Seq=1680022137, Ack=3823342003, Win=8192 ( Negotiated scale factor 0x8 ) = 2097152 {TCP:2291, IPv4:15} 
15530 10:59:56 AM 11/11/2019 3761.0306065 lsass.exe dc2.contoso.com dc1.contoso.com TCP TCP:Flags=...A...., SrcPort=56158, DstPort=49667, PayloadLen=0, Seq=3823342003, Ack=1680022138, Win=1026 (scale factor 0x8) = 262656 {TCP:2291, IPv4:15} 
15531 10:59:56 AM 11/11/2019 3761.0308782 lsass.exe dc2.contoso.com dc1.contoso.com MSRPC MSRPC:c/o Bind: DRSR(DRSR) UUID{E3514235-4B06-11D1-AB04-00C04FC2DCD2}  Call=0x2  Assoc Grp=0x0  Xmit=0x16D0  Recv=0x16D0 {MSRPC:2292, TCP:2291, IPv4:15} 
15532 10:59:56 AM 11/11/2019 3761.0308782 lsass.exe dc2.contoso.com dc1.contoso.com TCP TCP:[Continuation to #15531]Flags=...AP..., SrcPort=56158, DstPort=49667, PayloadLen=541, Seq=3823343463 - 3823344004, Ack=1680022138, Win=1026 (scale factor 0x8) = 262656 {TCP:2291, IPv4:15} 
15533 10:59:56 AM 11/11/2019 3761.0309433 lsass.exe dc1.contoso.com dc2.contoso.com TCP TCP:Flags=...A...., SrcPort=49667, DstPort=56158, PayloadLen=0, Seq=1680022138, Ack=3823344004, Win=8212 (scale factor 0x8) = 2102272 {TCP:2291, IPv4:15} 
15534 10:59:56 AM 11/11/2019 3761.0319109 lsass.exe dc1.contoso.com dc2.contoso.com MSRPC MSRPC:c/o Bind Ack:  Call=0x2  Assoc Grp=0x1894  Xmit=0x16D0  Recv=0x16D0 {MSRPC:2292, TCP:2291, IPv4:15} 
15535 10:59:56 AM 11/11/2019 3761.0340367 lsass.exe dc2.contoso.com dc1.contoso.com MSRPC MSRPC:c/o Alter Cont: DRSR(DRSR)  UUID{E3514235-4B06-11D1-AB04-00C04FC2DCD2}  Call=0x2 {MSRPC:2292, TCP:2291, IPv4:15} 
15536 10:59:56 AM 11/11/2019 3761.0344247 lsass.exe dc1.contoso.com dc2.contoso.com MSRPC MSRPC:c/o Alter Cont Resp:  Call=0x2  Assoc Grp=0x1894  Xmit=0x16D0  Recv=0x16D0 {MSRPC:2292, TCP:2291, IPv4:15} 
15537 10:59:56 AM 11/11/2019 3761.0362847 lsass.exe dc2.contoso.com dc1.contoso.com DRSR DRSR:drsuapi:IDL_DRSBind Request, *Encrypted* {MSRPC:2292, TCP:2291, IPv4:15} 
15538 10:59:56 AM 11/11/2019 3761.0365579 lsass.exe dc1.contoso.com dc2.contoso.com DRSR DRSR:drsuapi:IDL_DRSBind Response, *Encrypted* {MSRPC:2292, TCP:2291, IPv4:15} 
15539 10:59:56 AM 11/11/2019 3761.0392876 lsass.exe dc2.contoso.com dc1.contoso.com DRSR DRSR:drsuapi:IDL_DRSReplicaSync Request, *Encrypted* {MSRPC:2292, TCP:2291, IPv4:15} 
15540 10:59:56 AM 11/11/2019 3761.0397843 lsass.exe dc1.contoso.com dc2.contoso.com DRSR DRSR:drsuapi:IDL_DRSReplicaSync Response, *Encrypted* {MSRPC:2292, TCP:2291, IPv4:15}
```

Here is an example of a failure:

If you force the replication in AD sites and services, the replication attempt will fail with the following error:  
![image.png](/.attachments/image-bf96f9e8-3a57-4b8b-994f-a94961436bc5.png)


If you run `repadmin /showrepl`, you will see this error:

```plaintext
DC=contoso,DC=com 
    Default-First-Site-Name\DC2 via RPC 
        DSA object GUID: 985dd406-194e-4581-944e-8ae8471d9cd5 
        Last attempt @ 2019-11-18 07:32:09 failed, result 1722 (0x6ba): 
            The RPC server is unavailable. 
        1 consecutive failure(s). 
        Last success @ 2019-11-18 07:29:08.
```

A network trace will look similar to the following:

```
183 7:34:33 AM 11/18/2019 2.2623281 lsass.exe dc1.contoso.com dc2.contoso.com TCP TCP:Flags=CE....S., SrcPort=53627, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=3507072612, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:32, IPv4:1} 
211 7:34:34 AM 11/18/2019 2.7779744 dfsrs.exe dc1.contoso.com dc2.contoso.com TCP TCP:Flags=CE....S., SrcPort=53629, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=408554482, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:37, IPv4:1} 
212 7:34:34 AM 11/18/2019 2.7780164 dfsrs.exe dc1.contoso.com dc2.contoso.com TCP TCP:Flags=CE....S., SrcPort=53630, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=3296537162, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:38, IPv4:1} 
213 7:34:34 AM 11/18/2019 2.7780487 dfsrs.exe dc1.contoso.com dc2.contoso.com TCP TCP:Flags=CE....S., SrcPort=53628, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=1581946944, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:39, IPv4:1} 
219 7:34:34 AM 11/18/2019 2.9030580 lsass.exe dc1.contoso.com dc2.contoso.com TCP TCP:Flags=CE....S., SrcPort=53636, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=2767854924, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:40, IPv4:1} 
565 7:34:39 AM 11/18/2019 8.2691212 lsass.exe dc1.contoso.com dc2.contoso.com TCP TCP:[SynReTransmit #183]Flags=......S., SrcPort=53627, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=3507072612, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:32, IPv4:1} 
604 7:34:40 AM 11/18/2019 8.7846812 dfsrs.exe dc1.contoso.com dc2.contoso.com TCP TCP:[SynReTransmit #211]Flags=......S., SrcPort=53629, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=408554482, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:37, IPv4:1} 
605 7:34:40 AM 11/18/2019 8.7846861 dfsrs.exe dc1.contoso.com dc2.contoso.com TCP TCP:[SynReTransmit #212]Flags=......S., SrcPort=53630, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=3296537162, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:38, IPv4:1} 
606 7:34:40 AM 11/18/2019 8.7847087 dfsrs.exe dc1.contoso.com dc2.contoso.com TCP TCP:[SynReTransmit #213]Flags=......S., SrcPort=53628, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=1581946944, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:39, IPv4:1} 
611 7:34:40 AM 11/18/2019 8.9097050 lsass.exe dc1.contoso.com dc2.contoso.com TCP TCP:[SynReTransmit #219]Flags=......S., SrcPort=53636, DstPort=DCE endpoint resolution(135), PayloadLen=0, Seq=2767854924, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 {TCP:40, IPv4:1}
```

In the above example, the server is unable to connect to TCP port 135 on dc2.contoso.com .

This traffic will always be TCP and if the port is unreachable, the source server will always retransmit the packet.

In Netmon we can use this filter to display SYN retransmits.

```
Property.TCPSynRetransmit == 1 
```

A SYN retransmit will only happen if the remote server does not respond to the connection attempt and it is a good indication of a blocked TCP port.

There is a Powershell command named test-netconnection that can be used to test port connectivity.

This is the help page for test-netconnection:  
https://learn.microsoft.com/powershell/module/nettcpip/test-netconnection?view=windowsserver2022-ps&viewFallbackFrom=win10-ps

This command for example would test port 135 to server dc2.contoso.com 


```
Test-NetConnection -computername dc2.contoso.com -port 135 

WARNING: TCP connect to dc2.contoso.com:135 failed 

ComputerName           : dc2.contoso.com 
RemoteAddress          : 192.168.1.3 
RemotePort             : 135 
InterfaceAlias         : Ethernet 
SourceAddress          : 192.168.1.2 
PingSucceeded          : True 
PingReplyDetails (RTT) : 0 ms 
TcpTestSucceeded       : False
```
 
In the above example, the test to port 135 failed.

The network trace should provide some indication as to which port is failing. Once we know the port that is failing we can request the customer to ensure that the required ports are open.

Portqryui can also be used to test ports

Portqryui can be downloaded from this location:
https://www.microsoft.com/download/details.aspx?id=24009 

Portqryui has the ability to query and test the required ports for active directory

This is an example of using portqryui to test required ports:

![image.png](/.attachments/image-60b41248-ee09-454f-9813-3c640049f7b2.png)

A success for TCP port 135 would look like this in the output:

![image.png](/.attachments/image-47083114-be24-46e8-b6f3-febe4ab88070.png)

The above example shows that Portqryui is able to successfully connect to TCP port 135 on dc2.contoso.com
---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/NTLM/Workflow: NTLM: Protocol Flow/Workflow: NTLM: Noninteractive NTLM Authentication"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/NTLM/Workflow%3A%20NTLM%3A%20Protocol%20Flow/Workflow%3A%20NTLM%3A%20Noninteractive%20NTLM%20Authentication"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415186&Instance=415186&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415186&Instance=415186&Feedback=2)

___
<div id='cssfeedback-end'></div>

### Noninteractive NTLM authentication scenario

Noninteractive authentication might be required to permit an already logged-on user to access a resource such as a server application. This typically involves three systems: a client, a server, and a domain controller that performs the authentication calculations on behalf of the server.  
![Workflow for NTLM Noninteractive Authentication](/.attachments/NTLM/Workflow_NTLM_Noninteractive_NTLM_Authentication.png)

The following steps present an outline of NTLM (NT LAN Manager) noninteractive authentication.  
The first step provides the user's NTLM credentials and occurs only as part of the interactive authentication (logon) process.  
A user accesses a client computer and provides a domain name, user name, and password. The client computes a cryptographic hash of the password and discards the actual password.

### Example for an SMB session while accessing a share on a remote server from a client machine in an Active Directory environment

**Application-specific protocol messages are sent between client and server**

- TCP handshake with the server hosting the remote share on port Microsoft-DS (445).
````
146 20:14:02.6203080 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 10.9825626 55.8863241 (0) 192.168.100.51 192.168.100.56 TCP 0 TCP:Flags=......S., SrcPort=50767, DstPort=Microsoft-DS(445), PayloadLen=0, Seq=1659390725, Ack=0, Win=64240 ( Negotiating scale factor 0x8 ) = 64240 
147 20:14:02.6203727 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0000647 55.8863888 (0) 192.168.100.56 192.168.100.51 TCP 0 TCP: [Bad CheckSum]Flags=...A..S., SrcPort=Microsoft-DS(445), DstPort=50767, PayloadLen=0, Seq=986041234, Ack=1659390726, Win=8192 ( Negotiated scale factor 0x8 ) = 8192 
148 20:14:02.6206330 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0002603 55.8866491 (0) 192.168.100.51 192.168.100.56 TCP 0 TCP:Flags=...A...., SrcPort=50767, DstPort=Microsoft-DS(445), PayloadLen=0, Seq=1659390726, Ack=986041235, Win=8212 
````

- Client machine initiates the SMB session setup requesting access to the share hosted on the remote server.
````
149 20:14:02.6206335 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0000005 55.8866496 (0) 192.168.100.51 192.168.100.56 SMB 73 SMB:C; Negotiate, Dialect = NT LM 0.12, SMB 2.002, SMB 2.??? 
- Smb: C; Negotiate, Dialect = NT LM 0.12, SMB 2.002, SMB 2.??? 
    Protocol: SMB 
    Command: Negotiate 114(0x72) 
  + NTStatus: 0x0, Facility = FACILITY_SYSTEM, Severity = STATUS_SEVERITY_SUCCESS, Code = (0) STATUS_SUCCESS 
  + SMBHeader: Command, TID: 0xFFFF, PID: 0xFEFF, UID: 0x0000, MID: 0x0000 
  - CNegotiate:  
     WordCount: 0 (0x0) 
     ByteCount: 34 (0x22) 
   + Dialect: NT LM 0.12 
   + Dialect: SMB 2.002 
   + Dialect: SMB 2.??? 
````

- The server replies with the supported SMB version and preferred authentication mechanisms:
````
150 20:14:02.6208748 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0002413 55.8868909 (4) 192.168.100.56 192.168.100.51 SMB2 252 SMB2:R   NEGOTIATE (0x0), GUID={BCCBA35A-CC6A-93A9-4654-775B6C179917}  
  Frame: Number = 150, Captured Frame Length = 407, MediaType = NetEvent 
+ NetEvent:  
+ MicrosoftWindowsNDISPacketCapture: Packet Fragment (306 (0x132) bytes) 
+ Ethernet: Etype = Internet IP (IPv4),DestinationAddress:[00-15-5D-9D-2F-71],SourceAddress:[00-15-5D-9D-2F-74] 
+ Ipv4: Src = 192.168.100.56, Dest = 192.168.100.51, Next Protocol = TCP, Packet ID = 23821, Total IP Length = 292 
+ Tcp:  [Bad CheckSum]Flags=...AP..., SrcPort=Microsoft-DS(445), DstPort=50767, PayloadLen=252, Seq=986041235 - 986041487, Ack=1659390799, Win=8212 (scale factor 0x0) = 8212 
+ SMBOverTCP: Length = 248 
- SMB2: R   NEGOTIATE (0x0), GUID={BCCBA35A-CC6A-93A9-4654-775B6C179917}  
    SMBIdentifier: SMB 
  + SMB2Header: R NEGOTIATE (0x0),TID=0x0000, MID=0x0000, PID=0x0000, SID=0x0000 
  - RNegotiate:  
     StructureSize: 65 (0x41) 
   + SecurityMode: 1 (0x1) 
     DialectRevision: (0x2ff) - SMB2 wildcard revision number. 
       - securityBlob:  
    - GSSAPI:  
     - InitialContextToken:  
      + ApplicationHeader:  
      + ThisMech: SpnegoToken (1.3.6.1.5.5.2) 
      - InnerContextToken: 0x1 
       - SpnegoToken: 0x1 
        + ChoiceTag:  
        - NegTokenInit:  
         + SequenceHeader:  
         + Tag0:  
         - MechTypes: Prefer Negoex (1.3.6.1.4.1.311.2.2.30) 
          + SequenceHeader:  
          + MechType: Negoex (1.3.6.1.4.1.311.2.2.30) 
          + MechType: MsKerberosToken (1.2.840.48018.1.2.2) 
          + MechType: KerberosToken (1.2.840.113554.1.2.2) 
          + MechType: UserToUserMechanism (1.2.840.113554.1.2.2.3) 
          + MechType: NLMP (1.3.6.1.4.1.311.2.2.10) 
         + Tag3:  
         - NegHints:  
          + SequenceHeader:  
          + Tag0:  
          + hintName: not_defined_in_RFC4178@please_ignore 
````

### Phase 1 - Negotiate

1 - The client sends the NTLM negotiate message (not to be confused with the SMB negotiate phase).
````
154 20:14:02.8582921 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.1872698 56.1243082 (0) 192.168.100.51 192.168.100.56 SMB2 166 SMB2:C   SESSION SETUP (0x1)  
+ Tcp: Flags=...AP..., SrcPort=50767, DstPort=Microsoft-DS(445), PayloadLen=166, Seq=1659390977 - 1659391143, Ack=986041799, Win=8210 
+ SMBOverTCP: Length = 162 
- SMB2: C   SESSION SETUP (0x1)  
    SMBIdentifier: SMB 
  + SMB2Header: C SESSION SETUP (0x1),TID=0x0000, MID=0x0002, PID=0xFEFF, SID=0x0000 
  - CSessionSetup:  
     StructureSize: 25 (0x19) 
     VcNumber: 0 (0x0) 
   + SecurityMode: 1 (0x1) 
   + Capabilities: 0x1 
     Channel: 0 (0x0) 
     SecurityBufferOffset: 88 (0x58) 
     SecurityBufferLength: 74 (0x4A) 
     PreviousSessionId: 0 (0x0) 
   - securityBlob:  
    - GSSAPI:  
     - InitialContextToken:  
      + ApplicationHeader:  
      + ThisMech: SpnegoToken (1.3.6.1.5.5.2) 
      - InnerContextToken: 0x1 
       - SpnegoToken: 0x1 
        + ChoiceTag:  
        - NegTokenInit:  
         + SequenceHeader:  
         + Tag0:  
         - MechTypes: Prefer NLMP (1.3.6.1.4.1.311.2.2.10) 
          + SequenceHeader:  
          + MechType: NLMP (1.3.6.1.4.1.311.2.2.10) 
         + Tag2:  
         + OctetStringHeader:  
         - MechToken: NTLM NEGOTIATE MESSAGE 
          - NLMP: NTLM NEGOTIATE MESSAGE 
             Signature: NTLMSSP 
             MessageType: Negotiate Message (0x00000001) 
           + NegotiateFlags: 0xE2088297 (NTLM v2128-bit encryption, Always Sign) 
           + DomainNameFields: Length: 0, Offset: 0 
           + WorkstationFields: Length: 0, Offset: 0 
           + Version: Windows 10.0 Build 17763 NLMPv15 
````

### Phase 2 - Challenge

2 - The server generates a 16-byte random number, called the challenge or nonce, and sends it to the client. This challenge message is used by the server to challenge the client to prove its identity.
````
155 20:14:02.8584688 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0001767 56.1244849 (4) 192.168.100.56 192.168.100.51 SMB2 341 SMB2:R  - NT Status: System - Error, Code = (22) STATUS_MORE_PROCESSING_REQUIRED  SESSION SETUP (0x1), SessionFlags=0x0  
  Frame: Number = 155, Captured Frame Length = 496, MediaType = NetEvent 
+ NetEvent:  
+ MicrosoftWindowsNDISPacketCapture: Packet Fragment (395 (0x18B) bytes) 
+ Ethernet: Etype = Internet IP (IPv4),DestinationAddress:[00-15-5D-9D-2F-71],SourceAddress:[00-15-5D-9D-2F-74] 
+ Ipv4: Src = 192.168.100.56, Dest = 192.168.100.51, Next Protocol = TCP, Packet ID = 23823, Total IP Length = 381 
+ Tcp:  [Bad CheckSum]Flags=...AP..., SrcPort=Microsoft-DS(445), DstPort=50767, PayloadLen=341, Seq=986041799 - 986042140, Ack=1659391143, Win=8211 (scale factor 0x0) = 8211 
+ SMBOverTCP: Length = 337 
- SMB2: R  - NT Status: System - Error, Code = (22) STATUS_MORE_PROCESSING_REQUIRED  SESSION SETUP (0x1), SessionFlags=0x0  
    SMBIdentifier: SMB 
  + SMB2Header: R SESSION SETUP (0x1),TID=0x0000, MID=0x0002, PID=0xFEFF, SID=0x14000059 
  - RSessionSetup:  
     StructureSize: 9 (0x9) 
   + SessionFlags: 0x0 
     SecurityBufferOffset: 72 (0x48) 
     SecurityBufferLength: 265 (0x109) 
   - securityBlob:  
    - GSSAPI:  
     - NegotiationToken:  
      + ChoiceTag:  
      - NegTokenResp:  
       + SequenceHeader:  
       + Tag0:  
       + NegState: accept-incomplete (1) 
       + Tag1:  
       + SupportedMech: NLMP (1.3.6.1.4.1.311.2.2.10) 
       + Tag2:  
       + OctetStringHeader:  
       - ResponseToken: NTLM CHALLENGE MESSAGE 
        - NLMP: NTLM CHALLENGE MESSAGE 
           Signature: NTLMSSP 
           MessageType: Challenge Message (0x00000002) 
         + TargetNameFields: Length: 14, Offset: 56 
         + NegotiateFlags: 0xE2898215 (NTLM v2128-bit encryption, Always Sign) 
         + ServerChallenge: EAC411D09B585137 
           Reserved: Binary Large Object (8 Bytes) 
         + TargetInfoFields: Length: 162, Offset: 70 
         + Version: Windows 10.0 Build 14393 NLMPv15 
           TargetNameString: CONTOSO 
         + AvPairs: 7 pairs 
````

### Phase 3 - Authenticate

3 - The client machine encrypts this challenge with the hash of the user's password and returns the result (also designated by response) to the server.

- The response to the challenge is sent with an authenticate message.
````
156 20:14:02.8592258 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0007570 56.1252419 (0) 192.168.100.51 192.168.100.56 SMB2 627 SMB2:C   SESSION SETUP (0x1)  
  Frame: Number = 156, Captured Frame Length = 782, MediaType = NetEvent 
+ NetEvent:  
+ MicrosoftWindowsNDISPacketCapture: Packet Fragment (681 (0x2A9) bytes) 
+ Ethernet: Etype = Internet IP (IPv4),DestinationAddress:[00-15-5D-9D-2F-74],SourceAddress:[00-15-5D-9D-2F-71] 
+ Ipv4: Src = 192.168.100.51, Dest = 192.168.100.56, Next Protocol = TCP, Packet ID = 37231, Total IP Length = 667 
+ Tcp: Flags=...AP..., SrcPort=50767, DstPort=Microsoft-DS(445), PayloadLen=627, Seq=1659391143 - 1659391770, Ack=986042140, Win=8208 
+ SMBOverTCP: Length = 623 
- SMB2: C   SESSION SETUP (0x1)  
    SMBIdentifier: SMB 
  + SMB2Header: C SESSION SETUP (0x1),TID=0x0000, MID=0x0003, PID=0xFEFF, SID=0x14000059 
  - CSessionSetup:  
     StructureSize: 25 (0x19) 
     VcNumber: 0 (0x0) 
   + SecurityMode: 1 (0x1) 
   + Capabilities: 0x1 
     Channel: 0 (0x0) 
     SecurityBufferOffset: 88 (0x58) 
     SecurityBufferLength: 535 (0x217) 
     PreviousSessionId: 0 (0x0) 
   - securityBlob:  
    - GSSAPI:  
     - NegotiationToken:  
      + ChoiceTag:  
      - NegTokenResp:  
       + SequenceHeader:  
       + Tag0:  
       + NegState: accept-incomplete (1) 
       + Tag2:  
       + OctetStringHeader:  
       - ResponseToken: NTLM AUTHENTICATE MESSAGEVersion:v2, Domain: CONTOSO, User: testuser, Workstation: CONT-W81 
        - NLMP: NTLM AUTHENTICATE MESSAGEVersion:v2, Domain: CONTOSO, User: testuser, Workstation: CONT-W81 
           Signature: NTLMSSP 
           MessageType: Authenticate Message (0x00000003) 
         + LmChallengeResponseFields: Length: 24, Offset: 134 
         + NtChallengeResponseFields: Length: 320, Offset: 158 
         + DomainNameFields: Length: 14, Offset: 88 
         + UserNameFields: Length: 16, Offset: 102 
         + WorkstationFields: Length: 16, Offset: 118 
         + EncryptedRandomSessionKeyFields: Length: 16, Offset: 478 
         + NegotiateFlags: 0xE2888215 (NTLM v2128-bit encryption, Always Sign) 
         + Version: Windows 10.0 Build 17763 NLMPv15 
         + MessageIntegrityCheck: 6AC5D8B7A1F101D6DA5B6ADE0F606200 
           DomainNameString: CONTOSO 
           UserNameString: testuser 
           WorkstationString: CONT-W81  
       + LmChallengeResponseStruct: 000000000000000000000000000000000000000000000000 
         + NTLMV2ChallengeResponse: C0E9FA6C0FE2C70E847F069C1BF21415 
         + SessionKeyString: 012FD7AECF7D49059EDCEF3DADB8847D 
       + Tag3:  
       + OctetStringHeader:  
       - MechListMic: Version: 1 
        + NLMPMessageSignature: Version: 1 

  ````
   4 - The server sends the following three items to the domain controller:

- Username

- Challenge sent to the client

- Response received from the client

- On the Server Network trace we can see secure communications via RPC between the Member Server and the Domain Controller.

- The Netlogon Service on the Server securely delivers the user credentials to the Domain Controller over a secure channel established between the Server and the Domain Controller.
 ````
172 20:14:02.9896699 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0000885 56.2556860 (540) 192.168.100.56 CONT-DC.contoso.local MSRPC 218 MSRPC:c/o Bind: Netlogon(NRPC) UUID{12345678-1234-ABCD-EF00-01234567CFFB}  Call=0x2  Assoc Grp=0x0  Xmit=0x16D0  Recv=0x16D0  
173 20:14:02.9902827 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0006128 56.2562988 (0) CONT-DC.contoso.local 192.168.100.56 MSRPC 128 MSRPC:c/o Bind Ack:  Call=0x2  Assoc Grp=0x1393  Xmit=0x16D0  Recv=0x16D0  
174 20:14:02.9905334 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0002507 56.2565495 (540) 192.168.100.56 CONT-DC.contoso.local NRPC 920 NRPC:NetrLogonSamLogonEx Request, Encrypted 
175 20:14:02.9920853 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0015519 56.2581014 (0) CONT-DC.contoso.local 192.168.100.56 NRPC 888 NRPC:NetrLogonSamLogonEx Response, Encrypted 
   ````  

On the Server NetLogon Log we can see the SamLogon request from the client machine and DCLocator Process to Locate a Domain Controller to authenticate the User. 

 ````
01/01 20:14:02 [LOGON] [3844] SamLogon: Network logon of CONTOSO\testuser from CONT-W81 Entered 
01/01 20:14:02 [MISC] [3844] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c0fffff1 
01/01 20:14:02 [DNS] [3844] NetpDcFindDomainEntry: CONTOSO contoso.local: Found domain cache entry with quality 6/14 
01/01 20:14:02 [DNS] [3844] Cache: CONTOSO contoso.local: Found existing domain cache entry 
01/01 20:14:02 [MAILSLOT] [3844] NetpDcPingListIp: contoso.local.: Sent UDP ping to 192.168.100.55 
01/01 20:14:02 [MISC] [3844] NlPingDcNameWithContext: Sent 1/1 ldap pings to CONT-DC.contoso.local 
01/01 20:14:02 [MAILSLOT] [3844] NetpDcHandlePingResponse: contoso.local.: Received 'Sam Logon Response Ex' response. 
01/01 20:14:02 [3844] 4c5b4e75 7a7ce7b4 b9a0f2a1 e48be5a0   uN[L..|z........ 
01/01 20:14:02 [MISC] [3844] NetpDcAllocateCacheEntry: new entry 0x000001363A6189C0 -> DC:CONT-DC DnsDomName:contoso.local Flags:0x1f1fd  
01/01 20:14:02 [MISC] [3844] NlPingDcNameWithContext: CONT-DC.contoso.local responded over IP. 
01/01 20:14:02 [SESSION] [3844] CONTOSO: NlSetServerClientSession: New DC is an NT 5 DC: \\CONT-DC.contoso.local 
01/01 20:14:02 [SESSION] [3844] CONTOSO: NlSetServerClientSession: New DC is in closest site: \\CONT-DC.contoso.local 
01/01 20:14:02 [SESSION] [3844] CONTOSO: NlSetServerClientSession: New DC runs the time service: \\CONT-DC.contoso.local 
01/01 20:14:02 [PERF] [3844] NlSetServerClientSession: Not changing connection (000001363A631F28): "\\CONT-DC.contoso.local" 
ClientSession: 000001363A5BABD0NlSetDynamicSiteName: Old and new site names 'Default-First-Site-Name' are identical. 

 ````
5 - The domain controller uses the user name to retrieve the hash of the user's password from the Security Account Manager Database.

- The DC uses this password to encrypt the challenge.
- The Domain Controller compares the encrypted challenge it computed to the response computed by the client.

- On the Domain Controller NTLM.etl we can see the Member Server NTLM request
 ````
[0] 0210.023C::01/01/20-20:14:02.9909680 [dll] msvsam_c2870 MsvValidateTarget() - MsvValidateTarget accepted CONTOSO\CONT-MEM 
 ````
On the Domain Controller NetLogon Log we can see the user logon via the Member Server.
If they match, the domain controller sends the server confirmation that the user is authenticated. Successful User authentication
 ````
01/01 20:14:02 [LOGON] [572] CONTOSO: SamLogon: Transitive Network logon of CONTOSO\testuser from CONT-W81 (via CONT-MEM) Entered 
01/01 20:14:02 [SESSION] [572] QueryContextAttributes: 0.22: 3 returns 0x0 
01/01 20:14:02 [LOGON] [572] CONTOSO: SamLogon: Transitive Network logon of CONTOSO\testuser from CONT-W81 (via CONT-MEM) Returns 0x0 
01/01 20:14:02 [ENCRYPT] [572] NlpSignOrSeal: 0.22: Session Key: ef4586f1 d5f6ef7d 8a1645d9 d78c6a6d   ..E.}....E..mj.. 
01/01 20:14:02 [ENCRYPT] [572] NlpSignOrSeal: 0.22: IV: 5da085b2 736b3b18 7e76cf8e 25367bb6   ...].;ks..v~.{6% 
01/01 20:14:02 [ENCRYPT] [572] NlpSignOrSeal: 0.22: Clear Seq: 3ae10220 9a0759cf c982571a 79458918    ..:.Y...W....Ey 
01/01 20:14:02 [ENCRYPT] [572] NlpSignOrSeal: 0.22: Encrypted Seq: 0eaa4cda 44945a20 54bf6dfb fd0c8fab   .L.. Z.D.m.T.... 
01/01 20:14:02 [SESSION] [572] SealMessage: 0.22: returns 0x0 
 ````
6 - The Server sends response to the client. Assuming valid credentials, the server grants the client access to the requested service or resource.

- On the Member Server Netlogon Log we can see the result of the interaction with the Domain Controller
 ````
01/01 20:14:02 [SESSION] [3844] CONTOSO: NlStartApiClientSession: Bind to server \\CONT-DC.contoso.local (TCP) 1 (Retry: 0). 
01/01 20:14:02 [SESSION] [3844] CONTOSO: NlStartApiClientSession: Try to NlBindingSetAuthInfo 
01/01 20:14:02 [SESSION] [3844] AcquireCredentialsHandleW: called 
01/01 20:14:02 [SESSION] [3844] AllocateCredential: 0.1: credential referenced: 2 
01/01 20:14:02 [SESSION] [3844] AcquireCredentialsHandleW: 0.1: returns 0x0 
01/01 20:14:02 [SESSION] [3844] InitializeSecurityContext: CONT-MEM: called 
01/01 20:14:02 [SESSION] [3844] InitializeSecurityContext: 0.1: CONT-MEM: called with cred handle 
01/01 20:14:02 [SESSION] [3844] InitializeSecurityContext: returns 0x90312 
01/01 20:14:02 [SESSION] [3844] InitializeSecurityContext: CONT-MEM: called 
01/01 20:14:02 [SESSION] [3844] InitializeSecurityContext: 0.c: CONT-MEM: called with context handle 
01/01 20:14:02 [SESSION] [3844] InitializeSecurityContext: returns 0x0 
01/01 20:14:02 [SESSION] [3844] QueryContextAttributes: 0.c: 0 returns 0x0 

01/01 20:14:02 [ENCRYPT] [3844] NlpSignOrSeal: 0.c: Session Key: ef4586f1 d5f6ef7d 8a1645d9 d78c6a6d   ..E.}....E..mj.. 
01/01 20:14:02 [ENCRYPT] [3844] NlpSignOrSeal: 0.c: IV: fb9af22c e5f1934f 153b612a 63c65155   ,...O...*a;.UQ.c 
01/01 20:14:02 [ENCRYPT] [3844] NlpSignOrSeal: 0.c: Clear Seq: 34218c49 c98a446f 3a2636a4 247e6156   I.!4oD...6&:Va~$ 
01/01 20:14:02 [ENCRYPT] [3844] NlpSignOrSeal: 0.c: Encrypted Seq: 74ac72cb 95e2ef37 cb30eb45 77b6a50c   .r.t7...E.0....w 
01/01 20:14:02 [SESSION] [3844] SealMessage: 0.c: returns 0x0 

01/01 20:14:02 [ENCRYPT] [3844] NlpVerifyOrUnseal: 0.c: Session Key: ef4586f1 d5f6ef7d 8a1645d9 d78c6a6d   ..E.}....E..mj.. 
01/01 20:14:02 [ENCRYPT] [3844] NlpVerifyOrUnseal: 0.c: IV: 5da085b2 736b3b18 7e76cf8e 25367bb6   ...].;ks..v~.{6% 
01/01 20:14:02 [ENCRYPT] [3844] NlpVerifyOrUnseal: 0.c: Encrypted Seq: 0eaa4cda 44945a20 54bf6dfb fd0c8fab   .L.. Z.D.m.T.... 
01/01 20:14:02 [ENCRYPT] [3844] NlpVerifyOrUnseal: 0.c: Clear Seq: 3ae10220 9a0759cf c982571a 79458918    ..:.Y...W....Ey 
01/01 20:14:02 [ENCRYPT] [3844] NlpVerifyOrUnseal: 0.c: First Several of signature: c3dafd09 249c6f3e ef468ae7 a641ecc0   ....>o.$..F...A. 

01/01 20:14:02 [SESSION] [3844] UnsealMessage: 0.c: returns 0x0 
01/01 20:14:02 [SESSION] [3844] NlpUserValidateHigher: Seed = 5ddf5b07 1156f51d f5957465 588de214   .[.]..V.et.....X 
01/01 20:14:02 [SESSION] [3844] NlpUserValidateHigher: SessionKey = ef4586f1 d5f6ef7d 8a1645d9 d78c6a6d   ..E.}....E..mj.. 

01/01 20:14:02 [LOGON] [3844] SamLogon: Network logon of CONTOSO\testuser from CONT-W81 Returns 0x0 
 ````

- The User can access the shared resource. - Client Request
 ````
185 20:14:02.9961335 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0000895 56.2621496 (0) 192.168.100.51 192.168.100.56 SMB2 110 SMB2:C   TREE CONNECT (0x3), Path=\CONT-MEM\XFiles 
Status: 0x0, Facility = FACILITY_SYSTEM, Severity = STATUS_SEVERITY_SUCCESS, Code = (0) STATUS_SUCCESS 
 ````
- Server Response allowing access.
 ````
186 20:14:02.9962120 8:14:02 PM 1/1/2020 8:14:02 PM 1/1/2020 0.0000785 56.2622281 (4) 192.168.100.56 192.168.100.51 SMB2 84 SMB2:R   TREE CONNECT (0x3), TID=0x5  
Status: 0x0, Facility = FACILITY_SYSTEM, Severity = STATUS_SEVERITY_SUCCESS, Code = (0) STA
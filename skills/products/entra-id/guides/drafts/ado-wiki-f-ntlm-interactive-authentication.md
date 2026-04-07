---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/NTLM/Workflow: NTLM: Protocol Flow/Workflow: NTLM: Interactive NTLM Authentication"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/NTLM/Workflow%3A%20NTLM%3A%20Protocol%20Flow/Workflow%3A%20NTLM%3A%20Interactive%20NTLM%20Authentication"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415190&Instance=415190&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415190&Instance=415190&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article explains the interactive NTLM (NT LAN Manager) authentication process over a network, detailing the three phases: Negotiate, Challenge, and Authenticate. It provides a step-by-step breakdown of the interactions between a client machine and a domain controller.

# Interactive NTLM authentication scenario

When the NTLM protocol is used, a resource server must take one of the following actions to verify the identity of a computer or user whenever a new access token is needed:
- Contact a domain authentication service on the domain controller for the computer's or user's account domain, if the account is a domain account.
- Look up the computer's or user's account in the local account database, if the account is a local account.

Interactive NTLM authentication over a network typically involves two systems: a client system, where the user is requesting authentication, and a domain controller, where information related to the user's password is kept.

**CHECK FOR PICTURE HERE** ![Workflow of NTLM Interactive NTLM Authentication](/.attachments/NTLM/Workflow_NTLM_Interactive_NTLM_Authentication.png)

## Example of an RPC bind to a domain controller with NTLM authentication while logging on into a domain-joined workstation

### Phase 1 - Negotiate

A user accesses a client machine and provides domain name, user name, and password.
- The client machine computes a cryptographic hash of the password and discards the actual password.
- The client machine establishes a network path to the server and sends a `NEGOTIATE_MESSAGE`. This message allows the client to specify its supported NTLM options to the server.
- On the network trace, we can see the client machine sending an RPC bind request with NTLM negotiate message:

````
331 (616) 192.168.100.51 CONT-DC.contoso.local MSRPC 208 MSRPC:c/o Bind: DRSR(DRSR) UUID{E3514235-4B06-11D1-AB04-00C04FC2DCD2}  Call=0x2  Assoc Grp=0x0  Xmit=0x16D0  Recv=0x16D0  
- MSRPC: c/o Bind: DRSR(DRSR) UUID{E3514235-4B06-11D1-AB04-00C04FC2DCD2}  Call=0x2  Assoc Grp=0x0  Xmit=0x16D0  Recv=0x16D0  
  - Bind: {E3514235-4B06-11D1-AB04-00C04FC2DCD2} DRSR(DRSR) 
   - AuthVerifier: 0x1 
      AuthType: RPC_C_AUTHN_WINNT - NTLM authentication will be used. 
      AuthLevel: dce_c_authn_level_pkt_privacy - This level offers the dce_c_authn_level_pkt_integrity services plus privacy (encryption) of stub call arguments only. All run-time and lower-layer headers are still transmitted in clear text. 
      AuthPadLength: 0 (0x0) 
      AuthReserved: 0 (0x0) 
      AuthContextId: 0 (0x0) 
    - AuthValue:  
     - NLMP: NTLM NEGOTIATE MESSAGE 
        Signature: NTLMSSP 
        MessageType: Negotiate Message (0x00000001) 
      + NegotiateFlags: 0xE20882B7 (NTLM v2128-bit encryption, Always Sign & Seal) 
      + DomainNameFields: Length: 0, Offset: 0 
      + WorkstationFields: Length: 0, Offset: 0 
      + Version: Windows 10.0 Build 17763 NLMPv15 
````

- On the client machine NTLM.etl:

````
[0] 0268.0688::01/01/20-19:24:30.0548132 [msv1_0] ctxtcli_cxx111 SsprHandleFirstCall() - Entering SsprHandleFirstCall 
[0] 0268.0688::01/01/20-19:24:30.0548142 [msv1_0] context_cxx332 SspContextAllocateContext() - Entering SspContextAllocateContext 
[0] 0268.0688::01/01/20-19:24:30.0548160 [msv1_0] context_cxx387 SspContextAllocateContext() - Added Context 000002531AE5CBA0 
[0] 0268.0688::01/01/20-19:24:30.0548163 [msv1_0] context_cxx389 SspContextAllocateContext() - Leaving SspContextAllocateContext 
[0] 0268.0688::01/01/20-19:24:30.0548175 [msv1_0] utility_cxx1632 SspIsTargetLocalhost() - checking if loopback allowed LDAP/CONT-DC.contoso.local/contoso.local@CONTOSO.LOCAL 
[0] 0268.0688::01/01/20-19:24:30.0548279 [msv1_0] ctxtcli_cxx784 SsprHandleFirstCall() - SsprHandleFirstCall: NegotiateFlags = e20882b7 
[0] 0268.0688::01/01/20-19:24:30.0548287 [msv1_0] context_cxx179 SspContextDereferenceContext() - Entering SspContextDereferenceContext 
[0] 0268.0688::01/01/20-19:24:30.0548291 [msv1_0] ctxtcli_cxx861 SsprHandleFirstCall() - Leaving SsprHandleFirstCall: 0x90312 
[0] 0268.0688::01/01/20-19:24:30.0548296 [msv1_0] ctxtapi_cxx481 SpInitLsaModeContext() - Leaving  SpInitLsaModeContext for Old:0000000000000000, New:000002531AE5CBA0 
[0] 0268.0688::01/01/20-19:24:30.0548709 [msv1_0] userapi_cxx2647 SpQueryContextAttributes() - Entering SpQueryContextAttributes 
[0] 0268.0688::01/01/20-19:24:30.0548726 [msv1_0] userapi_cxx393 ReferenceUserContext() - Entering ReferenceUserContext for 000002531AE5CBA0 
[0] 0268.0688::01/01/20-19:24:30.0548734 [msv1_0] userapi_cxx451 ReferenceUserContext() - Leaving ReferenceUserContext for 000002531AE5CBA0, returning 0000000000000000 
[0] 0268.0688::01/01/20-19:24:30.0548737 [msv1_0] userapi_cxx2653 SpQueryContextAttributes() - SpQueryContextAttributes, ReferenceUserContext returns NULL (possible incomplete context) 
[0] 0268.0688::01/01/20-19:24:30.0548744 [msv1_0] userapi_cxx3152 SpQueryContextAttributes() - Leaving SpQueryContextAttributes: 0xc0000008 
[0] 0268.0688::01/01/20-19:24:30.0568558 [msv1_0] ctxtapi_cxx168 SpInitLsaModeContext() - Entering SpInitLsaModeContext for Old:000002531AE5CBA0, New:0000000000000000 
[0] 0268.0688::01/01/20-19:24:30.0568572 [msv1_0] ctxtapi_cxx744 SpAcceptLsaModeContext() - SspGetTokenBuffer: No token passed in 
````

### Phase 2 - Challenge

- The server generates a 16-byte random number, called the challenge or nonce, and sends it to the client.
- This `CHALLENGE_MESSAGE` is used by the server to challenge the client to prove its identity.
- The server (domain controller in the scenario) replies with an RPC bind acknowledge along with the NTLM challenge message to the client.

````
332 (3216) CONT-DC.contoso.local 192.168.100.51 MSRPC 344 MSRPC:c/o Bind Ack:  Call=0x2  Assoc Grp=0x1345  Xmit=0x16D0  Recv=0x16D0  
   - AuthVerifier:  
      AuthType: RPC_C_AUTHN_WINNT - NTLM authentication will be used. 
      AuthLevel: dce_c_authn_level_pkt_privacy - This level offers the dce_c_authn_level_pkt_integrity services plus privacy (encryption) of stub call arguments only. All run-time and lower-layer headers are still transmitted in clear text. 
      AuthPadLength: 0 (0x0) 
      AuthReserved: 0 (0x0) 
      AuthContextId: 0 (0x0) 
    - AuthValue:  
     - NLMP: NTLM CHALLENGE MESSAGE 
        Signature: NTLMSSP 
        MessageType: Challenge Message (0x00000002) 
      + TargetNameFields: Length: 14, Offset: 56 
      + NegotiateFlags: 0xE2898235 (NTLM v2128-bit encryption, Always Sign & Seal) 
      + ServerChallenge: C4AB965ADF51480E 
        Reserved: Binary Large Object (8 Bytes) 
      + TargetInfoFields: Length: 158, Offset: 70 
      + Version: Windows 10.0 Build 14393 NLMPv15 
        TargetNameString: CONTOSO 
      - AvPairs: 7 pairs 
       + AvPair: CONTOSO (Server NetBIOS domain name) 
       + AvPair: CONT-DC (Server NetBIOS computer name) 
       + AvPair: contoso.local (The FQDN (2) of the domain.) 
       + AvPair: CONT-DC.contoso.local (The fully qualified domain name (FQDN (1)) of the computer.) 
       + AvPair: contoso.local (The FQDN (2) of the forest.) 
       + AvPair: 7:24:30 PM 1/1/2020 (Server local time) 
       + AvPair: NULL 
````

- Client machine NTLM.etl:

````
[0] 0268.0688::01/01/20-19:24:30.0568579 [msv1_0] ctxtcli_cxx1197 SsprHandleChallengeMessage() - Entering SsprHandleChallengeMessage 
[0] 0268.0688::01/01/20-19:24:30.0568590 [msv1_0] ctxtapi_cxx91 SpDeleteContext() - Entering SspContextReferenceContext 
[0] 0268.0688::01/01/20-19:24:30.0568614 [msv1_0] ctxtcli_cxx1909 SsprHandleChallengeMessage() - SsprHandleChallengeMessage: Server support NTLM2 caused LM_KEY to be disabled. 
[0] 0268.0688::01/01/20-19:24:30.0568624 [msv1_0] ctxtcli_cxx2094 SsprHandleChallengeMessage() - SsprHandleChallengeMessage: ServerVersion 0xf0000003839000a, Major 10, Minor 0, Build 14393, Revision 15 
[0] 0268.0688::01/01/20-19:24:30.0568663 [msv1_0] ctxtcli_cxx2611 SsprHandleChallengeMessage() - SsprHandleChallengeMessage adding client token restrictions length 48, type 0 
[0] 0268.0688::01/01/20-19:24:30.0568723 [msv1_0] ctxtcli_cxx2929 SsprHandleChallengeMessage() - SsprHandleChallengeMessage using target name CONT-DC.contoso.local/contoso.local@CONTOSO.LOCAL with targetinfo to lookup credman creds 
[0] 0268.0688::01/01/20-19:24:30.0568865 [msv1_0] ctxtcli_cxx4626 CopyCredManCredentials() - CopyCredManCredentials: CrediReadDomainCredentials returned c000000d, LogonId 0:0x5f591c 
[0] 0268.0688::01/01/20-19:24:30.0570308 [msv1_0] ctxtcli_cxx4626 CopyCredManCredentials() - CopyCredManCredentials: CrediReadDomainCredentials returned c0000225, LogonId 0:0x5f591c 
[0] 0268.0688::01/01/20-19:24:30.0570333 [msv1_0] utility_cxx311 SspRevealPassword() - Entering SspRevealPassword 
[0] 0268.0688::01/01/20-19:24:30.0570336 [msv1_0] utility_cxx318 SspRevealPassword() - Leaving SspRevealPassword 
````

### Phase 3 - Authenticate

- The client machine encrypts this challenge with the hash of the user's password and returns the result (also designated by response) to the server.
- The response to the challenge is sent with an `AUTHENTICATE_MESSAGE`.
- The client machine sends the Authenticate_Message:

````
333 (616) 192.168.100.51 CONT-DC.contoso.local MSRPC 600 MSRPC:c/o Auth3:  Call=0x2 
  - AuthVerifier:  
      AuthType: RPC_C_AUTHN_WINNT - NTLM authentication will be used. 
      AuthLevel: dce_c_authn_level_pkt_privacy - This level offers the dce_c_authn_level_pkt_integrity services plus privacy (encryption) of stub call arguments only. All run-time and lower-layer headers are still transmitted in clear text. 
      AuthPadLength: 0 (0x0) 
      AuthReserved: 0 (0x0) 
      AuthContextId: 0 (0x0) 
    - AuthValue:  
     - NLMP: NTLM AUTHENTICATE MESSAGEVersion:v2, Domain: CONTOSO, User: testuser, Workstation: CONT-W81 
        Signature: NTLMSSP 
        MessageType: Authenticate Message (0x00000003) 
      + LmChallengeResponseFields: Length: 24, Offset: 134 
      + NtChallengeResponseFields: Length: 398, Offset: 158 
      + DomainNameFields: Length: 14, Offset: 88 
      + UserNameFields: Length: 16, Offset: 102 
      + WorkstationFields: Length: 16, Offset: 118 
      + EncryptedRandomSessionKeyFields: Length: 16, Offset: 556 
      + NegotiateFlags: 0xE2888235 (NTLM v2128-bit encryption, Always Sign & Seal) 
      + Version: Windows 10.0 Build 17763 NLMPv15 
      + MessageIntegrityCheck: 8F943EB85F380B61DAEC621171102AC8 
        DomainNameString: CONTOSO 
        UserNameString: testuser 
        WorkstationString: CONT-W81 
      + LmChallengeResponseStruct: 000000000000000000000000000000000000000000000000 
      + NTLMV2ChallengeResponse: 5FDFAD7E77567E1FA99F5592AC8A4872 
      + SessionKeyString: 72D4432467B4E8E1E4717D4145E0746B 
````

- Client machine NTLM.etl:

````
[0] 0268.0688::01/01/20-19:24:30.0570622 [msv1_0] nlmain_cxx1978 MspLm20GetChallengeResponse() - MspLm20GetChallengeResponse: LogonId 0:0x5f591c, ParameterControl 0x77, (null)(null); Credential CONTOSO\testuser; CONTOSO\testuser 
[0] 0268.0688::01/01/20-19:24:30.0570640 [msv1_0] nlmain_cxx8821 LsaApLogonTerminated() - NtlmCredIsoInProc::CompareCredentials:319 - NtlmSuccess 
[0] 0268.0688::01/01/20-19:24:30.0570645 [msv1_0] nlmain_cxx8821 LsaApLogonTerminated() - NtlmCredIsoInProc::IsGMSACred:269 - NtlmSuccess 
[0] 0268.0688::01/01/20-19:24:30.0570968 [msv1_0] nlmain_cxx8821 LsaApLogonTerminated() - NtlmCredIsoInProc::Lm20GetNtlm3ChallengeResponse:128 - NtlmSuccess 
[0] 0268.0688::01/01/20-19:24:30.0571011 [msv1_0] ctxtcli_cxx3899 SsprHandleChallengeMessage() - inserting the challenge HEX  
0000  C4AB965A DF51480E                    ...Z.QH. 
 for target LDAP/CONT-DC.contoso.local/contoso.local@CONTOSO.LOCAL, caller 0x268.0x688 
[0] 0268.0688::01/01/20-19:24:30.0571076 [msv1_0] context_cxx1351 SsprMakeSessionKey() - NegotiateFlags 0xe2888235 
[0] 0268.0688::01/01/20-19:24:30.0571080 [msv1_0] context_cxx1356 SsprMakeSessionKey() - session key HEX  
0000  18F48BCF 861F7752 AAB26DB1 E0E574D9  ......wR..m...t. 

[0] 0268.0688::01/01/20-19:24:30.0571084 [msv1_0] context_cxx1359 SsprMakeSessionKey() - LmChallengeResponse  
0000  00000000 00000000 00000000 00000000  ................ 
0010  00000000 00000000                    ........ 

[0] 0268.0688::01/01/20-19:24:30.0571087 [msv1_0] context_cxx1364 SsprMakeSessionKey() - datagram session key  
0000  72D44324 67B4E8E1 E4717D41 45E0746B  r.C$g....q}AE.tk 

[0] 0268.0688::01/01/20-19:24:30.0571146 [msv1_0] ctxtcli_cxx4246 SsprHandleChallengeMessage() - SsprHandleChallengeMessage: ChallengeFlags: e2898235 AuthenticateFlags: e2888235 
[0] 0268.0688::01/01/20-19:24:30.0571207 [msv1_0] context_cxx179 SspContextDereferenceContext() - Entering SspContextDereferenceContext 
[0] 0268.0688::01/01/20-19:24:30.0571238 [msv1_0] ctxtcli_cxx4466 SsprHandleChallengeMessage() - Leaving SsprHandleChallengeMessage: 0x0 
````

- Subsequent requests in the conversation are authenticated using NTLM
````
334 (616) 192.168.100.51 CONT-DC.contoso.local DRSR 208 DRSR:drsuapi:IDL_DRSBind Request, Encrypted 
- MSRPC: c/o Request: DRSR(DRSR) {E3514235-4B06-11D1-AB04-00C04FC2DCD2}  Call=0x2  Opnum=0x0  Context=0x1  Hint=0x94 Warning: Octets trailer appends to authentication token 
  - Request:  
   + PDUBody: 148 bytes 
   - AuthVerifier:  
      AuthPad: Binary Large Object (12 Bytes) 
      AuthType: RPC_C_AUTHN_WINNT - NTLM authentication will be used. 
      AuthLevel: dce_c_authn_level_pkt_privacy - This level offers the dce_c_authn_level_pkt_integrity services plus privacy (encryption) of stub call arguments only. All run-time and lower-layer headers are still transmitted in clear text. 
      AuthPadLength: 12 (0xC) 
      AuthReserved: 0 (0x0) 
      AuthContextId: 0 (0x0) 
    + AuthValue:  
+ Drsr: drsuapi:IDL_DRSBind Request, Encrypted
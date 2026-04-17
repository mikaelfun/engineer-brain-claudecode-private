---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/LDAP/LDAP General/LDAP: Detailed Network Traffic"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/LDAP/LDAP%20General/LDAP%3A%20Detailed%20Network%20Traffic"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1031967&Instance=1031967&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1031967&Instance=1031967&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This guide provides detailed insights into different LDAP communication and authentication scenarios, helping you troubleshoot LDAP network traffic effectively.

[[_TOC_]]
<BR>

#Introduction

This troubleshooting guide provides details about Lightweight Directory Access Protocol (LDAP) network traffic in various scenarios.

#Background

When troubleshooting LDAP issues, our main tool is a network trace. To fully identify customer scenarios, we first need to understand what type of LDAP communication is performed. Below, you will find common LDAP communication and authentication scenarios.

#Scenario 1: RootDSE Connection
This is the default scenario which is commonly observed when we perform LDAP operations.
![image.png](/.attachments/image-c3e74dcc-5f3b-4433-8b62-58ff2bb609fa.png)

In this connection, we see the initial TCP handshake over port 389 (highlighted in green) followed by an LDAPMessage Search request to enumerate all attributes specified in RootDSE.

For the Search Request, note the following -

<P style="margin:0in;font-family:Calibri;font-size:11.0pt">protocolOp:
searchRequest (3)</P>
<P style="margin:0in;font-family:Calibri;font-size:11.0pt">searchRequest</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>baseObject: </P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>scope: baseObject (0)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>derefAliases: neverDerefAliases (0)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>sizeLimit: 0</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>timeLimit: 100</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>typesOnly: False</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Filter: (objectClass=*)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>attributes: 0 items</P>
<br/>

The OperationHeader ID for this operation is 3.

To differentiate a RootDSE query from a normal object query, take note of BaseObject and SearchScope.

If the 'Attributes' fields is empty, we request all attributes.

For the Search Result Entry, the DC sends back a list of attributes that detail lots of useful information that can be used to troubleshoot performance or authentication issues -

<P style="margin:0in;font-family:Calibri;font-size:11.0pt">LDAPMessage
searchResEntry(1) &quot;&lt;ROOT&gt;&quot; [2 results]</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>messageID: 1</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>protocolOp: searchResEntry (<SPAN style="font-weight:bold">4</SPAN>)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>searchResEntry</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>objectName: </P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN><SPAN style="font-weight:bold">attributes:
22 items</SPAN></P>
<br/>
The OperationHeader ID for this operation is 4.

When performing a connection through LDP, the same information is displayed -
 <INSERT ORIGINAL> 

#Scenario 2a: Simple-Bind Authentication
Considered as the least secure authentication method, we bind to the LDAP Server with our credentials that are sent over clear-text to perform authentication.
 ![image.png](/.attachments/image-65e95cc3-702e-4293-984a-e5f9e6e014e5.png)

In this connection, after the initial TCP-handshake and RootDSE connection, we see an LDAP Bind request and Response (as described thoroughly in [ldap_bind_s](https://learn.microsoft.com/en-us/windows/win32/api/winldap/nf-winldap-ldap_bind_s#remarks) )

For the Bind Request, note the following -
<P style="margin:0in;font-family:Calibri;font-size:11.0pt">LDAPMessage
bindRequest(11) &quot;Danny&quot; simple</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>messageID: 11</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>protocolOp: bindRequest (<SPAN style="font-weight:bold">0</SPAN>)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>bindRequest</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>version: 3</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>name: Danny</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>authentication: simple (0)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>simple: &lt;Password&gt;</P>
<br/>

The OperationHeader ID for this operation is 0.
Version is an indication of what LDAP version is being used to perform the simple bind.
 
For the Bind Response, note the following -
<P style="margin:0in;font-family:Calibri;font-size:11.0pt">LDAPMessage
bindResponse(11) success</P>


<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>messageID: 11</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>protocolOp: bindResponse (<SPAN style="font-weight:bold">1</SPAN>)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>bindResponse</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>resultCode: <SPAN style="font-weight:
bold">success</SPAN> (0)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>matchedDN: </P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>errorMessage: </P>

<br/>

The OperationHeader ID for this operation is 1.

Status indicates the result of the bind attempt.

With an unsuccessful bind, 'ErrorMessage' should be populated with useful information, for example -

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt"><SPAN style="background:white">BindResponse: Status: Strong Auth Required</SPAN></P>



<P style="margin-left:.375in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"><SPAN style="background:white"><SPAN></SPAN>MatchedDN: NULL</SPAN></P>

<P style="margin-left:.75in;margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt"><SPAN style="background:white"><SPAN></SPAN>ErrorMessage: 00002028: LdapErr: </SPAN><SPAN style="font-weight:bold;background:white">DSID-0C090254</SPAN><SPAN style="background:white">, comment: The server requires binds to turn on
integrity checking if SSL\TLS are not already active on the connection, data 0,
v4f7c</SPAN></P>
<br/>

#Scenario 2b: NTLM Authentication
While still considered unsecure, we can commonly see LDAP Bind authentication attempts over NTLM on customer environments.
![image.png](/.attachments/image-e3cc7e60-e46a-4148-82dd-baa238e89e39.png)

In this connection, after the initial TCP-handshake and RootDSE connection, we see a doubled amount LDAP Bind Request and Response packets due to the way NTLM authentication works with Challenge/Response generation (as described thoroughly in [ldap_bind_s](https://learn.microsoft.com/en-us/windows/win32/api/winldap/nf-winldap-ldap_bind_s#remarks) )

For the Bind Request, note the following -

<P style="margin:0in;font-family:Calibri;font-size:11.0pt">LDAPMessage bindRequest(24) &quot;NTLM&quot; ntlmsspNegotiate</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>messageID: 24</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>protocolOp: bindRequest (0)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>bindRequest</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>version: 3</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>name: NTLM</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>authentication: ntlmsspNegotiate
(10)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLM Secure Service Provider</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLMSSP identifier: NTLMSSP</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLM Message Type:
NTLMSSP_NEGOTIATE (0x00000001)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Negotiate Flags: <SPAN style="font-weight:bold">0xe2088297</SPAN>, Negotiate 56, Negotiate Key
Exchange, Negotiate 128, Negotiate Version, Negotiate Extended Security,
Negotiate Always Sign, Negotiate NTLM key, Negotiate Lan Manager Key, Negotiate
Sign, Request Target, Negotia</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Calling workstation domain:
NULL</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Calling workstation name:
NULL</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN><SPAN style="font-weight:
bold">Version 10.0 (Build 19041); NTLM Current Revision 15</SPAN></P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Major Version: 10</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Minor Version: 0</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Build Number: 19041</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLM Current Revision:
15</P>
<br/>
The OperationHeader ID for this operation is 0.

Version is an indication of what LDAP version is being used to perform the simple bind.

Our initial NTLM authentication flow is sending a Negotiate message to our LDAP Server with all the fields we support for authentication, the server side goes over the fields and responds according to his own supported settings for NTLM.

For the Bind Response, note the following -

<P style="margin:0in;font-family:Calibri;font-size:11.0pt">LDAPMessage
bindResponse(24) success</P>


<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>messageID: 24</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>protocolOp: bindResponse (<SPAN style="font-weight:bold">1</SPAN>)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>bindResponse</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>resultCode: success (0)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>matchedDN: NTLMSSP</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLM Secure Service Provider</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLMSSP identifier: NTLMSSP</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLM Message Type:<SPAN style="font-weight:bold"> NTLMSSP_CHALLENGE</SPAN> (0x00000002)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Target Name: FABRIKAM</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Negotiate Flags: <SPAN style="font-weight:bold">0xe2898215</SPAN>, Negotiate 56, Negotiate Key
Exchange, Negotiate 128, Negotiate Version, Negotiate Target Info, Negotiate
Extended Security, Target Type Domain, Negotiate Always Sign, Negotiate NTLM
key, Negotiate Sign, Request</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLM Server Challenge: <SPAN style="font-weight:bold">28f440bec23738c4</SPAN></P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Reserved: 0000000000000000</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Target Info</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Length: 138</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Maxlen: 138</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Offset: 72</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Attribute: NetBIOS domain
name: FABRIKAM</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Attribute: NetBIOS computer
name: DC3</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Attribute: DNS domain name:
Fabrikam.com</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Attribute: DNS computer
name: DC3.Fabrikam.com</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Attribute: DNS tree name:
Fabrikam.com</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Attribute: Timestamp</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Attribute: End of list</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Version 10.0 (Build 20348);
NTLM Current Revision 15</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Major Version: 10</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Minor Version: 0</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Build Number: 20348</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLM Current Revision: 15</P>
<br/>
The OperationHeader ID for this operation is 1.

The Response issues an NTLM Challenge for the Client to sign under the agreed NegotiateFlags that are valid for both the Client/Server
 
For the subsequent Bind Request, note the following -

<P style="margin:0in;font-family:Calibri;font-size:11.0pt">LDAPMessage
bindRequest(25) &quot;&lt;ROOT&gt;&quot; ntlmsspAuth</P>


<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>messageID: 25</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>protocolOp: bindRequest (<SPAN style="font-weight:bold">0</SPAN>)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>bindRequest</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>version: 3</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>name: </P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>authentication: ntlmsspAuth (11)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLM Secure Service Provider</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLMSSP identifier: NTLMSSP</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLM Message Type: <SPAN style="font-weight:bold">NTLMSSP_AUTH</SPAN> (0x00000003)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Lan Manager Response:
000000000000000000000000000000000000000000000000</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>LMv2 Client Challenge:
0000000000000000</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLM Response: <SPAN style="font-weight:bold">9827b436d4bbd275b0b117b32fc771580101000000000000c5d3370e4f44d901c787ab57</SPAN></P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Domain name: Fabrikam</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>User name: Danny</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Host name: WIN10B</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Session Key:
0de254b81d744e762a5d8444bcee9758</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Negotiate Flags:
0xe2888215, Negotiate 56, Negotiate Key Exchange, Negotiate 128, Negotiate
Version, Negotiate Target Info, Negotiate Extended Security, Negotiate Always
Sign, Negotiate NTLM key, Negotiate Sign, Request Target, Negotiate U</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Version 10.0 (Build 19041);
NTLM Current Revision 15</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Major Version: 10</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Minor Version: 0</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Build Number: 19041</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>NTLM Current Revision:
15</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>MIC:
9f0992092deed30d26ed7cc482af59cc</P>
<br/>
The Client performs an additional Bind request and provides a Challenge Response for the Server side to conclude the authentication procedure.
 
For the 2nd Bind Response, note the following -

<P style="margin:0in;font-family:Calibri;font-size:11.0pt">LDAPMessage
bindResponse(25) success</P>


<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>messageID: 25</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>protocolOp: bindResponse (1)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>bindResponse</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>resultCode: <SPAN style="font-weight:
bold">success</SPAN> (0)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>matchedDN: </P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>errorMessage: </P>
<br/>
The Server returns a ResultCode: Success to conclude the authentication procedure.
 
#Scenario 2c: Kerberos Authentication
Considered the most secure option for non-TLS LDAP authentication, Kerberos LDAP Bind is performed after a TGS request for an LDAP SPN.
 
![image.png](/.attachments/image-8320d955-0f92-41aa-95e2-34aadcd2770d.png)

In this connection, after the initial TCP-handshake and RootDSE connection and TGS Request/Response to the KDC for an LDAP SPN, we see an LDAP Bind Request and Response (as described thoroughly in [ldap_bind_s](https://learn.microsoft.com/en-us/windows/win32/api/winldap/nf-winldap-ldap_bind_s#remarks) )

For the Bind Request, note the following -

<P style="margin:0in;font-family:Calibri;font-size:11.0pt">Lightweight
Directory Access Protocol</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>LDAPMessage bindRequest(18)
&quot;&lt;ROOT&gt;&quot; sasl</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>messageID: 18</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>protocolOp: bindRequest (<SPAN style="font-weight:bold">0</SPAN>)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>bindRequest</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN><SPAN style="font-weight:bold">version</SPAN>:
3</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>name: </P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>authentication: sasl (3)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>sasl</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>mechanism: GSS-SPNEGO</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>credentials:
6082074106062b0601050502a082073530820731a030302e06092a864882f71201020206</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>GSS-API Generic
Security Service Application Program Interface</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>OID: 1.3.6.1.5.5.2
(SPNEGO - Simple Protected Negotiation)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Simple Protected
Negotiation</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>negTokenInit</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>mechTypes:
4 items</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>mechToken:
608206f306092a864886f71201020201006e8206e2308206dea003020105a10302010ea2</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>krb5_blob:
608206f306092a864886f71201020201006e8206e2308206dea003020105a10302010ea2</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>KRB5
OID: 1.2.840.113554.1.2.2 (KRB5 - Kerberos 5)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>krb5_tok_id: <SPAN style="font-weight:bold">KRB5_AP_REQ</SPAN> (0x0001)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>Kerberos</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>ap-req</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>pvno: 5</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>msg-type: krb-ap-req (14)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>Padding: 0</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>ap-options: 20000000</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>0... .... = reserved: False</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>.0.. .... = use-session-key: False</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>..1. .... = mutual-required: True</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>ticket</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>tkt-vno: 5</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>realm: FABRIKAM.COM</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>sname</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>enc-part</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN><SPAN style="font-weight:bold">authenticator</SPAN></P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>etype: eTYPE-AES256-CTS-HMAC-SHA1-96 (18)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN>
</SPAN>cipher:
3e056d5d4ce1f7339d90ddac6a9683eb667c69a29e56b1f40135bb4680c3393619f35238</P>
<br/> 
The OperationHeader ID for this operation is 0.

Version is an indication of what LDAP version is being used to perform the simple bind.

After we receive a TGS from our KDC, we send a Bind Request where Kerberos is the Preferred Negotiate authentication protocol, inside the request we attach our TGS + Authentication to perform proper Kerberos Authentication with the LDAP Server. If we check the ticket & authenticator, the encryption type can be observed.

For the Bind Response, note the following -

<P style="margin:0in;font-family:Calibri;font-size:11.0pt">LDAPMessage
bindResponse(18) success</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>messageID: 18</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>protocolOp: bindResponse (<SPAN style="font-weight:bold">1</SPAN>)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>bindResponse</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>resultCode: success (0)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>matchedDN: </P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>errorMessage: </P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>serverSaslCreds:
a181b63081b3a0030a0100a10b06092a864882f712010202a2819e04819b60819806092a</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Simple Protected Negotiation</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>negTokenTarg</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>negResult: <SPAN style="font-weight:bold">accept-completed</SPAN> (0)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>supportedMech:
1.2.840.48018.1.2.2 (MS KRB5 - Microsoft Kerberos 5)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>responseToken:
60819806092a864886f71201020202006f8188308185a003020105a10302010fa2793077</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>krb5_blob:
60819806092a864886f71201020202006f8188308185a003020105a10302010fa2793077</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>KRB5 OID:
1.2.840.113554.1.2.2 (KRB5 - Kerberos 5)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>krb5_tok_id:
KRB5_AP_REP (0x0002)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>Kerberos</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>ap-rep</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>pvno: 5</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>msg-type: <SPAN style="font-weight:bold">krb-ap-rep</SPAN> (15)</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt"><SPAN> </SPAN>enc-part</P>
<br/>
The OperationHeader ID for this operation is 1.
As part of the Kerberos authentication flow, we send back a KRB_AP_REP message to indicate that the authentication is successful and that the bind has concluded.
 
#Scenario 3: LDAP over TLS (LDAPS)
Runs over port 636 by default, LDAPS allows for an end-to-end TLS communication with an option to establish authentication via client authentication.
 ![image.png](/.attachments/image-077f84c7-2a6f-4313-b821-e57a841b4ce1.png)

In this connection, after the initial TCP-handshake, instead of seeing the normal RootDSE connection attempt, we start a TLS communication to establish a connection with our LDAP Server.
Once the connection is fully established, the subsequent LDAP Bind for authentication is encrypted inside the TLS Tunnel meaning we won't see any traffic unless we use the server side's certificate to decrypt the data in the network trace.

#Scenario 4: LDAP Signing & Encryption
An optional security measure to mitigate MITM (man-in-the-middle) attacks where a bad actor can sniff the LDAP packets and redirect them back to the DC. Once we enable LDAP signing, encryption is also enabled by default so that all subsequent operations that are performed after the initial bind will be encrypted. Starting with Windows 10, all clients perform LDAP Signing by default
![image.png](/.attachments/image-7d6131f9-6671-4a8b-8563-b9c31df32c68.png)

In this connection, after the initial TCP-handshake, RootDSE connection and successful Bind, we are unable to view subsequent LDAP Operations as they are encrypted and signed, if we check the LDAPSASLBuffer section in the frame, we can observe the SASL checksum that signs these frames as part of the security measure to make sure they aren't tampered with
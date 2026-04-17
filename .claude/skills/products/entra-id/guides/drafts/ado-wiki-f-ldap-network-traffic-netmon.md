---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/LDAP/LDAP General/LDAP: Detailed Networking Traffic - Netmon"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/LDAP/LDAP%20General/LDAP%3A%20Detailed%20Networking%20Traffic%20-%20Netmon"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/888057&Instance=888057&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/888057&Instance=888057&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This troubleshooting guide provides details on LDAP (Lightweight Directory Access Protocol) network traffic in various scenarios, including RootDSE connections, Simple-Bind authentication, NTLM authentication, Kerberos authentication, and LDAP over TLS (LDAPS).

[[_TOC_]]
<BR>

# Introduction

This troubleshooting page provides details about LDAP Network traffic on various scenarios.

# Background

When troubleshooting LDAP issues, our main tool is a network trace. To fully identify customer scenarios, we first need to understand what type of LDAP communication is performed. Below, you will find common LDAP communication and authentication scenarios.


# Scenario 1: RootDSE Connection

<P style="margin-top:0pt;margin-bottom:12pt;font-family:&quot;Segoe UI VSS \(Regular\)&quot;;font-size:11.25pt"  lang=en-US><SPAN style="background:white">This is the
default scenario which is commonly observed when we perform LDAP operations.</SPAN></P>

![image.png](/.attachments/image-0b17959e-9fc7-45e2-8412-997a877c9e3a.png)

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US><SPAN style="background:white">In this connection, we see the
initial TCP handshake over port 389 (highlighted in green) followed by an
LDAPMessage Search request to enumerate all attributes specified in RootDSE.</SPAN></P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US><SPAN style="background:white">For the Search Request, note the
following -</SPAN></P>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">OperationHeader: Search Request, </SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:
     normal;font-weight:bold;font-family:Calibri;font-size:11.0pt">3(0x3)</SPAN></LI>
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt">SearchRequest: </SPAN><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">BaseDN: NULL, SearchScope: base
     Object</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt">,
     SearchAlias: neverDerefAliases</SPAN></LI>
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt">Attributes:</SPAN></LI>
</OL>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>The OperationHeader ID for this operation is 3.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>To differentiate a RootDSE query from a normal object query, take
note of BaseDN and SearchScope.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>If the 'Attributes' fields is empty, we request all attributes.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>For the Search Result Entry, the DC sends back a list of attributes
that detail lots of useful information that can be used to troubleshoot
performance or authentication issues -</P>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">OperationHeader: Search Result Entry, </SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:
     normal;font-weight:bold;font-family:Calibri;font-size:11.0pt">4(0x4)</SPAN></LI>
</OL>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:normal">
 <LI  value=2 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt;font-weight:bold"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:
     normal;font-weight:normal;font-family:Calibri;font-size:11.0pt">SearchResultEntry:
     NULL</SPAN></LI>
 <OL  type=a style="margin-top:0in;margin-bottom:
  0in;font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:normal">
  <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt;font-weight:bold"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-weight:normal;font-family:Calibri;font-size:11.0pt">Attributes:
      22 Partial Attributes</SPAN></LI>
  <OL  type=i style="margin-top:0in;margin-bottom:
   0in;font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:normal">
   <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt;font-weight:bold"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-weight:normal;font-family:Calibri;font-size:11.0pt">&lt;List
       of attributes here&gt;</SPAN></LI>
  </OL>
 </OL>
</OL>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>The OperationHeader ID for this operation is 4.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>When performing a connection through LDP, the same information is
displayed - </P>

![image.png](/.attachments/image-c84e00c8-9a0c-4dc9-94c3-f1b934e8b042.png)


<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

# Scenario 2a: Simple-Bind Authentication

<P style="margin-top:0pt;margin-bottom:12pt;font-family:&quot;Segoe UI VSS \(Regular\)&quot;;font-size:11.25pt"  lang=en-US><SPAN style="background:white">Considered as the
least secure authentication method, we bind to the LDAP Server with our
credentials that are sent over clear-text to perform authentication.</SPAN></P>


![image.png](/.attachments/image-9983bb8d-b039-4864-803d-9b53bec7ebcf.png)

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US><SPAN style="background:white">In this connection, after the initial
TCP-handshake and RootDSE connection, we see an LDAP Bind request and Response
(as described thoroughly in </SPAN><A 
href="https://learn.microsoft.com/en-us/windows/win32/api/winldap/nf-winldap-ldap_bind_s#remarks">ldap_bind_s
</A><SPAN style="background:white">)</SPAN></P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US><SPAN style="background:white">For the Bind Request, note the
following -</SPAN></P>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">OperationHeader: Bind Request, </SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:
     normal;font-weight:bold;font-family:Calibri;font-size:11.0pt">0(0)</SPAN></LI>
</OL>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:normal">
 <LI  value=2 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt;font-weight:bold"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:
     normal;font-weight:normal;font-family:Calibri;font-size:11.0pt">BindRequest:
     </SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:normal;font-weight:bold;font-family:Calibri;font-size:11.0pt">Version:3</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:
     normal;font-weight:normal;font-family:Calibri;font-size:11.0pt">,
     Name:Danny, UserName: &lt;Password&gt;, </SPAN><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:bold;font-style:normal;font-weight:
     bold;font-family:Calibri;font-size:11.0pt">Authentication type = simple</SPAN></LI>
</OL>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>The OperationHeader ID for this operation is 0.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>Version is an indication of what LDAP version is being used to
perform the simple bind.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>For the Bind Response, note the following -</P>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">OperationHeader: Bind Response, 1(0x1)</SPAN></LI>
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt">BindResponse: </SPAN><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">Status: Success</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt">, MatchedDN: NULL,
     ErrorMessage: NULL</SPAN></LI>
</OL>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>The OperationHeader ID for this operation is 1.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>Status indicates the result of the bind attempt.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>With an unsuccessful bind, 'ErrorMessage' should be populated with
useful information - </P>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">BindResponse: Status: Strong Auth Required,
     MatchedDN: NULL, ErrorMessage: 00002028: LdapErr: DSID-0C090254, comment:
     The server requires binds to turn on integrity checking if SSL\TLS are not
     already active on the connection, data 0, v4f7c</SPAN></LI>
</OL>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

# Scenario 2b: NTLM Authentication

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>While still considered unsecure, we can commonly see LDAP Bind
authentication attempts over NTLM on customer environments.</P>

![image.png](/.attachments/image-a5929240-4f15-44c2-b5a8-d2cef826e298.png)
<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US><SPAN style="background:white">In this connection, after the initial
TCP-handshake and RootDSE connection, we see a doubled amount LDAP Bind Request
and Response packets due to the way NTLM authentication works with
Challenge/Response generation (as described thoroughly in </SPAN><A 
href="https://learn.microsoft.com/en-us/windows/win32/api/winldap/nf-winldap-ldap_bind_s#remarks">ldap_bind_s
</A><SPAN style="background:white">)</SPAN></P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US><SPAN style="background:white">For the Bind Request, note the
following -</SPAN></P>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">OperationHeader: Bind Request, </SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:
     normal;font-weight:bold;font-family:Calibri;font-size:11.0pt">0(0)</SPAN></LI>
</OL>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:normal">
 <LI  value=2 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt;font-weight:bold"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:
     normal;font-weight:normal;font-family:Calibri;font-size:11.0pt">BindRequest:
     </SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:normal;font-weight:bold;font-family:Calibri;font-size:11.0pt">Version:3</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:
     normal;font-weight:normal;font-family:Calibri;font-size:11.0pt">, Name:</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:
     normal;font-weight:bold;font-family:Calibri;font-size:11.0pt">NTLM</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:
     normal;font-weight:normal;font-family:Calibri;font-size:11.0pt">,
     Authentication type = sicilyNegotiate</SPAN></LI>
</OL>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=3 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">NLMP: NTLM NEGOTIATE MESSAGE</SPAN></LI>
 <OL  type=a style="margin-top:0in;margin-bottom:
  0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
  <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
      Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
      Calibri;font-size:11.0pt">MessageType: Negotiate Message (0x00000001)</SPAN></LI>
  <LI style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:
      0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt">NegotiateFlags: </SPAN><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">0xE2088297</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt"> (NTLM v2128-bit encryption,
      Always Sign)</SPAN></LI>
 </OL>
</OL>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>The OperationHeader ID for this operation is 0.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>Version is an indication of what LDAP version is being used to
perform the simple bind.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>Our initial NTLM authentication flow is sending a Negotiate message
to our LDAP Server with all the fields we support for authentication, the
server side goes over the fields and responds according to his own supported
settings for NTLM.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>For the Bind Response, note the following -</P>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">OperationHeader: Bind Response, 1(0x1)</SPAN></LI>
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt">SicilyBindResponse: Success</SPAN></LI>
 <OL  type=a style="margin-top:0in;margin-bottom:
  0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
  <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
      Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
      Calibri;font-size:11.0pt">NLMP: NTLM CHALLENGE MESSAGE</SPAN></LI>
  <OL  type=i style="margin-top:0in;margin-bottom:
   0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
   <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
       Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:Calibri;font-size:11.0pt">MessageType: Challenge Message
       (0x00000002)</SPAN></LI>
   <LI style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:
       0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt">NegotiateFlags: </SPAN><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">0xE2898215</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt"> (NTLM v2128-bit
       encryption, Always Sign)</SPAN></LI>
   <LI style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:
       0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt">ServerChallenge: </SPAN><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">28F440BEC23738C4</SPAN></LI>
  </OL>
 </OL>
</OL>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>The OperationHeader ID for this operation is 1.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>SicilyBindResponse indicates the result of the bind attempt.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>The Response issues an NTLM Challenge for the Client to sign under
the agreed NegotiateFlags that are valid for both the Client/Server</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US><SPAN style="background:white">For the 2nd Bind Request, note the
following -</SPAN></P>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">OperationHeader: Bind Request, </SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:
     normal;font-weight:bold;font-family:Calibri;font-size:11.0pt">0(0)</SPAN></LI>
</OL>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:normal">
 <LI  value=2 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt;font-weight:bold"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:
     normal;font-weight:normal;font-family:Calibri;font-size:11.0pt">BindRequest:
     Version:3, Name:NULL, Authentication type = sicilyResponse</SPAN></LI>
</OL>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=3 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">NLMP: NTLM AUTHENTICATE MESSAGEVersion:v2,
     Domain: Fabrikam, User: Danny, Workstation: WIN10B</SPAN></LI>
 <OL  type=a style="margin-top:0in;margin-bottom:
  0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
  <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
      Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
      Calibri;font-size:11.0pt">MessageType: Authenticate Message (0x00000003)</SPAN></LI>
  <LI style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:
      0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt">NTLMV2ChallengeResponse:
      9827B436D4BBD275B0B117B32FC77158</SPAN></LI>
 </OL>
</OL>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>The Client performs an additional Bind request and provides a
Challenge Response for the Server side to conclude the authentication
procedure.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>For the 2nd Bind Response, note the following -</P>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">OperationHeader: Bind Response, 1(0x1)</SPAN></LI>
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt">SicilyBindResponse: Success</SPAN></LI>
 <OL  type=a style="margin-top:0in;margin-bottom:
  0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
  <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
      Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
      Calibri;font-size:11.0pt">ResultCode: Success</SPAN></LI>
 </OL>
</OL>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>The Server returns a ResultCode: Success to conclude the
authentication procedure.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

# Scenario 2c: Kerberos Authentication

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>Considered the most secure option for non-TLS LDAP authentication,
Kerberos LDAP Bind is performed after a TGS request for an LDAP SPN.</P>

![image.png](/.attachments/image-f68fd84b-0c30-4bb4-a0af-a40640462815.png)

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US><SPAN style="background:white">In this connection, after the initial
TCP-handshake and RootDSE connection and TGS Request/Response to the KDC for an
LDAP SPN, we see an LDAP Bind Request and Response (as described thoroughly in </SPAN><A 
href="https://learn.microsoft.com/en-us/windows/win32/api/winldap/nf-winldap-ldap_bind_s#remarks">ldap_bind_s
</A><SPAN style="background:white">)</SPAN></P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US><SPAN style="background:white">For the Bind Request, note the
following -</SPAN></P>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">OperationHeader: Bind Request, </SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:
     normal;font-weight:bold;font-family:Calibri;font-size:11.0pt">0(0)</SPAN></LI>
</OL>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:normal">
 <LI  value=2 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt;font-weight:bold"><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:
     normal;font-weight:normal;font-family:Calibri;font-size:11.0pt" 
     lang=en-US>BindRequest: Version:3, Name:NULL, PrincipalName:
     LDAP/DC3.Fabrikam.com/Fabrikam.com, Authentication type</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:
     normal;font-weight:normal;font-family:Calibri;font-size:11.0pt"  lang=he> </SPAN><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-weight:normal;font-family:Calibri;font-size:11.0pt"  lang=en-US>= sasl</SPAN></LI>
 <OL  type=a style="margin-top:0in;margin-bottom:
  0in;font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:normal">
  <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt;font-weight:bold"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-weight:normal;font-family:Calibri;font-size:11.0pt">AuthenticationTypeHeader:
      Authentication type = sasl</SPAN></LI>
  <OL  type=i style="margin-top:0in;margin-bottom:
   0in;font-family:Calibri;font-size:11.0pt;font-weight:bold;font-style:normal">
   <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt;font-weight:bold"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-weight:normal;font-family:Calibri;font-size:11.0pt">Credentials:
       </SPAN></LI>
  </OL>
 </OL>
</OL>

<P style="margin-left:1.5in;margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt"  lang=en-US>GSSSpnegoCredentials: </P>

<P style="margin-left:1.875in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>GssApi: </P>

<P style="margin-left:2.25in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>InitialContextToken: </P>

<P style="margin-left:2.625in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>InnerContextToken: 0x1</P>

<P style="margin-left:3.0in;margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt"  lang=en-US>NegTokenInit: </P>

<P style="margin-left:3.375in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>MechTypes: <SPAN style="font-weight:bold">Prefer
MsKerberosToken</SPAN> (1.2.840.48018.1.2.2)</P>

<P style="margin-left:3.375in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>MechToken: 0x1</P>

<P style="margin-left:3.75in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>MsKerberosToken: 0x1</P>

<P style="margin-left:4.125in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>KerberosInitToken: </P>

<P style="margin-left:4.5in;margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt"  lang=en-US>InnerContextToken: 0x1</P>

<P style="margin-left:4.875in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>KerberosToken: 0x1</P>

<P style="margin-left:5.25in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>ApReq: <SPAN style="font-weight:bold">KRB_AP_REQ
(14)</SPAN></P>

<P style="margin-left:5.625in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>Ticket: Realm: <SPAN style="font-weight:
bold">FABRIKAM.COM, Sname: LDAP/DC3.Fabrikam.com/Fabrikam.com</SPAN></P>

<P style="margin-left:5.625in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US><SPAN style="font-weight:bold">Authenticator:
</SPAN></P>

<P style="margin-left:5.625in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>&nbsp;</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>The OperationHeader ID for this operation is 0.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>Version is an indication of what LDAP version is being used to
perform the simple bind.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>After we receive a TGS from our KDC, we send a Bind Request where
Kerberos is the Preferred Negotiate authentication protocol, inside the request
we attach our TGS + Authentication to perform proper Kerberos Authentication
with the LDAP Server. If we check the ticket &amp; authenticator, the
encryption type can be observed.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>For the Bind Response, note the following -</P>

<OL  type=1 style="margin-top:0in;margin-bottom:
 0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
 <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
     Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
     Calibri;font-size:11.0pt">OperationHeader: Bind Response, 1(0x1)</SPAN></LI>
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:Calibri;font-size:11.0pt">BindResponse: Status: Success, MatchedDN: NULL,
     ErrorMessage: NULL</SPAN></LI>
 <OL  type=a style="margin-top:0in;margin-bottom:
  0in;font-family:Calibri;font-size:11.0pt;font-weight:normal;font-style:normal">
  <LI  value=1 style="margin-top:0;margin-bottom:0;vertical-align:middle;margin-top:0pt;margin-bottom:12pt"  lang=en-US><SPAN style="font-family:
      Calibri;font-size:11.0pt;font-weight:normal;font-style:normal;font-family:
      Calibri;font-size:11.0pt">ServerSaslCreds: </SPAN></LI>
 </OL>
</OL>

<P style="margin-left:1.125in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>GSS_Spnego: </P>

<P style="margin-left:1.5in;margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt"  lang=en-US>NegTokenResp: </P>

<P style="margin-left:1.875in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>SupportedMech: MsKerberosToken
(1.2.840.48018.1.2.2)</P>

<P style="margin-left:1.875in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>ResponseToken: 0x1</P>

<P style="margin-left:2.25in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>MsKerberosToken: 0x1</P>

<P style="margin-left:2.625in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>KerberosInitToken: </P>

<P style="margin-left:3.0in;margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt"  lang=en-US>InnerContextToken: 0x1</P>

<P style="margin-left:3.375in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>KerberosToken: 0x1</P>

<P style="margin-left:3.75in;margin-top:0pt;margin-bottom:12pt;font-family:
Calibri;font-size:11.0pt"  lang=en-US>ApRep: <SPAN style="font-weight:bold">KRB_AP_REP
(15)</SPAN></P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>The OperationHeader ID for this operation is 1.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>As part of the Kerberos authentication flow, we send back a <SPAN style="font-weight:bold">KRB_AP_REP </SPAN>message to indicate that the
authentication is successful and that the bind has concluded.</P>

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

# Scenario 3: LDAP over TLS (LDAPS)

Runs over port 636 by default, LDAPS allows for an end-to-end TLS communication with an option to establish authentication via client authentication.

![image.png](/.attachments/image-ad460930-07f9-4c5c-a37a-9f190a537c9a.png)

<P style="margin-top:0pt;margin-bottom:12pt;font-family:Calibri;font-size:11.0pt" 
lang=en-US>&nbsp;</P>

In this connection, after the initial TCP-handshake, instead of seeing the normal RootDSE connection attempt, we start a TLS communication to establish a connection with our LDAP Server.

Once the connection is fully established, the subsequent LDAP Bind for authentication is encrypted inside the TLS Tunnel meaning we won't see any traffic unless we use the server side's certificate to decrypt the data in the network trace.



# Scenario 4: LDAP Signing &amp; Encryption

An optional security measure to
mitigate MITM (man-in-the-middle) attacks where a bad actor can sniff the LDAP
packets and redirect them back to the DC. Once we enable LDAP signing,
encryption is also enabled by default so that all subsequent operations that
are performed after the initial bind will be encrypted. Starting with Windows
10, all clients perform LDAP Signing by default

![image.png](/.attachments/image-c93c7e40-bd32-435e-a54e-78f7d329eec7.png)

In this connection, after the initial
TCP-handshake, RootDSE connection and successful Bind, we are unable to view
subsequent LDAP Operations as they are encrypted and signed, if we check the
LDAPSASLBuffer section in the frame, we can observe the SASL checksum that
signs these frames as part of the security measure to make sure they aren't
tampered with
---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: The Three-Phase Ticketing - Deep Dive/Kerberos - KRB_AS_REP - Authentication Response | Reply"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20The%20Three-Phase%20Ticketing%20-%20Deep%20Dive/Kerberos%20-%20KRB_AS_REP%20-%20Authentication%20Response%20%7C%20Reply"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053229&Instance=1053229&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053229&Instance=1053229&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article provides a detailed explanation of the KRB_AS_REP (Kerberos Authentication Service Reply) within the Kerberos authentication protocol. It covers the composition of the KDC (Key Distribution Center) reply and how it is handled on the client side.

[[_TOC_]]

# Authentication service reply

This section describes in detail the KDC reply and how it is handled on the client.

![Kerberos Diagram](/.attachments/image-1b1c744a-0950-49d4-bdf0-48241429489b.png)

## KRB_AS_REP  composure at KDC

The KDC replies with KRB_AS_REP containing a service ticket for itself. It contains a session key that the user can use in communicating with the KDC _KC,K_, nonce _n_, and timestamp _t_, encrypted in the user's long-term key _KC_.

It also contains a special service ticket called a ticket-granting ticket (TGT), including the client name, KrbTgt, timestamp, authorization data (PAC), and session key between the client and KDC, encrypted with the KDC's long-term key:

```plaintext
{TGT}KK =  {Client, KrbTgt, t, PAC, KC,K}KK
```

TGT authorization data (PAC = Privilege Attribute Certificate) includes:
- SID for the user's account
- SIDs for security groups which the user is a member of
- SIDs for universal groups in the enterprise that include either the user or one of the domain groups the user is a member of

## KRB_AS_REP  handling on client

### KRB_AS_REP message contents

![KRB_AS_REP Message Contents](/.attachments/image-944d3c2b-eafb-48b9-bc61-8f75cf223cab.png)

The client uses its cached copy of the user key to decrypt its copy of the TGT session key. It can then discard the user key derived from the user's password, as it is no longer needed. **The Local Security Authority (LSA) stores the TGT in the users logon session.**

The client cannot decrypt or tamper with the TGT ticket but will use it as proof of being authenticated for further Ticket Granting Service (TGS) requests.

When the client receives the KDC's reply to its initial request, the client uses its cached copy of the user key to decrypt its copy of the session key.

In all subsequent exchanges with the KDC, the client uses the TGS session key. Like any other session key, this key is temporary, valid only until the TGT expires or the user logs off. For that reason, the TGS session key is often called a logon session key.

From the client's point of view, a TGT is just another ticket. Before the client attempts to connect to any service, the client first checks the user credentials cache for a service ticket to that service. If it does not have one, it checks the cache again for a TGT. If it finds a TGT, the LSA fetches the corresponding logon session key from the cache, uses this key to prepare an authenticator, and sends both the authenticator and the TGT to the KDC, along with a request for a service ticket for the service. In other words, gaining admission to the KDC is no different from gaining admission to any other service in the domain,it requires a session key, an authenticator, and a ticket (in this case, a TGT).

From the KDC's point of view, TGTs enable the KDC to avoid the performance penalties of looking up a user's long-term key every time the user requests a service. The KDC looks up the user key only once, when it grants an initial TGT. For all other exchanges with this user, the KDC can decrypt the TGT with its own long-term key and extract the logon session key,and use that to validate the user's authenticator.

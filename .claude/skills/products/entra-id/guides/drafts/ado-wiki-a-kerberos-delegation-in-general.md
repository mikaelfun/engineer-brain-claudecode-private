---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Delegation/Kerberos: Delegation in general"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20Example%20Reference/Kerberos%3A%20Delegation/Kerberos%3A%20Delegation%20in%20general"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1083985&Instance=1083985&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1083985&Instance=1083985&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
This document provides an overview of Kerberos delegation, including terminology, delegation options, and various delegation schemes. It explains the differences between impersonation and delegation, details the setup changes required, and describes the graphical user interface (GUI) options available for configuring delegation. The document also covers different types of delegation such as unconstrained delegation, constrained delegation, and constrained delegation with protocol transition.

[[_TOC_]]

# Kerberos delegation in general

## Terminology

- **Impersonation**: Allows a service to act as the user while performing an action (specifically on the same server the service is hosted on).
- **Delegation**: A service can act as the user while performing an action hosted on another server.
- The account that impersonates the user is called the **delegate**.

## What options for delegation do we have?

Setup changes:  
Now the web server becomes a **Frontend** server, with the need to access a **Backend** server resource.  
**IIS**: Website, Basic Setting, Edit Site, Physical Path: \\rw8r2dc2.rw8r2.net\IIS_Redir\MyWebsite - pointing to a **remote share**.

This access at the **Backend** requires impersonation on the **Frontend** server service instance as _user1_ via Kerberos delegation. The user is not aware of the resources the Frontend accesses on behalf of their identity via **impersonation**.

## Kerberos delegation scheme
 
![Kerberos delegation scheme](/.attachments/image-69c05c27-9fa9-41c5-828a-17b2db7e1af7.png)

## Delegation tab options

 Note: The tab becomes available when a Service Principal Name (SPN) gets registered!
 
![Delegation tab options](/.attachments/image-d59ee592-d105-4d2d-8f9f-0f9492c2dc9c.png)

## GUI options available:

1. By default, an account is not trusted for delegation  "Do not trust this user for delegation."
1. Since Windows 2000, unconstrained delegation is available  "Trust this user for delegation to any service (Kerberos only)."
1. Since Windows Server 2003, we added two "Service For User" (S4U) extensions:
   - **Service-for-User-to-Proxy (S4U2proxy)**: Constrained delegation  "Use Kerberos only."
   - **Service-for-User-to-Self (S4U2self)**: Protocol transition  "Use any authentication protocol."
1. Options 3 or 4 require specifying target account(s) and selecting the corresponding Service Type Name (SPN) registered there. Kerberos is then constrained to these SPNs.

## Types of delegation

- **Proxy**: The client obtains a service ticket for the backend and then gives it to the frontend (note: the client must know the name of the backend).
- **Unconstrained delegation** (also known as forwarded Ticket Granting Ticket (TGT) or full delegation): 
  - The client gives its own TGT to the frontend.
  - The frontend service can do anything as the user with the forwarded TGT; this kind of delegation has no constraints.
  - End-to-end authentications are done through the Kerberos authentication protocol only.

Since Windows Server 2003 (domain functional level (DFL)  2003, requires Windows Server 2003 domain functional level):

- **Constrained delegation (S4U2proxy)**:
  - Allows the frontend to forward requests on behalf of the client only to a specified list of backend services.
  - End-to-end authentications are done through the Kerberos authentication protocol only.
  - Constrained delegation works with or without protocol transition.
  
- **Constrained delegation with protocol transition (S4U2self)**:
  - Allows a Kerberized service (such as the frontend) to get a service ticket to itself, where the Privilege Attribute Certificate (PAC) has the users authorization data (user and group Security Identifiers (SIDs)).  
    This ticket may be used as the Ticket Granting Service (TGS) ticket evidence in the S4U2proxy.
  - The client may authenticate to the frontend service through any authentication protocol; however, the second hop (between the frontend and the backend) is done over Kerberos.

![full details about delegation options](/.attachments/image-52de4d49-824d-45df-840a-276c324c2cf4.png)
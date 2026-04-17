---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: The Three-Phase Ticketing - Deep Dive/Kerberos - KDC Proxy flows and architecture"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20The%20Three-Phase%20Ticketing%20-%20Deep%20Dive/Kerberos%20-%20KDC%20Proxy%20flows%20and%20architecture"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1080724&Instance=1080724&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1080724&Instance=1080724&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This document provides an in-depth look at the KDC Proxy service operations within the Kerberos protocol, including an overview of the architecture, state diagrams for obtaining service tickets and changing passwords, and a glossary of relevant terms.

[[_TOC_]]

# Introduction
This page describes the general operations of the main steps in the Key Distribution Center (KDC) Proxy service operations. Use this as a reference to compare with customer results.

# Glossary
- **Kerberos Key Distribution Center Proxy Protocol (KKDCP)**: A protocol that defines a way to forward Kerberos requests from a client to a KDC when the client is located outside the corporate network without line-of-sight to a domain controller. The best example is the public Internet.
- **Kerberos client**: The components in Windows that implement the Kerberos protocol on Windows workstations and member servers (Kerberos.dll).
- **KKDCP client**: Part of the Windows Kerberos client that implements the KKDCP protocol (still Kerberos.dll).
- **KKDCP server**: A service that relays Kerberos requests from the client to the KDC server (domain controller). On Windows Server, this service is named KPSSVC (KDC Proxy Server) and is available on Windows Server 2012 and higher.
- **KDC**: The Key Distribution Center, which runs as part of Active Directory Domain Services.
- **Kerberos application server**: A server application or a service that uses Kerberos as its authentication protocol.

# Architecture overview
![KDC Proxy Architecture Overview](/.attachments/Kerberos/KDC_Proxy_1.png)

The KDC Proxy runs on the server and sits between the client and the KDC (domain controller).

Service name is KPSSVC (KDC Proxy Server).

Usual operation of the KDC Proxy service:
- Client sends Kerberos requests encapsulated in an HTTP POST query on top of an HTTPS connection (TLS secure channel).
- KPSSVC listens for incoming HTTPS requests, extracts the Kerberos request, and forwards it raw to the KDC.
- KDC performs its usual work.
- KPSSVC packs the Kerberos DC response into an HTTP response and sends it to the client over the same HTTPS connection.
- Client extracts the Kerberos response from the HTTP payload and processes it as usual.

## Architecture Q&A

>Q: **Does KDC Proxy rely on IIS for processing incoming HTTP requests?**<br>
A: No. KDC Proxy sits on top of the HTTP.sys driver and has no dependency on IIS.

>Q: **The docs are requiring me to install the RD Gateway role, which also installs NPS and IIS. Is there any way to only deploy the KDC Proxy as a standalone role or feature?**<br>
A: The only supported way of deploying the KDC Proxy is through one of the Windows Server roles that use it. At the time of writing, only deploying the RD Gateway role or Direct Access feature are supported ways of enabling the KDC Proxy. Even if there are some third-party websites explaining how to configure KDC Proxy, these are currently not supported methods.

>Q: **What is the URL KDC Proxy is listening to?**<br>
A: KDC Proxy registers with the HTTP.sys API to listen to https://*:443/KdcProxy.

>Q: **Can we change the suffix URL?**<br>
A: It is not recommended as this is not documented. Make clear this change is not supported as it is not publicly documented. Engage your escalation team if the customer insists.

>Q: **What are the protocols being used?**<br>
A: For incoming client connections, KPSSVC requires incoming traffic from TCP port 443. For communicating with Active Directory Domain Controllers.

>Q: **What are the requirements for the KDC Proxy certificate?**<br>
A: The KDC Proxy certificate is a regular TLS Server/web server certificate.

# KDC Proxy location
This section covers how clients locate a KDC Proxy server. There are two possibilities:
- Either the KDC Proxy is set using a GPO (see the reference page for details).
- Or, the calling application can set a KDC Proxy by leveraging the SetCredentialsAttributes() SSPI API: https://docs.microsoft.com/en-us/windows/win32/api/sspi/ns-sspi-secpkgcredentials_kdcproxysettingsw.

GPO settings will apply to all Kerberos requests, whatever the application.

Programmatically settings will only apply to applications enhanced to benefit from the Kerberos KDC Proxy feature.

# State diagram - Obtaining a service ticket (TGS)
Below is the flow between the different actors when a client requests a Ticket Granting Service (TGS) for a particular service.

![State Diagram - Obtaining a Service Ticket (TGS)](/.attachments/Kerberos/KDC_Proxy_2.png)

When a Kerberos client wants to use Kerberos-based authentication and cannot locate a DC for the realm, it uses ProxyMessage() to invoke the KKDCP client.

1. Because the Kerberos client does not have a ticket-granting ticket (TGT), it calls ProxyMessage with a KRB_AS_REQ.
1. The KKDCP client establishes a TLS secure channel with the KKDCP server.
1. The KKDCP client sends a KDC_PROXY_MESSAGE containing the KRB_AS_REQ to the KKDCP server.
1. The KKDCP server finds the KDC and sends the KRB_AS_REQ to the KDC.
1. The KDC returns a KRB_AS_REP to the KKDCP server.
1. The KKDCP server sends a KDC_PROXY_MESSAGE containing the KRB_AS_REP to the KKDCP client.
1. The KKDCP client returns the KRB_AS_REP and SUCCESS to the Kerberos client.
1. The Kerberos client processes the KRB_AS_REP and calls ProxyMessage with a KRB_TGS_REQ.
1. The KKDCP client sends a KDC_PROXY_MESSAGE containing the KRB_TGS_REQ to the KKDCP server.
1. The KKDCP server finds the KDC and sends the KRB_TGS_REQ to the KDC.
1. The KDC returns a KRB_TGS_REP to the KKDCP server.
1. The KKDCP server sends a KDC_PROXY_MESSAGE containing the KRB_TGS_REP to the KKDCP client.
1. The KKDCP client returns the KRB_TGS_REP and SUCCESS to the Kerberos client.
1. The Kerberos client processes the KRB_TGS_REP and sends a KRB_AP_REQ to the Kerberos application server.
1. The Kerberos application server processes the KRB_AP_REQ and sends a KRB_AP_REP to the Kerberos client.

# State diagram - Changing a password (KPASSWD)
![State Diagram - Changing a Password (KPASSWD)](/.attachments/Kerberos/KDC_Proxy_3.png)

When a Kerberos client wants to use Kerberos-based authentication and cannot locate a DC for the realm, it uses ProxyMessage() to invoke the KKDCP client. If the logon requires the user to change the password prior to logon, applications can use KKDCP for Kerberos password change.

1. Since the Kerberos client does not have a TGT, it calls ProxyMessage with a KRB_AS_REQ.
1. The KKDCP client establishes a TLS secure channel with the KKDCP server.
1. The KKDCP client sends a KDC_PROXY_MESSAGE containing the KRB_AS_REQ to the KKDCP server.
1. The KKDCP server finds the KDC and sends the KRB_AS_REQ to the KDC.
1. The KDC returns KRB_ERROR for password change required before logon to the KKDCP server.
1. The KKDCP server sends a KDC_PROXY_MESSAGE containing the KRB_ERROR to the KKDCP client.
1. The KKDCP client returns the KRB_ERROR and SUCCESS to the Kerberos client.
1. The Kerberos client processes the KRB_ERROR and returns a password change required before logon error to the application. Since the application supports change password, it initiates a Kerberos change password. The Kerberos client calls ProxyMessage with a KRB_AS_REQ for kadmin/changepw.
1. The KKDCP client sends a KDC_PROXY_MESSAGE containing the KRB_AS_REQ to the KKDCP server.
1. The KKDCP server finds the KDC and sends the KRB_AS_REQ to the KDC.
1. The KDC returns a KRB_AS_REP to the KKDCP server.
1. The KKDCP server sends a KDC_PROXY_MESSAGE containing the KRB_AS_REP to the KKDCP client.
1. The KKDCP client returns the KRB_AS_REP and SUCCESS to the Kerberos client.
1. The Kerberos client processes the KRB_AS_REP and creates a Kerberos change password request (KRB_CHG_PWD_REQ) and calls ProxyMessage.
1. The KKDCP client sends a KDC_PROXY_MESSAGE containing the KRB_CHG_PWD_REQ to the KKDCP server.
1. The KKDCP server finds the KDC and sends the KRB_CHG_PWD_REQ to the KDC.
1. The KDC returns a Kerberos change password request (KRB_CHG_PWD_REP) to the KKDCP server.
1. The KKDCP server sends a KDC_PROXY_MESSAGE containing the KRB_CHG_PWD_REP to the KKDCP client.
1. The KKDCP client returns the KRB_CHG_PWD_REP and SUCCESS to the Kerberos client.
1. The Kerberos client processes the KRB_CHG_PWD_REP. The application initiates a logon with the new password. The Kerberos client calls ProxyMessage with a KRB_AS_REQ.
1. The KKDCP client sends a KDC_PROXY_MESSAGE containing the KRB_AS_REQ to the KKDCP server.
1. The KKDCP server finds the KDC and sends the KRB_AS_REQ to the KDC.
1. The KDC returns a KRB_AS_REP to the KKDCP server.
1. The KKDCP server sends a KDC_PROXY_MESSAGE containing the KRB_AS_REP to the KKDCP client.
1. The KKDCP client returns the KRB_AS_REP and SUCCESS to the Kerberos client.
1. The Kerberos client processes the KRB_AS_REP and calls ProxyMessage with a KRB_TGS_REQ.
1. The KKDCP client sends a KDC_PROXY_MESSAGE containing the KRB_TGS_REQ to the KKDCP server.
1. The KKDCP server finds the KDC and sends the KRB_TGS_REQ to the KDC.
1. The KDC returns a KRB_TGS_REP to the KKDCP server.
1. The KKDCP server sends a KDC_PROXY_MESSAGE containing the KRB_TGS_REP to the KKDCP client.
1. The KKDCP client returns the KRB_TGS_REP and SUCCESS to the Kerberos client.
1. The Kerberos client processes the KRB_TGS_REP and sends a KRB_AP_REQ to the Kerberos application server.
1. The Kerberos application server processes the KRB_AP_REQ and sends a KRB_AP_REP to the Kerberos client.

---
#KDC ETW examples
More details about KDC flow into ETW tracing can be find here [Kerberos: Reference: KDC Proxy](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/451641/Kerberos-Reference-KDC-Proxy)


---
#KDC and AVD wiki
[KDC proxy and AVD WIKI](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/639995/KDC-Proxy)

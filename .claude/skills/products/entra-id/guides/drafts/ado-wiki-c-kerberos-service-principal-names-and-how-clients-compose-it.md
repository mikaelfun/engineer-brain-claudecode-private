---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Service Principal Names and how clients compose it"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20Service%20Principal%20Names%20and%20how%20clients%20compose%20it"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1344962&Instance=1344962&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1344962&Instance=1344962&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This article provides an overview of Service Principal Names (SPNs), including their purpose, format, registration, and troubleshooting. It also explains how clients compose an SPN for service authentication.

[[_TOC_]]

# SPN purpose, format, registrations, and troubleshooting

- [Service Principal Names (SPN)](https://learn.microsoft.com/en-us/archive/technet-wiki/717.service-principal-names-spn-setspn-syntax)
- [Service principal names](https://learn.microsoft.com/en-us/windows/win32/ad/service-principal-names)
- [Verification of uniqueness for user principal name, service principal name, and the service principal name alias (CVE-2021-42282)](https://prod.support.services.microsoft.com/en-us/topic/kb5008382-verification-of-uniqueness-for-user-principal-name-service-principal-name-and-the-service-principal-name-alias-cve-2021-42282-4651b175-290c-4e59-8fcb-e4e5cd0cdb29)

## How clients compose a service's SPN

To authenticate a service, a client application composes a Service Principal Name (SPN) for the service instance to which it must connect. The client application can use the [DsMakeSpn](https://learn.microsoft.com/en-us/windows/win32/api/dsparse/nf-dsparse-dsmakespna) function to compose an SPN. The client specifies the components of the SPN using known data or data retrieved from sources other than the service itself.

The form of an SPN is as follows:  
`<service class>/<host>:<port>/<service name>`

In this form, "<service class>" and "<host>" are required. "<port>" and "<service name>" are optional.

Typically, the client recognizes the "<service class>" part of the name and determines which of the optional components to include in the SPN. The client can retrieve components of the SPN from sources such as a service connection point (SCP) or user input.

For example, the client can read the serviceDNSName attribute of a service's SCP to get the "<host>" component. The serviceDNSName attribute contains either the DNS name of the server on which the service instance is running or the DNS name of SRV records containing the host data for service replicas. The "<service name>" component, used only for replicable services, can be the distinguished name of the service's SCP, the DNS name of the domain served by the service, or the DNS name of SRV or MX records.

For more information, visit [How Clients Compose a Service's SPN](https://learn.microsoft.com/en-us/windows/win32/ad/how-clients-compose-a-serviceampaposs-spn).

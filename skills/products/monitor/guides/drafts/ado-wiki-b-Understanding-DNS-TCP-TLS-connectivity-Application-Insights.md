---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Networking/Network Connectivity/Understanding DNS, TCP, and TLS connectivity in Application Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Networking/Network%20Connectivity/Understanding%20DNS%2C%20TCP%2C%20and%20TLS%20connectivity%20in%20Application%20Insights"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Understanding DNS, TCP, and TLS connectivity in Application Insights

## Overview

A lot of support investigations where no telemetry is arriving in Application Insights coming from web apps (on-premises, Azure VM, App Services), will result in the need to validate several networking aspects to rule out a network problem affecting telemetry ingestion.

The purpose of this document is to explain the general step-by-step in which a web apps process will attempt to send telemetry to an Application Insights endpoint.

## Boil it down to the basics

Application Insights SDKs can be seen as nothing more than a client (software, binaries, DLLs) running within a process (most often the w3wp.exe process) inside of a host (usually a VM). The IIS hosting process, like any other, follows a standard step-by-step approach when establishing outbound network connections. That process is described below:

1. DNS → _Where am I supposed to go?_
2. TCP → _Can I get there?_
3. TLS → _Can I send data securely?_

## Stages before sending telemetry to Application Insights

### 1. DNS resolution

Before the web apps process decides to send telemetry to an Application Insights resource, it must first determine who to send the data to. The **who** is represented by the IP address that gets resolved in a DNS resolution process, using the Ingestion Endpoint for Application Insights.

If DNS doesn't work, neither TCP nor TLS take place after.

Key takeaways:
- Global and regional endpoints play a factor into how the name resolution process:
  - Connection Strings → resolve to regional endpoints
  - Instrumentation Keys (no longer recommended) → resolve to global endpoint

See reference: [IP addresses used by Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/ip-addresses) & [Migrate from instrumentation keys to connection strings](https://learn.microsoft.com/en-us/azure/azure-monitor/app/migrate-from-instrumentation-keys-to-connection-strings)

### 2. TCP connectivity

Now that we know against which IP address we need to send telemetry to, next we need to know if we can reach that IP address on a specific port number.

**Note:** The port number used by web apps to send data over to an Application Insights resource is 443, used for securely sending data over HTTPS.

In this step, the web apps process will attempt to establish a 3-way TCP Handshake against the public IP address representing the ingestion endpoint we want to send telemetry to. The TCP handshake involves the following steps:

1. TCP SYN packet sent by the client
2. TCP SYN ACK sent as a response by the server
3. TCP ACK sent as a final acknowledgement by the client

**Note:** The client is the web server's process running with the Application Insights SDK and the server is the Azure instance listening as the Ingestion Endpoint.

If a TCP handshake is established, this confirms that the web server can reach the Ingestion Endpoint in terms of network routing.

### 3. TLS connectivity

If DNS resolution and TCP connections are successful, the next step between both parties is to agree on how they will exchange telemetry securely over HTTPS. For this, a TLS handshake must occur.

**What is a TLS handshake?**

A TLS handshake is a process in which two parties decide how they are going to exchange data in a secure fashion over HTTPS:

- A **Client Hello** message is sent by the web server hosting the app. The message will include which TLS version used to initiate the negotiation and the cipher suites supported by the client.
- A **Server Hello** message is sent back by the server in response to the Client Hello, which contains the server's TLS certificate, the server's chosen cipher suite.
- Key exchange. Endpoints exchange secured keys to encrypt/decrypt telemetry.

Once this finishes, telemetry can be sent by the apps process and accepted by the Application Insights ingestion endpoint.

## Public Documentation
- [What is DNS? | How DNS works | Cloudflare](https://www.cloudflare.com/learning/dns/what-is-dns/)
- [What is TCP (Transmission Control Protocol)? - GeeksforGeeks](https://www.geeksforgeeks.org/what-is-transmission-control-protocol-tcp/)
- [What is Transport Layer Security (TLS)? | Cloudflare](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/)

---
_Created by: nzamoralopez, Nov 25th, 2024_

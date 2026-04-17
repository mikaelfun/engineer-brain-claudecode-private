---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/Tools/Fiddler"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/Tools/Fiddler"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

Fiddler is a 3rd party tool developed by Telerik. It works as a HTTPS proxy, sitting between the client making the request and the server at the HTTP/HTTPS protocol.

## How it works
The communication through Fiddler is initiated by a client, which establishes a TCP handshake against Fiddler on port 8888 (This is the default port, it can be changed). 

Fiddler offers the option to decrypt HTTPS traffic if the option is enabled in the settings. If this option is not enabled, encrypted traffic is handled through the [`CONNECT` HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/CONNECT) which works as a passthrough connection. We want HTTPS decryption to be enabled when we use Fiddler for troubleshooting.

Assuming HTTPS decryption is used, Fiddler will ask to install a local root certificate to the machine where it is running. The certificate itself should be installed on whatever machine is making the client requests (Installing it on the same machine where Fiddler is running is required if the same machine is the one making the requests). Since Fiddler is now intercepting the request, installing the certificate is required so the client trusts this "fake" certificate authority which is Fiddler. If the certificate is not installed, the TLS handshake will fail.

> Specific clients like Python do not use the OS certificate store and might require additional steps to install the Fiddler certificate.

In HTTPS operations with HTTPS decryption enabled, after the TCP handshake is established, the client will proceed to establish a TLS connection against Fiddler (which will be successful since the certificate is trusted based on the previous step). Since Fiddler is on the other end of this TLS connection, it can decrypt the request sent by the client.

The next step is for Fiddler to establish a TCP handshake and TLS handshake to the server. Fiddler is the client in this stage, which means it can encrypt the request that it got from the client application, send it to the server, wait for the response, decrypt it, read it, encrypt it again, and send it back to the client application that made the initial request.

We use this functionality of Fiddler to analyze what the client is sending and receiving from the server, on applications that do not offer HTTP tracing.

## Setup and initial configuration
There are two different Fiddler tools we can use for troubleshooting:

### FiddlerCap
This is the preferred solution when we need the customer to capture a trace for support, as it is a stripped-down version aimed for capturing traces only, instead of the whole Fiddler Classic solution we use for analyzing the traces.

It can be downloaded from [FiddlerCap](https://www.telerik.com/fiddler/fiddlercap).

Make sure the **Decrypt HTTPS traffic** option is selected before start capturing.

### Fiddler Classic

Fiddler Classic offers the same option FiddlerCap covers plus way more. This is the solution we offer to analyze the Fiddler traces we get from the customer (regardless if they were captured with FiddlerCap or Fiddler Classic). Fiddler Classic also offers the option to import HAR traces captured in the browser.

Fiddler Classic can be downloaded from [Fiddler Classic](https://www.telerik.com/fiddler/fiddler-classic). To configure HTTPS decryption, follow the instructions in [Configure Fiddler Classic to Decrypt HTTPS Traffic](https://docs.telerik.com/fiddler/configure-fiddler/tasks/decrypthttps). Make sure this is enabled before start capturing.

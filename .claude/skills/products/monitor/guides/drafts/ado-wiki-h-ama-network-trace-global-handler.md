---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/How-To/How to Analyze Network Trace/How to analyze AMA Network Trace global.handler.control.monitor.azure.com"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Windows%2FHow-To%2FHow%20to%20Analyze%20Network%20Trace%2FHow%20to%20analyze%20AMA%20Network%20Trace%20global.handler.control.monitor.azure.com"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
Applies To:
- Azure Monitor Agent :- All versions

[[_TOC_]]


Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.

Examples below are captured using the following steps on a Windows server with the Microsoft Monitoring Agent installed
No proxy configuration is present

From an administrative command prompt run:

```cmd
netsh trace start capture=yes
ipconfig /flushdns
** wait five minutes **
netsh trace stop
```
#DNS Lookup
DNS Lookup for the IP address of the **global.handler.control.monitor.azure.com** endpoint
|Source|Destination|Protocol Name|Description|
|:-----------|:-----------:|:-----------:|:-----------|
|10.0.0.161|10.0.0.34|DNS|DNS:QueryId = 0x4953, QUERY (Standard query), Query  for global.handler.control.monitor.azure.com of type Host Addr on class Internet|
|10.0.0.34|10.0.0.161|DNS|DNS:QueryId = 0x4953, QUERY (Standard query), Response - Success, 50, 0 ... |

Detailed examination of the DNS response showing the IP address of the ODS endpoint
The endpoint global.handler.control.monitor.azure.com is aliased to global.handler.control.privatelink.monitor.azure.com
global.handler.control.privatelink.monitor.azure.com is aliased to amcs-prod-global-handler.trafficmanager.net 
amcs-prod-global-handler.trafficmanager.net is aliased to amcs-prod-eus2-1-handler.eastus2.cloudapp.azure.com
The exact names and IP addresses you may see hear will vary greatly. The important thing to note is that an IP address was returned for the query.

![image.png](/.attachments/image-b5aee005-3c19-4be9-aeea-53d5d72cec03.png)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">
NOTE: In the case where a proxy server or a OMS Gateway is used, the Agent will NOT make a DNS query for the endpoint.  It may however make a DNS query to resolve the IP address of the proxy server instead.  It will then rely on the proxy server to resolve DNS for LA endpoint names.  This may be a clue if proxy is configured and the customer is unaware of this.
</div>

#TCP 3-way Handshake

Next, the Agent will make a TCP connection to the IP address returned in the DNS response. The TCP 3-way handshake will look similar to this:
|Source|Destination|Protocol Name|Description|
|:-----------|:-----------:|:-----------:|:-----------|
|10.0.0.161|20.49.99.69|TCP|TCP:Flags=CE....S., SrcPort=65136, DstPort=HTTPS(443), PayloadLen=0, Seq=4269628534, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192|
|20.49.99.69|10.0.0.161|TCP|TCP:Flags=.E.A..S., SrcPort=HTTPS(443), DstPort=65136, PayloadLen=0, Seq=2188141395, Ack=4269628535, Win=65535 ( Negotiated scale factor 0x8 ) = 16776960|
|10.0.0.161|20.49.99.69|TCP|TCP:Flags=...A...., SrcPort=65136, DstPort=HTTPS(443), PayloadLen=0, Seq=4269628535, Ack=2188141396, Win=258 (scale factor 0x8) = 66048|

#TLS Handshake
After the 3-way hand shake completes, TLS is negotiated and will resemble this:
|Source|Destination|Protocol Name|Description|
|:-----------|:-----------:|:-----------:|:-----------|
|10.0.0.161|20.49.99.69|TLS|TLS:TLS Rec Layer-1 HandShake: Client Hello.|
|20.49.99.69|10.0.0.161|TLS|TLS:TLS Rec Layer-1 HandShake: Server Hello. Certificate.|

The Client Hello message in the first packet above will contain some important information you should validate. In the below screenshot note the TLS version specified in the ClientHello portion of the packet.
This must be TLS 1.2.

![image.png](/.attachments/image-08ba9cc6-15be-47e6-8a27-30ad2d23d08f.png)

The Client Hello will also include a list of Cipher Suites that the client supports.  The Azure Endpoint will choose a Cipher from this list if it finds one it supports.  We will look at this in the Server Hello packet further down.
If the server doesn't find a supported Cipher, the server will respond with a TCP Reset which will end the connection.  This may happen if the customer has turned off required ciphers.
As highlighted below, **TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384** is known to work and should be enabled.

![image.png](/.attachments/image-ca9eec46-5fa8-4dc3-b4f8-d05d03164012.png)

Next validate the **ServerName** extension further down in the TLS header. The **ServerName** field must match that of the **ODS** endpoint.

![image.png](/.attachments/image-a76e20be-8137-4c4b-becc-53b2f9714f6a.png)

This is a common point when network related failures occur.  The two above screenshots call out scenarios that may result in a TCP Reset from the Azure Endpoint.

Scenario 1, if a compatible Cipher isn't found, Azure will reset the connection.  Ensure **TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384** is listed in the Client Hello

Scenario 2, if a network firewall isn't configured with a rule to allow a connection the name listed in the ServerName extension, the firewall is likely to issue a TCP reset impersonating the Azure Endpoint.  This makes it look like Azure closed the connection but in reality, it was the firewall.  

Note the **R** in the **TCP:Flags** of this packet.  This will cause the TCP connection to immediately close.  A TCP FIN, denoted by an **F** in **TCP:FLAGS** may also be used in this case.
![image.png](/.attachments/image-8d43bb86-8c8f-4a2f-8985-bc2cba68e747.png)

If the connection moves past the above scenarios successfully, the next packet should be a ServerHello
Review the ServerHello packet. The first thing to note is the TLSCipherSuite. In this example the Azure Endpoint selected **TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384**

![image.png](/.attachments/image-cff829a0-5382-4c2d-a97c-a1f33fef74ee.png)

Drill down into the Certificates portion of the ServerHello and validate that the Issuer of the certificate is correct

![image.png](/.attachments/image-a642d50e-d2e9-4fef-849c-a1cd48b682b5.png)

#HTTPS Inspection/SSL Inspection/Packet Inspection
As seen above, the Issuer is a Microsoft CA and this is expected. In some cases where the customer has a Firewall that is configured to inspect TSL sessions, the Firewall will use its own
CA or the customer's internal CA. This will break the TLS session. Below is an example of what this looks like. 
>> ![image.png](/.attachments/image-29cbd9b4-243e-4778-b4e6-70c2b23e80b6.png)
In this example, Fiddler was configured to decrypt SSL traffic.  This feature works in the same way a packet inspecting firewall works by using it's own certificate, impersonating the endpoint the Agent was attempting to reach.  The agent looks for this man-in-the-middle attack and will prevent this connection from completing successfully.

#Success
Lastly, below shows the result of a successful TLS negotiation.

|Source|Destination|Protocol Name|Description|
|:-----------|:-----------:|:-----------:|:-----------|
|10.0.0.161|20.49.99.69|TLS|TLS:TLS Rec Layer-1 HandShake: Client Key Exchange.; TLS Rec Layer-2 Cipher Change Spec; TLS Rec Layer-3 HandShake: Encrypted Handshake Message.|
|20.49.99.69|10.0.0.161|TLS|TLS:TLS Rec Layer-1 Cipher Change Spec; TLS Rec Layer-2 HandShake: Encrypted Handshake Message.|
|10.0.0.161|20.49.99.69|TCP|TCP:Flags=...A...., SrcPort=65136, DstPort=HTTPS(443), PayloadLen=0, Seq=4269628868, Ack=2188148079, Win=258 (scale factor 0x8) = 66048|
|10.0.0.161|20.49.99.69|TLS|TLS:TLS Rec Layer-1 SSL Application Data|

The first two frames above are the evidence of the Client and Server exchanging a symmetric encryption key
The last frame showing SSL Application Data, indicates encrypted data has been sent using the symmetric key previously obtained.
This is typical of a successful TLS negotiation

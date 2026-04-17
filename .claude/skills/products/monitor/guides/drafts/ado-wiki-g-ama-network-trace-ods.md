---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/How-To/How to Analyze Network Trace/How to analyze AMA Network Trace ODS Connection"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Azure%20Monitor%20Agent%20%28AMA%29%20for%20Windows/How-To/How%20to%20Analyze%20Network%20Trace/How%20to%20analyze%20AMA%20Network%20Trace%20ODS%20Connection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Analyze AMA Network Trace ODS Connection

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
DNS Lookup for the IP address of the **ods.opinsights.azure.com** endpoint
|Source|Destination|Protocol Name|Description|
|:-----------|:-----------:|:-----------:|:-----------|
|10.0.0.20|10.0.0.34|DNS|DNS:QueryId = 0xC691, QUERY (Standard query), Query  for ac604a75-54fe-42e7-99bc-e0b23545d3c5.ods.opinsights.azure.com of type Host Addr on class Internet|
|10.0.0.34|10.0.0.20|DNS|DNS:QueryId = 0xC691, QUERY (Standard query), Response - Success, 50, 0 ... |

Detailed examination of the DNS response showing the IP address of the ODS endpoint
The endpoint **ac604a75-54fe-42e7-99bc-e0b23545d3c5.ods.opinsights.azure.com** is aliased to **ods.trafficemanager.net**
**ods.trafficemanager.net** is aliased to **ipv4-eus-oi-ode-cses-b.eastus.cloudapp.azuer.com**
The exact names and IP addresses you may see hear will vary greatly.  The important thing to note is that an IP address was returned for the query. 

![image.png](/.attachments/image-39033542-412f-4f26-8b20-2b7bdcae96fb.png)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">
NOTE: In the case where a proxy server or a OMS Gateway is used, the Agent will NOT make a DNS query for the endpoint.  It may however make a DNS query to resolve the IP address of the proxy server instead.  It will then rely on the proxy server to resolve DNS for LA endpoint names.  This may be a clue if proxy is configured and the customer is unaware of this.
</div>

#TCP 3-way Handshake
Next, the Agent will make a TCP connection to the IP address returned in the DNS response. The TCP 3-way handshake will look similar to this:
|Source|Destination|Protocol Name|Description|
|:-----------|:-----------:|:-----------:|:-----------|
|10.0.0.20|20.42.73.204|TCP|TCP:Flags=CE....S., SrcPort=13892, DstPort=HTTPS(443), PayloadLen=0, Seq=3366509350, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192|
|20.42.73.204|10.0.0.20|TCP|TCP:Flags=.E.A..S., SrcPort=HTTPS(443), DstPort=13892, PayloadLen=0, Seq=671311755, Ack=3366509351, Win=65535 ( Negotiated scale factor 0x8 ) = 16776960|
|10.0.0.20|20.42.73.204|TCP|TCP:Flags=...A...., SrcPort=13892, DstPort=HTTPS(443), PayloadLen=0, Seq=3366509351, Ack=671311756, Win=258 (scale factor 0x8) = 66048|

#TLS Handshake
After the 3-way hand shake completes, TLS is negotiated and will resemble this:
|Source|Destination|Protocol Name|Description|
|:-----------|:-----------:|:-----------:|:-----------|
|10.0.0.20|20.42.73.204|TLS|TLS:TLS Rec Layer-1 HandShake: Client Hello.|
|20.42.73.204|10.0.0.20|TLS|TLS:TLS Rec Layer-1 HandShake: Server Hello. Certificate.|

The Client Hello message in the first packet above will contain some important information you should validate. In the below screenshot note the TLS version specified in the ClientHello portion of the packet.
This must be TLS 1.2.

![image.png](/.attachments/image-76a0d479-1a4c-4f4b-af16-89f58766ae56.png)

The Client Hello will also include a list of Cipher Suites that the client supports.  The Azure Endpoint will choose a Cipher from this list if it finds one it supports.  We will look at this in the Server Hello packet further down.
If the server doesn't find a supported Cipher, the server will respond with a TCP Reset which will end the connection.  This may happen if the customer has turned off required ciphers.
As highlighted below, **TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384** is known to work and should be enabled.

![image.png](/.attachments/image-ca9eec46-5fa8-4dc3-b4f8-d05d03164012.png)

Next validate the **ServerName** extension further down in the TLS header. The **ServerName** field must match that of the **ODS** endpoint.

![image.png](/.attachments/image-19470eb5-6926-494a-b7ad-9d50aaf3f5e8.png)

This is a common point when network related failures occur.  The two above screenshots call out scenarios that may result in a TCP Reset from the Azure Endpoint.

Scenario 1, if a compatible Cipher isn't found, Azure will reset the connection.  Ensure **TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384** is listed in the Client Hello

Scenario 2, if a network firewall isn't configured with a rule to allow a connection the name listed in the ServerName extension, the firewall is likely to issue a TCP reset impersonating the Azure Endpoint.  This makes it look like Azure closed the connection but in reality, it was the firewall.  

Note the **R** in the **TCP:Flags** of this packet.  This will cause the TCP connection to immediately close.  A TCP FIN, denoted by an **F** in **TCP:FLAGS** may also be used in this case.
![image.png](/.attachments/image-8d43bb86-8c8f-4a2f-8985-bc2cba68e747.png)

If the connection moves past the above scenarios successfully, the next packet should be a ServerHello
Review the ServerHello packet. The first thing to note is the TLSCipherSuite. In this example the Azure Endpoint selected **TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384**

![image.png](/.attachments/image-cff829a0-5382-4c2d-a97c-a1f33fef74ee.png)

Drill down into the Certificates portion of the ServerHello and validate that the Issuer of the certificate is correct


![image.png](/.attachments/image-c638ca67-8cdd-49b1-b23b-2b26e27bbf6a.png)

#HTTPS Inspection/SSL Inspection/Packet Inspection

As seen above, the Issuer is a Microsoft CA and this is expected. In some cases where the customer has a Firewall that is configured to inspect TSL sessions, the Firewall will use its own
CA or the customer's internal CA. This will break the TLS session.  Below is an example of what this looks like. 
>> ![image.png](/.attachments/image-29cbd9b4-243e-4778-b4e6-70c2b23e80b6.png)
In this example, Fiddler was configured to decrypt SSL traffic.  This feature works in the same way a packet inspecting firewall works by using it's own certificate, impersonating the endpoint the Agent was attempting to reach.  The agent looks for this man-in-the-middle attack and will prevent this connection from completing successfully.

#Success
Lastly, below shows the result of a successful TLS negotiation.

|Source|Destination|Protocol Name|Description|
|:-----------|:-----------:|:-----------:|:-----------|
|10.0.0.20|20.42.73.204|TLS|TLS:TLS Rec Layer-1 HandShake: Certificate. Client Key Exchange. Certificate Verify.; TLS Rec Layer-2 Cipher Change Spec; TLS Rec Layer-3 HandShake: Encrypted Handshake Message.|
|20.42.73.204|10.0.0.20|TLS|TLS:TLS Rec Layer-1 Cipher Change Spec; TLS Rec Layer-2 HandShake: Encrypted Handshake Message.|
|10.0.0.20|20.42.73.204|TLS|TLS:TLS Rec Layer-1 SSL Application Data|

The first two frames above are the evidence of the Client and Server exchanging a symmetric encryption key
The last frame showing SSL Application Data, indicates encrypted data has been sent using the symmetric key previously obtained.  
This is typical of a successful TLS negotiation


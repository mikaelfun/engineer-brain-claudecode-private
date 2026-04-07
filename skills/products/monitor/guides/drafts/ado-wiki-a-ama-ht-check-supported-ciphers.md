---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check the supported ciphers for an endpoint"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/How-To/AMA%3A%20HT%3A%20Check%20the%20supported%20ciphers%20for%20an%20endpoint"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
When clients are negotiating encrypted communication with a server, they need to offer a cipher suite that the server supports. This article will discuss how to determine the cipher suites that an endpoint (URL) will permit and prefer.

# Identify the supported ciphers for an endpoint
In this case, as we are attempting to reach the endpoint at:
```https://global.handler.control.monitor.azure.com/```

The first step is to visit the SSL Labs website, specifically the SSL Test page:
https://www.ssllabs.com/ssltest/

Once there, input the URL of the endpoint you are trying to assess, which in this instance is the URL provided above. 

![image.png](/.attachments/image-ab8b8bc9-5deb-4c5c-92a0-1ff5e118af7f.png)

Upon conducting the test, scroll down until you reach the section labeled Cipher Suites.

![image.png](/.attachments/image-e580ff99-2a8f-4393-a2f5-6840d2bdf7c4.png)

I have included a reference image for illustration, but as you can observe, the TLS 1.2 cipher suites supported by this endpoint are:

TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (0xc030)
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (0xc02f)

NOTE: When looking at ciphers, it may be easier to use the hex at the end of the cipher when visually comparing ciphers in a network trace, etc.
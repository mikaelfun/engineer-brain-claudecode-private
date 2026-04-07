---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Azure VM Diagnostics - Test Connectivity & Process Tuples"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Azure%20VM%20Diagnostics%20-%20Test%20Connectivity%20%26%20Process%20Tuples"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
When we find that an Azure VM cannot reach an endpoint, in some cases, the cause can be difficult to ascertain. We can use the Test Connectivity diagnostic to gain insight.

# Azure Support Center (ASC)
ASC > Resource Explorer > VM > Diagnostics > Test Connectivity

![image.png](/.attachments/image-81f44c2a-2e4c-48e2-8918-6e3cce928c1a.png)

- Fill in the destination IP (you'll need to see what the endpoint resolved to on the VM)
- Fill in the protocol:port (usually tcp:443)
- Click the "Run" button

![image.png](/.attachments/image-7623e15e-05af-4962-a56d-cd51873ff726.png)

The results that are output provide details about how the traffic would flow, what routing rules, matched, etc. 

For example:
![image.png](/.attachments/image-28431dcc-e227-46f5-a6ca-a11be33b05aa.png)

You can download the Process Tuples to review the details of the connection:

![image.png](/.attachments/image-5ddeb095-21ba-4d39-80e7-2b14533020b5.png)

# Common Issues
## Results showed "Traffic ALLOWED", but traffic isn't allowed
In the test connectivity results, we may see something like this:
![image.png](/.attachments/image-c1092ac5-5ded-4b16-86a1-06ba3bf97f91.png)

But the network trace shows something like this (TCP handshake failed):
![image.png](/.attachments/image-d02b1327-a351-49cf-aab6-be03656d71de.png)

When we look at the process tuples file, this may shed more light:
![image.png](/.attachments/image-fe52ef0e-3380-4da4-bf0e-d47982b949d9.png)

In the above scenario, the customer has a user defined route that has a destination of InternetGateway. Their NIC is part of an internal load balancer. [Outbound rules Azure Load Balancer | Scenario 5](https://learn.microsoft.com/azure/load-balancer/outbound-rules#scenario5out) describes this behavior.

![image.png](/.attachments/image-b70e9271-3df2-457c-a965-24fc7e17988b.png)
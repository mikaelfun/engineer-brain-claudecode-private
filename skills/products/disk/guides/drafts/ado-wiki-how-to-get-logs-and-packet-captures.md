---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Troubleshooting/How to get Logs and packet captures"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20FXT%20and%20vFXT%2FTroubleshooting%2FHow%20to%20get%20Logs%20and%20packet%20captures"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Collect Logs

The General Information Upload section to send system information about the node or cluster to Avere Global Services.

Note: The manual uploads available from this page supplement the automatic nightly uploads that you can configure on the [Cluster > Support](https://azure.github.io/Avere/legacy/ops_guide/4_7/html/gui_support.html#gui-support-settings) settings page.

1. Choose the type of information to upload with the Choose gather mode selector. Options are described in detail [below](https://azure.github.io/Avere/legacy/ops_guide/4_7/html/support_overview.html#support-gather-mode).
2. Optional: Type a note for the upload in the Comment text field.
3. Click the Upload information button.

# How to Collect a Packet Capture

A Packet Capture (pcap) is a form of data collection that can help us determine many different networking issues. A packet capture allows us to determine the root cause of many different problems involving security settings, permissions, connectivity, etc. If the issue exists between client to cluster or cluster to filer, a pcap will offer us insight.

## PROCEDURE

While investigating a case you may be asked to collect a packet capture for further analysis. There are two ways to accomplish this task, in the customer's cluster management GUI or through remote commands. (If customer has it enabled)

First, we will visit how to obtain a packet capture in the customer's GUI:

Click the Support tab at the top of the page.

**NOTE:** Do not select 10GB Ring Buffer unless otherwise instructed

Now you can select the duration if you want to capture a recurring issue or you can use 'Until manually stopped' if you need to capture just enough while you reproduce an issue. When you have manually stopped selected, you will have to manually click the Stop collecting button to end and upload the capture.

Because packet captures can often be very verbose, we often want to filter what we're capturing to ensure a concise view of a specific communication. Here you will specify the host of a client, FXT node, or core filer to only capture that specific traffic. You can also specify the port that you want to see in your pcap. Just specify an IP with "host <ip>" and port with "port <port>". You can even filter multiple specific results with the use of "and/or" with parenthesis. Here is an example of a packet filter:

```
(host 10.10.1.1 and port 2049) or (host 10.1.1.15 and port 4045)
```
